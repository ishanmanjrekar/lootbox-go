import os
from PIL import Image

def clean_box7(src_path, dest_path):
    print(f"Smart cleaning {src_path} -> {dest_path}")
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return
        
    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    to_check = []
    
    # Add all edge pixels as starting points
    for x in range(width):
        to_check.append((x, 0))
        to_check.append((x, height - 1))
    for y in range(height):
        to_check.append((0, y))
        to_check.append((width - 1, y))
        
    while to_check:
        cx, cy = to_check.pop(0)
        if (cx, cy) in visited:
            continue
        visited.add((cx, cy))
        
        if cx < 0 or cx >= width or cy < 0 or cy >= height:
            continue
            
        r, g, b, a = pixels[cx, cy]
        
        # Determine if this pixel is part of the rocket
        # 1. Dark outline: R, G, B are all very low
        is_outline = (r < 45 and g < 45 and b < 45)
        
        # 2. Saturated color (pink or green): high difference between channels
        is_saturated = (max(r, g, b) - min(r, g, b)) > 15
        
        if is_outline or is_saturated:
            # We hit the rocket boundary! Do not clear this pixel and do not traverse further
            continue
            
        # Otherwise, it's background. Clear it and add neighbors
        pixels[cx, cy] = (0, 0, 0, 0)
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if (nx, ny) not in visited:
                to_check.append((nx, ny))
                
    img.save(dest_path)
    print(f"Saved clean image to {dest_path}")

if __name__ == "__main__":
    artifact_dir = "C:\\Users\\ishan\\.gemini\\antigravity-ide\\brain\\1d896c52-2db8-47ff-a1d1-305c8d1c87cc"
    dest_dir = "public/assets/boxes"
    
    clean_box7(
        os.path.join(artifact_dir, "box_7_closed_1782597406239.png"),
        os.path.join(dest_dir, "box-7-closed.png")
    )
    clean_box7(
        os.path.join(artifact_dir, "box_7_open_1782597415609.png"),
        os.path.join(dest_dir, "box-7-open.png")
    )
