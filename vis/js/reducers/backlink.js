const backlink = (state = null, action) => {
  switch (action.type) {
    case "SET_BACKLINK":
      return action.data;
    default:
      return state;
  }
};

export default backlink;
