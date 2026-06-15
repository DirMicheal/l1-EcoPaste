import { listen } from "@tauri-apps/api/event";
import { useMount, useUnmount } from "ahooks";
import { useRef } from "react";

export const useTauriListen = <T>(...args: Parameters<typeof listen<T>>) => {
  const unlistenRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useMount(async () => {
    const unlisten = await listen<T>(...args);

    if (isMountedRef.current) {
      unlistenRef.current = unlisten;
    } else {
      unlisten();
    }
  });

  useUnmount(() => {
    isMountedRef.current = false;
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
  });
};
