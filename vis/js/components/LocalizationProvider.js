import React from "react";

let LocalizationContext;
let { Provider } = (LocalizationContext = React.createContext());

export const useLocalizationContext = () =>
  React.useContext(LocalizationContext);

export default function LocalizationProvider({ localization, children }) {
  return <Provider value={localization}>{children}</Provider>;
}
