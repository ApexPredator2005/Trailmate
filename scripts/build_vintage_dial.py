import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

size = 1024
cx, cy = size // 2, size // 2
radius = int(size * 0.47)

im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(im)

# 1. Aged Parchment Disc Base with realistic vignette
for r in range(radius, 0, -1):
    factor = r / radius
    # Vintage parchment: center #FDFBF3 -> mid #F2E7D1 -> perimeter #D2BE99
    red = int(253 - (253 - 210) * (factor ** 1.35))
    green = int(251 - (251 - 190) * (factor ** 1.35))
    blue = int(243 - (243 - 153) * (factor ** 1.35))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))

# Outer brass lip shadow
draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(75, 55, 25, 220), width=5)
draw.ellipse([cx - radius + 5, cy - radius + 5, cx + radius - 5, cy + radius - 5], outline=(140, 110, 60, 180), width=3)

# 2. Concentric Degree Calibration Tracks
r_outer_track = radius - 14
r_inner_track = radius - 52
r_degree_nums = radius - 70
r_sub_track = radius - 88

draw.ellipse([cx - r_outer_track, cy - r_outer_track, cx + r_outer_track, cy + r_outer_track], outline=(20, 18, 16, 255), width=3)
draw.ellipse([cx - r_inner_track, cy - r_inner_track, cx + r_inner_track, cy + r_inner_track], outline=(20, 18, 16, 255), width=2)
draw.ellipse([cx - r_sub_track, cy - r_sub_track, cx + r_sub_track, cy + r_sub_track], outline=(50, 42, 32, 230), width=2)

# 3. 360 Degree Graduation Ticks
for deg in range(360):
    rad = math.radians(deg - 90) # 0 at top
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    
    is_cardinal = (deg % 90 == 0)
    is_ten = (deg % 10 == 0)
    is_five = (deg % 5 == 0)
    
    if is_cardinal:
        r_start = r_inner_track - 10
        width = 4
        color = (20, 18, 16, 255)
    elif is_ten:
        r_start = r_inner_track
        width = 3
        color = (25, 22, 19, 255)
    elif is_five:
        r_start = r_outer_track - 22
        width = 2
        color = (45, 38, 30, 240)
    else:
        r_start = r_outer_track - 14
        width = 1
        color = (70, 58, 45, 200)
        
    x0 = cx + cos_a * r_start
    y0 = cy + sin_a * r_start
    x1 = cx + cos_a * r_outer_track
    y1 = cy + sin_a * r_outer_track
    draw.line([(x0, y0), (x1, y1)], fill=color, width=width)

# Try loading standard font or fallback
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 52)
    font_cardinal = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 60)
    font_inter = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 28)
    font_numbers = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 18)
except Exception:
    font_large = ImageFont.load_default()
    font_cardinal = font_large
    font_inter = font_large
    font_numbers = font_large

# 4. Degree Numbers on every 10 degrees (matching Reference 1 & 3)
for deg in range(10, 370, 10):
    if deg % 90 == 0:
        continue # Cardinal letters will be placed near here
    rad = math.radians(deg - 90)
    tx = cx + math.cos(rad) * (r_degree_nums - 2)
    ty = cy + math.sin(rad) * (r_degree_nums - 2)
    label = str(deg if deg < 360 else 360)
    # Draw centered
    draw.text((tx, ty), label, fill=(28, 24, 20, 240), font=font_numbers, anchor="mm")

# 5. Inner Hairline Sunburst Rays (32 fine guide rays)
r_star_tip = r_sub_track - 18
for i in range(32):
    rad = math.radians(i * 11.25)
    x1 = cx + math.cos(rad) * r_star_tip
    y1 = cy + math.sin(rad) * r_star_tip
    draw.line([(cx, cy), (x1, y1)], fill=(120, 98, 68, 80), width=1)

# Inner concentric accent rings
draw.ellipse([cx - 260, cy - 260, cx + 260, cy + 260], outline=(40, 32, 22, 180), width=2)
draw.ellipse([cx - 190, cy - 190, cx + 190, cy + 190], outline=(80, 65, 45, 140), width=1)
draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], outline=(40, 32, 22, 200), width=2)

# 6. The Iconic 16-Point Split-Facet Compass Rose (matching References 1, 2, 3, 4!)
# 8 Primary Star Points
primary_points = 8
for p in range(primary_points):
    tip_rad = math.radians(p * 45 - 90)
    mid_rad_next = math.radians(p * 45 - 90 + 22.5)
    mid_rad_prev = math.radians(p * 45 - 90 - 22.5)
    
    r_tip = r_star_tip if (p % 2 == 0) else (r_star_tip * 0.78)
    r_mid = r_star_tip * 0.32
    
    tx = cx + math.cos(tip_rad) * r_tip
    ty = cy + math.sin(tip_rad) * r_tip
    
    mx_next = cx + math.cos(mid_rad_next) * r_mid
    my_next = cy + math.sin(mid_rad_next) * r_mid
    
    mx_prev = cx + math.cos(mid_rad_prev) * r_mid
    my_prev = cy + math.sin(mid_rad_prev) * r_mid
    
    # Left Half: Solid Ebony Black / Dark Charcoal Ink
    draw.polygon([(cx, cy), (tx, ty), (mx_prev, my_prev)], fill=(18, 16, 14, 255), outline=(10, 8, 6, 255))
    
    # Right Half: Warm Vintage Aged Ivory / Antique Brass
    draw.polygon([(cx, cy), (tx, ty), (mx_next, my_next)], fill=(244, 234, 208, 255), outline=(40, 32, 22, 255))

# Secondary Intermediate Star Points (smaller 8 points)
for s in range(8):
    tip_rad = math.radians(s * 45 - 90 + 22.5)
    mid_rad_next = math.radians(s * 45 - 90 + 22.5 + 11.25)
    mid_rad_prev = math.radians(s * 45 - 90 + 22.5 - 11.25)
    
    r_tip = r_star_tip * 0.58
    r_mid = r_star_tip * 0.22
    
    tx = cx + math.cos(tip_rad) * r_tip
    ty = cy + math.sin(tip_rad) * r_tip
    mx_next = cx + math.cos(mid_rad_next) * r_mid
    my_next = cy + math.sin(mid_rad_next) * r_mid
    mx_prev = cx + math.cos(mid_rad_prev) * r_mid
    my_prev = cy + math.sin(mid_rad_prev) * r_mid
    
    draw.polygon([(cx, cy), (tx, ty), (mx_prev, my_prev)], fill=(25, 22, 19, 255), outline=(10, 8, 6, 255))
    draw.polygon([(cx, cy), (tx, ty), (mx_next, my_next)], fill=(235, 222, 192, 255), outline=(40, 32, 22, 255))

# 7. Cardinal Serif Typography ('N', 'E', 'S', 'W')
# North: Rich Vermilion with antique fleur-de-lis
r_cardinal = r_sub_track + 26
draw.text((cx, cy - r_cardinal), "N", fill=(185, 28, 28, 255), font=font_cardinal, anchor="mm")

# Fleur-de-lis heraldic crest at North tip
fl_y = cy - r_outer_track + 8
draw.polygon([(cx, fl_y - 16), (cx - 10, fl_y + 8), (cx, fl_y + 3), (cx + 10, fl_y + 8)], fill=(185, 28, 28, 255))
draw.ellipse([cx - 4, fl_y + 4, cx + 4, fl_y + 12], fill=(185, 28, 28, 255))

# East, South, West in deep ebony archival ink
draw.text((cx + r_cardinal, cy), "E", fill=(18, 15, 12, 255), font=font_cardinal, anchor="mm")
draw.text((cx, cy + r_cardinal), "S", fill=(18, 15, 12, 255), font=font_cardinal, anchor="mm")
draw.text((cx - r_cardinal, cy), "W", fill=(18, 15, 12, 255), font=font_cardinal, anchor="mm")

# Inter-cardinals (NE, SE, SW, NW)
r_inter = r_sub_track + 22
sqrt2 = 0.7071
draw.text((cx + r_inter * sqrt2, cy - r_inter * sqrt2), "NE", fill=(55, 42, 28, 230), font=font_inter, anchor="mm")
draw.text((cx + r_inter * sqrt2, cy + r_inter * sqrt2), "SE", fill=(55, 42, 28, 230), font=font_inter, anchor="mm")
draw.text((cx - r_inter * sqrt2, cy + r_inter * sqrt2), "SW", fill=(55, 42, 28, 230), font=font_inter, anchor="mm")
draw.text((cx - r_inter * sqrt2, cy - r_inter * sqrt2), "NW", fill=(55, 42, 28, 230), font=font_inter, anchor="mm")

# 8. Central Brass Pivot Collar & Spindle Ring (matching Reference 1 & 3)
draw.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], fill=(180, 142, 70, 255), outline=(70, 52, 22, 255), width=4)
draw.ellipse([cx - 42, cy - 42, cx + 42, cy + 42], fill=(215, 175, 95, 255), outline=(130, 98, 40, 255), width=3)
draw.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], fill=(238, 202, 122, 255), outline=(90, 68, 28, 255), width=2)
# Center hole for needle spindle
draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(35, 24, 12, 255), outline=(15, 10, 5, 255), width=2)

# Save to public images
target_path = "public/images/compass_dial_vintage_hd.png"
im.save(target_path, "PNG", optimize=True)
print(f"Generated museum-grade vintage dial texture: {target_path} ({os.path.getsize(target_path)} bytes)")
