import { FC, memo } from "react";
import { Marker } from "react-leaflet";

import { getCoordinatesFromPaper } from "@/js/utils/coordinates";

import { createPinIcon } from "./createPinIcon";
import { PinProps } from "./types";

export const Pin: FC<PinProps> = memo(({ data, isActive, onClick }) => {
  const { east, north } = getCoordinatesFromPaper(data);

  const handleClick = () => onClick(data);

  if (!east || !north) {
    return null;
  }

  return (
    <Marker
      position={[north, east]}
      icon={createPinIcon(isActive)}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
});
