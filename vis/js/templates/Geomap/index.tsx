import React, { FC } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { AquanaviPaper, State } from "@/js/types";
import { useSelector } from "react-redux";
import { Mesocosm } from "./Mesocosm";
import { OPTIONS } from "./options";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x as string,
  iconUrl: markerIcon as string,
  shadowUrl: markerShadow as string,
});

const getMesocosmsData = (state: State) => state.data.list;

export const Geomap: FC = () => {
  const { map, tileLayer } = OPTIONS;
  const mesocosms = useSelector(getMesocosmsData);

  return (
    <MapContainer {...map} className="geomap_container">
      <TileLayer {...tileLayer} />
      {mesocosms.map((mesocosm) => (
        <Mesocosm
          key={mesocosm.safe_id}
          {...(mesocosm as any as AquanaviPaper)}
        />
      ))}
    </MapContainer>
  );
};
