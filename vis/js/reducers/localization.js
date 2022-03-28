const localization = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    // localization does not change after the first setup
    default:
      return state;
  }
};

export default localization;
