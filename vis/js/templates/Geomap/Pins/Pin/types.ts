import { AllPossiblePapersType } from "@/js/types";

export interface PinProps {
  data: AllPossiblePapersType;
  isActive: boolean;
  onClick: (data: AllPossiblePapersType) => void;
}

export interface Config {
  offsets: {
    basic: number;
    selected: number;
  };
}
