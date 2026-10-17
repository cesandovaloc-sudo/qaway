const fs = require('fs');
const path = require('path');

// Diccionario de corrección fonética y acústica
const PHONETIC_REPLACEMENTS = [
  // Sistemas
  [/\bSILLAGI\b/gi, 'SIAGIE'],
  [/\bsillagi\b/gi, 'SIAGIE'],
  [/\bsiyagi\b/gi, 'SIAGIE'],
  [/\bMC-SIGA\b/gi, 'MC SIGA'],
  [/\bmc siga\b/gi, 'MC SIGA'],

  // Modalidades y programas
  [/\bPronois\b/gi, 'PRONOEI'],
  [/\bpronois\b/gi, 'PRONOEI'],
  [/\bPRONOIS\b/gi, 'PRONOEI'],
  [/\bEBI\b/g, 'EIB'],
  [/\bebi\b/g, 'EIB'],

  // Lenguas originarias
  [/\bJarabut\b/gi, 'Harakbut'],
  [/\bjarabut\b/gi, 'Harakbut'],
  [/\bHarabut\b/gi, 'Harakbut'],
  [/\bAhuajun\b/gi, 'Awajún'],
  [/\bahuajun\b/gi, 'Awajún'],
  [/\bashaninka\b/gi, 'Asháninka'],
  [/\bAshaninca\b/gi, 'Asháninka'],

  // UGEL y provincias
  [/\bUGEL Mano\b/gi, 'UGEL Manu'],
  [/\bUgel mano\b/gi, 'UGEL Manu'],
  [/\bEl UGEL de Ambos\b/gi, 'La UGEL Ambo'],
  [/\bUGEL de Ambos\b/gi, 'UGEL Ambo'],
  [/\bUGEL de Bilimasa\b/gi, 'UGEL Bellavista'],
  [/\bUGEL Víctor Fajardo\b/gi, 'UGEL Fajardo'],
];

function applyPhoneticCleaning(text) {
  if (!text) return '';
  let cleaned = text;
  for (const [pattern, replacement] of PHONETIC_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

// Extrae mención de UGEL si existe en el texto para aislarla en casoEspecifico
function extractUgelContext(text) {
  if (!text) return { publicText: '', internalDetail: '' };
  
  const ugelMatch = text.match(/(?:Desde\s+(?:la\s+)?(?:UGEL\s+)?([A-ZÁÉÍÓÚÑ][\w\s]+?)|La\s+UGEL\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][\w\s]+?)|El\s+UGEL\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][\w\s]+?))\s+(?:se\s+indica|se\s+consulta|indica|consulta|solicita|tiene|asigna)/i);

  if (ugelMatch) {
    const rawMention = ugelMatch[0];
    const internalDetail = text.trim();
    // Transformar el inicio a redacción institucional genérica
    const publicText = text
      .replace(/^Desde\s+(?:la\s+)?(?:UGEL\s+)?[\w\s]+?\s+(?:se\s+indica\s+que|se\s+consulta\s+si|solicita\s+poder|solicita|indica\s+que)/i, 'Se reporta que')
      .replace(/^La\s+UGEL\s+(?:de\s+)?[\w\s]+?\s+(?:indica\s+que|consulta\s+si)/i, 'Se reporta que la UGEL identifica que')
      .replace(/^El\s+UGEL\s+(?:de\s+)?[\w\s]+?\s+(?:asignó|asigna)/i, 'Se identifica que una UGEL asignó')
      .trim();

    return { publicText, internalDetail };
  }

  return { publicText: text.trim(), internalDetail: '' };
}

// Procesa una casuística individual según el estándar oficial
function cleanCasuisticaItem(raw, index) {
  const numStr = String(raw.number || index + 1).padStart(2, '0');
  const dirCode = raw.dirCode || raw.dirId || 'DEI';

  // 1. Limpieza fonética global
  let title = applyPhoneticCleaning(raw.title || '');
  let criterioTitle = applyPhoneticCleaning(raw.criterioTitle || 'Criterio General');
  let criterioDesc = applyPhoneticCleaning(raw.criterioDesc || '');
  let rawDesarrollo = applyPhoneticCleaning(raw.desarrollo || '');
  let solucion = applyPhoneticCleaning(raw.solucion || raw.accion || '');
  let ejemplo = applyPhoneticCleaning(raw.ejemplo || '');

  // 2. Aislar nombre de UGEL en casoEspecifico
  const { publicText: cleanDesarrollo, internalDetail: ugelDetail } = extractUgelContext(rawDesarrollo);
  const casoEspecifico = raw.casoEspecifico?.trim() || ugelDetail || '';

  // 3. Formatear Título en 2 Filas si es pregunta simple
  if (!title.includes(':') && title.startsWith('¿')) {
    title = `${criterioTitle}: ${title}`;
  }

  // 4. Asignar Normativa PMV
  let normativa = raw.normativa?.trim() || '';
  if (!normativa) {
    if (/lengua|harakbut|asháninka|awajún|eib/i.test(title + ' ' + cleanDesarrollo)) {
      normativa = 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos en lenguas originarias.';
    } else if (/siga|pecosa|código modular|distribución/i.test(title + ' ' + cleanDesarrollo)) {
      normativa = 'Oficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Orientaciones para el monitoreo de asignación de materiales en el MC SIGA.';
    } else {
      normativa = 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.';
    }
  }

  return {
    id: raw.id || `${dirCode.toLowerCase()}-${numStr}`,
    number: numStr,
    title,
    criterioTitle,
    criterioDesc,
    desarrollo: cleanDesarrollo,
    solucion,
    ejemplo,
    normativa,
    casoEspecifico,
    accion: '',
    isOpen: false
  };
}

// Función principal ejecutable
function processFile(inputFilePath, outputFilePath) {
  const absInput = path.resolve(inputFilePath);
  const absOutput = outputFilePath ? path.resolve(outputFilePath) : absInput;

  console.log(`Leyendo archivo crudo: ${absInput}`);
  const rawData = JSON.parse(fs.readFileSync(absInput, 'utf8'));

  if (!Array.isArray(rawData)) {
    throw new Error('El archivo no contiene un array de casuísticas');
  }

  console.log(`Procesando ${rawData.length} casuísticas con el estándar oficial...`);
  const cleanedData = rawData.map((item, idx) => cleanCasuisticaItem(item, idx));

  fs.writeFileSync(absOutput, JSON.stringify(cleanedData, null, 2), 'utf8');
  console.log(`¡Éxito! Archivo guardado y normalizado en: ${absOutput}`);
}

module.exports = {
  processFile,
  cleanCasuisticaItem,
  applyPhoneticCleaning
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const input = args[0] || path.join(__dirname, '..', 'src', 'data', 'casuisticas_veedores_2026-09-28.json');
  const output = args[1] || input;
  processFile(input, output);
}
