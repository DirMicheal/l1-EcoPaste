import { useEffect, useRef } from "react";
import { subscribe } from "valtio";

export const useImmediate = (...args: Parameters<typeof subscribe>): void => {
  const [proxyObject, callback, notifyInSync] = args;

  // Always invoke the latest callback so the subscription never reads stale
  // values closed over by an earlier render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // Fire once immediately so consumers run against the current state, then
    // keep them in sync. The empty ops array mirrors the original behavior.
    callbackRef.current([]);

    return subscribe(
      proxyObject,
      (ops) => callbackRef.current(ops),
      notifyInSync,
    );
    // `callback` is intentionally excluded: it is read fresh via `callbackRef`.
  }, [proxyObject, notifyInSync]);
};
