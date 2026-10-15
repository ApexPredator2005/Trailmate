import math
import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

size = 1024
cx, cy = size // 2, size // 2
radius = int(size * 0.47)

im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(im)

# 1. Antique Spun Brass Metallic Base Disc
# Replicates the warm, glowing sunburst brushed brass dial in reference images 1, 2, 3, 4, 5
for r in range(radius, 0, -1):
    factor = r / radius
    # Brass gradient:
    # Center: #FCE8B2 (luminous warm gold)
    # Mid-radius: #E2C278 (rich antique brass)
    # Outer-radius: #A77C32 (burnished deep bronze)
    red = int(252 - (252 - 167) * (factor ** 1.25))
    green = int(232 - (232 - 124) * (factor ** 1.25))
    blue = int(178 - (178 - 50) * (factor ** 1.25))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))

# 2. Spun-Metal Micro Lathe Grooves (Concentric circular etching)
for r in range(20, radius, 3):
    alpha = 18 if (r % 6 == 0) else 10
    tone = 60 if (r % 2 == 0) else 240
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(tone, tone, tone, alpha), width=1)

# Outer burnished brass lip shadow & bezel seating ring
draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(55, 38, 14, 240), width=6)
draw.ellipse([cx - radius + 5, cy - radius + 5, cx + radius - 5, cy + radius - 5], outline=(180, 140, 60, 200), width=3)

# 3. Concentric Degree Calibration Tracks (References 1, 3, 4)
r_outer_track = radius - 14
r_inner_track = radius - 54
r_degree_nums = radius - 72
r_sub_track = radius - 90

draw.ellipse([cx - r_outer_track, cy - r_outer_track, cx + r_outer_track, cy + r_outer_track], outline=(22, 18, 12, 255), width=3)
draw.ellipse([cx - r_inner_track, cy - r_inner_track, cx + r_inner_track, cy + r_inner_track], outline=(22, 18, 12, 255), width=2)
draw.ellipse([cx - r_sub_track, cy - r_sub_track, cx + r_sub_track, cy + r_sub_track], outline=(40, 30, 18, 230), width=2)

# 4. 360 Degree Graduation Ticks (Sharp Archival Etching)
for deg in range(360):
    rad = math.radians(deg - 90) # 0 at top (North)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    
    is_cardinal = (deg % 90 == 0)
    is_ten = (deg % 10 == 0)
    is_five = (deg % 5 == 0)
    
    if is_cardinal:
        r_start = r_inner_track - 12
        width = 4
        color = (18, 14, 10, 255)
    elif is_ten:
        r_start = r_inner_track
        width = 3
        color = (22, 18, 12, 255)
    elif is_five:
        r_start = r_outer_track - 24
        width = 2
        color = (35, 26, 16, 240)
    else:
        r_start = r_outer_track - 14
        width = 1
        color = (55, 42, 26, 200)
        
    x0 = cx + cos_a * r_start
    y0 = cy + sin_a * r_start
    x1 = cx + cos_a * r_outer_track
    y1 = cy + sin_a * r_outer_track
    draw.line([(x0, y0), (x1, y1)], fill=color, width=width)

# Load fonts
try:
    font_cardinal = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 62)
    font_inter = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 26)
    font_numbers = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 17)
except Exception:
    font_cardinal = ImageFont.load_default()
    font_inter = font_cardinal
    font_numbers = font_cardinal

# 5. Degree Numbers every 10 degrees (10° to 360°, matching References 1, 3, 4)
for deg in range(10, 370, 10):
    if deg % 90 == 0:
        continue # Cardinal letters placed here
    rad = math.radians(deg - 90)
    tx = cx + math.cos(rad) * (r_degree_nums - 2)
    ty = cy + math.sin(rad) * (r_degree_nums - 2)
    label = str(deg if deg < 360 else 360)
    draw.text((tx, ty), label, fill=(24, 18, 12, 240), font=font_numbers, anchor="mm")

# 6. Inner Hairline Sunburst Guide Rays (32 fine astrolabe rays)
r_star_tip = r_sub_track - 18
for i in range(32):
    rad = math.radians(i * 11.25)
    x1 = cx + math.cos(rad) * r_star_tip
    y1 = cy + math.sin(rad) * r_star_tip
    draw.line([(cx, cy), (x1, y1)], fill=(95, 72, 38, 70), width=1)

# Inner concentric accent rings
draw.ellipse([cx - 264, cy - 264, cx + 264, cy + 264], outline=(36, 26, 14, 190), width=2)
draw.ellipse([cx - 192, cy - 192, cx + 192, cy + 192], outline=(65, 48, 26, 140), width=1)
draw.ellipse([cx - 104, cy - 104, cx + 104, cy + 104], outline=(36, 26, 14, 210), width=2)

# 7. The Iconic 16-Point Split-Facet Wind-Rose Star (References 1, 2, 3, 4, 5)
# 8 Primary Star Points
for p in range(8):
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
    
    # Left Half: Solid Archival Charcoal / Deep Burnished Bronze (#16120E)
    draw.polygon([(cx, cy), (tx, ty), (mx_prev, my_prev)], fill=(20, 16, 12, 255), outline=(10, 8, 5, 255))
    
    # Right Half: Luminous Polished Brass Facet Highlight (#FBF0CE)
    draw.polygon([(cx, cy), (tx, ty), (mx_next, my_next)], fill=(251, 240, 206, 255), outline=(45, 34, 18, 255))

# 8 Secondary Intermediate Star Points
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
    
    draw.polygon([(cx, cy), (tx, ty), (mx_prev, my_prev)], fill=(28, 22, 16, 255), outline=(10, 8, 5, 255))
    draw.polygon([(cx, cy), (tx, ty), (mx_next, my_next)], fill=(244, 228, 185, 255), outline=(45, 34, 18, 255))

# 8. Cardinal Typography ('N', 'E', 'S', 'W')
r_cardinal = r_sub_track + 26

# North in Vermilion Red with Ornate Heraldic Fleur-de-lis
draw.text((cx, cy - r_cardinal), "N", fill=(185, 28, 28, 255), font=font_cardinal, anchor="mm")

# Fleur-de-lis ornament above North
fl_y = cy - r_outer_track + 8
draw.polygon([(cx, fl_y - 18), (cx - 12, fl_y + 8), (cx, fl_y + 2), (cx + 12, fl_y + 8)], fill=(185, 28, 28, 255))
draw.ellipse([cx - 4, fl_y + 5, cx + 4, fl_y + 13], fill=(185, 28, 28, 255))

# East, South, West in deep ebony archival ink
draw.text((cx + r_cardinal, cy), "E", fill=(18, 14, 10, 255), font=font_cardinal, anchor="mm")
draw.text((cx, cy + r_cardinal), "S", fill=(18, 14, 10, 255), font=font_cardinal, anchor="mm")
draw.text((cx - r_cardinal, cy), "W", fill=(18, 14, 10, 255), font=font_cardinal, anchor="mm")

# Intercardinals (NE, SE, SW, NW)
r_inter = r_sub_track + 22
sqrt2 = 0.7071
draw.text((cx + r_inter * sqrt2, cy - r_inter * sqrt2), "NE", fill=(45, 34, 20, 230), font=font_inter, anchor="mm")
draw.text((cx + r_inter * sqrt2, cy + r_inter * sqrt2), "SE", fill=(45, 34, 20, 230), font=font_inter, anchor="mm")
draw.text((cx - r_inter * sqrt2, cy + r_inter * sqrt2), "SW", fill=(45, 34, 20, 230), font=font_inter, anchor="mm")
draw.text((cx - r_inter * sqrt2, cy - r_inter * sqrt2), "NW", fill=(45, 34, 20, 230), font=font_inter, anchor="mm")

# 9. Central Brass Pivot Spindle Rings
draw.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], fill=(175, 135, 62, 255), outline=(65, 45, 18, 255), width=4)
draw.ellipse([cx - 42, cy - 42, cx + 42, cy + 42], fill=(225, 182, 92, 255), outline=(125, 90, 35, 255), width=3)
draw.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], fill=(245, 212, 130, 255), outline=(85, 60, 22, 255), width=2)
# Center socket hole for 3D needle boss
draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(30, 20, 10, 255), outline=(12, 8, 4, 255), width=2)

# Save to public images
target_path = "public/images/compass_dial_vintage_hd.png"
im.save(target_path, "PNG", optimize=True)
print(f"Generated museum-grade antique spun-brass dial texture: {target_path} ({os.path.getsize(target_path)} bytes)")
