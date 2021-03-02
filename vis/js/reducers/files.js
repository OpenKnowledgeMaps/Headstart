const files = (state = { current: 0, list: [] }, action) => {
  if (action.canceled) {
    return state;
  }
  
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        list: action.configObject.files,
      };
    case "FILE_CLICKED":
      return {
        ...state,
        current: action.fileIndex
      };
    default:
      return state;
  }
};

export default files;
