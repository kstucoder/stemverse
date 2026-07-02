import { useCallback, useRef } from 'react';
import useSerialStore from '../stores/serialStore';
import useGameStore from '../stores/gameStore';

export function useSerial() {
  const { connected, connect, disconnect, startReading } = useSerialStore();
  const gameStore = useGameStore();
  const onDataRef = useRef(null);

  const setOnDataCallback = useCallback((cb) => {
    onDataRef.current = cb;
  }, []);

  const handleConnect = useCallback(async () => {
    const result = await connect();
    if (result.success) {
      startReading((line) => {
        // Some lessons print several sensor readings on a single line without
        // newlines in between (e.g. "TEMP:23 LDR:512" or "POT:512 BTN:0 TEMP:23").
        // A single ^(\w+):(.+)$ match would swallow everything after the first
        // colon as one garbage value, so tokenize the line and parse every
        // key:value pair it contains.
        const tokens = line.match(/(\w+):(-?\d+(?:\.\d+)?|\S+)/g) || [];
        tokens.forEach((token) => {
          const idx = token.indexOf(':');
          const key = token.slice(0, idx).toLowerCase();
          const val = token.slice(idx + 1);
          gameStore.updateSerialData(key, isNaN(Number(val)) ? val : Number(val));
        });
        if (onDataRef.current) onDataRef.current(line);
      });
    }
    return result;
  }, [connect, startReading, gameStore]);

  return { connected, connect: handleConnect, disconnect, setOnDataCallback };
}

export default useSerial;
