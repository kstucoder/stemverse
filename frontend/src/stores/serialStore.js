import { create } from 'zustand';

const useSerialStore = create((set, get) => ({
  port: null,
  reader: null,
  connected: false,
  dataStream: [],
  baudRate: 9600,

  connect: async () => {
    try {
      if (!navigator.serial) throw new Error('Web Serial API not supported. Use Chrome or Edge.');
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: get().baudRate });
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      set({ port, reader, connected: true, dataStream: [] });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  disconnect: async () => {
    const { reader, port } = get();
    try {
      if (reader) await reader.cancel();
      if (port) await port.close();
    } catch (e) {
      console.error(e);
    }
    set({ port: null, reader: null, connected: false, dataStream: [] });
  },

  startReading: (onData) => {
    const { reader, connected } = get();
    if (!connected || !reader) return;
    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            value.split('\n').forEach((line) => {
              const t = line.trim();
              if (t) {
                set((s) => ({ dataStream: [...s.dataStream.slice(-99), t] }));
                if (onData) onData(t);
              }
            });
          }
        }
      } catch (err) {
        if (err.name !== 'CancelError') console.error(err);
      }
    };
    readLoop();
  },

  sendData: async (data) => {
    const { port, connected } = get();
    if (!connected || !port) return;
    try {
      const writer = port.writable.getWriter();
      await writer.write(new TextEncoder().encode(data + '\n'));
      writer.releaseLock();
    } catch (err) {
      console.error(err);
    }
  },
}));

export default useSerialStore;
