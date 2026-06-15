import { useEffect } from "react";
import { subscribe } from "valtio";

export const useImmediate = (...args: Parameters<typeof subscribe>): void => {
  const [proxyObject, callback] = args;

  useEffect(() => {
    callback([]);

    const unsubscribe = subscribe(proxyObject, callback);

    return unsubscribe;
  }, [proxyObject, callback]);
};
