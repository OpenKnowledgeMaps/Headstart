import React, { FC } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { AquanaviPaper, State } from "@/js/types";
import { useSelector } from "react-redux";
import { Mesocosm } from "./Mesocosm";
import { OPTIONS } from "./options";
import "leaflet/dist/leaflet.css";

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
