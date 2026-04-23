import { Localization } from "../i18n/localization";

type TitleLabelType =
  | "authorview-streamgraph"
  | "authorview-knowledgemap"
  | "keywordview-streamgraph"
  | "keywordview-knowledgemap"
  | "geomap";

export const getHeadingLabel = (
  labelType: TitleLabelType,
  localization: Localization,
) => {
  switch (labelType) {
    case "authorview-streamgraph":
      return localization.streamgraph_authors_label;
    case "authorview-knowledgemap":
      return localization.overview_authors_label;
    case "keywordview-streamgraph":
      return localization.streamgraph_label;
    case "keywordview-knowledgemap":
      return localization.overview_label;
    case "geomap":
      return localization.geomap_label;
    default:
      throw new Error(`Label of type '${labelType}' not supported.`);
  }
};
