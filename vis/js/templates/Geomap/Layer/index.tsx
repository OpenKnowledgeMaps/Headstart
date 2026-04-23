import { FC } from "react";
import { useSelector } from "react-redux";

import { BaseLayer } from "./BaseLayer";
import { LayersSwitcher } from "./LayersSwitcher";
import { checkIsSwitchingAllowed } from "./selectors";

export const Layer: FC = () => {
  const isWithLayerSwitchingFeature = useSelector(checkIsSwitchingAllowed);

  return (
    <>
      {isWithLayerSwitchingFeature && <LayersSwitcher />}
      {!isWithLayerSwitchingFeature && <BaseLayer />}
    </>
  );
};
