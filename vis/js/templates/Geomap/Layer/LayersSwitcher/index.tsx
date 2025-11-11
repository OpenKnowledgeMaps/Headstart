import { FC } from "react";
import { LayersControl, TileLayer } from "react-leaflet";

import { CONFIG } from "../config";

const { LAYERS, CHECKED_LAYER_INDEX, POSITION } = CONFIG;

export const LayersSwitcher: FC = () => (
  <LayersControl position={POSITION}>
    {LAYERS.map(({ name, url, attribution }, index) => {
      const isChecked = index === CHECKED_LAYER_INDEX;

      return (
        <LayersControl.BaseLayer key={name} checked={isChecked} name={name}>
          <TileLayer attribution={attribution} url={url} />
        </LayersControl.BaseLayer>
      );
    })}
  </LayersControl>
);
