import "leaflet/dist/leaflet.css";

import { FC, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";

import { useData } from "@/hooks/useData";
import { selectPaper } from "@/js/actions";
import { AllPossiblePapersType } from "@/js/types";

import { OPTIONS } from "./options";
import { Pin } from "./Pin";
import { getHoveredItemId, getSelectedItemId } from "./selectors";

const { MAP, LAYER } = OPTIONS;

export const Geomap: FC = () => {
  const { filteredData } = useData(true);
  const selectedItemId = useSelector(getSelectedItemId);
  const hoveredItemId = useSelector(getHoveredItemId);
  const handleItemSelect = useDispatch();

  const handlePinClick = useCallback(
    (data: AllPossiblePapersType) => {
      handleItemSelect(selectPaper(data));
    },
    [handleItemSelect],
  );

  return (
    <MapContainer {...MAP} className="geomap_container">
      <TileLayer {...LAYER} />
      {filteredData &&
        filteredData.map((item) => {
          const { safe_id: id } = item;
          const isActive = selectedItemId === id || hoveredItemId === id;

          return (
            <Pin
              key={id + isActive}
              data={item}
              isActive={isActive}
              onClick={handlePinClick}
            />
          );
        })}
    </MapContainer>
  );
};
