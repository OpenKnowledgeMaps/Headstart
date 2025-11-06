import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";

import { CONFIG } from "./config";
import { HeightContainer } from "./HeightContainer";
import { LayersSwitcher } from "./LayersSwitcher";
import { Pins } from "./Pins";

const { MAP, ZOOM_CONTROL } = CONFIG;

export const Geomap: FC = () => (
  <HeightContainer>
    <MapContainer {...MAP} className="geomap_container">
      <ZoomControl {...ZOOM_CONTROL} />
      <LayersSwitcher />
      <Pins />
    </MapContainer>
  </HeightContainer>
);
