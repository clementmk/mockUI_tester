# AUTO Browser Extension 🔌

Chrome extension for the Autonomous Mystery Shopper (AUTO) testing tool.

## Features

### 🖱️ Context Menu Integration
Right-click anywhere on a page to access "🚀 Test this flow with AUTO" with quick test scenarios:
- 📱 Signup Flow
- 🔐 Login Flow
- 📄 Upload Documents
- ⚙️ Custom Test

### 🎯 Popup Dashboard
Click the extension icon to see:
- Recent test history (last 10 tests)
- Quick test buttons for common scenarios
- Test status indicators (Passed/Failed/Running)
- Direct link to full dashboard

### ⚪ Floating Button
A draggable floating button appears on every page:
- Always accessible for quick testing
- Click to open quick test menu
- Drag to reposition (auto-snaps to screen edges)
- Minimal and unobtrusive design

### 🔔 Instant Notifications
Get Chrome notifications when:
- Tests start running
- Tests complete (with pass/fail status)
- Badge counter shows active test count

## Installation

### For Development

1. **Generate Icons** (required for Chrome to load the extension):
   ```bash
   cd icons
   # If you have ImageMagick installed:
   magick icon.svg -resize 16x16 icon16.png
   magick icon.svg -resize 48x48 icon48.png
   magick icon.svg -resize 128x128 icon128.png
   ```
   
   Or use an online converter at https://www.favicon-generator.org/ with the provided `icon.svg`

2. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `browser-extension` folder
   - The AUTO extension should now appear in your extensions

3. **Start the Dashboard Server**:
   ```bash
   cd "../frontend"
   python ../server.py
   ```
   The dashboard will be available at http://localhost:8001

4. **Use the Extension**:
   - Click the AUTO icon in Chrome toolbar to open popup
   - Right-click on any page to access quick tests
   - Look for the floating button in the bottom-right corner

## File Structure

```
browser-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker (context menus, notifications, storage)
├── content.js             # Floating button logic
├── content.css            # Floating button styles
├── popup/
│   ├── popup.html        # Popup interface
│   ├── popup.js          # Popup logic
│   └── popup.css         # Popup styles
└── icons/
    ├── icon.svg          # SVG template
    ├── icon16.png        # 16x16 icon (to be generated)
    ├── icon48.png        # 48x48 icon (to be generated)
    ├── icon128.png       # 128x128 icon (to be generated)
    └── README.md         # Icon generation guide
```

## How It Works

### Architecture
- **Manifest V3**: Modern Chrome Extension architecture
- **Service Worker**: Background script handles context menus, notifications, and storage
- **Content Script**: Injected into all pages for floating button
- **Popup**: Mini dashboard interface

### Communication Flow
```
User Action (Context Menu/Popup/Floating Button)
    ↓
Message to Background Service Worker
    ↓
Store in chrome.storage.local
    ↓
Send API request to localhost:8001
    ↓
Show Chrome notification
    ↓
Update badge counter
```

### Data Storage
Tests are stored in `chrome.storage.local`:
- Last 10 tests kept in history
- Each test includes: id, name, scenario, url, device, browser, status, timestamp

## Permissions

The extension requires:
- **contextMenus**: Right-click menu integration
- **notifications**: Test status alerts
- **storage**: Save recent test history
- **activeTab**: Get current page URL for testing
- **tabs**: Open dashboard in new tab
- **host_permissions** (localhost:8001): Connect to AUTO dashboard

## Customization

### Change Test Scenarios
Edit the scenario options in:
- `background.js` (lines 6-34) - Context menu items
- `popup/popup.html` (lines 21-36) - Quick test buttons
- `content.js` (lines 11-30) - Floating button menu

### Modify Appearance
- Popup: Edit `popup/popup.css`
- Floating Button: Edit `content.css`
- Colors: All use CSS variables matching main dashboard

### Integration with Backend
Update the API endpoint in `background.js`:
```javascript
// Line 48-65 in background.js
const response = await fetch('http://localhost:8001/api/tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
});
```

## Troubleshooting

### Extension Won't Load
- Make sure all icon files (icon16.png, icon48.png, icon128.png) exist in the `icons/` folder
- Check Chrome DevTools console for errors (`chrome://extensions/` → Details → Inspect views: service worker)

### Floating Button Not Appearing
- Check if content script loaded: Right-click page → Inspect → Console tab
- Verify `content.js` and `content.css` are listed in manifest.json

### Dashboard Won't Open
- Ensure the Python server is running on port 8001
- Check host_permissions in manifest.json includes "http://localhost:8001/*"

### Context Menu Missing
- Reload the extension: `chrome://extensions/` → Reload button
- Check service worker console for errors

## Development Tips

1. **Reload Extension**: After code changes, go to `chrome://extensions/` and click the reload icon
2. **Debug Service Worker**: Click "Inspect views: service worker" under the extension
3. **Debug Popup**: Right-click extension icon → Inspect popup
4. **Debug Content Script**: Open DevTools on any page where floating button appears
5. **View Storage**: In service worker console, run `chrome.storage.local.get(console.log)`

## Future Enhancements

- [ ] Real-time test progress updates via WebSocket
- [ ] Test history filtering and search
- [ ] Custom test configuration in popup
- [ ] Screenshot preview in popup
- [ ] Export test reports from extension
- [ ] Keyboard shortcuts for quick actions
- [ ] Multi-browser support (Firefox, Edge)

## Credits

Built for **Deriv Hackathon 2026**  
Part of the **Autonomous Mystery Shopper (AUTO)** project

---

**Need Help?** Check the main dashboard README or contact the AUTO team.
