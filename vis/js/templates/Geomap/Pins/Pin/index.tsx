import { FC, memo } from "react";
import { Marker } from "react-leaflet";

import { getCoordinatesFromPaper } from "@/js/utils/coordinates";

import { CONFIG } from "./config";
import { createPinIcon } from "./createPinIcon";
import { PinProps } from "./types";

const { offsets } = CONFIG;
const { basic, selected } = offsets;

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
      zIndexOffset={isActive ? selected : basic}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
});
