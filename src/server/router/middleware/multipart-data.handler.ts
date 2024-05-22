import { Server } from "../../core";
import { Multipart } from "../../services";
import { NextFunction, Request, Response } from "express";
import { RequestEnhanced } from "../../types";
import { DataManager } from "../../data";
import { logger } from "../../../services";

async function persistFileData(req: Request, res: Response, next: NextFunction) {
  const enhancedRequest = req as RequestEnhanced;

  if (Array.isArray(enhancedRequest.___uploads)) {
    const { ___uploads } = enhancedRequest
    const manager = DataManager.get()
    const basePath = req.path.match(/\/_api\/([^/]+)/)
    const collection = basePath?.shift()?.replace("/_api/", "")
    const type = await DataManager.get()
      .from("__types")
      .eq("name", collection || "")
      .single()

    logger.debug("%p%P Persisting %s files", 3, 1, ___uploads.length)

    for (let i = 0; i < ___uploads.length; i++) {
      const file = ___uploads[i]

      const { fieldName } = file

      const field = type?.fields.find((field: any) => field.name === fieldName)

      delete file.type
      delete file.fieldName
      delete file.entryId

      const entry = await manager
        .from("__files")
        .insert(file)

      if (entry) {
        if (field?.type === "dropzone") {
          req.body[fieldName as string] = [...(req.body[fieldName as string] || []), ""+entry.id]
        } else {
          req.body[fieldName as string] = ""+entry.id
        }

        logger.debug("%p%P Payload updated %s => %o", 5, 0, fieldName, req.body[fieldName as string])
      }
    }
  }
  next()
}

export const multipartDataHandler = () => {
  const multipart = new Multipart();
  const middleware = multipart.configure();
  Server.app.post("/*", middleware, persistFileData);
  Server.app.patch("/*", middleware, persistFileData);
  Server.app.put("/*", middleware, persistFileData);
};
