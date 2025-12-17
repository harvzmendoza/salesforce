import { useState } from 'react';
import { syncFromServer } from '../services/syncService';

export default function DownloadPage() {
    const [downloading, setDownloading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleDownload = async () => {
        setDownloading(true);
        setMessage('');
        setError('');

        try {
            const tasks = await syncFromServer();
            setMessage(`Downloaded ${tasks.length} records from the server.`);
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download data from the server. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Download Data</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Use this page to download the latest data from the server into your device for offline use.
            </p>

            {message && (
                <div className="mb-4 p-3 rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-400">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 rounded-sm bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {downloading ? 'Downloading...' : 'Download Data'}
            </button>
        </div>
    );
}


