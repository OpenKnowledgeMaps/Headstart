import "leaflet/dist/leaflet.css";

import { FC, useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useSelector } from "react-redux";

import { State } from "@/js/types";
import { getCoordinatesFromPaper } from "@/js/utils/coordinates";

import { OPTIONS } from "./options";
import { Pin } from "./Pin";

const { map, tileLayer } = OPTIONS;

const getMesocosmsData = (state: State) => state.data.list;

export const Geomap: FC = () => {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const mesocosms = useSelector(getMesocosmsData);

  const handlePinClick = useCallback((id: string) => {
    setSelectedPinId(id);
  }, []);

  return (
    <MapContainer {...map} className="geomap_container">
      <TileLayer {...tileLayer} />
      {mesocosms.map((data) => {
        const { safe_id: id } = data;
        const { east, north } = getCoordinatesFromPaper(data);

        if (!east || !north) {
          return null;
        }

        return (
          <Pin
            key={id}
            id={id}
            lon={east}
            lat={north}
            isActive={selectedPinId === id}
            onClick={handlePinClick}
          />
        );
      })}
    </MapContainer>
  );
};
