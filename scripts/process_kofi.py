import os
import sys
from PIL import Image

def process_kofi_icon(input_path, output_path, target_size=256):
    print(f"Processing image from {input_path}")
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} does not exist.")
        return False
        
    # Open the image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Create a pixel map
    pixels = img.load()
    
    # We want to perform a flood fill from the corners (0,0), (width-1, 0), (0, height-1), (width-1, height-1)
    # to find the background pixels.
    # We'll treat pixels that are "close to white" as background.
    visited = set()
    to_visit = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    # Add all border pixels to ensure we get everything if there are tiny gaps
    for x in range(width):
        to_visit.append((x, 0))
        to_visit.append((x, height-1))
    for y in range(height):
        to_visit.append((0, y))
        to_visit.append((width-1, y))
        
    background_pixels = set()
    
    # Simple BFS flood fill
    while to_visit:
        cx, cy = to_visit.pop(0)
        if (cx, cy) in visited:
            continue
        visited.add((cx, cy))
        
        # Check if coordinates are in bounds
        if cx < 0 or cx >= width or cy < 0 or cy >= height:
            continue
            
        r, g, b, a = pixels[cx, cy]
        
        # Check if the pixel is white-ish (high RGB values)
        # The generated image has a pure white or very light background
        is_whitish = (r > 240 and g > 240 and b > 240)
        
        if is_whitish:
            background_pixels.add((cx, cy))
            # Check neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if (nx, ny) not in visited:
                    to_visit.append((nx, ny))
                    
    # Now set all detected background pixels to transparent
    for x, y in background_pixels:
        pixels[x, y] = (255, 255, 255, 0)
        
    # Find bounding box of non-transparent pixels to crop it tightly
    bbox_left = width
    bbox_right = 0
    bbox_top = height
    bbox_bottom = 0
    
    for x in range(width):
        for y in range(height):
            _, _, _, a = pixels[x, y]
            if a > 0:
                if x < bbox_left:
                    bbox_left = x
                if x > bbox_right:
                    bbox_right = x
                if y < bbox_top:
                    bbox_top = y
                if y > bbox_bottom:
                    bbox_bottom = y
                    
    if bbox_right < bbox_left or bbox_bottom < bbox_top:
        print("Error: Image is completely transparent.")
        return False
        
    # Crop the image with some padding (e.g. 10 pixels around it)
    padding = 16
    crop_left = max(0, bbox_left - padding)
    crop_top = max(0, bbox_top - padding)
    crop_right = min(width, bbox_right + padding)
    crop_bottom = min(height, bbox_bottom + padding)
    
    cropped_img = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    
    # Pad to square before resizing to prevent stretching
    c_width, c_height = cropped_img.size
    max_dim = max(c_width, c_height)
    square_img = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 0))
    # Center the cropped image in the new square image
    offset_x = (max_dim - c_width) // 2
    offset_y = (max_dim - c_height) // 2
    square_img.paste(cropped_img, (offset_x, offset_y))
    
    # Resize to target size using Lanczos resampling
    final_size = (target_size, target_size)
    resized_img = square_img.resize(final_size, Image.Resampling.LANCZOS)
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the processed image
    resized_img.save(output_path, "PNG")
    print(f"Successfully processed and saved image to {output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_kofi.py <input_path> <output_path> [target_size]")
        sys.exit(1)
    size = 256
    if len(sys.argv) >= 4:
        try:
            size = int(sys.argv[3])
        except ValueError:
            pass
    process_kofi_icon(sys.argv[1], sys.argv[2], size)
