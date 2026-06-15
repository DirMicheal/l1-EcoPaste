import { isArray, mergeWith } from "es-toolkit/compat";

/**
 * 递归合并两个对象的结果类型：普通对象（非数组）递归合并，
 * 数组与其他值由 source 直接覆盖，精确反映 {@link deepAssign} 的运行时行为。
 */
type DeepMerge<T, S> = {
  [K in keyof T | keyof S]: K extends keyof S
    ? K extends keyof T
      ? [T[K]] extends [readonly unknown[]]
        ? S[K]
        : [S[K]] extends [readonly unknown[]]
          ? S[K]
          : [T[K]] extends [object]
            ? [S[K]] extends [object]
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
export const deepAssign = <T extends object, S extends object>(
  target: T,
  source: S,
): DeepMerge<T, S> => {
  return mergeWith(target, source, (targetValue, sourceValue) => {
    if (isArray(targetValue)) {
      return sourceValue;
    }
  }) as unknown as DeepMerge<T, S>;
};
