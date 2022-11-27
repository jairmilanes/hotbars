import { mkdirSync } from "fs";
import mimeTypes from "mime-types";
import multer from "multer";
import { RequestHandler } from "express";
import { logger } from "../../services";
import { UploadsConfig } from "../types";
import { joinPath } from "../utils";
import { Config } from "../core";

export class Multipart {
  private options: UploadsConfig;

  constructor() {
    this.options = Config.value<UploadsConfig>("uploads");
  }

  configure(): RequestHandler {
    if (this.options.enabled) {
      return this.create();
    }

    return multer().none();
  }

  private create(): RequestHandler {
    const storage = this.createStorage();

    const config = multer({
      dest: this.options.path,
      storage,
      limits: {
        fileSize: this.options.maxFileSize,
      },
    });

    return config.fields(this.mapFields());
  }

  private mapFields(): multer.Field[] {
    return this.options.types.map((type) => {
      if (typeof type === "string") {
        return { name: type };
      }
      return { name: type.name, maxCount: type.maxCount || null };
    }) as multer.Field[];
  }

  private createStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const targetDirectory = req.body.type || "general";
        const fullUploadPath = joinPath(this.options.path, targetDirectory);
        // Multer does not create the directory when this function is provided
        // So we create the target directory based on the type body parameter
        try {
          mkdirSync(fullUploadPath, { recursive: true });
        } catch (e) {
          logger.warn(`Error trying to create upload path "${fullUploadPath}"`);
        }

        cb(null, targetDirectory);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname +
            "-" +
            uniqueSuffix +
            "." +
            mimeTypes.extension(file.mimetype)
        );
      },
    });
  }
}
