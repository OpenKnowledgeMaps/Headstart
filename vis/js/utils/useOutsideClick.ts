import React, { useEffect } from "react";

/**
 * Based on the following StackOverflow post:
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 */

const useOutsideClick = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore
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
