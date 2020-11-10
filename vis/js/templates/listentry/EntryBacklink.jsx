import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const EntryBacklink = ({ isInStream, onClick }) => {
  const localization = useLocalizationContext();

  return (
    // html template starts here
    <div id="backlink_list" className="backlink-list" onClick={onClick}>
      <a className="underline">
        {isInStream
          ? localization.backlink_list_streamgraph_stream_selected
          : localization.backlink_list_streamgraph}
      </a>
    </div>
    // html template ends here
  );
};

export default EntryBacklink;
