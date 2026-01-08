import { useState, useRef, useEffect } from 'react';
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

    useEffect(() => {
        getLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
            <header className="mb-6 lg:mb-8 mt-4 lg:mt-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F2937]">Attendance Overview</h1>
            </header>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
                    {/* Camera Section */}
                    <section className="p-4 border border-[#E0E0E0] rounded-lg bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <h2 className="text-base font-semibold text-[#1F2937] flex items-center flex-shrink-0">
                            <span className="material-symbols-outlined mr-2 text-[#6B7280] text-lg">photo_camera</span>
                            Capture Photo
                        </h2>
                        {!capturedImage && (
                            <button
                                onClick={startCamera}
                                className="w-full sm:w-auto px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1] flex items-center justify-center"
                                disabled={!!streamRef.current}
                            >
                                <span className="material-symbols-outlined mr-2 text-base">camera</span>
                                Start Camera
                            </button>
                        )}
                        {streamRef.current && !capturedImage && (
                            <button
                                onClick={capturePhoto}
                                className="w-full sm:w-auto px-4 py-2 bg-[#22C55E] hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined mr-2 text-base">camera</span>
                                Capture Photo
                            </button>
                        )}
                        {capturedImage && (
                            <button
                                onClick={() => {
                                    setCapturedImage(null);
                                    stopCamera();
                                }}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                            >
                                Retake
                            </button>
                        )}
                    </section>

                    {/* Location Section */}
                    <section className="p-4 border border-[#E0E0E0] rounded-lg bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <h2 className="text-base font-semibold text-[#1F2937] flex items-center flex-shrink-0">
                            <span className="material-symbols-outlined mr-2 text-[#6B7280] text-lg">place</span>
                            Location
                        </h2>
                        <div className="flex items-center text-xs sm:text-sm">
                            {location ? (
                                <p className="text-[#22C55E] font-medium flex items-center">
                                    <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                    Detected
                                </p>
                            ) : locationError ? (
                                <p className="text-[#EF4444] font-medium flex items-center">
                                    <span className="material-symbols-outlined text-sm mr-1">error</span>
                                    Permission Denied
                                </p>
                            ) : (
                                <p className="text-[#6B7280] font-medium flex items-center">
                                    <span className="material-symbols-outlined text-sm mr-1">sync</span>
                                    Detecting...
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {capturedImage && (
                    <div className="mb-6">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full max-w-md mx-auto rounded-lg border border-[#E0E0E0]"
                        />
                    </div>
                )}

                {!capturedImage && streamRef.current && (
                    <div className="mb-6 relative bg-gray-100 rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full max-w-md mx-auto"
                        />
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 md:mb-10">
                    <button
                        onClick={handleTimeIn}
                        disabled={loading || !capturedImage}
                        className="w-full py-3 bg-[#22C55E] hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center text-sm md:text-base group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined mr-2 group-hover:scale-110 transition-transform">login</span>
                        {loading ? 'Processing...' : 'Clock In'}
                    </button>
                    <button
                        onClick={handleTimeOut}
                        disabled={loading || !capturedImage}
                        className="w-full py-3 bg-[#EF4444] hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center text-sm md:text-base group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined mr-2 group-hover:scale-110 transition-transform">logout</span>
                        {loading ? 'Processing...' : 'Clock Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}

