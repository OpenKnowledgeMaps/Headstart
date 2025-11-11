import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer } from "react-leaflet";

import { CONFIG } from "./config";
import { HeightContainer } from "./HeightContainer";
import { Layer } from "./Layer";
import { Pins } from "./Pins";
import { ZoomControls } from "./ZoomControls";

export const Geomap: FC = () => (
  <HeightContainer>
    <MapContainer {...CONFIG} className="geomap_container">
      <ZoomControls />
      <Layer />
      <Pins />
    </MapContainer>
  </HeightContainer>
);
