import { Config } from "./types";

export const CONFIG: Config = {
  POSITION: "topright",
  CHECKED_LAYER_NAME: "Standard",
  LAYERS: [
    {
      name: "Standard",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> ♥ <a href="https://wiki.osmfoundation.org/wiki/Terms_of_Use" target="_blank" rel="noopener noreferrer">Make a Donation</a>. <a href="https://www.openstreetmap.org/terms" target="_blank" rel="noopener noreferrer">Website and API terms</a>',
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    {
      name: "Humanitarian",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>. Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank" rel="noopener noreferrer">OpenStreetMap France</a>. <a href="https://www.openstreetmap.org/terms" target="_blank" rel="noopener noreferrer">Website and API terms</a>',
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    },
    {
      name: "Topographical (OpenTopoMap)",
      attribution:
        'map data: © <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org/" target="_blank" rel="noopener noreferrer">SRTM</a> | map style: © <a href="https://opentopomap.org/" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC-BY-SA</a>)',
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    },
  ],
};
