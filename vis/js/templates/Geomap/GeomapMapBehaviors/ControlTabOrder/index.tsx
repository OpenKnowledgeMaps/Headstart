import { FC, useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Why this component is needed?
 *
 * Leaflet appends `.leaflet-control-container` after `.leaflet-map-pane`, so default
 * Tab order visits map markers before zoom/layer controls. Moving the control
 * container before the map pane matches expected keyboard order without positive
 * tabindex (which would affect the whole document).
 */
export const ControlTabOrder: FC = () => {
  const map = useMap();

  useEffect(() => {
    const reorder = (): void => {
      const container = map.getContainer();
      const controlContainer = container.querySelector<HTMLElement>(
        ".leaflet-control-container",
      );
      const mapPane = container.querySelector<HTMLElement>(".leaflet-map-pane");

      if (
        !controlContainer ||
        !mapPane ||
        controlContainer.parentElement !== container ||
        mapPane.parentElement !== container
      ) {
        return;
      }

      if (container.firstElementChild === controlContainer) {
        return;
      }

      container.insertBefore(controlContainer, mapPane);
    };

    const schedule = (): void => {
      requestAnimationFrame(reorder);
    };

    map.whenReady(schedule);
  }, [map]);

  return null;
};
