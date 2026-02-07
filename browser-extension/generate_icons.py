"""
Simple icon generator for AUTO extension using PIL (Pillow)
Creates placeholder PNG icons at required sizes

Install Pillow first:
    pip install pillow

Run this script:
    python generate_icons.py
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os

    # Icon sizes
    sizes = [16, 48, 128]

    # Colors
    bg_color = (10, 10, 10)  # #0a0a0a
    primary_color = (0, 255, 136)  # #00ff88
    secondary_color = (0, 136, 255)  # #0088ff

    def create_icon(size):
        # image with dark background
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)
        
        # dimensions
        padding = size // 8
        circle_size = size - (padding * 2)
        
        # gradient circle 
        circle_bbox = [padding, padding, size - padding, size - padding]
        draw.ellipse(circle_bbox, outline=primary_color, width=max(1, size // 20))
        
        # center dot
        center = size // 2
        dot_radius = size // 8
        dot_bbox = [
            center - dot_radius,
            center - dot_radius,
            center + dot_radius,
            center + dot_radius
        ]
        draw.ellipse(dot_bbox, fill=primary_color)
        
        # Add "AUTO" text for larger icons
        if size >= 48:
            try:
                font_size = size // 6
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()
                
                text = "AUTO"
                # centering
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                text_x = (size - text_width) // 2
                text_y = size - padding - text_height - padding // 2
                
                draw.text((text_x, text_y), text, fill=primary_color, font=font)
            except Exception as e:
                print(f"Could not add text to {size}px icon: {e}")
        
        return img

    # Create icons directory if it doesn't exist
    icons_dir = "icons"
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)

    # Generate icons
    print("Generating AUTO extension icons...")
    for size in sizes:
        icon = create_icon(size)
        filename = f"{icons_dir}/icon{size}.png"
        icon.save(filename)
        print(f"✓ Created {filename}")

    print("\n✅ All icons generated successfully!")
    print("You can now load the extension in Chrome.")

except ImportError:
    print("❌ Pillow (PIL) is not installed.")
    print("\nInstall it using:")
    print("    pip install pillow")
    print("\nThen run this script again:")
    print("    python generate_icons.py")
    print("\n" + "="*50)
    print("\nAlternative: Generate icons online")
    print("1. Open icons/icon.svg in a browser")
    print("2. Take a screenshot")
    print("3. Use https://www.favicon-generator.org/ to create all sizes")
    print("4. Save as icon16.png, icon48.png, icon128.png in icons/ folder")
