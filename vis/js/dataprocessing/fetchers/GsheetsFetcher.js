import Fetcher from "./Fetcher";

class GsheetsFetcher extends Fetcher {
  async getData() {
    const url =
      this.config.serverUrl +
      "services/getGSheetsMap.php?vis_id=" +
      this.config.files[0].file +
      "&q=" +
      this.config.files[0].title +
      "&context=true&streamgraph=" +
      this.config.isStreamgraph;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  }
}

export default GsheetsFetcher;
