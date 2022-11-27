import express from "express";
import { Server } from "../core";

export const replaceRouter = (name: string, router: express.Router) => {
  Server.app._router?.stack.forEach((layer: any) => {
    if (layer?.handle._source === name) {
      layer.handle = router;
    }
  });
};
