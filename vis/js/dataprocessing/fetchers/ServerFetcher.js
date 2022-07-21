import Fetcher from "./Fetcher";

class ServerFetcher extends Fetcher {
  async getData() {
    const url =
      this.config.serverUrl +
      "services/getLatestRevision.php?vis_id=" +
      this.config.files[0].file +
      "&context=true&streamgraph=" +
      this.config.isStreamgraph;


    // Your changes go here





    
    // Your changes go here

    return data;
  }
}

export default ServerFetcher;
