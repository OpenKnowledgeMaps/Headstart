import React from "react";
import { connect } from "react-redux";
import ScaleToolbar from "../templates/ScaleToolbar";

import LocalizationProvider from "./LocalizationProvider";
import { openInfoModal, scaleMap } from "../actions";

const Toolbar = ({
  showScaleToolbar,
  scaleOptions,
  scaleLabels,
  scaleExplanations,
  scaleBaseUnit,
  scaleValue,
  onInfoClick,
  onScaleChange,
  localization,
}) => {
  if (showScaleToolbar) {
    const handleScaleChange = (newScaleBy) => {
      const newBaseUnit = scaleBaseUnit[newScaleBy];
      const isContentBased = newScaleBy === "content_based";
      const newSort = isContentBased ? undefined : newBaseUnit;

      onScaleChange(newScaleBy, newBaseUnit, isContentBased, newSort);
    };

    return (
      <LocalizationProvider localization={localization}>
        <ScaleToolbar
          options={scaleOptions}
          labels={scaleLabels}
          explanations={scaleExplanations}
          value={scaleValue}
          onInfoClick={onInfoClick}
          onChange={handleScaleChange}
        />
      </LocalizationProvider>
    );
  }

  return null;
};

const mapStateToProps = (state) => ({
  showScaleToolbar: state.toolbar.showScaleToolbar,
  scaleOptions: state.toolbar.scaleOptions,
  scaleLabels: state.toolbar.scaleLabels,
  scaleExplanations: state.toolbar.scaleExplanations,
  scaleBaseUnit: state.toolbar.scaleBaseUnit,
  scaleValue: state.toolbar.scaleValue,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onInfoClick: () => dispatch(openInfoModal()),
  onScaleChange: (value, baseUnit, contentBased, sort) =>
    dispatch(scaleMap(value, baseUnit, contentBased, sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
