import { create } from 'zustand';

const useSerialStore = create((set, get) => ({
  port: null,
  reader: null,
  readableStreamClosed: null,
  connected: false,
  dataStream: [],
  baudRate: 9600,

  connect: async () => {
    try {
      if (!navigator.serial) throw new Error('Web Serial API qo\'llab-quvvatlanmaydi. Chrome yoki Edge brauzeridan foydalaning.');
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: get().baudRate });
      const textDecoder = new TextDecoderStream();
      // pipeTo() natijasini saqlab qo'yamiz. disconnect() paytida shu promise
      // tugashini kutmasdan port.close() chaqirilsa, brauzer "Cannot cancel a
      // locked stream" xatosini beradi (port hali pipeTo tomonidan band).
      // .catch(() => {}) — cancel qilinganda pipeTo tabiiy ravishda reject
      // bo'lishi mumkin, buni "Uncaught (in promise)" sifatida chiqib
      // ketishining oldini oladi.
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable).catch(() => {});
      const reader = textDecoder.readable.getReader();
      set({ port, reader, readableStreamClosed, connected: true, dataStream: [] });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  disconnect: async () => {
    const { reader, port, readableStreamClosed } = get();
    try {
      if (reader) {
        await reader.cancel();
        // pipe to'liq yopilishini kutamiz — aks holda port hali "locked" bo'ladi
        if (readableStreamClosed) await readableStreamClosed;
      }
      if (port) await port.close();
    } catch (e) {
      console.error(e);
    }
    set({ port: null, reader: null, readableStreamClosed: null, connected: false, dataStream: [] });
  },

  startReading: (onData) => {
    const { reader, connected } = get();
    if (!connected || !reader) return;
    // Chunk'lar orasida qoldiq matnni saqlash uchun bufer.
    // Web Serial API bitta qatorni ("TEMP:21\n") bir necha bo'lakka
    // bo'lib yuborishi mumkin ("TEM" + "P:21\n") — buferlamasdan
    // buni to'g'ridan-to'g'ri '\n' bo'yicha bo'lish chala qatorlarni
    // hosil qiladi va ma'lumot yo'qolib qoladi.
    let buffer = '';
    const readLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            let idx;
            while ((idx = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              const t = line.trim();
              if (t) {
                set((s) => ({ dataStream: [...s.dataStream.slice(-99), t] }));
                if (onData) onData(t);
              }
            }
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
