import { getName, getVersion } from "@tauri-apps/api/app";
import { appDataDir } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { platform } from "@tauri-apps/plugin-os";
import { omit } from "es-toolkit/compat";
import { getLocale } from "tauri-plugin-locale-api";
import { clipboardStore } from "@/stores/clipboard";
import { globalStore } from "@/stores/global";
import type { Language, Store, WindowStyle } from "@/types/store";
import { deepAssign } from "./object";
import { getSaveStorePath } from "./path";

const WINDOW_STYLES: readonly string[] = ["standard", "dock"];

/**
 * 类型守卫：检查值是否为合法的 WindowStyle
 */
const isWindowStyle = (value: unknown): value is WindowStyle => {
  return typeof value === "string" && WINDOW_STYLES.includes(value);
};

/**
 * 类型守卫：检查解析后的 JSON 是否符合 Store 结构
 */
const isStoreShape = (value: unknown): value is Store => {
  return (
    typeof value === "object" &&
    value !== null &&
    "globalStore" in value &&
    "clipboardStore" in value
  );
};

/**
 * 初始化配置项
 */
const initStore = async () => {
  globalStore.appearance.language ??= await getLocale<Language>();
  globalStore.env.platform = platform();
  globalStore.env.appName = await getName();
  globalStore.env.appVersion = await getVersion();
  globalStore.env.saveDataDir ??= await appDataDir();

  // 迁移旧版窗口样式（如已废弃的 "float"）
  const rawStyle: unknown = clipboardStore.window.style;
  if (!isWindowStyle(rawStyle)) {
    clipboardStore.window.style = "standard";
  }

  await mkdir(globalStore.env.saveDataDir, { recursive: true });
};

/**
 * 本地存储配置项
 * @param backup 是否为备份数据
 */
export const saveStore = async (backup = false) => {
  const store = { clipboardStore, globalStore };

  const path = await getSaveStorePath(backup);

  return writeTextFile(path, JSON.stringify(store, null, 2));
};

/**
 * 从本地存储恢复配置项
 * @param backup 是否为备份数据
 */
export const restoreStore = async (backup = false) => {
  const path = await getSaveStorePath(backup);

  const existed = await exists(path);

  if (existed) {
    const content = await readTextFile(path);
    const parsed = JSON.parse(content);

    if (!isStoreShape(parsed)) {
      console.warn("Invalid store data, skipping restore");
      return;
    }

    const store = parsed;
    const nextGlobalStore = omit(store.globalStore, backup ? "env" : "");

    deepAssign(globalStore, nextGlobalStore);
    deepAssign(clipboardStore, store.clipboardStore);
  }

  if (backup) return;

  return initStore();
};
