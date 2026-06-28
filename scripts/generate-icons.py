import os
from PIL import Image

def generate_icons():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_icon_path = os.path.join(project_root, "android-assets", "icon.png")
    web_assets_path = os.path.join(project_root, "public", "assets", "icon.png")
    res_path = os.path.join(project_root, "android", "app", "src", "main", "res")

    print("==============================================")
    print("      LAUNCHER ICON GENERATOR IN PROGRESS      ")
    print("==============================================")

    if not os.path.exists(source_icon_path):
        print(f"Error: Source icon not found at {source_icon_path}")
        return False

    try:
        # Load the base image
        img = Image.open(source_icon_path)
        print(f"Loaded source icon: {source_icon_path} ({img.width}x{img.height})")

        # 1. Save to web public assets (for the in-game splash screen)
        os.makedirs(os.path.dirname(web_assets_path), exist_ok=True)
        img.save(web_assets_path, "PNG")
        print(f"Copied base icon to web assets: {web_assets_path}")

        # Choose the best resampling filter depending on PIL version
        try:
            resample_filter = Image.Resampling.LANCZOS
        except AttributeError:
            resample_filter = Image.ANTIALIAS

        # 2. Resize and generate standard and adaptive mipmaps
        mipmaps = [
            ("mipmap-mdpi", 48, 108),
            ("mipmap-hdpi", 72, 162),
            ("mipmap-xhdpi", 96, 216),
            ("mipmap-xxhdpi", 144, 324),
            ("mipmap-xxxhdpi", 192, 432)
        ]

        for folder, launcher_size, foreground_size in mipmaps:
            folder_path = os.path.join(res_path, folder)
            if not os.path.exists(folder_path):
                print(f"Warning: Resource folder {folder} does not exist. Skipping.")
                continue

            # Standard Launcher Icon
            launcher_img = img.resize((launcher_size, launcher_size), resample_filter)
            launcher_img.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
            
            # Round Launcher Icon
            round_img = img.resize((launcher_size, launcher_size), resample_filter)
            round_img.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

            # Adaptive Foreground Icon
            fg_img = img.resize((foreground_size, foreground_size), resample_filter)
            fg_img.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

            print(f"Generated launcher icons for {folder} (Standard/Round: {launcher_size}px, Foreground: {foreground_size}px)")

        print("==============================================")
        print("    SUCCESS: ALL LAUNCHER ICONS GENERATED!    ")
        print("==============================================")
        return True

    except Exception as e:
        print("Error compiling Android icons:", str(e))
        return False

if __name__ == "__main__":
    generate_icons()
