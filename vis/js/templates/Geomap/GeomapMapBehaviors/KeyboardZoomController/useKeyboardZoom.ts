import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

interface KeyboardZoomOptions {
  step?: number;
}

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

export const useKeyboardZoom = (options: KeyboardZoomOptions = {}): void => {
  const { step = 1 } = options;
  const map: LeafletMap = useMap();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) {
        return;
      }

      const { key } = event;
      const currentZoom = map.getZoom();
      const minZoom = map.getMinZoom();
      const maxZoom = map.getMaxZoom();

      if (key === "+" || key === "=") {
        event.preventDefault();
        map.setZoom(Math.min(currentZoom + step, maxZoom));
      }

      if (key === "-") {
        event.preventDefault();
        map.setZoom(Math.max(currentZoom - step, minZoom));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [map, step]);
};
