import { useRef, useEffect, useState } from 'react';

export default function SignatureCanvas({ value, onChange, error }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 300;

        // Set drawing style - white color for signature
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Set canvas background to dark for white signature visibility
        ctx.fillStyle = '#1b1b18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load existing signature if provided
        if (value) {
            const img = new Image();
            img.onload = () => {
                // Clear and redraw dark background
                ctx.fillStyle = '#1b1b18';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Reset stroke style
                ctx.strokeStyle = '#ffffff';
                ctx.drawImage(img, 0, 0);
                setHasSignature(true);
            };
            img.onerror = () => {
                // If image fails to load, just set hasSignature based on value existence
                setHasSignature(!!value);
            };
            img.src = value;
        }
    }, [value]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
            y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL('image/png');
            if (onChange) {
                onChange(dataURL);
            }
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear and redraw dark background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1b1b18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Reset stroke style
        ctx.strokeStyle = '#ffffff';
        setHasSignature(false);
        if (onChange) {
            onChange('');
        }
    };

    return (
        <div>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className={`w-full border-2 rounded-sm cursor-crosshair ${
                        error
                            ? 'border-[#F53003] dark:border-[#FF4433]'
                            : 'border-[#e3e3e0] dark:border-[#3E3E3A]'
                    } bg-[#1b1b18]`}
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Draw your signature here
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-2 flex justify-end">
                <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1b1b18] dark:hover:text-[#EDEDEC]"
                >
                    Clear
                </button>
            </div>
            {error && (
                <p className="mt-1 text-sm text-[#F53003] dark:text-[#FF4433]">
                    {error}
                </p>
            )}
        </div>
    );
}

