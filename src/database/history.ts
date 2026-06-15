import { exists, remove } from "@tauri-apps/plugin-fs";
import type { SelectQueryBuilder } from "kysely";
import { getDefaultSaveImagePath } from "tauri-plugin-clipboard-x-api";
import type {
  DatabaseSchema,
  DatabaseSchemaHistory,
  HistorySelectResult,
} from "@/types/database";
import { join } from "@/utils/path";
import { getDatabase } from ".";

type QueryBuilder = SelectQueryBuilder<
  DatabaseSchema,
  "history",
  HistorySelectResult
>;

export const selectHistory = async (
  fn?: (qb: QueryBuilder) => QueryBuilder,
) => {
  const db = await getDatabase();

  let qb: QueryBuilder = db.selectFrom("history").selectAll();

  if (fn) {
    qb = fn(qb);
  }

  // Kysely flattens the discriminated `history` row on select; recover the
  // domain union for callers via `$castTo` so the result stays precisely typed.
  return qb.$castTo<DatabaseSchemaHistory>().execute();
};

export const insertHistory = async (data: DatabaseSchemaHistory) => {
  const db = await getDatabase();

  return db.insertInto("history").values(data).execute();
};

export const updateHistory = async (
  id: string,
  nextData: Partial<DatabaseSchemaHistory>,
) => {
  const db = await getDatabase();

  return db.updateTable("history").set(nextData).where("id", "=", id).execute();
};

export const deleteHistory = async (data: DatabaseSchemaHistory) => {
  const db = await getDatabase();

  await db.deleteFrom("history").where("id", "=", data.id).execute();

  if (data.type !== "image") return;

  // `data` is now narrowed to the image variant, so `value` is a string path.
  const { value } = data;

  let path = value;

  const saveImagePath = await getDefaultSaveImagePath();

  if (!value.startsWith(saveImagePath)) {
    path = join(saveImagePath, value);
  }

  const existed = await exists(path);

  if (!existed) return;

  return remove(path);
};
