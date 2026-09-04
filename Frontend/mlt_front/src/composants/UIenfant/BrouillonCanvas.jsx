import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Trash2, X } from 'lucide-react';

const COLORS = [
    { name: 'Bleu', value: '#2563eb' },
    { name: 'Noir', value: '#1e293b' },
    { name: 'Rouge', value: '#dc2626' },
    { name: 'Vert', value: '#16a34a' }
];

const BRUSH_SIZES = [2, 4, 8, 12];

const BrouillonCanvas = ({ isOpen, onClose }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#2563eb');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState('pencil'); // 'pencil' | 'eraser'
    const lastPos = useRef({ x: 0, y: 0 });

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.drawImage(tempCanvas, 0, 0);
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }, 100);
            return () => {
                window.removeEventListener('resize', resizeCanvas);
                clearTimeout(timer);
            };
        }
    }, [isOpen]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const pos = getCoordinates(e);
        lastPos.current = pos;
        setIsDrawing(true);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const pos = getCoordinates(e);

        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastPos.current = pos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    if (!isOpen) return null;

    return (
        <div ref={containerRef} className="w-full h-[55vh] lg:h-full animate-in zoom-in-95 duration-200">
            <div className="bg-base-100 flex flex-col overflow-hidden h-full border border-base-300 rounded-[2rem] shadow-sm">
                
                {/* BARRE D'OUTILS SUPÉRIEURE (Design épuré et sobre) */}
                <div className="bg-base-100 text-base-content p-4 flex flex-wrap justify-between items-center gap-3 border-b border-base-200 select-none">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Pencil size={16} />
                        </div>
                        <span className="text-xs font-black tracking-wider uppercase text-base-content">Brouillon</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* CHOIX DES OUTILS */}
                        <div className="join bg-base-200 p-0.5 rounded-xl shrink-0">
                            <button 
                                onClick={() => setTool('pencil')}
                                className={`btn btn-xs join-item rounded-lg ${tool === 'pencil' ? 'btn-active btn-neutral' : 'btn-ghost'} border-none`}
                                title="Crayon"
                            >
                                <Pencil size={12} />
                            </button>
                            <button 
                                onClick={() => setTool('eraser')}
                                className={`btn btn-xs join-item rounded-lg ${tool === 'eraser' ? 'btn-active btn-neutral' : 'btn-ghost'} border-none`}
                                title="Gomme"
                            >
                                <Eraser size={12} />
                            </button>
                        </div>

                        {/* CHOIX DES COULEURS */}
                        {tool === 'pencil' && (
                            <div className="flex gap-1.5 bg-base-200 p-1.5 rounded-xl shrink-0">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setColor(c.value)}
                                        className={`w-3.5 h-3.5 rounded-full border transition-transform ${color === c.value ? 'scale-125 border-white ring-2 ring-primary/40' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ÉPAISSEUR DU TRAIT */}
                        <div className="flex items-center gap-1.5 bg-base-200 px-2 py-1 rounded-xl text-[10px] shrink-0 font-bold">
                            <span className="opacity-60">Taille :</span>
                            <div className="flex gap-0.5">
                                {BRUSH_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setBrushSize(size)}
                                        className={`w-5 h-5 rounded flex items-center justify-center text-[9px] transition-all ${brushSize === size ? 'bg-neutral text-neutral-content font-black' : 'hover:bg-base-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={clearCanvas}
                            className="btn btn-xs btn-outline btn-error rounded-xl gap-1 text-[10px] font-bold"
                            title="Tout effacer"
                        >
                            <Trash2 size={11} /> Effacer
                        </button>
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="btn btn-xs btn-circle btn-ghost"
                                title="Fermer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ZONE DE DESSIN CANVAS (Seyès discret) */}
                <div 
                    className="flex-1 bg-white relative cursor-crosshair"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full block"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                {/* PIED DE L'ARDOISE */}
                <div className="p-3 bg-base-200/50 text-center text-[10px] opacity-40 font-bold uppercase tracking-widest border-t border-base-200">
                    Brouillon libre pour tes calculs
                </div>
            </div>
        </div>
    );
};

export default BrouillonCanvas;
