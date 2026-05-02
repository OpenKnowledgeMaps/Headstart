import { FC } from "react";

import { ControlTabOrder } from "./ControlTabOrder";
import { KeyboardZoomController } from "./KeyboardZoomController";
import { SelectionResetHandler } from "./SelectionResetHandler";

/**
 * Why this component is needed?
 *
 * This component is used to handle the map behaviors.
 * For example, when the user clicks on the map, the selection is reset OR
 * when the user zooms in or out using the keyboard, the map is zoomed in or out.
 */
export const GeomapMapBehaviors: FC = () => (
  <>
    <ControlTabOrder />
    <SelectionResetHandler />
    <KeyboardZoomController />
  </>
);
