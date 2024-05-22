import { mkdirSync } from "fs";
import mimeTypes from "mime-types";
import multer from "multer";
import { RequestHandler, Request } from "express";
import { logger } from "../../services";
import { RequestEnhanced, UploadsConfig, User } from "../types";
import { joinPath } from "../utils";
import { Config } from "../core";
import { DataManager } from "../data";

interface Field extends multer.Field {
  destination?: string;
  maxSize?: number;
}

export class Multipart {
  private options: UploadsConfig;

  private context: Record<string, any> = {}

  constructor() {
    this.options = Config.get<UploadsConfig>("uploads");
    logger.debug(`%p%P Multipart handler`, 0, 1);
  }

  configure(): RequestHandler {
    if (this.options.enabled) {
      return this.create();
    }

    return multer().none();
  }

  private create(): RequestHandler {
    const storage = this.createStorage();
    const options = {
      dest: this.options.path,
      storage,
      limits: {
        fileSize: this.options.maxFileSize
      },
      fileFilter: this.fileFilter.bind(this)
    }

    logger.debug(`%p%P Upload config %O`, 3, 0, options);

    const config = multer(options);

    return config.any() //fields(this.mapFields());
  }

  private mapFields(): Field[] {
    return this.options.types.map((type) => {
      if (typeof type === "string") {
        return { name: type, maxCount: 1 };
      }
      return { ...type, maxCount: type.maxCount || 1 };
    }) as Field[];
  }

  getConfig(fieldName: string) {
    return this.mapFields().find(type => type.name === fieldName)
  }

  async fileFilter(req: RequestEnhanced, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    if (!req.isAuthenticated()) {
      return callback(new Error("Upload unauthorized, must be authenticated."))
    }

    logger.debug("Upload file filter %s => %s", file.fieldname, file.originalname)

    if (req.path.startsWith("/_api")) {
      const basePath = req.path.match(/\/_api\/([^/]+)/)
      const collection = basePath?.shift()?.replace("/_api/", "")

      if (!collection) {
        return callback(null, false)
      }

      const type = await DataManager.get()
          .from("__types")
          .eq("name", collection)
          .single()

      if (type) {
        if (file.fieldname.indexOf("[")) {
          file.fieldname = file.fieldname.split("[")[0]
        }

        const config = this.getConfig(file.fieldname)

        if (config && config.maxSize && config.maxSize < file.size) {
          return callback(new Error("File is too large"))
        }

        const fileField = type.fields.find(
          (field: any) => field.name === file.fieldname
        )

        if (fileField) {
          this.context = {
            ...this.context,
            [fileField.name]: {
              typeName: collection,
              field: fileField
            }
          }
        }

        if (!req.___uploads) {
          req.___uploads = []
        }

        req.___uploads.push({
          fieldName: fileField?.name,
          fileName: file.originalname,
          extension: mimeTypes.extension(file.mimetype) || file.filename.split(".").pop(),
          mime: file.mimetype,
          type: type.name,
          entryId: req.body.id,
          url: this.resolveUrl(file.originalname, file),
          path: this.resolveTargetDirectory(file),
          userId: (req.user as User).id
        })

        logger.debug("%p%P File found %o", 3, 1, file)

        return callback(null, true)
      }
    }

    // If the request is not part of the /_api/* collections
    const config = this.getConfig(file.fieldname)

    if (config) {
      if (config.maxSize && config.maxSize < file.size) {
        return callback(new Error("File is too large"))
      }

      return callback(null, true)
    }

    return callback(null, false)
  }

  private resolveFolder(file: Express.Multer.File) {
    const context = this.context[file.fieldname]
    const config = this.getConfig(file.fieldname)
    const ext = mimeTypes.extension(file.mimetype)
    return context?.field[`type-${context?.field.type}-folder`]
      || config?.destination
      || ext
      || "general";
  }

  private resolveTargetDirectory(file: Express.Multer.File) {
    return joinPath(this.options.path, this.resolveFolder(file));
  }

  private resolveUrl(fileName: string, file: Express.Multer.File) {
    const folder = this.resolveFolder(file)

    return joinPath("/public", folder, fileName);
  }

  private createStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const destination = this.resolveTargetDirectory(file)
        // Multer does not create the directory when this function is provided
        // So we create the target directory based on the type body parameter
        try {
          mkdirSync(destination, { recursive: true });
        } catch (e) {
          logger.warn(`Error trying to create upload path "${destination}"`);
        }

        cb(null, destination);
      },
      filename: (req: RequestEnhanced, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        const i = req.___uploads?.findIndex(
          fl => fl.fileName === file.originalname
        )

        const extension = mimeTypes.extension(file.mimetype)
        const nameWithNoExt = file.originalname.replace(
            `.${extension}`, ""
        )
        const fileName = `${nameWithNoExt}-${uniqueSuffix}.${extension}`;

        if (req.___uploads && typeof i === "number" && i > -1) {
          req.___uploads[i].fileName = fileName
          req.___uploads[i].url = this.resolveUrl(fileName, file)
        }

        cb(null, fileName);
      },
    });
  }
}
