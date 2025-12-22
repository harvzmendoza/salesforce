# PWA Setup Documentation

Your Laravel + React app is now configured as a Progressive Web App (PWA) with offline functionality.

## What Was Configured

### 1. Vite PWA Plugin
- Configured `vite-plugin-pwa` in `vite.config.js`
- Set up service worker with Workbox for offline caching
- Configured runtime caching strategies:
  - **Fonts**: Cache-first (1 year)
  - **API calls**: Network-first (5 minutes)
  - **Images**: Cache-first (30 days)

### 2. Service Worker Registration
- Added service worker registration in `resources/react/app.jsx`
- Uses Workbox Window for better control and update notifications
- Automatically prompts users when updates are available

### 3. PWA Manifest
- Added manifest link and meta tags to `resources/views/tasks.blade.php`
- Configured app name, theme colors, and display mode

### 4. Offline Indicator
- Created `OfflineIndicator` component to show when user is offline
- Automatically appears when network connection is lost

## Next Steps

### Generate PWA Icons

You need to create PWA icons before the app can be fully installed:

1. **Option 1: Use the HTML Generator**
   - Open `public/generate-icons.html` in your browser
   - Click "Generate Icons" to preview
   - Download both 192x192 and 512x512 icons
   - Save them as `public/pwa-192x192.png` and `public/pwa-512x512.png`

2. **Option 2: Use Online Tools**
   - Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
   - Upload your app icon
   - Generate and download the required sizes
   - Place them in the `public` directory

3. **Option 3: Create Manually**
   - Create 192x192 and 512x512 PNG images with your branding
   - Save as `public/pwa-192x192.png` and `public/pwa-512x512.png`

### Build and Test

1. **Build the assets:**
   ```bash
   npm run build
   ```

2. **Test the PWA:**
   - Open your app in a browser (Chrome/Edge recommended)
   - Open DevTools → Application tab
   - Check "Service Workers" section - you should see your service worker registered
   - Check "Manifest" section - verify all details are correct
   - Try going offline (DevTools → Network → Offline) and test functionality

3. **Install the PWA:**
   - Look for the install prompt in your browser's address bar
   - Or use the browser menu: Chrome → Install App / Edge → Apps → Install this site as an app
   - The app will be installed and can run offline

## Features

✅ **Offline Support**: App works offline with cached resources  
✅ **Auto Updates**: Service worker automatically updates when new version is available  
✅ **Installable**: Users can install the app on their devices  
✅ **Offline Indicator**: Visual feedback when connection is lost  
✅ **Smart Caching**: Different caching strategies for different resource types  

## Troubleshooting

### Service Worker Not Registering
- Make sure you've run `npm run build`
- Check browser console for errors
- Verify the service worker file exists at `/sw.js`

### Icons Not Showing
- Ensure icon files exist in `public/` directory
- Check file names match exactly: `pwa-192x192.png` and `pwa-512x512.png`
- Clear browser cache and rebuild

### Offline Mode Not Working
- Check service worker is registered (DevTools → Application → Service Workers)
- Verify resources are being cached (DevTools → Application → Cache Storage)
- Test in production build, not just dev mode

## Development Notes

- Service worker is enabled in development mode (`devOptions.enabled: true`)
- In production, the service worker will cache all assets automatically
- API calls use network-first strategy, so they'll try network first, then fall back to cache



