# 🚀 Quick Start Guide - AUTO Browser Extension

Get your AUTO extension up and running in 3 simple steps!

## Prerequisites
- Google Chrome browser
- Python 3.x (for running the dashboard server)

## Step 1: Generate Extension Icons

### Option A: Using Python (Recommended)
```bash
cd browser-extension
pip install pillow
python generate_icons.py
```

### Option B: Online Tool
1. Open `icons/icon.svg` in your browser
2. Use https://www.favicon-generator.org/ to generate PNGs
3. Download and save as `icon16.png`, `icon48.png`, `icon128.png` in the `icons/` folder

### Option C: Manual (Quick & Dirty)
Create simple colored squares using any image editor and save them in the `icons/` folder:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Step 2: Load Extension in Chrome

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **"Load unpacked"** button

4. Select the `browser-extension` folder

5. The AUTO extension should now appear! ✅

## Step 3: Start the Dashboard Server

```bash
cd frontend
python server.py
```

The dashboard will be available at: http://localhost:8001

## 🎉 You're Ready!

### Try These Features:

1. **Popup Dashboard**
   - Click the AUTO extension icon in Chrome toolbar
   - See recent tests and quick actions

2. **Context Menu**
   - Right-click anywhere on a webpage
   - Look for "🚀 Test this flow with AUTO"
   - Select a test scenario

3. **Floating Button**
   - Look for the glowing AUTO button in bottom-right corner
   - Click to open quick test menu
   - Drag to reposition (snaps to edges)

4. **Full Dashboard**
   - Visit http://localhost:8001
   - See detailed analytics and test reports

## Troubleshooting

### "Extension failed to load"
- **Missing icons**: Make sure icon16.png, icon48.png, and icon128.png exist in the `icons/` folder
- **Solution**: Run `python generate_icons.py` in the browser-extension directory

### "Floating button not showing"
- Reload the page after installing the extension
- Check if the extension is enabled at `chrome://extensions/`

### "Dashboard won't open"
- Make sure the server is running: `python server.py`
- Check that it's on port 8001
- Try accessing http://localhost:8001 directly

### Context menu missing
- Reload the extension: Go to `chrome://extensions/` and click the reload icon
- Restart Chrome if needed

## What's Next?

- Start testing! Right-click on any page to run a test
- Check out the full dashboard for analytics
- Read the main README.md for detailed documentation

## Need Help?

Check the main `browser-extension/README.md` for:
- Detailed architecture information
- Customization options
- Development tips
- API integration guide

---

**Happy Testing! 🧪**
