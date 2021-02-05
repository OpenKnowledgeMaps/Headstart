import { transition } from "d3-transition";
import { easePolyInOut } from "d3-ease";

/**
 * Returns d3 transition object that is passed as a parameter 
 * to each component transition.
 * 
 * @param {Function} callback callback triggered at the end
 */
export const createTransition = (callback) => {
  const newTransition = transition()
    .duration(750)
    .ease(easePolyInOut.exponent(3));
  newTransition.on("end", callback);
  return newTransition;
};
