import { FC, PropsWithChildren } from "react";

import Highlight from "@/js/components/Highlight";
import { useLocalizationContext } from "@/js/components/LocalizationProvider";

export const Location: FC<PropsWithChildren> = ({ children }) => {
  const { location, location_fallback } = useLocalizationContext();

  return (
    <div className="list_row">
      <span className="list_row_label">{location}: </span>
      <span className="list_row_content">
        <Highlight queryHighlight>{children || location_fallback}</Highlight>
      </span>
    </div>
  );
};
