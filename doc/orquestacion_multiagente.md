# 🌐 Protocolo de Orquestación Multi-Agente (Orca)

Este documento define las reglas, comandos y flujos directos para que cualquier agente (**Antigravity**, **OpenCode**, etc.) que ingrese a esta carpeta (`Celulares`) se sincronice de inmediato con los demás agentes **sin perder tiempo explorando carpetas externas ni buscando configuraciones inexistentes**.

---

## 0. Roles y Jerarquías Dinámicas (Líder vs. Subagente)

Cualquier agente (**Antigravity**, **OpenCode**, **Codex**, etc.) puede asumir el rol de **Líder (Orquestador)** o **Subagente (Ejecutor)** según lo defina el usuario o el flujo de trabajo:

* **Si operas como Líder (Orquestador):**
  1. Recibes la meta del usuario y defines la estrategia/plan.
  2. Desglosas tareas atómicas y las inyectas al terminal del Subagente con `orca terminal send`.
  3. Supervisas el avance con `orca terminal read`.
  4. Validas la calidad técnica y reportas el avance consolidado al usuario.

* **Si operas como Subagente (Ejecutor):**
  1. Monitoreas tu terminal para recibir instrucciones delegadas por el Líder.
  2. Ejecutas con precisión la tarea asignada (ej. frontend, refactor, pruebas).
  3. Al culminar, envías un reporte conciso de éxito o bloqueo al terminal del Líder con `orca terminal send`.

---

## 1. Detección Rápida y Acceso a la Orquestación

> ⚠️ **REGLA DE ORO:** No busques configuración en directorios superiores ni externos. La orquestación se gestiona a nivel de proceso mediante el CLI de **Orca**.

### Verificación inmediata del entorno
Ejecutar en la terminal:
```powershell
orca status --json
```
Si devuelve `"state": "ready"`, el orquestador está activo.

### Descubrimiento automático de agentes y handles
Para saber qué agentes están en este proyecto y obtener sus terminal handles en 1 segundo:

```powershell
orca terminal list --json
```

O en un comando directo de PowerShell que extrae los handles:
```powershell
$terminals = (orca terminal list --json | ConvertFrom-Json).result.terminals
$terminals | Select-Object handle, agentIdentity, title
```

---

## 2. Comandos de Interconexión Bidireccional (Input & Output)

Cada agente posee un `handle` único emitido por el runtime (formato: `term_xxxx...`).

### A) Enviar Mensaje a Otro Agente (INPUT)
Para inyectar un prompt o instrucción en el terminal del otro agente:

```powershell
orca terminal send --terminal <HANDLE_DESTINO> --text "<MENSAJE>" --enter --json
```

* **De Antigravity hacia OpenCode:**
  ```powershell
  orca terminal send --terminal <HANDLE_OPENCODE> --text "Hola OpenCode, procesa X tarea" --enter --json
  ```
* **De OpenCode hacia Antigravity:**
  ```powershell
  orca terminal send --terminal <HANDLE_ANTIGRAVITY> --text "Hola Antigravity, tarea completada" --enter --json
  ```

* **Tip (Interrumpir proceso bloqueado):** Si el agente destino está atascado en un prompt interactivo o proceso largo, envíale `--interrupt`:
  ```powershell
  orca terminal send --terminal <HANDLE_DESTINO> --interrupt --json
  ```

---

### B) Leer la Respuesta del Otro Agente (OUTPUT)
Para monitorear o leer qué está respondiendo o haciendo el otro agente:

```powershell
orca terminal read --terminal <HANDLE_DESTINO> --limit 25 --json
```

---

## 3. Plantillas Estandarizadas de Comunicación Inter-Agente

Para evitar malentendidos, ambigüedades y consumo innecesario de tokens, los mensajes transmitidos entre terminales deben seguir una estructura prefijada:

### A) Instrucción del Líder al Subagente (Delegación)
```text
[ROL: LIDER -> SUBAGENTE] [TAREA #<ID>]
- Objetivo: <Acción puntual a realizar>
- Alcance/Archivos: <Rutas exactas de los archivos a tocar>
- Restricciones: <Reglas estrictas, candados visuales o dependencias>
- Criterio de entrega: <Qué se espera que reporte al terminar>
```

### B) Reporte del Subagente al Líder (Finalización o Bloqueo)
```text
[ROL: SUBAGENTE -> LIDER] [REPORTE #<ID>: LISTO / BLOQUEADO]
- Estado: LISTO (o BLOQUEADO con motivo)
- Cambios realizados: <Resumen conciso en 1-2 líneas de lo modificado>
- Archivos afectados: <Lista de archivos tocados>
- Siguiente paso: Esperando validación o siguiente instrucción.
```

---

## 4. Test Rápido de Interconexión (Handshake Ligero)

Para verificar la conexión sin consumir exceso de tokens:

### Protocolo Ping-Pong:
1. **Agente A (Iniciador)** envía:
   ```text
   PING [TIMESTAMP]: Test de interconexión Orca
   ```
2. **Agente B (Receptor)** responde a la terminal del Agente A:
   ```text
   PONG [TIMESTAMP]: Recibido y confirmado
   ```
3. **Registro en archivo:** Ambos validan la prueba actualizando una línea en [TEST_INTERCONEXION.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/4-Proyectos-Trabajos/Celulares/TEST_INTERCONEXION.md).

---

## 5. Handles de Referencia Actuales (Sesión Activa)

* **OpenCode (`opencode2`):** `term_61051e8e-ef4d-4792-b45a-e17cea73a748`
* **Antigravity (`antigravity`):** `term_9b611d44-d2f2-494b-98e3-57e53718533e`
*(Nota: Si se reinicia la sesión de Orca, usa `orca terminal list --json` para obtener los handles actualizados).*
