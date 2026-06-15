import { useEffect } from "react";
import { subscribe } from "valtio";

export const useSubscribe = (...args: Parameters<typeof subscribe>) => {
  const [proxyObject, callback] = args;

  useEffect(() => {
    const unsubscribe = subscribe(proxyObject, callback);

    return unsubscribe;
  }, [proxyObject, callback]);
};
