import { platform } from "@tauri-apps/plugin-os";
import { isString } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import isUrl from "is-url";

/**
 * 不被视作有效颜色的关键字与系统颜色
 */
const EXCLUDED_COLOR_VALUES = [
  "none",
  "currentColor",
  "-moz-initial",
  "inherit",
  "initial",
  "revert",
  "revert-layer",
  "unset",
  "ActiveBorder",
  "ActiveCaption",
  "AppWorkspace",
  "Background",
  "ButtonFace",
  "ButtonHighlight",
  "ButtonShadow",
  "ButtonText",
  "CaptionText",
  "GrayText",
  "Highlight",
  "HighlightText",
  "InactiveBorder",
  "InactiveCaption",
  "InactiveCaptionText",
  "InfoBackground",
  "InfoText",
  "Menu",
  "MenuText",
  "Scrollbar",
  "ThreeDDarkShadow",
  "ThreeDFace",
  "ThreeDHighlight",
  "ThreeDLightShadow",
  "ThreeDShadow",
  "Window",
  "WindowFrame",
  "WindowText",
];

/**
 * 用于检测颜色值的样式声明，复用同一实例以避免每次调用都创建 DOM 元素
 */
const detectionStyle: CSSStyleDeclaration = new Option().style;

/**
 * 是否为开发环境
 */
export const isDev = () => {
  return import.meta.env.DEV;
};

/**
 * 是否为 macos 系统
 */
export const isMac = platform() === "macos";

/**
 * 是否为 windows 系统
 */
export const isWin = platform() === "windows";

/**
 * 是否为 linux 系统
 */
export const isLinux = platform() === "linux";

/**
 * 是否为链接
 */
export const isURL = (value: string) => {
  return isUrl(value);
};

/**
 * 是否为邮箱
 */
export const isEmail = (value: string) => {
  const regex = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

  return regex.test(value);
};

/**
 * 是否为颜色
 */
export const isColor = (value: string) => {
  if (EXCLUDED_COLOR_VALUES.includes(value) || value.includes("url")) {
    return false;
  }

  detectionStyle.backgroundColor = "";
  detectionStyle.backgroundImage = "";
  detectionStyle.backgroundColor = value;
  detectionStyle.backgroundImage = value;

  const { backgroundColor, backgroundImage } = detectionStyle;

  return backgroundColor !== "" || backgroundImage !== "";
};

/**
 * 是否为图片
 */
export const isImage = (value: string) => {
  const regex = /\.(jpe?g|png|webp|avif|gif|svg|bmp|ico|tiff?|heic|apng)$/i;

  return regex.test(value);
};

/**
 * 是否为空白字符串
 */
export const isBlank = (value: unknown) => {
  if (isString(value)) {
    return isEmpty(value.trim());
  }

  return true;
};
