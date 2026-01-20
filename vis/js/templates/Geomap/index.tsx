import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer } from "react-leaflet";

import { CONFIG } from "./config";
import { HeightContainer } from "./HeightContainer";
import { Layer } from "./Layer";
import { Pins } from "./Pins";
import { SelectionResetHandler } from "./SelectionResetHandler";
import { ZoomControls } from "./ZoomControls";

export const Geomap: FC = () => (
  <HeightContainer>
    <MapContainer {...CONFIG} className="geomap_container">
      <SelectionResetHandler />
      <ZoomControls />
      <Layer />
      <Pins />
    </MapContainer>
  </HeightContainer>
);
