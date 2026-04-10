import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer } from "react-leaflet";

import { CONFIG } from "./config";
import { GeomapMapBehaviors } from "./GeomapMapBehaviors";
import { HeightContainer } from "./HeightContainer";
import { Layer } from "./Layer";
import { Pins } from "./Pins";
import { ZoomControls } from "./ZoomControls";

export const Geomap: FC = () => (
  <HeightContainer>
    <MapContainer {...CONFIG} className="geomap_container">
      <GeomapMapBehaviors />
      <ZoomControls />
      <Layer />
      <Pins />
    </MapContainer>
  </HeightContainer>
);
