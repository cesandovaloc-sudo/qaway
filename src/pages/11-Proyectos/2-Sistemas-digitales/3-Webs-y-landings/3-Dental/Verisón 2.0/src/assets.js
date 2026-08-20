const files = import.meta.glob("./assets/images/optimized/*.{avif,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

function fileUrl(name, width, format) {
  return files["./assets/images/optimized/" + name + "-" + width + "." + format];
}

function responsiveAsset(name, widths, width, height) {
  return {
    width,
    height,
    fallback: fileUrl(name, widths.at(-1), "webp"),
    srcSet(format) {
      return widths.map((size) => fileUrl(name, size, format) + " " + size + "w").join(", ");
    },
  };
}

export const dentalImages = {
  hero: responsiveAsset("hero-paciente-brackets", [480, 800, 1200], 1536, 1024),
  benefits: responsiveAsset("beneficios-sonrisa-brackets", [480, 800, 1200, 1600], 1792, 1024),
  aligners: responsiveAsset("tratamiento-alineadores", [480, 800, 1200], 1456, 1088),
  whiteningBefore: responsiveAsset("tratamiento-blanqueamiento-antes", [480, 800, 1200], 1456, 1088),
  whiteningAfter: responsiveAsset("tratamiento-blanqueamiento-despues", [480, 800, 1200], 1456, 1088),
  smileDesign: responsiveAsset("tratamiento-diseno-sonrisa", [480, 800, 1200], 1456, 1088),
  specialistValeria: responsiveAsset("especialista-valeria", [480, 800], 1024, 1536),
  specialistAndres: responsiveAsset("especialista-andres", [480, 800], 1024, 1792),
  appointment: responsiveAsset("formulario-paciente-sillon", [480, 800], 1024, 1536),
};
