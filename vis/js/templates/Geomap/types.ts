import { LatLngBoundsExpression, LatLngTuple } from "leaflet";

interface Map {
  center: LatLngTuple;
  zoom: number;
  minZoom: number;
  maxBounds: LatLngBoundsExpression;
  maxBoundsViscosity: number;
  worldCopyJump: boolean;
}

interface TileLayer {
  attribution: string;
  url: string;
}

export interface Options {
  MAP: Map;
  LAYER: TileLayer;
}
