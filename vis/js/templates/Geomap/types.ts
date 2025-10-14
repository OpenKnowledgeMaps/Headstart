import { LatLngTuple } from "leaflet";

interface Map {
  center: LatLngTuple;
  zoom: number;
}

interface TileLayer {
  attribution: string;
  url: string;
}

export interface Options {
  map: Map;
  tileLayer: TileLayer;
}
