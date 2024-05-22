



export interface CacheInterface {

  init(): Promise<void>;

  destroy(): Promise<void>;

  get(key: string): Promise<any>;

  set(key: string, value: any): Promise<any>;
}