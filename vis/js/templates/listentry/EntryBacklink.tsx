import React, { FC } from "react";
import { useLocalizationContext } from "../../components/LocalizationProvider";

interface EntryBacklinkProps {
  isInStream: boolean;
  onClick: () => void;
}

const EntryBacklink: FC<EntryBacklinkProps> = ({ isInStream, onClick }) => {
  const localization = useLocalizationContext();

  return (
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
  );
};

export default EntryBacklink;
