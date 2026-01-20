import { Config } from "../configs/config";

export interface Action {
  type: string;
  configObject?: Config;
}
