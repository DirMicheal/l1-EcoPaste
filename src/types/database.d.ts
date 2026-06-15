import type { Selectable } from "kysely";
import type {
  ClipboardContentType,
  ReadClipboardItemUnion,
} from "tauri-plugin-clipboard-x-api";
import type { LiteralUnion } from "type-fest";

export type DatabaseSchemaHistorySubtype = "url" | "email" | "color" | "path";

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

// The row shape Kysely yields when selecting from the history table. Kysely
// flattens the `DatabaseSchemaHistory` discriminated union into a single row on
// select, so this is the query builder's output type; `selectHistory` recovers
// the domain union for callers via `$castTo`.
export type HistorySelectResult = Selectable<DatabaseSchemaHistory>;

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
  history: DatabaseSchemaHistory;
  group: DatabaseSchemaGroup;
}
