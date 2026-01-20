import { FC, PropsWithChildren } from "react";
import { useSelector } from "react-redux";

import { getMapHeight } from "./selectors";

export const HeightContainer: FC<PropsWithChildren> = ({ children }) => {
  const height = useSelector(getMapHeight);

  return <div style={{ height }}>{children}</div>;
};
