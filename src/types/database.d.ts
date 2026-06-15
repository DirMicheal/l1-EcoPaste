import type {
  ClipboardContentType,
  ReadClipboardItemUnion,
} from "tauri-plugin-clipboard-x-api";
import type { LiteralUnion } from "type-fest";

export type DatabaseSchemaHistorySubtype = "url" | "email" | "color" | "path";

export interface DatabaseSchemaHistoryRow {
  id: string;
  type: ClipboardContentType;
  value: string | string[];
  count: number;
  width?: number;
  height?: number;
  group: DatabaseSchemaGroupId;
  search: string;
  favorite: boolean;
  createTime: string;
  note?: string;
  subtype?: DatabaseSchemaHistorySubtype;
}

export type DatabaseSchemaHistory<
  T extends ClipboardContentType = ClipboardContentType,
> = ReadClipboardItemUnion<T> & {
  id: string;
  group: DatabaseSchemaGroupId;
  search: string;
  favorite: boolean;
  createTime: string;
  note?: string;
  subtype?: DatabaseSchemaHistorySubtype;
};

export type DatabaseSchemaGroupId = LiteralUnion<
  "all" | "text" | "image" | "files" | "favorite",
  string
>;

export interface DatabaseSchemaGroup {
  id: DatabaseSchemaGroupId;
  name: string;
  createTime?: string;
}

export interface DatabaseSchema {
  history: DatabaseSchemaHistoryRow;
  group: DatabaseSchemaGroup;
}
