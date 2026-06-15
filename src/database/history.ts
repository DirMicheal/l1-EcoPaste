import { exists, remove } from "@tauri-apps/plugin-fs";
import type { SelectQueryBuilder } from "kysely";
import { getDefaultSaveImagePath } from "tauri-plugin-clipboard-x-api";
import type {
  DatabaseSchema,
  DatabaseSchemaHistoryRow,
} from "@/types/database";
import { join } from "@/utils/path";
import { getDatabase } from ".";

type QueryBuilder = SelectQueryBuilder<
  DatabaseSchema,
  "history",
  DatabaseSchemaHistoryRow
>;

export const selectHistory = async (
  fn?: (qb: QueryBuilder) => QueryBuilder,
) => {
  const db = await getDatabase();

  let qb = db.selectFrom("history").selectAll() as QueryBuilder;

  if (fn) {
    qb = fn(qb);
  }

  return qb.execute();
};

export const insertHistory = async (data: DatabaseSchemaHistoryRow) => {
  const db = await getDatabase();

  return db.insertInto("history").values(data).execute();
};

export const updateHistory = async (
  id: string,
  nextData: Partial<DatabaseSchemaHistoryRow>,
) => {
  const db = await getDatabase();

  return db.updateTable("history").set(nextData).where("id", "=", id).execute();
};

export const deleteHistory = async (data: DatabaseSchemaHistoryRow) => {
  const { id, type, value } = data;

  const db = await getDatabase();

  await db.deleteFrom("history").where("id", "=", id).execute();

  if (type !== "image") return;

  // When type is "image", value is always a string (file path)
  if (typeof value !== "string") return;

  let path = value;

  const saveImagePath = await getDefaultSaveImagePath();

  if (!value.startsWith(saveImagePath)) {
    path = join(saveImagePath, value);
  }

  const existed = await exists(path);

  if (!existed) return;

  return remove(path);
};
