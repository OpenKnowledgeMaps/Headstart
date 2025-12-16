import { FC, PropsWithChildren } from "react";
import { useSelector } from "react-redux";

import { getMapHeight } from "./selectors";
import { ACCESSABILITY_ATTRIBUTES } from "./config";

export const HeightContainer: FC<PropsWithChildren> = ({ children }) => {
  const height = useSelector(getMapHeight);

  return (
    <div style={{ height }} {...ACCESSABILITY_ATTRIBUTES}>
      {children}
    </div>
  );
};
