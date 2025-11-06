import { FC } from "react";

import { useVisualizationType } from "@/hooks";

import { useLocalizationContext } from "../../components/LocalizationProvider";

interface BackLinkProps {
  isInStream: boolean;
  onClick: () => void;
}

const BackLink: FC<BackLinkProps> = ({ isInStream, onClick }) => {
  const localization = useLocalizationContext();
  const { isStreamgraph } = useVisualizationType();

  let displayedText = localization.backlink_list;

  if (isStreamgraph) {
    displayedText = isInStream
      ? localization.backlink_list_streamgraph_stream_selected
      : localization.backlink_list_streamgraph;
  }

  return (
    <button type="button" className="back_link_button" onClick={onClick}>
      {displayedText}
    </button>
  );
};

export default BackLink;
