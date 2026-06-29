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
        const match = line.match(/^(\w+):(.+)$/);
        if (match) {
          const key = match[1].toLowerCase();
          const val = match[2];
          gameStore.updateSerialData(key, isNaN(Number(val)) ? val : Number(val));
        }
        if (onDataRef.current) onDataRef.current(line);
      });
    }
    return result;
  }, [connect, startReading, gameStore]);

  return { connected, connect: handleConnect, disconnect, setOnDataCallback };
}

export default useSerial;
