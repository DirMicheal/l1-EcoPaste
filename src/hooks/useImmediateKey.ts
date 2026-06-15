import { useCallback, useEffect, useRef } from "react";
import { subscribeKey } from "valtio/utils";

export const useImmediateKey: typeof subscribeKey = (...args) => {
  const unsubscribeRef = useRef(() => {});

  const [object, key, callback] = args;

  useEffect(() => {
    callback(object[key]);

    unsubscribeRef.current = subscribeKey(object, key, callback);

    return () => {
      unsubscribeRef.current();
      unsubscribeRef.current = () => {};
    };
  }, [object, key, callback]);

  return useCallback(() => {
    unsubscribeRef.current();
  }, []);
};
