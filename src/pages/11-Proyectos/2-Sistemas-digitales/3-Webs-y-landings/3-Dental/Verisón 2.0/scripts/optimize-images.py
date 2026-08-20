from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MASTER_DIR = ROOT / "src" / "assets" / "images" / "masters"
OUTPUT_DIR = ROOT / "src" / "assets" / "images" / "optimized"
WIDTHS = (480, 800, 1200, 1600)


def optimize(source: Path) -> None:
    with Image.open(source) as image:
        image = image.convert("RGB")
        for width in WIDTHS:
            if width > image.width:
                continue

            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            stem = f"{source.stem}-{width}"
            resized.save(
                OUTPUT_DIR / f"{stem}.webp",
                "WEBP",
                quality=82,
                method=6,
            )
            resized.save(
                OUTPUT_DIR / f"{stem}.avif",
                "AVIF",
                quality=66,
                speed=6,
            )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in sorted(MASTER_DIR.glob("*.png")):
        optimize(source)


if __name__ == "__main__":
    main()
