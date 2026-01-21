import { Area } from "../../models/area";

export interface Areas {
  list: Area[];
  options: {
    bubbleMaxScale: number;
    bubbleMinScale: number;
    maxAreaSize: number;
    minAreaSize: number;
    referenceSize: number;
    zoomFactor: number;
  };
  size: number;
}
