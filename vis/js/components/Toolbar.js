import React from "react";
import { connect } from "react-redux";
import ScaleToolbar from "../templates/ScaleToolbar";

import { openInfoModal, scaleMap } from "../actions";

const Toolbar = ({
  showScaleToolbar,
  scaleOptions,
  scaleLabels,
  scaleExplanations,
  scaleBaseUnit,
  scaleValue,
  showCreatedBy,
  onInfoClick,
  onScaleChange,
}) => {
  if (showScaleToolbar) {
    const handleScaleChange = (newScaleBy) => {
      const newBaseUnit = scaleBaseUnit[newScaleBy];
      const isContentBased = newScaleBy === "content_based";
      const newSort = isContentBased ? undefined : newBaseUnit;

      onScaleChange(newScaleBy, newBaseUnit, isContentBased, newSort);
    };

    return (
      <div id="toolbar" className="toolbar">
        <ScaleToolbar
          options={scaleOptions}
          labels={scaleLabels}
          explanations={scaleExplanations}
          value={scaleValue}
          showCredit={showCreatedBy}
          onInfoClick={onInfoClick}
          onChange={handleScaleChange}
        />
      </div>
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
  showCreatedBy: state.misc.showCreatedByViper,
});

const mapDispatchToProps = (dispatch) => ({
  onInfoClick: () => dispatch(openInfoModal()),
  onScaleChange: (value, baseUnit, contentBased, sort) =>
    dispatch(scaleMap(value, baseUnit, contentBased, sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
