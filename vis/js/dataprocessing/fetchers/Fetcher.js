class Fetcher {
  config = {
    serverUrl: "",
    files: [],
    isStreamgraph: false,
  };

  constructor(config) {
    this.config = config;
  }

  async getData() {
    throw new Error("Function not implemented.");
  }
}

export default Fetcher;
