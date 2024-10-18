const hyphenationLang = (state = null, action: any) => {
  if (action.canceled) {
    return state;
  }
  
  switch (action.type) {
    case "INITIALIZE":
      return action.configObject.hyphenation_language;
    default:
      return state;
  }
};

export default hyphenationLang;
