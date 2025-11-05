type TitleLabelTypes =
  | "authorview-streamgraph"
  | "authorview-knowledgemap"
  | "keywordview-streamgraph"
  | "keywordview-knowledgemap"
  | "geomap";

export interface Heading {
  acronym: unknown;
  customTitle: unknown;
  presetTitle: string;
  projectId: unknown;
  title: unknown;
  titleLabelType: TitleLabelTypes;
  titleStyle: string;
}
