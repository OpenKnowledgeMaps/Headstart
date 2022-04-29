import Fetcher from "./Fetcher";

class ServerFetcher extends Fetcher {
  async getData() {
    const url =
      this.config.serverUrl +
      "services/getLatestRevision.php?vis_id=" +
      this.config.files[0].file +
      "&context=true&streamgraph=" +
      this.config.isStreamgraph;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  }
}

export default ServerFetcher;
