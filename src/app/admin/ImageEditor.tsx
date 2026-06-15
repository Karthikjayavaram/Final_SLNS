import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import Draggable from 'react-draggable';
import { X, Save, RotateCcw, RotateCw } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
  isModal?: boolean;
  extraTools?: React.ReactNode;
}

export default function ImageEditor({ imageUrl, onSave, onCancel, isModal = true, extraTools }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Watermark State
  const [addWatermark, setAddWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('SLNS Since 1986');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.8);
  const [watermarkPos, setWatermarkPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableNodeRef = useRef<HTMLDivElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const image = await createImage(imageUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
      
      // Draw rotated image
      canvas.width = safeArea;
      canvas.height = safeArea;
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate(getRadianAngle(rotation));
      ctx.translate(-safeArea / 2, -safeArea / 2);
      ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

      const data = ctx.getImageData(0, 0, safeArea, safeArea);
      
      // Set canvas to crop size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - croppedAreaPixels.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - croppedAreaPixels.y)
      );

      // Draw Watermark
      if (addWatermark && watermarkText && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative position based on the draggable position vs the container
        // Draggable gives position relative to its parent container
        const relativeX = watermarkPos.x / containerRect.width;
        const relativeY = watermarkPos.y / containerRect.height;

        const canvasX = relativeX * canvas.width;
        const canvasY = relativeY * canvas.height;

        // The font size should scale relatively
        const scaleFactor = canvas.width / containerRect.width;
        const finalFontSize = watermarkSize * scaleFactor;

        ctx.globalAlpha = watermarkOpacity;
        ctx.font = `bold ${finalFontSize}px Arial`;
        ctx.fillStyle = watermarkColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Add small shadow for visibility
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4 * scaleFactor;
        ctx.shadowOffsetX = 2 * scaleFactor;
        ctx.shadowOffsetY = 2 * scaleFactor;

        ctx.fillText(watermarkText, canvasX, canvasY);
      }

      canvas.toBlob((blob) => {
        if (blob) onSave(blob);
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error(e);
      alert('Error creating image');
    }
  };

  return (
    <div className={`${isModal ? 'fixed inset-0 z-[60]' : 'absolute inset-0'} bg-black/90 flex flex-col md:flex-row`}>
      {/* Editor Main Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* We use a wrapper with fixed aspect to match the crop area or we let Cropper fill the container */}
        <div ref={containerRef} className="relative w-full h-full max-w-4xl max-h-[80vh] bg-[#111] overflow-hidden">
          {/* Cropper layer */}
          <div className="absolute inset-0 z-0">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={undefined} // Free crop
              objectFit="contain"
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ containerStyle: { background: 'transparent' } }}
            />
          </div>
          
          {/* Draggable Watermark Layer - Absolutely positioned over Cropper, pointer-events none on wrapper, auto on children */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
            {addWatermark && (
              <Draggable
                nodeRef={draggableNodeRef}
                position={watermarkPos}
                onDrag={(e, data) => setWatermarkPos({ x: data.x, y: data.y })}
                bounds="parent"
              >
                <div 
                  ref={draggableNodeRef}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    color: watermarkColor,
                    opacity: watermarkOpacity,
                    fontSize: `${watermarkSize}px`,
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    cursor: 'move',
                    pointerEvents: 'auto',
                    whiteSpace: 'nowrap',
                    touchAction: 'none', // Critical for mobile drag
                    userSelect: 'none'
                  }}
                >
                  {watermarkText || 'Watermark'}
                </div>
              </Draggable>
            )}
          </div>
        </div>
      </div>

      {/* Tools Panel */}
      <div className="w-full md:w-80 bg-surface border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl font-bold">Edit Media</h3>
          {isModal && <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5"/></button>}
        </div>

        {extraTools}

        {/* Rotate Tool */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider text-gold-400">Rotation</label>
          <div className="flex items-center gap-4">
            <button onClick={() => setRotation(r => r - 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><RotateCcw className="w-4 h-4"/></button>
            <input type="range" min="0" max="360" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="flex-1 accent-gold-400" />
            <button onClick={() => setRotation(r => r + 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><RotateCw className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Zoom Tool */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider text-gold-400">Zoom</label>
          <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-gold-400" />
        </div>

        {/* Watermark Tool */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="watermark-toggle"
              checked={addWatermark} 
              onChange={e => setAddWatermark(e.target.checked)}
              className="w-4 h-4 accent-gold-400"
            />
            <label htmlFor="watermark-toggle" className="text-xs uppercase tracking-wider text-gold-400 cursor-pointer">
              Add Watermark
            </label>
          </div>
          
          {addWatermark && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                value={watermarkText} 
                onChange={e => setWatermarkText(e.target.value)} 
                placeholder="Watermark text..."
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50">Color</label>
                  <input type="color" value={watermarkColor} onChange={e => setWatermarkColor(e.target.value)} className="w-full h-8 bg-black rounded cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50">Size</label>
                  <input type="number" value={watermarkSize} onChange={e => setWatermarkSize(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black border border-white/10 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/50">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                <input type="range" min="0" max="1" step="0.1" value={watermarkOpacity} onChange={e => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-gold-400" />
              </div>
              
              <p className="text-[10px] text-gold-400/50 italic">Drag the text directly on the image to position it.</p>
            </div>
          )}
        </div>

        <button onClick={handleSave} className="mt-auto btn-gold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Save className="w-4 h-4"/> Apply Changes
        </button>
      </div>
    </div>
  );
}

// Helpers
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}
