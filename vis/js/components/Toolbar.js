import React from "react";
import { connect } from "react-redux";
import ScaleToolbar from "../templates/ScaleToolbar";

import { openInfoModal, openResearcherModal, scaleMap } from "../actions";

const Toolbar = ({
  showScaleToolbar,
  scaleOptions,
  scaleBaseUnit,
  scaleValue,
  showCredit,
  onInfoClick,
  onScaleChange,
  onResearcherClick,
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
          value={scaleValue}
          showCredit={showCredit}
          onInfoClick={onInfoClick}
          onResearcherClick={onResearcherClick}
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
  scaleBaseUnit: state.toolbar.scaleBaseUnit,
  scaleValue: state.toolbar.scaleValue,
  showCredit: state.misc.showCreatedByViper,
});

const mapDispatchToProps = (dispatch) => ({
  onInfoClick: () => dispatch(openInfoModal()),
  onResearcherClick: () => dispatch(openResearcherModal()),
  onScaleChange: (value, baseUnit, contentBased, sort) =>
    dispatch(scaleMap(value, baseUnit, contentBased, sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
