const toolbar = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        showScaleToolbar: action.configObject.scale_toolbar,
        scaleOptions: action.configObject.scale_types,
        scaleBaseUnit: action.configObject.scale_base_unit,
        scaleValue: getScaleValue(action.configObject),
      };
    case "SCALE":
      return {
        ...state,
        scaleValue: action.value,
      };
    default:
      return state;
  }
};

export default toolbar;

const getScaleValue = (config) => {
  if (config.scale_by) {
    return config.scale_by;
  }

  if (config.scale_types && config.scale_types.length > 0) {
    return config.scale_types[0];
  }

  return null;
};
