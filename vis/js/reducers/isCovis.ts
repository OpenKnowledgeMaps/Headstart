// workaround solution to recognize covis (cannot use config.service, because it's gsheets)

const isCovis = (state = false, action: any) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return action.configObject.language === "eng_covis";
    default:
      return state;
  }
};

export default isCovis;
