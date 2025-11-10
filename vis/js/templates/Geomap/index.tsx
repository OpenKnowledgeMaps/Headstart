import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";

import { CONFIG } from "./config";
import { HeightContainer } from "./HeightContainer";
import { LayersSwitcher } from "./LayersSwitcher";
import { Pins } from "./Pins";

const { MAP, ZOOM_CONTROL, FEATURES_DISABLING } = CONFIG;
const { isShowLayersSwitcher, isShowZoomControls } = FEATURES_DISABLING;

export const Geomap: FC = () => (
  <HeightContainer>
    <MapContainer {...MAP} className="geomap_container">
      {isShowZoomControls && <ZoomControl {...ZOOM_CONTROL} />}
      {isShowLayersSwitcher && <LayersSwitcher />}
      <Pins />
    </MapContainer>
  </HeightContainer>
);
