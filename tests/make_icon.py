# 生成应用图标：绿色圆角方块 + 白色加号 + 两个彩色圆点（代表“相加”）
# 用法：python tests/make_icon.py
from PIL import Image, ImageDraw
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

GREEN = (52, 199, 89, 255)
WHITE = (255, 255, 255, 255)
ORANGE = (255, 149, 0, 255)
BLUE = (0, 122, 255, 255)


def draw_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = size * 0.22
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=GREEN)

    cx = size / 2
    cy = size / 2
    # 白色加号
    half = size * 0.20
    thick = size * 0.14
    d.rounded_rectangle([cx - half, cy - thick / 2, cx + half, cy + thick / 2], radius=thick / 2, fill=WHITE)
    d.rounded_rectangle([cx - thick / 2, cy - half, cx + thick / 2, cy + half], radius=thick / 2, fill=WHITE)

    # 左右两个圆点
    dot_r = size * 0.085
    d.ellipse([cx - size * 0.34 - dot_r, cy - dot_r, cx - size * 0.34 + dot_r, cy + dot_r], fill=ORANGE)
    d.ellipse([cx + size * 0.34 - dot_r, cy - dot_r, cx + size * 0.34 + dot_r, cy + dot_r], fill=BLUE)
    return img


def main():
    draw_icon(512).save(os.path.join(ROOT, "icon-512.png"))
    draw_icon(192).save(os.path.join(ROOT, "icon-192.png"))
    draw_icon(180).save(os.path.join(ROOT, "apple-touch-icon.png"))
    base = draw_icon(256)
    base.save(os.path.join(ROOT, "icon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("icons written to", ROOT)


if __name__ == "__main__":
    main()
