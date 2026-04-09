import { FC, PropsWithChildren } from "react";
import { useSelector } from "react-redux";

import { getAriaLabel } from "./getAriaLabel";
import {
  getCustomTitle,
  getLocalization,
  getMapHeight,
  getQuery,
  getQueryAdvanced,
  getTitleLabelType,
  getTitleStyle,
} from "./selectors";

export const HeightContainer: FC<PropsWithChildren> = ({ children }) => {
  const height = useSelector(getMapHeight);
  const localization = useSelector(getLocalization);
  const titleLabelType = useSelector(getTitleLabelType);
  const query = useSelector(getQuery);
  const advancedQuery = useSelector(getQueryAdvanced);
  const customTitle = useSelector(getCustomTitle);
  const titleStyle = useSelector(getTitleStyle);

  const ariaLabel = getAriaLabel({
    titleLabelType,
    localization,
    query,
    advancedQuery,
    customTitle,
    titleStyle,
  });

  return (
    <div role="region" aria-label={ariaLabel} style={{ height }}>
      {children}
    </div>
  );
};
