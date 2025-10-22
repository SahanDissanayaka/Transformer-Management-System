import React, { useState } from 'react';

export type ShapeType = 'bbox';

type Props = {
  active: boolean;
  targetImgId: string; // id of the <img> element to normalize coordinates
  drawShape?: ShapeType; // currently supports 'bbox'
  selectedClass: string;
  stroke: string;
  onAnnotationCreate: (
    coords: [number, number, number, number],
    selectedClass: string,
    extra?: unknown,
    shape?: ShapeType
  ) => void;
};

export default function AnnotationCanvas({
  active,
  targetImgId,
  drawShape = 'bbox',
  selectedClass,
  stroke,
  onAnnotationCreate,
}: Props) {
  const [drawing, setDrawing] = useState(false);
  const [startPointOverlay, setStartPointOverlay] = useState<[number, number] | null>(null); // pixel coords in overlay space
  const [currentBoxOverlay, setCurrentBoxOverlay] = useState<[number, number, number, number] | null>(null);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!active || drawShape !== 'bbox') return;
    e.preventDefault();
    e.stopPropagation();
    const overlayRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - overlayRect.left;
    const y = e.clientY - overlayRect.top;
    setStartPointOverlay([x, y]);
    setCurrentBoxOverlay(null);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!active || !drawing || !startPointOverlay || drawShape !== 'bbox') return;
    e.preventDefault();
    const overlayRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - overlayRect.left;
    const y = e.clientY - overlayRect.top;
    setCurrentBoxOverlay([startPointOverlay[0], startPointOverlay[1], x, y]);
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!active || !drawing || !startPointOverlay || drawShape !== 'bbox') return;
    e.preventDefault();
    e.stopPropagation();
    const overlayRect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const startClientX = overlayRect.left + startPointOverlay[0];
    const startClientY = overlayRect.top + startPointOverlay[1];
    const endClientX = e.clientX;
    const endClientY = e.clientY;

    const img = document.getElementById(targetImgId) as HTMLImageElement | null;
    if (!img) {
      setDrawing(false);
      setCurrentBoxOverlay(null);
      setStartPointOverlay(null);
      return;
    }
    const imgRect = img.getBoundingClientRect();

    const x1Img = Math.min(startClientX, endClientX) - imgRect.left;
    const y1Img = Math.min(startClientY, endClientY) - imgRect.top;
    const x2Img = Math.max(startClientX, endClientX) - imgRect.left;
    const y2Img = Math.max(startClientY, endClientY) - imgRect.top;

    const nx1 = Math.max(0, Math.min(1, x1Img / imgRect.width));
    const ny1 = Math.max(0, Math.min(1, y1Img / imgRect.height));
    const nx2 = Math.max(0, Math.min(1, x2Img / imgRect.width));
    const ny2 = Math.max(0, Math.min(1, y2Img / imgRect.height));

    // Keep the rectangle visible until parent saves/cancels; finalize overlay rect
    const endOverlayX = e.clientX - overlayRect.left;
    const endOverlayY = e.clientY - overlayRect.top;
    setDrawing(false);
    setCurrentBoxOverlay([
      Math.min(startPointOverlay[0], endOverlayX),
      Math.min(startPointOverlay[1], endOverlayY),
      Math.max(startPointOverlay[0], endOverlayX),
      Math.max(startPointOverlay[1], endOverlayY),
    ]);
    setStartPointOverlay(null);

    onAnnotationCreate([nx1, ny1, nx2, ny2], selectedClass, undefined, 'bbox');
  };

  if (!active) return null;

  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 100, cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {currentBoxOverlay && (
        <rect
          x={Math.min(currentBoxOverlay[0], currentBoxOverlay[2])}
          y={Math.min(currentBoxOverlay[1], currentBoxOverlay[3])}
          width={Math.abs(currentBoxOverlay[2] - currentBoxOverlay[0])}
          height={Math.abs(currentBoxOverlay[3] - currentBoxOverlay[1])}
          fill={`${stroke}33`}
          stroke={stroke}
          strokeWidth={3}
        />
      )}
    </svg>
  );
}
