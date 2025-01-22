import Fetcher from "./Fetcher";

class ServerFetcher extends Fetcher {
  async getData() {
    //Configure endpoint Url
    const url =
      this.config.serverUrl +
      "services/getLatestRevision.php?vis_id=" +
      this.config.files[0].file +
      "&context=true&streamgraph=" +
      this.config.isStreamgraph;
    //fetch url
    const data = await fetch(url)
    const response = await data.json()
    //send response to UI
    return response;
  }
}

export default ServerFetcher;
