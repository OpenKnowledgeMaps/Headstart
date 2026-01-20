import { FC } from "react";
import { TileLayer } from "react-leaflet";

import { CONFIG } from "../config";

const { LAYERS, CHECKED_LAYER_INDEX } = CONFIG;

export const BaseLayer: FC = () => {
  return <TileLayer {...LAYERS[CHECKED_LAYER_INDEX]} />;
};
