import { useState, useRef } from 'react';
import api from '../services/api';

export default function Attendance() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('Failed to access camera. Please allow camera permissions.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);
            stopCamera();
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                setLocationError('Failed to get location. Please allow location permissions.');
                console.error('Geolocation error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const submitAttendance = async (type) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Ensure we have location
            if (!location) {
                await new Promise((resolve) => {
                    getLocation();
                    // Wait a bit for location to be set
                    setTimeout(resolve, 1000);
                });
            }

            if (!location && !locationError) {
                setError('Please allow location permissions to continue.');
                setLoading(false);
                return;
            }

            // Convert image to blob if captured
            let pictureFile = null;
            if (capturedImage) {
                const response = await fetch(capturedImage);
                const blob = await response.blob();
                pictureFile = new File([blob], `attendance-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                });
            }

            // Create FormData
            const formData = new FormData();
            formData.append('type', type);
            formData.append('timestamp', new Date().toISOString());
            if (pictureFile) {
                formData.append('picture', pictureFile);
            }
            if (location) {
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());
            }

            // Send to API
            const response = await api.post('/attendances', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setSuccess(`${type === 'time_in' ? 'Time In' : 'Time Out'} recorded successfully!`);
            setCapturedImage(null);
            setLocation(null);
            setLocationError(null);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    `Failed to record ${type === 'time_in' ? 'Time In' : 'Time Out'}. Please try again.`
            );
            console.error('Attendance submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeIn = () => {
        if (!capturedImage) {
            setError('Please capture a photo first.');
            return;
        }
        submitAttendance('time_in');
    };

    const handleTimeOut = () => {
        if (!capturedImage) {
            setError('Please capture a photo first.');
            return;
        }
        submitAttendance('time_out');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Attendance
            </h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                    {success}
                </div>
            )}

            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg p-6 space-y-6">
                {/* Camera Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Capture Photo
                    </h2>
                    <div className="space-y-4">
                        {!capturedImage && (
                            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full max-w-md mx-auto"
                                    style={{ display: streamRef.current ? 'block' : 'none' }}
                                />
                                {!streamRef.current && (
                                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                        Camera preview will appear here
                                    </div>
                                )}
                            </div>
                        )}
                        {capturedImage && (
                            <div className="relative">
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full max-w-md mx-auto rounded-lg"
                                />
                                <button
                                    onClick={() => {
                                        setCapturedImage(null);
                                        stopCamera();
                                    }}
                                    className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Retake Photo
                                </button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-4">
                            {!capturedImage && (
                                <>
                                    <button
                                        onClick={startCamera}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!!streamRef.current}
                                    >
                                        Start Camera
                                    </button>
                                    {streamRef.current && (
                                        <button
                                            onClick={capturePhoto}
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Capture Photo
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Location
                    </h2>
                    <div className="space-y-4">
                        {location ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={getLocation}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Get Location
                                </button>
                                {locationError && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {locationError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleTimeIn}
                        disabled={loading || !capturedImage}
                        className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    >
                        {loading ? 'Processing...' : 'Time In'}
                    </button>
                    <button
                        onClick={handleTimeOut}
                        disabled={loading || !capturedImage}
                        className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    >
                        {loading ? 'Processing...' : 'Time Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}

