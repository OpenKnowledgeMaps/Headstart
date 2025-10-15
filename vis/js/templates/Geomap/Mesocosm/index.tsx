import { FC } from "react";
import { Marker } from "react-leaflet";
import { AquanaviPaper } from "@/js/types";

export const Mesocosm: FC<AquanaviPaper> = ({ geographicalData }) => {
  if (!geographicalData?.north || !geographicalData?.east) {
    return null;
  }

  const { north: latitude, east: longitude } = geographicalData;

  return <Marker position={[latitude, longitude]} />;
};
