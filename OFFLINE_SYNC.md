# Offline Sync Feature Documentation

Your app now supports full offline functionality with bidirectional synchronization!

## How It Works

### Offline Storage
- **IndexedDB**: All tasks are stored locally in IndexedDB for offline access
- **Automatic Caching**: When online, tasks are automatically cached locally
- **Offline-First**: App works completely offline - create, update, and delete tasks

### Sync Queue
- **Pending Operations**: All offline changes are queued for sync
- **Automatic Queuing**: Create, update, and delete operations are automatically queued when offline
- **Sync Button**: Manual sync button to upload pending changes and download latest data

### Sync Process
1. **Upload Pending Changes**: When you click "Sync", all pending operations are sent to the server
2. **Download Latest Data**: After uploading, the latest data is downloaded from the server
3. **Conflict Resolution**: Server data takes precedence (last-write-wins)

## Features

### ✅ Full Offline Support
- Create, read, update, and delete tasks while offline
- All data stored locally in IndexedDB
- No internet connection required

### ✅ Smart Sync
- **Sync Button**: Manually sync when online
- **Pending Counter**: Shows number of pending operations
- **Last Sync Time**: Displays when last sync occurred
- **Auto-Queue**: Operations automatically queued when offline

### ✅ User Feedback
- **Offline Indicator**: Shows when device is offline
- **Sync Status**: Displays pending operations count
- **Error Messages**: Clear feedback on sync errors

## Usage

### Working Offline

1. **Go Offline**: Disconnect from internet or use browser's offline mode
2. **Use App Normally**: Create, update, or delete tasks as usual
3. **See Pending Count**: Notice the pending operations counter next to Sync button
4. **Go Online**: Reconnect to internet
5. **Click Sync**: Click the "Sync" button to upload all pending changes

### Sync Button

The Sync button:
- **Location**: Top right of the Tasks page, next to "Add Task" button
- **Status**: Shows pending operations count
- **Last Sync**: Displays last sync time
- **Disabled**: When offline, button is disabled
- **Loading**: Shows spinner while syncing

### Sync Process

When you click "Sync":
1. ✅ Uploads all pending create/update/delete operations
2. ✅ Downloads latest tasks from server
3. ✅ Updates local storage with server data
4. ✅ Clears sync queue on success
5. ✅ Shows error if sync fails

## Technical Details

### Storage Structure

**IndexedDB Stores:**
- `tasks`: Stores all task data
- `syncQueue`: Stores pending sync operations

### Sync Queue Operations

Each queued operation contains:
- `type`: 'create', 'update', or 'delete'
- `data`: Task data (for create/update)
- `taskId`: Task ID (for update/delete)
- `timestamp`: When operation was queued
- `retries`: Number of retry attempts

### Temporary IDs

- Tasks created offline get temporary IDs (e.g., `temp_1234567890_abc123`)
- On sync, temporary IDs are replaced with real server IDs
- Local storage is updated with real IDs

### API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/batch-sync` - Batch sync (optional, for future use)

## Troubleshooting

### Sync Not Working

1. **Check Internet**: Make sure you're online
2. **Check Console**: Look for errors in browser console
3. **Check Pending Count**: Verify there are pending operations
4. **Try Again**: Click Sync button again

### Data Not Syncing

1. **Check Server**: Verify API endpoints are working
2. **Check Console**: Look for API errors
3. **Check Network Tab**: Verify requests are being sent
4. **Clear Cache**: Try clearing browser cache and IndexedDB

### Offline Data Lost

- Data is stored in IndexedDB
- Clearing browser data will delete offline storage
- Always sync before clearing browser data

### Duplicate Tasks

- If sync fails partway through, you might see duplicates
- Delete duplicates manually
- Future syncs will resolve conflicts

## Best Practices

1. **Sync Regularly**: Click Sync button when online to keep data in sync
2. **Check Pending Count**: Monitor pending operations
3. **Sync Before Important Actions**: Sync before making critical changes
4. **Handle Errors**: If sync fails, check error message and try again

## Development Notes

### IndexedDB Initialization
- Database is initialized on app load
- If initialization fails, app falls back to online-only mode

### Sync Strategy
- **Network-First**: When online, tries network first, falls back to cache
- **Offline-First**: When offline, uses local storage exclusively
- **Queue on Failure**: If online but request fails, operation is queued

### Conflict Resolution
- **Last-Write-Wins**: Server data takes precedence
- **No Merging**: Conflicts are resolved by overwriting with server data
- **Future Enhancement**: Could implement more sophisticated conflict resolution



