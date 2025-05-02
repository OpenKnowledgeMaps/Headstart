export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay = 300,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const context = this;
    const isCallNow = immediate && !timeoutId;

    const later = () => {
      timeoutId = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, delay);

    if (isCallNow) {
      func.apply(context, args);
    }
  };
};
