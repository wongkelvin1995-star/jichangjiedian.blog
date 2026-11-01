"""生成“火焰框”边框素材（站长 2026-11-01 给的参考图风格：发光的立体双线框，四条边缠绕火焰）。

输出：public/images/space/fire-frame.webp（1000×1000，透明底），供 CSS border-image 九宫格使用：
  - border-image-slice = 200：四个角各 200×200，四条边中间 600 像素一段会重复铺开（round），
    所以边上的火焰沿边方向按 600 像素周期生成，铺开时没有接缝，重复也不明显；
  - 外框线在距图边 62 像素处，内框线 82 像素，四角有斜线连起来，看起来像一个有厚度的玻璃框；
  - 火焰往上烧：上边的火焰在框外，下边的火焰从内框线往框里烧，左右两边贴着内框线往里、往上卷。
另外输出 fire-frame-preview.png（叠在深色底上，只用来看效果，不发布）。

全部由程序生成，固定随机种子，重复运行得到同样的图；没有使用任何第三方图片。
用法：python3 scripts/make-fire-frame.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'images' / 'space'
PREVIEW = ROOT / '.scratch' / 'fire-frame-preview.png'

S = 200          # 九宫格切片（四个角的大小）
P = 600          # 边上重复段的长度（火焰沿边方向的周期）
N = 2 * S + P    # 贴图边长
O = 62           # 外框线位置
I = 82           # 内框线位置
rng = np.random.default_rng(20261101)

yy, xx = np.mgrid[0:N, 0:N].astype(np.float64)


def make_perlin(cells_s: int):
    """二维梯度噪声：沿 s 方向每 P 像素正好 cells_s 格并首尾相接（周期 P），另一方向不周期。返回函数 f(s, t, cell_t)，值约 [-1, 1]。"""
    m = 4096
    ang = rng.uniform(0, 2 * np.pi, size=(cells_s * 64, m))
    gx, gy = np.cos(ang), np.sin(ang)

    def layer(s, t, cs, ct):
        x = s / P * cs
        y = t / ct + 1000.0
        x0 = np.floor(x).astype(np.int64)
        y0 = np.floor(y).astype(np.int64)
        fx, fy = x - x0, y - y0

        def dot(ix, iy, dx, dy):
            ix = np.mod(ix, cs)
            iy = np.mod(iy, m)
            return gx[ix, iy] * dx + gy[ix, iy] * dy

        n00 = dot(x0, y0, fx, fy)
        n10 = dot(x0 + 1, y0, fx - 1, fy)
        n01 = dot(x0, y0 + 1, fx, fy - 1)
        n11 = dot(x0 + 1, y0 + 1, fx - 1, fy - 1)
        u = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
        v = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
        return (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v

    def fbm(s, t, ct, octaves=5):
        out = np.zeros_like(s)
        amp, tot = 1.0, 0.0
        for o in range(octaves):
            out += amp * layer(s, t, cells_s * 2 ** o, ct / 2 ** o)
            tot += amp
            amp *= 0.5
        return out / tot * 1.6

    return fbm


def smooth(e0, e1, v):
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def horizontal_flames(y0: float, hmin: float, hmax: float):
    """从水平线 y0 往上烧的火舌（沿 x 周期 P）：高度渐变 + 噪声，噪声高的地方火舌窜得更高"""
    warp = make_perlin(9)
    body = make_perlin(12)
    h = y0 - yy
    hn = np.clip(h / hmax, 0, 1)
    s = xx + 20.0 * warp(xx, h, 44.0, 3) * hn
    g = np.clip(1 - h / hmax, -1, 1)
    n = body(s, h + 0.0, 46.0)
    f = 0.85 * g + 0.85 * n - 0.2
    above = smooth(0.1, 0.95, f) * smooth(-2, hmin * 0.3, h + hmin * 0.3)
    below = np.exp(-((h / 5.0) ** 2)) * 0.9
    return np.where(h >= 0, np.maximum(above, below * (h < 6)), below)


def vertical_flames(x0: float, wmin: float, wmax: float, mirror: bool):
    """贴着竖线 x0 往框里卷、往上飘的火焰（沿 y 周期 P）：火舌朝里伸、朝上斜"""
    warp = make_perlin(9)
    body = make_perlin(12)
    x = (N - 1 - xx) if mirror else xx
    d = x - x0
    dn = np.clip(d / wmax, 0, 1)
    t = yy + 0.9 * np.clip(d, 0, None)
    t = t + 14.0 * warp(t, d, 36.0, 3) * dn
    g = np.clip(1 - d / wmax, -1, 1)
    n = body(t, d, 26.0)
    f = 0.85 * g + 0.85 * n - 0.24
    inside = smooth(0.1, 0.95, f)
    outside = np.exp(-((d / 5.0) ** 2)) * 0.9
    return np.where(d >= 0, np.maximum(inside, outside * (d < 6)), outside)


def screen(a, b):
    return 1 - (1 - a) * (1 - b)


# ---------------------------------------------------------------- 火焰强度场
lo, hi = O - 2, N - 1 - O + 2
mask_x = smooth(lo - 8, lo + 10, xx) * smooth(hi + 8, hi - 10, xx)   # 水平火焰只在框的左右端之间
mask_y = smooth(lo - 8, lo + 10, yy) * smooth(hi + 8, hi - 10, yy)   # 竖直火焰只在框的上下端之间

top = horizontal_flames(O, 8, 50) * mask_x * 0.8          # 上边：框外的火舌，比下边矮、暗一些
bottom = horizontal_flames(N - 1 - I, 18, 98) * mask_x     # 下边：从内框线往框里烧（最高 98，不越过下边切片线 N-S）
left = vertical_flames(I, 12, 96, mirror=False) * mask_y   # 左右：往框里最多 96（不越过左边切片线 S）
right = vertical_flames(I, 12, 96, mirror=True) * mask_y
fire = screen(screen(top, bottom), screen(left, right))
fire = np.clip(fire, 0, 1)


# ---------------------------------------------------------------- 霓虹双线框 + 四角斜线
def seg_dist(ax, ay, bx, by):
    px, py = xx - ax, yy - ay
    vx, vy = bx - ax, by - ay
    t = np.clip((px * vx + py * vy) / (vx * vx + vy * vy), 0, 1)
    return np.hypot(px - t * vx, py - t * vy)


def rect_dist(k):
    a, b = k, N - 1 - k
    return np.minimum.reduce([seg_dist(a, a, b, a), seg_dist(a, b, b, b), seg_dist(a, a, a, b), seg_dist(b, a, b, b)])


a0, a1, b0, b1 = O, I, N - 1 - O, N - 1 - I
diag = np.minimum.reduce([seg_dist(a0, a0, a1, a1), seg_dist(b0, a0, b1, a1), seg_dist(a0, b0, a1, b1), seg_dist(b0, b0, b1, b1)])
d_outer, d_inner = rect_dist(O), rect_dist(I)
core = np.maximum.reduce([np.exp(-((d_outer / 1.05) ** 2)), np.exp(-((d_inner / 0.9) ** 2)) * 0.8, np.exp(-((diag / 0.9) ** 2)) * 0.85])
halo = np.maximum.reduce([np.exp(-((d_outer / 5.5) ** 2)) * 0.75, np.exp(-((d_inner / 4.5) ** 2)) * 0.5, np.exp(-((diag / 4.0) ** 2)) * 0.5])
haze = np.exp(-((d_outer / 16) ** 2)) * 0.28
# 内外框之间的“玻璃面”：很淡的一层暖光，让框看起来有厚度
between = ((np.minimum(xx, N - 1 - xx) >= O) & (np.minimum(yy, N - 1 - yy) >= O)) & ~((np.minimum(xx, N - 1 - xx) > I) & (np.minimum(yy, N - 1 - yy) > I))
face = between * 0.1

# ---------------------------------------------------------------- 上色（预乘透明度）
stops = np.array([0.0, 0.14, 0.34, 0.56, 0.76, 0.92, 1.0])
cols = np.array([
    [40, 0, 0],
    [128, 14, 0],
    [206, 44, 4],
    [250, 98, 14],
    [255, 158, 40],
    [255, 210, 104],
    [255, 240, 186],
], dtype=np.float64)
alph = np.array([0.0, 0.3, 0.7, 0.9, 1.0, 1.0, 1.0])
fire = fire * (1 - 0.45 * between)
rgb_f = np.stack([np.interp(fire, stops, cols[:, c]) for c in range(3)], axis=-1)
a_f = np.interp(fire, stops, alph)
prem = rgb_f * a_f[..., None]

# 光晕（bloom）：把火焰模糊后叠一层
bloom_img = Image.fromarray(np.clip(prem, 0, 255).astype(np.uint8), 'RGB').filter(ImageFilter.GaussianBlur(9))
bloom = np.asarray(bloom_img).astype(np.float64) * 0.55

line_rgb = (core[..., None] * np.array([255, 246, 214]) + halo[..., None] * np.array([255, 128, 34]) + haze[..., None] * np.array([255, 92, 20])
            + face[..., None] * np.array([255, 120, 40]))
line_a = np.clip(core + halo + haze + face, 0, 1)

E = prem + bloom + line_rgb
A = np.clip(a_f + bloom.max(axis=-1) / 255.0 + line_a, 0, 1)
E = np.minimum(E, 255 * A[..., None])     # 预乘颜色不能超过透明度
rgb = np.where(A[..., None] > 1e-4, E / np.maximum(A[..., None], 1e-4), 0)
out = np.dstack([np.clip(rgb, 0, 255), A * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / 'fire-frame.webp', 'WEBP', quality=74, method=6, alpha_quality=80)
PREVIEW.parent.mkdir(parents=True, exist_ok=True)
bg = Image.new('RGBA', (N, N), (11, 18, 40, 255))
bg.alpha_composite(img)
bg.convert('RGB').save(PREVIEW)
print('wrote', OUT / 'fire-frame.webp', (OUT / 'fire-frame.webp').stat().st_size, 'bytes')
