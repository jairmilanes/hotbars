import { Request, Response } from "express";
import fetch, { BodyInit, RequestInit } from "node-fetch";
import * as _ from "lodash";
import { Config, Server } from "../../core";
import { SafeAny } from "../../types";
import { joinPath } from "../../utils";
import { ConfigManager } from "../../services/config-manager";

interface FetchResponse<T> {
  data?: T;
  error?: Error;
}

interface RequestConfig extends RequestInit {
  query?: Record<string, string>;
}

export abstract class ControllerAbstract {
  private config: ConfigManager;

  protected baseUrl?: string;

  protected constructor(config: ConfigManager) {
    this.config = config;
  }

  protected url(relativePath: string) {
    if (relativePath.startsWith("/")) relativePath = relativePath.substring(1);
    return joinPath(this.baseUrl || Server.url, relativePath);
  }

  async get<T = Record<string, SafeAny>>(
    relativeUrl: string,
    query?: Record<string, string>
  ): Promise<FetchResponse<T>> {
    return this.try(relativeUrl, {
      method: "get",
      query,
    });
  }

  protected post<T = Record<string, SafeAny>>(
    relativeUrl: string,
    body: BodyInit | undefined,
    config?: RequestConfig
  ): Promise<FetchResponse<T>> {
    return this.try<T>(relativeUrl, {
      method: "post",
      body,
      ...(config || {}),
    });
  }

  protected patch<T = Record<string, SafeAny>>(
    relativeUrl: string,
    body: BodyInit,
    config?: RequestConfig
  ): Promise<FetchResponse<T>> {
    return this.try<T>(relativeUrl, {
      method: "patch",
      body,
      ...(config || {}),
    });
  }

  protected put<T = Record<string, SafeAny>>(
    relativeUrl: string,
    body: BodyInit,
    config?: RequestConfig
  ): Promise<FetchResponse<T>> {
    return this.try<T>(relativeUrl, {
      method: "put",
      body,
      ...(config || {}),
    });
  }

  protected delete<T = Record<string, SafeAny>>(
    id: string,
    config?: RequestConfig
  ): Promise<FetchResponse<T>> {
    return this.try<T>(id, {
      method: "delete",
      ...(config || {}),
    });
  }

  abstract handle(
    req: Request,
    res: Response,
    context: Record<string, any>
  ): Promise<Record<string, SafeAny>>;

  private async try<T>(
    relativeUrl: string,
    config: RequestConfig
  ): Promise<FetchResponse<T>> {
    const url = new URL(this.url(relativeUrl));

    _.forIn(config.query || {}, (value, key) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString(), config);

      const data = await response.json();

      return { error: undefined, data: data as T };
    } catch (e) {
      return { error: e as Error, data: undefined };
    }
  }
}
