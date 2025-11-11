import "leaflet/dist/leaflet.css";

import { FC } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";
import { useSelector } from "react-redux";

import { CONFIG } from "./config";
import { HeightContainer } from "./HeightContainer";
import { Layer } from "./Layer";
import { Pins } from "./Pins";
import { getGeomapFeaturesSettings } from "./selectors";

const { MAP, ZOOM_CONTROL } = CONFIG;

export const Geomap: FC = () => {
  const { isWithZoomControl } = useSelector(getGeomapFeaturesSettings);

  return (
    <HeightContainer>
      <MapContainer {...MAP} className="geomap_container">
        {isWithZoomControl && <ZoomControl {...ZOOM_CONTROL} />}
        <Layer />
        <Pins />
      </MapContainer>
    </HeightContainer>
  );
};
