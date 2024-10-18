// @ts-nocheck

import React from "react";

const LocalizationContext = React.createContext();

export const useLocalizationContext = () =>
  React.useContext(LocalizationContext);

export default function LocalizationProvider({ localization, children }) {
  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
}
