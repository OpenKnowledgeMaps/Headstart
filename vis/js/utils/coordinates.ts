import { AllPossiblePapersType } from "../types";

/**
 * This function extracts coordinates from the document data. It is returning coordinates
 * or null if coordinates are not presented in the document data.
 */
export const getCoordinatesFromPaper = (data: AllPossiblePapersType) => {
  if (!("geographicalData" in data)) {
    return { east: null, north: null };
  }

  const { geographicalData } = data;

  if (!geographicalData) {
    return { east: null, north: null };
  }

  return geographicalData;
};
