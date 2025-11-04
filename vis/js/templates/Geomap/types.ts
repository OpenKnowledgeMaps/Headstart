import { LatLngBoundsExpression, LatLngTuple } from "leaflet";

interface Map {
  center: LatLngTuple;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  maxBounds: LatLngBoundsExpression;
  maxBoundsViscosity: number;
  worldCopyJump: boolean;
  keyboard: boolean;
  zoomControl: boolean;
}

interface ZoomControl {
  position?: "topleft" | "topright" | "bottomleft" | "bottomright";
}

export interface Config {
  MAP: Map;
  ZOOM_CONTROL: ZoomControl;
}
