import PeruChoropleth from "./components/PeruChoropleth";

// DATOS ILUSTRATIVOS: sustituir por los datos reales de tu aplicación.
const regionMetrics = {
  "AMAZONAS": { progress: 68, ugel: 8 },
  "ANCASH": { progress: 82, ugel: 20 },
  "APURIMAC": { progress: 44, ugel: 8 },
  "AREQUIPA": { progress: 91, ugel: 10 },
  "AYACUCHO": { progress: 0, ugel: 11 },
  "CAJAMARCA": { progress: 56, ugel: 13 },
  "CALLAO": { progress: 88, ugel: 1 },
  "CUSCO": { progress: 72, ugel: 14 },
  "HUANCAVELICA": { progress: 34, ugel: 7 },
  "HUANUCO": { progress: 63, ugel: 11 },
  "ICA": { progress: 84, ugel: 5 },
  "JUNIN": { progress: 38, ugel: 13 },
  "LA LIBERTAD": { progress: 77, ugel: 12 },
  "LAMBAYEQUE": { progress: 86, ugel: 3 },
  "LIMA": { progress: 74, ugel: 9 },
  "LORETO": { progress: 41, ugel: 8 },
  "MADRE DE DIOS": { progress: 59, ugel: 3 },
  "MOQUEGUA": { progress: 93, ugel: 3 },
  "PASCO": { progress: 52, ugel: 3 },
  "PIURA": { progress: 69, ugel: 12 },
  "PUNO": { progress: 47, ugel: 14 },
  "SAN MARTIN": { progress: 79, ugel: 10 },
  "TACNA": { progress: 90, ugel: 4 },
  "TUMBES": { progress: 83, ugel: 3 },
  "UCAYALI": { progress: 36, ugel: 4 },
};

export default function MapaRegional() {
  return (
    <PeruChoropleth
      title="Cumplimiento por región"
      subtitle="MINEDU · Dotación 2027"
      regionMetrics={regionMetrics}
      onRegionSelect={(region) => {
        console.log("Región seleccionada:", region);
        // Aquí puedes actualizar el panel de detalle de tu aplicación.
      }}
    />
  );
}
