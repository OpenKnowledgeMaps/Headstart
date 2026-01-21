import { ScaleOptions } from "../index";

export interface ScaleMapAction {
  type: "SCALE";
  value: ScaleOptions;
  contentBased: boolean;
  baseUnit?: string;
  sort?: string;
}
