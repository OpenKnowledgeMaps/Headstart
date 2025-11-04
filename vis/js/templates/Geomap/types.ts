import { LatLngBoundsExpression, LatLngTuple } from "leaflet";

interface Map {
  center: LatLngTuple;
  zoom: number;
  minZoom: number;
  maxBounds: LatLngBoundsExpression;
  maxBoundsViscosity: number;
  worldCopyJump: boolean;
  keyboard: boolean;
  zoomControl: boolean;
}

interface TileLayer {
  attribution: string;
  url: string;
}

interface ZoomControl {
  position?: "topleft" | "topright" | "bottomleft" | "bottomright";
}

export interface Options {
  MAP: Map;
  LAYER: TileLayer;
  ZOOM_CONTROL: ZoomControl;
}
