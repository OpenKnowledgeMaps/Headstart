import { FC } from "react";
import { ZoomControl } from "react-leaflet";
import { useSelector } from "react-redux";

import { CONFIG } from "./config";
import { checkIsWithZoomControl } from "./selectors";

export const ZoomControls: FC = () => {
  const isWithZoomControl = useSelector(checkIsWithZoomControl);

  if (!isWithZoomControl) {
    return null;
  }

  return <ZoomControl {...CONFIG} />;
};
