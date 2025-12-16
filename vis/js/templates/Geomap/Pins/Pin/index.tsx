import { FC, memo } from "react";
import { Marker } from "react-leaflet";

import { getCoordinatesFromPaper } from "@/js/utils/coordinates";

import { CONFIG } from "./config";

import { PinProps } from "./types";
import { createPinIcon } from "./createPinIcon";

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
      icon={createPinIcon(isActive, data)}
      zIndexOffset={isActive ? selected : basic}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
});
