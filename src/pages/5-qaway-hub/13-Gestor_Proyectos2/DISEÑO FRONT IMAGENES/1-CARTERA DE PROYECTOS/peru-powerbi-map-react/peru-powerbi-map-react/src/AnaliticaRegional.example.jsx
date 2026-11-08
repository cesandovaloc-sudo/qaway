import PeruPowerBIMap from "./components/PeruPowerBIMap";

// EJEMPLO ILUSTRATIVO. Reemplazar por datos reales de la aplicación.
const regionData = {
  "AMAZONAS": { progress: 68, bubbleValue: 8, ugelCount: 8, incidents: 3 },
  "ANCASH": { progress: 82, bubbleValue: 20, ugelCount: 20, incidents: 1 },
  "APURIMAC": { progress: 44, bubbleValue: 8, ugelCount: 8, incidents: 5 },
  "AREQUIPA": { progress: 91, bubbleValue: 10, ugelCount: 10, incidents: 0 },
  "AYACUCHO": { progress: 0, bubbleValue: 11, ugelCount: 11, incidents: 8 },
  "CAJAMARCA": { progress: 56, bubbleValue: 13, ugelCount: 13, incidents: 4 },
  "CALLAO": { progress: 88, bubbleValue: 1, ugelCount: 1, incidents: 0 },
  "CUSCO": { progress: 72, bubbleValue: 14, ugelCount: 14, incidents: 2 },
  "HUANCAVELICA": { progress: 34, bubbleValue: 7, ugelCount: 7, incidents: 6 },
  "HUANUCO": { progress: 63, bubbleValue: 11, ugelCount: 11, incidents: 3 },
  "ICA": { progress: 84, bubbleValue: 5, ugelCount: 5, incidents: 1 },
  "JUNIN": { progress: 38, bubbleValue: 13, ugelCount: 13, incidents: 7 },
  "LA LIBERTAD": { progress: 77, bubbleValue: 12, ugelCount: 12, incidents: 2 },
  "LAMBAYEQUE": { progress: 86, bubbleValue: 3, ugelCount: 3, incidents: 0 },
  "LIMA": { progress: 74, bubbleValue: 9, ugelCount: 9, incidents: 3 },
  "LORETO": { progress: 41, bubbleValue: 8, ugelCount: 8, incidents: 5 },
  "MADRE DE DIOS": { progress: 59, bubbleValue: 3, ugelCount: 3, incidents: 2 },
  "MOQUEGUA": { progress: 93, bubbleValue: 3, ugelCount: 3, incidents: 0 },
  "PASCO": { progress: 52, bubbleValue: 3, ugelCount: 3, incidents: 2 },
  "PIURA": { progress: 69, bubbleValue: 12, ugelCount: 12, incidents: 3 },
  "PUNO": { progress: 47, bubbleValue: 14, ugelCount: 14, incidents: 4 },
  "SAN MARTIN": { progress: 79, bubbleValue: 10, ugelCount: 10, incidents: 2 },
  "TACNA": { progress: 90, bubbleValue: 4, ugelCount: 4, incidents: 0 },
  "TUMBES": { progress: 83, bubbleValue: 3, ugelCount: 3, incidents: 0 },
  "UCAYALI": { progress: 36, bubbleValue: 4, ugelCount: 4, incidents: 5 },
};

export default function AnaliticaRegional() {
  return (
    <PeruPowerBIMap
      title="Tablero analítico territorial"
      subtitle="MINEDU · Dotación 2027"
      regionData={regionData}
      bubbleMetric="ugelCount"
      onRegionSelect={(region) => {
        // Conectar aquí con el panel o detalle regional existente.
        console.log("Región seleccionada:", region);
      }}
    />
  );
}
