import { FC } from "react";
import { useSelector } from "react-redux";

import { useVisualizationType } from "@/hooks";
import { State } from "@/js/types";

const getIsEmbed = (state: State) => state.misc.isEmbedded;

export const CreateMapButton: FC = () => {
  const isEmbed = useSelector(getIsEmbed);
  const { isGeoMap } = useVisualizationType();

  if (isEmbed) {
    return null;
  }

  if (isGeoMap) {
    return <div className="space_between_visualization_and_footer" />;
  }

  return (
    <div className="create_knowledge_map_button_container">
      <p className="try-now">
        <a target="_blank" className="donate-now" href="index">
          Create a knowledge map
        </a>
      </p>
    </div>
  );
};
