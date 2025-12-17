import SyncButton from './SyncButton';

export default function SyncPage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sync</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Use this page to sync all offline changes with the server. Make sure you are online
                before starting the sync.
            </p>
            <div className="flex items-center justify-start">
                <SyncButton />
            </div>
        </div>
    );
}


