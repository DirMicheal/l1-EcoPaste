import { useCallback, useEffect, useRef } from "react";
import { subscribeKey } from "valtio/utils";

export const useSubscribeKey: typeof subscribeKey = (...args) => {
  const [proxyObject, key, callback, notifyInSync] = args;

  // Always invoke the latest callback so the subscription never reads stale
  // values closed over by an earlier render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const unsubscribeRef = useRef<() => void>(() => {});

  useEffect(() => {
    unsubscribeRef.current = subscribeKey(
      proxyObject,
      key,
      (value) => callbackRef.current(value),
      notifyInSync,
    );

    return () => unsubscribeRef.current();
    // `callback` is intentionally excluded: it is read fresh via `callbackRef`.
  }, [proxyObject, key, notifyInSync]);

  // Stable identity that always delegates to the current unsubscribe, so the
  // caller never holds the initial no-op or an outdated function.
  return useCallback(() => unsubscribeRef.current(), []);
};
