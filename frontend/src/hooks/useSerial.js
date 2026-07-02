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
      gameStore.setState({ arduinoConnected: true });
      startReading((line) => {
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

  const handleDisconnect = useCallback(async () => {
    gameStore.setState({ arduinoConnected: false });
    await disconnect();
  }, [disconnect, gameStore]);

  return { connected, connect: handleConnect, disconnect: handleDisconnect, setOnDataCallback };
}

export default useSerial;
