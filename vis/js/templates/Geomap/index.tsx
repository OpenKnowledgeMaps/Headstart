import "leaflet/dist/leaflet.css";

import { FC, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";

import { selectPaper } from "@/js/actions";
import { AllPossiblePapersType } from "@/js/types";
import { filterData } from "@/js/utils/data";

import { OPTIONS } from "./options";
import { Pin } from "./Pin";
import * as selectors from "./selectors";

const { MAP, LAYER } = OPTIONS;

export const Geomap: FC = () => {
  const data = useSelector(selectors.getData);
  const selectedItemId = useSelector(selectors.getSelectedItemId);
  const searchSettings = useSelector(selectors.getSearchSettings);
  const filterSettings = useSelector(selectors.getSearchFilterSettings);
  const handleItemSelect = useDispatch();

  const filteredData: AllPossiblePapersType[] = filterData(
    data,
    searchSettings,
    filterSettings,
  );

  const handlePinClick = useCallback(
    (data: AllPossiblePapersType) => {
      handleItemSelect(selectPaper(data));
    },
    [handleItemSelect],
  );

  return (
    <MapContainer {...MAP} className="geomap_container">
      <TileLayer {...LAYER} />
      {filteredData.map((item) => {
        const { safe_id: id } = item;
        const isActive = selectedItemId === id;

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
