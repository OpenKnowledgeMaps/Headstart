import { FC } from "react";
import { LayersControl, TileLayer } from "react-leaflet";

import { CONFIG } from "./config";

export const LayersSwitcher: FC = () => (
  <LayersControl position="topright">
    {CONFIG.map(({ name, url, attribution }, index) => (
      <LayersControl.BaseLayer key={name} checked={index === 0} name={name}>
        <TileLayer attribution={attribution} url={url} />
      </LayersControl.BaseLayer>
    ))}
  </LayersControl>
);
