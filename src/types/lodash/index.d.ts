/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Type definitions for lodash
import { LoDashStatic, LoDashExplicitWrapper, LoDashImplicitWrapper } from "lodash";

declare module "lodash" {
  interface LoDashStatic {
    getById(id: string): any;

    insert(doc: Record<string, any>): Record<string, any>;

    upsert(doc: Record<string, any>): Record<string, any>;

    updateById(id: string, attrs: Record<string, any>): Record<string, any>;

    updateWhere(
      predicate: any,
      attrs: Record<string, any>
    ): Record<string, any>[];

    replaceById(id: string, attrs: Record<string, any>): Record<string, any>;

    removeById(id: string): Record<string, any>;

    removeWhere(predicate: any): Record<string, any>[];
  }

  interface LoDashExplicitWrapper<TValue> {
    getById(id: string): any;

    insert(doc: Record<string, any>): Record<string, any>;

    upsert(doc: Record<string, any>): Record<string, any>;

    updateById(id: string, attrs: Record<string, any>): Record<string, any>;

    updateWhere(
      predicate: any,
      attrs: Record<string, any>
    ): Record<string, any>[];

    replaceById(id: string, attrs: Record<string, any>): Record<string, any>;

    removeById(id: string): Record<string, any>;

    removeWhere(predicate: any): Record<string, any>[];
  }

  interface LoDashImplicitWrapper<TValue> {
    getById(id: string): any;

    insert(doc: Record<string, any>): Record<string, any>;

    upsert(doc: Record<string, any>): Record<string, any>;

    updateById(id: string, attrs: Record<string, any>): Record<string, any>;

    updateWhere(
      predicate: any,
      attrs: Record<string, any>
    ): Record<string, any>[];

    replaceById(id: string, attrs: Record<string, any>): Record<string, any>;

    removeById(id: string): Record<string, any>;

    removeWhere(predicate: any): Record<string, any>[];
  }
}
