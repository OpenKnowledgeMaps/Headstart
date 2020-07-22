export default chartType = (state = null, action) => {
    switch (action.type) {
      case "SET_NORMAL":
        return 'normal';
      case "SET_STREAMGRAPH":
          return 'streamgraph'
      default:
        return state;
    }
  };
