const misc = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        showCreatedBy: action.configObject.credit_embed,
        showCreatedByViper: action.configObject.credit,
        createdByUrl: action.configObject.canonical_url,
      };
    default:
      return state;
  }
};

export default misc;
