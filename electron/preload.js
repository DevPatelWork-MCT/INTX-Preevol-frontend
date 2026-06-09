// electron/preload.ts

import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
});