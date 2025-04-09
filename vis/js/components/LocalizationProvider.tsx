import React from "react";
import { Localization } from "../i18n/localization";

const LocalizationContext = React.createContext<Localization>({} as any);

export const useLocalizationContext = () =>
  React.useContext(LocalizationContext);

export default function LocalizationProvider({ localization, children }: {
  localization: Localization,
  children: React.ReactNode
}) {
  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
}
