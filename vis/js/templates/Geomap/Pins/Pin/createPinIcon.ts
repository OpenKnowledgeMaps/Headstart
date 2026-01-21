import L from "leaflet";

export const createPinIcon = (isActive: boolean) =>
  L.divIcon({
    className: `custom-marker ${isActive ? "selected" : ""}`,
    html: `<div class="marker-shape"></div>`,
    iconSize: [22, 30],
    iconAnchor: [11, 30],
  });
