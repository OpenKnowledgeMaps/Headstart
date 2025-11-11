import { FC, PropsWithChildren } from "react";
import { useDispatch, useSelector } from "react-redux";

import { deselectPaper } from "@/js/actions";

import { getMapHeight } from "./selectors";

export const HeightContainer: FC<PropsWithChildren> = ({ children }) => {
  const height = useSelector(getMapHeight);
  const dispatch = useDispatch();

  const handleMapClick = () => {
    dispatch(deselectPaper());
  };

  return (
    <div style={{ height }} onClick={handleMapClick}>
      {children}
    </div>
  );
};
