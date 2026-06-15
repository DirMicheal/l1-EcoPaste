import { useEffect, useRef } from "react";
import { subscribe } from "valtio";

export const useSubscribe = (...args: Parameters<typeof subscribe>) => {
  const [proxyObject, callback, notifyInSync] = args;

  // Always invoke the latest callback so the subscription never reads stale
  // values closed over by an earlier render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return subscribe(
      proxyObject,
      (ops) => callbackRef.current(ops),
      notifyInSync,
    );
    // `callback` is intentionally excluded: it is read fresh via `callbackRef`,
    // so re-subscribing only happens when the subscription target itself changes.
  }, [proxyObject, notifyInSync]);
};
