import { Config } from "./config";
import multer from "multer";
import { joinPath } from "../utils/path";
import { mkdirSync } from "fs";
import mimeTypes from "mime-types";
import { logger } from "./logger";
import { RequestHandler } from "express";

export class UploadsManager {
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  configure(): RequestHandler {
    if (this.config.uploads.enabled) {
      return this.create();
    }

    return multer().none();
  }

  private create(): RequestHandler {
    const storage = this.createStorage();

    const config = multer({
      dest: this.config.uploads.path,
      storage,
      limits: {
        fileSize: this.config.uploads.maxFileSize,
      },
    });

    return config.fields(this.mapFields());
  }

  private mapFields(): multer.Field[] {
    return this.config.uploads.types.map((type) => {
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
        const fullUploadPath = joinPath(
          this.config.uploads.path,
          targetDirectory
        );
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
