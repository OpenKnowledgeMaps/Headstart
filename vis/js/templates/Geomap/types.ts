import { Control, MapOptions } from "leaflet";

type MapConfig = Required<
  Pick<
    MapOptions,
    | "center"
    | "zoom"
    | "minZoom"
    | "maxZoom"
    | "maxBounds"
    | "maxBoundsViscosity"
    | "worldCopyJump"
    | "keyboard"
    | "zoomControl"
  >
>;

type ZoomControlConfig = Control.ZoomOptions;

export interface Config {
  MAP: MapConfig;
  ZOOM_CONTROL: ZoomControlConfig;
}
