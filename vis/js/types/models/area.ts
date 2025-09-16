import { AllPossiblePapersType } from "../models/paper";

export interface Area {
  area_uri: number;
  num_readers: number;
  origR: number;
  origX: number;
  origY: number;
  papers: AllPossiblePapersType[];
  r: number;
  title: string;
  x: number;
  y: number;
  zoomedR: number;
  zoomedX: number;
  zoomedY: number;
}
