import { AllPossiblePapersType } from "../../index";

export interface Data {
  size: number;
  list: AllPossiblePapersType[];
  options: Options;
}

interface Options {
  isStreamgraph: boolean;
  maxDiameterSize: number;
  minDiameterSize: number;
  paperHeightFactor: number;
  paperMaxScale: number;
  paperMinScale: number;
  paperWidthFactor: number;
  referenceSize: number;
  visualizationId: string;
  hoveredItemId: string | null;
}
