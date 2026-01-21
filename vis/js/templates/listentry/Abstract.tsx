import React, { FC } from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import { SelectedPaper, State } from "../../types";

interface AbstractProps {
  text: string;
  isSelected: SelectedPaper | null;
}

const Abstract: FC<AbstractProps> = ({ text, isSelected }) => {
  const loc = useLocalizationContext();

  return (
    <p id="list_abstract" className={!isSelected ? "short" : undefined}>
      <Highlight queryHighlight>{text ? text : loc.default_abstract}</Highlight>
    </p>
  );
};

const mapStateToProps = (state: State) => ({
  isSelected: state.selectedPaper,
});

export default connect(mapStateToProps)(React.memo(Abstract));
