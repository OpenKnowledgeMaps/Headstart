import React, { FC } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { scaleMap } from "../actions";
import ScaleToolbar from "../templates/ScaleToolbar";
import {
  ScaleMapAction,
  ScaleOptions,
  State,
  Toolbar as ToolbarStateType,
} from "../types";

interface ToolbarProps extends ToolbarStateType, MapDispatchProps {}

const Toolbar: FC<ToolbarProps> = ({
  showScaleToolbar,
  scaleOptions,
  scaleLabels,
  scaleExplanations,
  scaleBaseUnit,
  scaleValue,
  onScaleChange,
}) => {
  if (
    !showScaleToolbar ||
    !scaleBaseUnit ||
    !scaleLabels ||
    !scaleExplanations ||
    !scaleValue
  ) {
    return null;
  }

  const handleScaleChange = (newScaleBy: ScaleOptions) => {
    // If scale is equal to “content_based”, this means that the scale settings need to be reset.
    // This method is handled separately from the others (TODO: can be refactored in feature).
    if (newScaleBy === "content_based") {
      onScaleChange(newScaleBy, undefined, true, undefined);
      return;
    }

    const newBaseUnit = scaleBaseUnit[newScaleBy];
    onScaleChange(newScaleBy, newBaseUnit, false, newBaseUnit);
  };

  return (
    <div id="toolbar" className="toolbar">
      <ScaleToolbar
        options={scaleOptions}
        labels={scaleLabels}
        explanations={scaleExplanations}
        value={scaleValue}
        onChange={handleScaleChange}
      />
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  showScaleToolbar: state.toolbar.showScaleToolbar,
  scaleOptions: state.toolbar.scaleOptions,
  scaleLabels: state.toolbar.scaleLabels,
  scaleExplanations: state.toolbar.scaleExplanations,
  scaleBaseUnit: state.toolbar.scaleBaseUnit,
  scaleValue: state.toolbar.scaleValue,
});

const mapDispatchToProps = (dispatch: Dispatch<ScaleMapAction>) => ({
  onScaleChange: (
    value: ScaleOptions,
    baseUnit: string | undefined,
    contentBased: boolean,
    sort: string | undefined,
  ) => dispatch(scaleMap(value, baseUnit, contentBased, sort)),
});

type MapDispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
