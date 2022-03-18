import Fetcher from "./Fetcher";

class LocalFetcher extends Fetcher {
  async getData() {
    return await this.getDataFromFile(0);
  }

  async getDataFromFile(fileIndex) {
    const url = this.config.files[fileIndex].file;

    const response = await fetch(url);
    // TODO csv (based on config.input_format)
    const data = await response.json();

    return data;
  }
}

export default LocalFetcher;
