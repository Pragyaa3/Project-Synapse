# Generate Extension Icons

You need to create 3 PNG icon files for the Chrome extension.

## Quick Method: Use an Online Tool

1. Go to: https://www.favicon-generator.org/
2. Upload any brain emoji image or the `icon.svg` file
3. Download and extract the icons
4. Rename them:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png` (resize to 48x48)
   - `android-chrome-192x192.png` → `icon128.png` (resize to 128x128)

## Alternative: Use Figma/Canva

1. Create a 128x128px canvas
2. Add purple gradient background (#667eea to #764ba2)
3. Add brain emoji 🧠 in white
4. Export as PNG
5. Create 48x48 and 16x16 versions

## Or Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Convert SVG to PNG at different sizes
magick icon.svg -resize 128x128 icon128.png
magick icon.svg -resize 48x48 icon48.png
magick icon.svg -resize 16x16 icon16.png
```

## Temporary Workaround

For testing, you can use emoji as text in the manifest (already done), but proper icons look better in production.

## Icon Requirements

- **icon16.png**: 16x16 pixels (toolbar, context menu)
- **icon48.png**: 48x48 pixels (extensions page)
- **icon128.png**: 128x128 pixels (Chrome Web Store, installation)

All should be PNG format with transparent or gradient background.
