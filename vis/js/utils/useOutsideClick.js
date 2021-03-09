import { useEffect } from "react";

/**
 * Based on the following StackOverflow post:
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 */

const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref]);
};

export default useOutsideClick;
