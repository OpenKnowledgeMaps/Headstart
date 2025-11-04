import "leaflet/dist/leaflet.css";

import { FC, useCallback } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";

import { useData } from "@/hooks/useData";
import { selectPaper } from "@/js/actions";
import { AllPossiblePapersType } from "@/js/types";

import { CONFIG } from "./config";
import { LayersSwitcher } from "./LayersSwitcher";
import { Pin } from "./Pin";
import { getHoveredItemId, getSelectedItemId } from "./selectors";

const { MAP, ZOOM_CONTROL } = CONFIG;

export const Geomap: FC = () => {
  const { filteredData } = useData(true);
  const selectedItemId = useSelector(getSelectedItemId);
  const hoveredItemId = useSelector(getHoveredItemId);
  const dispatch = useDispatch();

  const handlePinClick = useCallback(
    (data: AllPossiblePapersType) => {
      dispatch(selectPaper(data));
    },
    [dispatch],
  );

  return (
    <MapContainer {...MAP} className="geomap_container">
      <ZoomControl {...ZOOM_CONTROL} />
      <LayersSwitcher />
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
