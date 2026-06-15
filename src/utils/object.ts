import { isArray, mergeWith } from "es-toolkit/compat";

/**
 * 深度合并类型：递归合并两个对象类型，数组类型由 source 覆盖
 */
export type DeepMerge<T, S> = {
  [K in keyof T | keyof S]: K extends keyof S
    ? K extends keyof T
      ? T[K] extends Record<string, unknown>
        ? S[K] extends Record<string, unknown>
          ? DeepMerge<T[K], S[K]>
          : S[K]
        : S[K]
      : S[K]
    : K extends keyof T
      ? T[K]
      : never;
};

/**
 * 深度递归合并两个对象，普通对象会递归合并，其他值会直接覆盖
 * @param target 目标对象
 * @param source 源对象
 */
export const deepAssign = <T, S>(target: T, source: S): DeepMerge<T, S> => {
  return mergeWith(target, source, (targetValue, sourceValue) => {
    if (isArray(targetValue)) {
      return sourceValue;
    }
  }) as DeepMerge<T, S>;
};
