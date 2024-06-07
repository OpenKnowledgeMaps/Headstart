import Fetcher from "./Fetcher";

class ServerFetcher extends Fetcher {
  async getData() {
    const url =
      this.config.serverUrl +
      "services/getLatestRevision.php?vis_id=" +
      this.config.files[0].file +
      "&context=true&streamgraph=" +
      this.config.isStreamgraph;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

}


export default ServerFetcher;
