import { FC, useRef } from "react";
import { useMapEvent } from "react-leaflet";
import { useDispatch } from "react-redux";

import { useActiveDataItem } from "@/hooks";
import { deselectPaper } from "@/js/actions";

export const SelectionResetHandler: FC = () => {
  const dispatch = useDispatch();
  const { selectedItemId } = useActiveDataItem();
  const isMovingRef = useRef(false);

  useMapEvent("movestart", () => {
    isMovingRef.current = true;
  });

  useMapEvent("moveend", () => {
    requestAnimationFrame(() => {
      isMovingRef.current = false;
    });
  });

  useMapEvent("click", () => {
    if (!selectedItemId || isMovingRef.current) return;

    dispatch(deselectPaper());
  });

  return null;
};
