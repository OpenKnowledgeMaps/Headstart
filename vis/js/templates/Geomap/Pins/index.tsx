import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";

import { useActiveDataItem } from "@/hooks/useActiveDataItem";
import { useData } from "@/hooks/useData";
import { selectPaper } from "@/js/actions";
import { AllPossiblePapersType } from "@/js/types";

import { Pin } from "./Pin";

export const Pins: FC = () => {
  const { filteredData } = useData(true);
  const { hoveredItemId, selectedItemId } = useActiveDataItem();
  const dispatch = useDispatch();

  const handlePinClick = useCallback(
    (data: AllPossiblePapersType) => {
      dispatch(selectPaper(data));
    },
    [dispatch],
  );

  return (
    <>
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
    </>
  );
};
