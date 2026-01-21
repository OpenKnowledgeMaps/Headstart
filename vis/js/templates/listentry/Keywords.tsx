import React, { FC } from "react";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import Highlight from "../../components/Highlight";
import { PropsWithChildren } from "../../types";

const Keywords: FC<PropsWithChildren> = ({ children }) => {
  const localization = useLocalizationContext();

  return (
    <div className="list_row">
      <span className="list_row_label">{localization.keywords}: </span>
      <span className="list_row_content">
        <Highlight queryHighlight>{children}</Highlight>
      </span>
    </div>
  );
};

export default Keywords;
