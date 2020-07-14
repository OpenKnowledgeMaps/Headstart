/**
 * This is where all actions are stored.
 */

export const showBacklink = (onClick) => ({
  type: "SET_BACKLINK",
  data: {
    onClick,
  },
});

export const hideBacklink = () => ({
  type: "SET_BACKLINK",
  data: null,
});
