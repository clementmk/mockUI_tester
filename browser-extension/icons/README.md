# Extension Icons

## Icon Design
The AUTO extension icons feature:
- Dark background (#0a0a0a)
- Gradient circle logo (◉) in green-to-blue gradient (#00ff88 to #0088ff)
- Modern, sleek appearance matching the AUTO brand

## Required Sizes
- **icon16.png**: 16x16px - Used in favicon and extension list
- **icon48.png**: 48x48px - Used in extension management page
- **icon128.png**: 128x128px - Used in Chrome Web Store and installation

## Generate Icons

### Option 1: Using SVG Template (Recommended)
Use the provided `icon.svg` template and convert to PNG at required sizes:

```bash
# Using ImageMagick
magick icon.svg -resize 16x16 icon16.png
magick icon.svg -resize 48x48 icon48.png
magick icon.svg -resize 128x128 icon128.png
```

### Option 2: Online Tool
1. Visit https://www.favicon-generator.org/
2. Upload the icon.svg
3. Generate and download all sizes

### Option 3: Manual Design
Use any graphic design tool (Figma, Canva, Photoshop) to create:
- Square canvas with dark background (#0a0a0a)
- Centered circle with gradient (#00ff88 to #0088ff)
- "AUTO" text in bold, modern font
- Export as PNG at 16px, 48px, and 128px

## Temporary Placeholder
For development, create simple colored squares:
- 16x16 green square as icon16.png
- 48x48 green square as icon48.png
- 128x128 green square with "AUTO" text as icon128.png

## Note
The current placeholder icons are basic. For production/demo, create professional icons using the SVG template or design tools.
