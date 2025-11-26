import { useState } from "react";

/**
 * Manage image transformation state (zoom, pan, rotate)
 */
export function useImageTransform(initialScale: number = 1) {
  const [scale, setScale] = useState(initialScale);
  const [offX, setOffX] = useState(0);
  const [offY, setOffY] = useState(0);
  const [rot, setRot] = useState(0);

  const reset = () => {
    setScale(initialScale);
    setOffX(0);
    setOffY(0);
    setRot(0);
  };

  return {
    scale,
    setScale,
    offX,
    setOffX,
    offY,
    setOffY,
    rot,
    setRot,
    reset,
  };
}
