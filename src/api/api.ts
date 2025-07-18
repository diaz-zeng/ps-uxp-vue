import * as photoshop from "./photoshop"; 
import { uxp } from "../globals";

const hostName =
  uxp?.host?.name.toLowerCase().replace(/\s/g, "") || ("" as string);

// prettier-ignore
let host = {} as 
  & typeof photoshop 

if (hostName.startsWith("photoshop")) host = photoshop; 

export const api = host;
