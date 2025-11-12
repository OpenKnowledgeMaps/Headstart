import { FC, PropsWithChildren } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useActiveDataItem } from "@/hooks";
import { deselectPaper } from "@/js/actions";

import { getMapHeight } from "./selectors";

export const HeightContainer: FC<PropsWithChildren> = ({ children }) => {
  const { selectedItemId } = useActiveDataItem();
  const height = useSelector(getMapHeight);
  const dispatch = useDispatch();

  const handleMapClick = () => {
    if (!selectedItemId) return;

    dispatch(deselectPaper());
  };

  return (
    <div style={{ height }} onClick={handleMapClick}>
      {children}
    </div>
  );
};
