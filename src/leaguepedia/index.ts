import axios from "./axios";
import { generateLeaguepediaURL } from "./generate_url";

export const leaguepedia = {
  async fetchData(parameters: any) {
    const url = generateLeaguepediaURL(parameters);
    console.log("URL: ", url);
    const res = await axios.get(url);
    return res.data;
  },
};
