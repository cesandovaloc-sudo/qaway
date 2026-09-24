const IMAGES_WEBP = ["image/png", "image/jpeg"];

export function esImagenWebpValida(file) {
  return (
    IMAGES_WEBP.includes(file.type) ||
    /\.(png|jpe?g|webp)$/i.test(file.name)
  );
}

export function convertirAWebp(file, { scale = 1, quality = 0.92, maxEdge = 0 } = {}) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let targetWidth = Math.round(img.naturalWidth * scale);
          let targetHeight = Math.round(img.naturalHeight * scale);
          if (maxEdge > 0) {
            const longest = Math.max(targetWidth, targetHeight);
            if (longest > maxEdge) {
              const k = maxEdge / longest;
              targetWidth = Math.round(targetWidth * k);
              targetHeight = Math.round(targetHeight * k);
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, targetWidth);
          canvas.height = Math.max(1, targetHeight);
          const ctx = canvas.getContext("2d", { alpha: true });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
}