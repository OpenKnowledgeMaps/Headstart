import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const EntryBacklink = ({ isInStream, onClick }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <button
      className="paper_button backlink_list"
      style={{ width: "auto" }}
      onClick={onClick}
    >
      <i className="fas fa-arrow-left"></i>
      <span className="backlink-label">
        {isInStream
          ? localization.backlink_list_streamgraph_stream_selected
          : localization.backlink_list_streamgraph}
      </span>
    </button>
    // html template ends here
  );
};

export default EntryBacklink;
