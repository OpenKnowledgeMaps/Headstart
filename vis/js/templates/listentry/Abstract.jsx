import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";
import { shorten } from "../../utils/string";

const Abstract = ({ text, maxLength }) => {
  const loc = useLocalizationContext();

  let finalContent = text;
  if (!finalContent) {
    finalContent = loc.default_abstract;
  }
  if (maxLength) {
    finalContent = shorten(finalContent, maxLength);
  }

  return (
    // html template starts here
    <p id="list_abstract">
      <Highlight queryHighlight>{finalContent}</Highlight>
    </p>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  maxLength: state.selectedPaper ? null : state.list.abstractSize,
});

export default connect(mapStateToProps)(React.memo(Abstract));
