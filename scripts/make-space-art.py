#!/usr/bin/env python3
"""
生成「深空星际」主题的背景素材（全部由程序绘制，不使用任何第三方图片）：
  public/images/space/nebula-{1920,1280,800}.{avif,webp}   蓝紫星云 + 星空（首页/内页顶部大背景；800 为手机竖向裁切）
  public/images/space/planet-{900,520}.{avif,webp}          带光环的深空行星（透明背景）
  public/images/space/stars-tile.webp                        可平铺的细碎星点（全站底层）
固定随机种子，重复运行得到同样的图。用法：python3 scripts/make-space-art.py
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter, zoom

OUT = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'space'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(20261031)

# 主题色（与 src/styles/tokens.css 一致）
BG = np.array([0x07, 0x0B, 0x1B]) / 255
DEEP = np.array([0x0B, 0x17, 0x35]) / 255
NEBULA = np.array([0x70, 0x47, 0xFF]) / 255
ELECTRIC = np.array([0x39, 0x8B, 0xFF]) / 255
CYAN = np.array([0x36, 0xD7, 0xFF]) / 255


def fbm(h: int, w: int, octaves: int = 6, base: int = 4, gain: float = 0.55) -> np.ndarray:
    """分形噪声：多层随机网格放大叠加，返回 0..1。"""
    acc = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = base * 2**o
        g = rng.random((max(2, n * h // max(h, w)) + 2, n + 2))
        acc += amp * zoom(g, (h / g.shape[0], w / g.shape[1]), order=3)[:h, :w]
        total += amp
        amp *= gain
    acc /= total
    acc -= acc.min()
    return acc / max(acc.max(), 1e-6)


def nebula(h: int, w: int) -> np.ndarray:
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = xx / w, yy / h
    # 域扭曲：让星云呈丝缕状
    warp = fbm(h, w, octaves=4, base=2)
    n1 = fbm(h, w, octaves=6, base=3)
    n2 = fbm(h, w, octaves=6, base=5)
    shaped = np.clip((n1 * 0.7 + warp * 0.3) ** 2.2 * 1.6, 0, 1)
    wisps = np.clip((n2 - 0.45) * 2.2, 0, 1) ** 1.6
    # 两团星云：右上偏紫，左中偏蓝，叠一点青色高光
    purple_core = np.exp(-(((u - 0.68) / 0.38) ** 2 + ((v - 0.30) / 0.42) ** 2))
    blue_core = np.exp(-(((u - 0.22) / 0.42) ** 2 + ((v - 0.58) / 0.40) ** 2))
    img = np.ones((h, w, 3)) * BG
    img += (DEEP - BG)[None, None] * (0.6 * blue_core + 0.5 * purple_core)[..., None]
    img += NEBULA[None, None] * (shaped * purple_core * 0.75 + wisps * purple_core * 0.35)[..., None]
    img += ELECTRIC[None, None] * (shaped * blue_core * 0.55 + wisps * blue_core * 0.3)[..., None]
    img += CYAN[None, None] * (np.clip(n2 - 0.62, 0, 1) * 1.6 * (purple_core + blue_core) * 0.35)[..., None]
    # 暗尘带
    dust = np.clip((fbm(h, w, octaves=5, base=6) - 0.55) * 3, 0, 1)
    img *= 1 - 0.35 * dust[..., None] * (purple_core + blue_core)[..., None]
    # 下方渐暗，接入页面底色
    fade = np.clip((v - 0.62) / 0.38, 0, 1) ** 1.4
    img = img * (1 - fade[..., None]) + BG[None, None] * fade[..., None]
    return np.clip(img, 0, 1)


def stars(h: int, w: int, density: float, bright: float, rgb: np.ndarray | None = None) -> np.ndarray:
    """随机星点（高斯点扩散），返回叠加层 0..1。"""
    n = int(h * w * density)
    layer = np.zeros((h, w, 3))
    ys = rng.integers(0, h, n)
    xs = rng.integers(0, w, n)
    mags = rng.random(n) ** 2.4 * bright
    tint = rng.random((n, 3)) * 0.25 + 0.75
    tint[:, 2] = 1.0  # 偏蓝白
    for y, x, m, t in zip(ys, xs, mags, tint):
        layer[y, x] = np.maximum(layer[y, x], m * t)
    soft = gaussian_filter(layer, sigma=(0.9, 0.9, 0))
    big = gaussian_filter(layer * (layer > bright * 0.5), sigma=(3.0, 3.0, 0)) * 3.2
    out = soft + big
    if rgb is not None:
        out = out * rgb[None, None]
    return np.clip(out, 0, 1)


def to_img(arr: np.ndarray, alpha: np.ndarray | None = None) -> Image.Image:
    rgb = (np.clip(arr, 0, 1) * 255).round().astype(np.uint8)
    if alpha is None:
        return Image.fromarray(rgb, 'RGB')
    a = (np.clip(alpha, 0, 1) * 255).round().astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, a]), 'RGBA')


def save(img: Image.Image, name: str, quality: int = 62) -> None:
    img.save(OUT / f'{name}.webp', 'WEBP', quality=quality, method=6)
    img.save(OUT / f'{name}.avif', 'AVIF', quality=max(40, quality - 8), speed=4)
    for ext in ('webp', 'avif'):
        print(f'{name}.{ext}: {os.path.getsize(OUT / f"{name}.{ext}") // 1024} KB')


# ------------------------------------------------------------------ 星云大图
H, W = 1200, 1920
base = nebula(H, W)
base = np.clip(base + stars(H, W, 0.0022, 1.0) * 1.1, 0, 1)
master = to_img(base).filter(ImageFilter.GaussianBlur(0.4))
save(master.resize((1920, 1200), Image.LANCZOS), 'nebula-1920', 60)
save(master.resize((1280, 800), Image.LANCZOS), 'nebula-1280', 60)
# 手机：取画面中右部（星云主体）做竖向裁切
mobile = master.crop((620, 0, 1540, 1200)).resize((800, 1044), Image.LANCZOS)
save(mobile, 'nebula-800', 58)

# ------------------------------------------------------------------ 带光环的行星（透明底）
PH, PW = 900, 900
yy, xx = np.mgrid[0:PH, 0:PW]
cx, cy, R = 450, 450, 250
dx, dy = (xx - cx) / R, (yy - cy) / R
rr = dx * dx + dy * dy
inside = rr <= 1
z = np.sqrt(np.clip(1 - rr, 0, 1))
# 光照：左上
L = np.array([-0.55, -0.5, 0.67])
L /= np.linalg.norm(L)
ndotl = np.clip(dx * L[0] + dy * L[1] + z * L[2], 0, 1)
tex = fbm(PH, PW, octaves=5, base=3)
bands = 0.5 + 0.5 * np.sin((dy * 1.0 + tex * 0.35) * 9.0)
col = DEEP * 1.6 * (1 - bands * 0.3)[..., None] + NEBULA * (bands * 0.55 * (0.5 + tex * 0.5))[..., None] + ELECTRIC * (tex * 0.4 + 0.08)[..., None] + CYAN * (np.clip(tex - 0.6, 0, 1) * 0.5)[..., None]
shade = (0.08 + 1.05 * ndotl ** 1.15)[..., None]
planet = col * shade
rim = np.clip(1 - z, 0, 1) ** 4.0 * (0.15 + 0.85 * ndotl)
planet += CYAN[None, None] * rim[..., None] * 0.9
planet_alpha = inside.astype(float)
# 大气光晕
glow_r = np.sqrt(rr)
glow = np.clip(np.exp(-((glow_r - 1.0) / 0.16) ** 2), 0, 1) * (glow_r > 0.98)
glow_rgb = (ELECTRIC * 0.6 + CYAN * 0.4)[None, None] * glow[..., None] * (0.35 + 0.65 * np.clip(-dx * 0.6 - dy * 0.6 + 0.5, 0, 1))[..., None]
# 光环：倾斜椭圆环带（前半在行星前，后半在行星后）
tilt = -0.42
ex, ey = (xx - cx), (yy - cy)
# 旋转坐标
ca, sa = np.cos(tilt), np.sin(tilt)
rx = ex * ca - ey * sa
ry = ex * sa + ey * ca
ring_a, ring_b = 470.0, 128.0  # 椭圆半轴
e = np.sqrt((rx / ring_a) ** 2 + (ry / ring_b) ** 2)
ring_tex = fbm(PH, PW, octaves=4, base=8)
band = np.clip(1 - np.abs((e - 0.86) / 0.18), 0, 1) ** 0.8
band *= 0.55 + 0.45 * np.sin(e * 90 + ring_tex * 6) ** 2
gap = np.clip(1 - np.abs((e - 0.80) / 0.02), 0, 1)
band *= 1 - 0.8 * gap
ring_alpha = band * 0.85
ring_rgb = (ELECTRIC * 0.55 + NEBULA * 0.3 + np.array([0.9, 0.95, 1.0]) * 0.35)[None, None] * np.ones((PH, PW, 1))
ring_rgb *= (0.45 + 0.55 * np.clip(ring_tex * 1.6, 0, 1))[..., None]
front = ry > 0  # 旋转后 y>0 的一侧视为靠近观众
# 行星投到光环上的阴影
shadow = np.exp(-(((rx + 40) / 300) ** 2)) * (ry > 0) * (np.abs(ry) < 80)
ring_rgb *= 1 - 0.6 * shadow[..., None]

out_rgb = np.zeros((PH, PW, 3))
out_a = np.zeros((PH, PW))


def over(rgb: np.ndarray, a: np.ndarray) -> None:
    global out_rgb, out_a
    a3 = a[..., None]
    out_rgb = rgb * a3 + out_rgb * (1 - a3)
    out_a = a + out_a * (1 - a)


over(ring_rgb, ring_alpha * (~front))
over(glow_rgb, glow * 0.9)
over(planet, planet_alpha)
over(ring_rgb, ring_alpha * front)
# 预乘转直通（避免边缘发黑）
safe = np.where(out_a[..., None] > 1e-4, out_rgb / np.maximum(out_a[..., None], 1e-4), 0)
planet_img = to_img(safe, out_a)
save(planet_img, 'planet-900', 68)
save(planet_img.resize((520, 520), Image.LANCZOS), 'planet-520', 66)

# ------------------------------------------------------------------ 平铺星点
T = 640
tile = stars(T, T, 0.0018, 1.0)
# 让四边接缝自然：平铺后模糊再裁回
tiled = np.tile(tile, (2, 2, 1))
tiled = gaussian_filter(tiled, sigma=(0.3, 0.3, 0))
tile = tiled[T // 2 : T // 2 + T, T // 2 : T // 2 + T]
lum = tile.max(axis=2)
tile_img = to_img(np.clip(tile / np.maximum(lum[..., None], 1e-4), 0, 1), lum)
tile_img.save(OUT / 'stars-tile.webp', 'WEBP', lossless=False, quality=80, method=6, exact=False)
print('stars-tile.webp:', os.path.getsize(OUT / 'stars-tile.webp') // 1024, 'KB')
