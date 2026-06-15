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
import type { ClipboardStore, Language, Store } from "@/types/store";
import { deepAssign } from "./object";
import { getSaveStorePath } from "./path";

type WindowStyle = ClipboardStore["window"]["style"];

const WINDOW_STYLES = ["standard", "dock"] as const satisfies readonly WindowStyle[];

/**
 * 判断值是否为合法的对象（非数组、非 null）
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * 判断值是否为合法的窗口样式，用于迁移旧版本遗留的非法值（如旧值 "float"）
 */
const isWindowStyle = (value: unknown): value is WindowStyle =>
  typeof value === "string" && WINDOW_STYLES.includes(value as WindowStyle);

/**
 * 运行时校验解析后的数据是否符合 Store 接口的结构
 */
const isStore = (value: unknown): value is Store =>
  isObject(value) &&
  isObject(value.globalStore) &&
  isObject(value.clipboardStore);

/**
 * 初始化配置项
 */
const initStore = async () => {
  globalStore.appearance.language ??= await getLocale<Language>();
  globalStore.env.platform = platform();
  globalStore.env.appName = await getName();
  globalStore.env.appVersion = await getVersion();
  globalStore.env.saveDataDir ??= await appDataDir();

  // 迁移旧版本遗留的非法窗口样式（如旧值 "float"）
  if (!isWindowStyle(clipboardStore.window.style)) {
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
    const parsed: unknown = JSON.parse(content);

    if (isStore(parsed)) {
      const nextGlobalStore = omit(parsed.globalStore, backup ? "env" : "");

      deepAssign(globalStore, nextGlobalStore);
      deepAssign(clipboardStore, parsed.clipboardStore);
    }
  }

  if (backup) return;

  return initStore();
};
