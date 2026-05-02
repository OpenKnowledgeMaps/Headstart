import { AllPossiblePapersType } from "@/js/types";
import L from "leaflet";

const getAriaLabel = (data: AllPossiblePapersType): string => {
  let result = "";

  if (!("geographicalData" in data)) {
    return result;
  }

  const { title, geographicalData } = data;

  if (title) {
    result = title;
  }

  if (geographicalData) {
    const { continent, country } = geographicalData;
    result = result + `; ${country}, ${continent}`;
  }

  return result;
};

export const createPinIcon = (
  isActive: boolean,
  data: AllPossiblePapersType,
) => {
  const ariaLabel = getAriaLabel(data);

  return L.divIcon({
    className: `custom-marker ${isActive ? "selected" : ""}`,
    html: `<div class="marker-shape" role="button" aria-label="${ariaLabel}"></div>`,
    iconSize: [22, 30],
    iconAnchor: [11, 30],
  });
};
