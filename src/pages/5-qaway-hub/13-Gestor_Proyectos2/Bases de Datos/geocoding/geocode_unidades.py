#!/usr/bin/env python3
"""Geocodifica el directorio de DRE/GRE/UGEL (DIRECTORIO ALMACENES FEN.xlsx).

Estrategia por niveles de precision (se detiene en el primero que acierte y valide la region):
  1  calle      direccion + numero + distrito/provincia + region
  2  calle      direccion sin numero + distrito + region   (abreviaturas expandidas)
  3  distrito   nombre del distrito + region                (centroide del distrito)
  4  provincia  nombre de la provincia + region             (centroide)
  5  region     nombre de la region                         (ultimo recurso)
Lo que no resuelva ni el nivel 5 queda en pendientes_google.csv para el pase con Google.

Salidas (junto a este script):
  coordenadas_unidades.csv   codigo, nombre, region, direccion, lat, lng, precision, fuente, query, display
  pendientes_google.csv      filas que hay que revisar con Google Geocoding

Uso:
  python geocode_unidades.py                 # usa cache, reanuda
  python geocode_unidades.py --refresh       # ignora la cache
Backend libre: Nominatim/OSM (1 req/s, User-Agent obligatorio, atribucion OSM).
"""
import csv
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.abspath(os.path.join(HERE, "..", "DIRECTORIO ALMACENES FEN.xlsx"))
MAPA = os.path.join(HERE, "unidades_db.json")
CACHE = os.path.join(HERE, ".geocache.json")
OUT = os.path.join(HERE, "coordenadas_unidades.csv")
PEND = os.path.join(HERE, "pendientes_google.csv")

UA = "qawaylab-gestor-proyectos/1.0 (gestion@qawaylab.com)"
SLEEP = 1.15
NIVELES = {1: "calle", 2: "calle", 3: "distrito", 4: "provincia", 5: "region"}

# Grafias distintas entre el Excel y gestor_unidades (misma sede)
ALIAS = {"MAR VRAEM": "MAR", "NAZCA": "NASCA", "UNION": "UNION A"}

ABREV = [
    (r"\bJR\.?\b", "Jiron"), (r"\bJIR\.?\b", "Jiron"), (r"\bAV\.?\b", "Avenida"),
    (r"\bAVDA\.?\b", "Avenida"), (r"\bCL\.?\b", "Calle"), (r"\bPSJE\.?\b", "Pasaje"),
    (r"\bPROL\.?\b", "Prolongacion"), (r"\bCARR\.?\b", "Carretera"),
    (r"\bNRO\.?\b", ""), (r"\bN[°º]\.?\b", ""), (r"\bNUM\.?\b", ""),
    (r"\bS/N\b", ""), (r"\bSN\b", ""), (r"\bSIN NUMERO\b", ""),
    (r"\bC\.?V\.?\b", ""), (r"\(.*?\)", " "), (r"\bESQ\.?\b", ""),
    (r"\bURB\.?\b", "Urbanizacion"), (r"\bBAR\.?\b", "Barrio"),
]


def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().upper()
    return re.sub(r"[^A-Z0-9]+", " ", s).strip()


def clave(s):
    """Clave de emparejamiento: sin prefijos institucionales."""
    s = norm(s)
    s = re.sub(r"\b(DRE|GRE|UGEL|DIREC|REGIONAL|DE|LA|EL)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def limpiar_direccion(d):
    d = str(d or "").replace("N°", " ").replace("Nº", " ")
    for pat, rep in ABREV:
        d = re.sub(pat, rep, d, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", d).strip(" ,-")


def sin_numero(d):
    return re.sub(r"\s+\d+[A-Za-z]?$", "", d).strip(" ,-")


def http_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "es"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.loads(r.read().decode("utf-8"))


def nominatim(q, cache, refresh=False):
    if not refresh and q in cache:
        return cache[q]
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "jsonv2", "limit": 1, "addressdetails": 1}
    )
    try:
        res = http_json(url)
        hit = res[0] if res else None
    except Exception as exc:  # red/limite: se reintenta en la siguiente corrida
        print("  ! error %s :: %s" % (q[:60], exc), flush=True)
        hit = None
    cache[q] = hit
    time.sleep(SLEEP)
    return hit


def estado_de(hit):
    a = (hit or {}).get("address", {}) or {}
    return norm(a.get("state") or a.get("region") or "").replace(" ", "")


def valida(hit, region_norm):
    """Rechaza aciertos en otro departamento (evita el 'mismo nombre en otro sitio')."""
    if not hit:
        return False
    est = estado_de(hit)
    if not est:
        return True
    return est == region_norm or region_norm in est or est in region_norm


# En OSM 'region' suele ser la provincia peruana; 'county' la provincia/distrito
CAMPOS_LOCALIDAD = ("city", "town", "village", "hamlet", "municipality", "county",
                    "city_district", "suburb", "state_district", "region")
CAMPOS_AMPLIOS = ("region", "county", "state_district")


def valida_localidad(hit, loc_norm):
    """Para busquedas por localidad: devuelve el campo que coincide, o None."""
    if not hit or not loc_norm:
        return None
    a = hit.get("address", {}) or {}
    for campo in CAMPOS_LOCALIDAD:
        v = norm(a.get(campo, "")).replace(" ", "")
        if v and (loc_norm in v or v in loc_norm):
            return campo
    primero = norm(str(hit.get("display_name", "")).split(",")[0]).replace(" ", "")
    if primero and (loc_norm in primero or primero in loc_norm):
        return "display_name"
    return None


def sin_acentos(s):
    return unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()


def cargar_excel():
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    # Directorio: region, nombre, ruc, direccion exacta
    dirs = []
    for r in wb["Direcciones"].iter_rows(min_row=5, values_only=True):
        if not r or not r[2]:
            continue
        dirs.append({
            "region": str(r[1] or "").strip(),
            "nombre": str(r[2] or "").strip(),
            "ruc": str(r[3] or "").strip(),
            "direccion": str(r[4] or "").strip(),
        })
    # Hoja de detalle: referencia de ubicacion del almacen (col 18) y direccion de almacen (col 17)
    detalle = {}
    for r in wb["DRE_GRE_UGEL"].iter_rows(min_row=5, values_only=True):
        if not r or len(r) < 18 or not r[2]:
            continue
        detalle[norm(r[2])] = {
            "dir_almacen": str(r[17] or "").strip(),
            "referencia": str(r[18] or "").strip(),
            "zona": str(r[20] or "").strip(),
        }
    # Hoja3: volcado SUNAT (ruc|razon|...|departamento|provincia|distrito|direccion)
    sunat = {}
    for r in wb["Hoja3"].iter_rows(values_only=True):
        if not r or not r[0]:
            continue
        p = str(r[0]).split("|")
        if len(p) > 12 and p[0].strip().isdigit():
            sunat[p[0].strip()] = {
                "departamento": p[9].strip(), "provincia": p[10].strip(),
                "distrito": p[11].strip(), "direccion": p[12].strip(),
            }
    return dirs, detalle, sunat


def main():
    refresh = "--refresh" in sys.argv
    limit = next((int(a.split("=")[1]) for a in sys.argv if a.startswith("--limit=")), 0)
    dirs, detalle, sunat = cargar_excel()
    if limit:
        dirs = dirs[:limit]
    mapa = json.load(open(MAPA, encoding="utf-8"))
    por_clave = {}
    for u in mapa:
        por_clave.setdefault(u["clave"], []).append(u["code"])

    cache = {}
    if os.path.exists(CACHE) and not refresh:
        cache = json.load(open(CACHE, encoding="utf-8"))

    filas, pendientes = [], []
    for i, d in enumerate(dirs, 1):
        nombre, region = d["nombre"], d["region"]
        k = clave(nombre)
        k_alias = clave(ALIAS.get(k, k))
        codes = por_clave.get(k_alias, [])
        if len(codes) > 1:  # DRE X y UGEL X comparten clave: desempatar por tipo
            prefs = ("DRE-", "GRE-") if re.match(r"^(DRE|GRE)\b", nombre, re.I) else ("UGEL-",)
            codes = [c for c in codes if c.startswith(prefs)] or codes
        code = codes[0] if len(codes) == 1 else ""
        k = k_alias
        sun = sunat.get(d["ruc"], {})
        det = detalle.get(norm(nombre), {})
        distrito = sun.get("distrito", "")
        provincia = sun.get("provincia", "")
        direccion = d["direccion"] or sun.get("direccion", "")
        dirlimpia = limpiar_direccion(direccion)

        # candidatos de busqueda, de mas preciso a mas general
        def cadena(*partes):
            return sin_acentos(", ".join([p for p in partes if p]) + ", Peru")

        cands = []
        if dirlimpia:
            cands.append((1, cadena(dirlimpia, distrito, provincia, region)))
            cands.append((2, cadena(sin_numero(dirlimpia), distrito or "", provincia, region)))
        localidad = distrito or re.sub(r"^(DRE|GRE|UGEL)\s+", "", nombre, flags=re.I)
        cands.append((3, cadena(localidad, provincia, region)))
        if provincia:
            cands.append((4, cadena(provincia, region)))
        # ultimo recurso: centroide de la region/departamento ("zona mas cercana")
        region_q = region.replace("PROVINCIAS", "").strip() or region
        cands.append((5, cadena(region_q)))

        region_norm = norm(region).replace(" ", "")
        loc_norm = norm(localidad).replace(" ", "")
        elegido, nivel, query, campo_hit = None, None, "", ""
        for nv, q in cands:
            hit = nominatim(q, cache, refresh)
            if not valida(hit, region_norm):
                continue
            campo = "calle"
            if 3 <= nv <= 4:
                campo = valida_localidad(hit, loc_norm)
                if not campo:
                    continue  # centroide de otra localidad: no sirve
            elif nv >= 5:
                campo = "region"  # centroide de region: no se exige localidad
            elegido, nivel, query, campo_hit = hit, nv, q, campo
            break

        base = {
            "codigo": code,
            "nombre": nombre,
            "region": region,
            "ruc": d["ruc"],
            "direccion": direccion,
            "referencia": det.get("referencia", ""),
            "zona": det.get("zona", ""),
            "distrito": distrito,
            "provincia": provincia,
            "departamento": sun.get("departamento", ""),
            "match": ("alias" if clave(ALIAS.get(clave(nombre), clave(nombre))) != clave(nombre)
                      else "exacto") if code else "sin_match",
        }
        # Aviso: el distrito fiscal (SUNAT) no coincide con la localidad del nombre
        nombre_loc = re.sub(r"^(DRE|GRE|UGEL)\s+", "", nombre, flags=re.I)
        if distrito and norm(nombre_loc) and norm(nombre_loc) not in norm(distrito) \
                and norm(distrito) not in norm(nombre_loc):
            base["aviso"] = "distrito_sunat_distinto_al_nombre"
        else:
            base["aviso"] = ""
        if nivel in (1, 2):
            precision = "calle"
        elif nivel == 3:
            precision = "distrito" if campo_hit not in CAMPOS_AMPLIOS else "provincia"
        elif nivel == 4:
            precision = "provincia"
        elif nivel == 5:
            precision = "region"
        else:
            precision = ""

        if elegido and nivel <= 2:
            base.update({
                "lat": round(float(elegido["lat"]), 6), "lng": round(float(elegido["lon"]), 6),
                "precision": NIVELES[nivel], "nivel": nivel, "fuente": "osm",
                "query": query, "display": elegido.get("display_name", ""),
            })
            filas.append(base)
        else:
            # se guarda el mejor centroide como respaldo, pero la fila va a pendientes
            if elegido:
                base.update({
                    "lat": round(float(elegido["lat"]), 6), "lng": round(float(elegido["lon"]), 6),
                    "precision": precision, "nivel": nivel, "fuente": "osm",
                    "query": query, "display": elegido.get("display_name", ""),
                })
            else:
                base.update({"lat": "", "lng": "", "precision": "", "nivel": "",
                             "fuente": "", "query": "", "display": ""})
            pendientes.append(base)
            filas.append(base)
        if i % 25 == 0:
            print("  ... %d/%d  (calle:%d  pendientes:%d)" % (
                i, len(dirs),
                sum(1 for f in filas if f.get("precision") == "calle"), len(pendientes)), flush=True)
            json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)

    cols = list(filas[0].keys())
    for ruta, data in ((OUT, filas), (PEND, pendientes)):
        with open(ruta, "w", encoding="utf-8-sig", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            w.writerows(data)
    json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)

    calle = sum(1 for f in filas if f.get("precision") == "calle")
    sin_match = sum(1 for f in filas if f.get("match") == "sin_match")
    print("\nTOTAL %d | calle %d | distrito/etc %d | pendientes %d | sin codigo %d" % (
        len(filas), calle, len(filas) - calle - len(pendientes), len(pendientes), sin_match))
    print("CSV:", OUT)
    print("PEND:", PEND)


if __name__ == "__main__":
    main()
