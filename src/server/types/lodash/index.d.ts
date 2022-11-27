/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Type definitions for lodash
import {
  LoDashWrapper,
  LoDashStatic,
  LoDashExplicitWrapper,
  LoDashImplicitWrapper,
} from "lodash";

declare module "lodash" {
  interface LoDashStatic {
    getById(id: string): LoDashStatic;

    insert(doc: Record<string, any>): LoDashStatic;

    upsert(doc: Record<string, any>): LoDashStatic;

    updateById(id: string, attrs: Record<string, any>): LoDashStatic;

    updateWhere(predicate: any, attrs: Record<string, any>): LoDashStatic;

    replaceById(id: string, attrs: Record<string, any>): LoDashStatic;

    removeById(id: string): LoDashStatic;

    removeWhere(predicate: any): LoDashStatic;
  }

  interface LoDashExplicitWrapper<TValue> {
    getById(id: string): LoDashExplicitWrapper<Record<string, any>>;

    insert(
      doc: Record<string, any>
    ): LoDashExplicitWrapper<Record<string, any>>;

    upsert(
      doc: Record<string, any>
    ): LoDashExplicitWrapper<Record<string, any>>;

    updateById(
      id: string,
      attrs: Record<string, any>
    ): LoDashExplicitWrapper<Record<string, any>>;

    updateWhere(
      predicate: any,
      attrs: Record<string, any>
    ): LoDashExplicitWrapper<Record<string, any>[]>;

    replaceById(
      id: string,
      attrs: Record<string, any>
    ): LoDashExplicitWrapper<Record<string, any>>;

    removeById(id: string): LoDashExplicitWrapper<Record<string, any>[]>;

    removeWhere(predicate: any): LoDashExplicitWrapper<Record<string, any>[]>;
  }

  interface LoDashImplicitWrapper<TValue> {
    getById(id: string): LoDashImplicitWrapper<Record<string, any>>;

    insert(
      doc: Record<string, any>
    ): LoDashImplicitWrapper<Record<string, any>>;

    upsert(
      doc: Record<string, any>
    ): LoDashImplicitWrapper<Record<string, any>>;

    updateById(
      id: string,
      attrs: Record<string, any>
    ): LoDashImplicitWrapper<Record<string, any>>;

    updateWhere(
      predicate: any,
      attrs: Record<string, any>
    ): LoDashImplicitWrapper<Record<string, any>[]>;

    replaceById(
      id: string,
      attrs: Record<string, any>
    ): LoDashImplicitWrapper<Record<string, any>[]>;

    removeById(id: string): LoDashImplicitWrapper<Record<string, any>>;

    removeWhere(predicate: any): LoDashImplicitWrapper<Record<string, any>[]>;
  }
}
