import React, { FC } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { OPTIONS } from "./options";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x as string,
  iconUrl: markerIcon as string,
  shadowUrl: markerShadow as string,
});

const { map, tileLayer } = OPTIONS;

export const Geomap: FC = () => {
  return (
    <MapContainer {...map} className="geomap_container">
      <TileLayer {...tileLayer} />
    </MapContainer>
  );
};
