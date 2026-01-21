import { ControlPosition } from "leaflet";

type Layer = {
  name: string;
  attribution: string;
  url: string;
};

export interface Config {
  POSITION: ControlPosition;
  CHECKED_LAYER_INDEX: number;
  LAYERS: Layer[];
}
