import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

_font_cache: dict = {}

_FONT_PATHS = [
    Path(__file__).resolve().parent.parent / "fonts" / "DejaVuSans.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    Path("/System/Library/Fonts/Helvetica.ttc"),
    Path("/Library/Fonts/Arial.ttf"),
]

_BOLD_FONT_PATHS = [
    Path(__file__).resolve().parent.parent / "fonts" / "DejaVuSans-Bold.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    Path("/Library/Fonts/Arial Bold.ttf"),
]


def _find_font(paths):
    for p in paths:
        if p.exists():
            return str(p)
    return None


def get_font(size: int, bold: bool = False):
    key = (size, bold)
    if key in _font_cache:
        return _font_cache[key]

    font_path = _find_font(_BOLD_FONT_PATHS if bold else _FONT_PATHS)
    if font_path:
        try:
            font = ImageFont.truetype(font_path, size=size)
            _font_cache[key] = font
            return font
        except Exception:
            pass

    font = ImageFont.load_default(size=size)
    _font_cache[key] = font
    return font


def render_certificate(template_file, fields: list[dict]) -> Image.Image:
    img = Image.open(template_file).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for f in fields:
        text = str(f.get("text", ""))
        if not text:
            continue

        cx = f.get("x", 0)
        cy = f.get("y", 0)
        size = max(1, int(f.get("font_size", 16)))
        color = f.get("font_color") or "#000000"
        bold = str(f.get("font_family", "normal")).lower() == "bold"

        font = get_font(size, bold)
        bbox = font.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]

        draw.text(
            (cx - tw / 2, cy - th / 2),
            text,
            font=font,
            fill=color,
        )

    return Image.alpha_composite(img, overlay).convert("RGB")


def to_png_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def to_pdf_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PDF")
    return buf.getvalue()
