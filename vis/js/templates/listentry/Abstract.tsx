// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";

interface AbstractProps {
  text: string;
  isSelected: boolean;
}

const Abstract = ({ text, isSelected }: AbstractProps) => {
  const loc = useLocalizationContext();

  return (
    // html template starts here
    <p id="list_abstract" className={!isSelected ? "short" : undefined}>
      <Highlight queryHighlight>{text ? text : loc.default_abstract}</Highlight>
    </p>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  isSelected: state.selectedPaper,
});

export default connect(mapStateToProps)(React.memo(Abstract));
