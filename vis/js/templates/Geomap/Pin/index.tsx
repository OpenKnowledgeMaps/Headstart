import { FC, memo } from "react";
import { Marker } from "react-leaflet";

import { createPinIcon } from "./createPinIcon";
import { PinProps } from "./types";

export const Pin: FC<PinProps> = memo(({ id, lat, lon, isActive, onClick }) => {
  const handleClick = () => {
    onClick(id);
  };

  return (
    <Marker
      position={[lat, lon]}
      icon={createPinIcon(isActive)}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
});
