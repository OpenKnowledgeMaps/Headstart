import { queryConcatenator } from "@/js/utils/data";
import { getHeadingLabel } from "@/js/utils/getHeadingLabel";
import { unescapeHTML } from "@/js/utils/unescapeHTMLentities";

const MAX_LENGTH_CUSTOM = 100;

const sliceText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
};

type Params = {
  titleLabelType: Parameters<typeof getHeadingLabel>[0];
  localization: Parameters<typeof getHeadingLabel>[1];
  query: string;
  advancedQuery: string | null;
  customTitle: unknown;
  titleStyle: string | null;
};

export const getAriaLabel = ({
  titleLabelType,
  localization,
  query,
  advancedQuery,
  customTitle,
  titleStyle,
}: Params) => {
  const headingLabel = getHeadingLabel(titleLabelType, localization);
  const queryString = queryConcatenator([query, advancedQuery]);

  const effectiveTitle =
    titleStyle === "custom" &&
    typeof customTitle !== "undefined" &&
    customTitle !== null
      ? unescapeHTML(sliceText(String(customTitle), MAX_LENGTH_CUSTOM))
      : queryString;

  return effectiveTitle ? `${headingLabel} ${effectiveTitle}` : headingLabel;
};
