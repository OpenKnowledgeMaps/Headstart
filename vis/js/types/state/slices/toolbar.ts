import { ScaleOptions } from "../../index";

export interface Toolbar {
  showScaleToolbar: boolean;
  scaleValue?: ScaleOptions;
  scaleOptions: ScaleOptions[] | [];
  scaleBaseUnit?: BaseUnit;
  scaleExplanations?: ScaleExplanations;
  scaleLabels?: ScaleLabels;
}

export interface ScaleLabels {
  citations: string;
  cited_by_accounts_count: string;
  content_based: string;
  references: string;
}

export interface ScaleExplanations {
  citations: string;
  cited_by_accounts_count: string;
  content_based: string;
  references: string;
}

interface BaseUnit {
  citations: string;
  cited_by_accounts_count: string;
  references: string;
}
