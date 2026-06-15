import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useEffect } from "react";

export const useTauriListen = <T>(...args: Parameters<typeof listen<T>>) => {
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let cancelled = false;

    listen<T>(...args).then((fn) => {
      // If the component unmounted before registration resolved, tear the
      // listener down immediately; otherwise keep it for cleanup on unmount.
      if (cancelled) {
        fn();
      } else {
        unlisten = fn;
      }
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);
};
