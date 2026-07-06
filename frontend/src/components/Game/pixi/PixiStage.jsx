// PixiStage — WebGL o'yin sahnasi uchun React wrapper.
// GameCanvas'ning Pixi ekvivalenti: app lifecycle, resize, store-driven
// shake/popup'lar shu yerda; o'yin faqat `build(app)` funksiyasini beradi.
// StrictMode double-mount'ga chidamli (dead-flag + to'liq destroy).
import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import useGameStore from '../../../stores/gameStore';
import { ScorePopups } from '../GameCanvas';

export default function PixiStage({ build, className = '', children }) {
  const hostRef = useRef(null);
  const shakeRef = useRef(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    let app = null;
    let dead = false;
    let teardown = null;

    (async () => {
      const a = new Application();
      await a.init({
        backgroundAlpha: 0,
        antialias: true,
        // MUHIM: faqat butun son — Windows 125%/150% masshtabida dpr kasr
        // (1.25/1.5) bo'ladi va Pixi v8 filtrlari kasr resolution bilan
        // framebuffer yaratolmay "setResource null" crash beradi.
        resolution: Math.max(1, Math.min(2, Math.floor(window.devicePixelRatio || 1))),
        autoDensity: true,
        resizeTo: hostRef.current,
      });
      if (dead || !hostRef.current) { a.destroy(true, { children: true, texture: true }); return; }
      app = a;

      // Himoya to'ri: ba'zi GPU/drayverlarda bloom filtri render paytida
      // yiqilishi mumkin ("setResource ... null"). Bunday holda butun sahna
      // qop-qora bo'lib qolmasin — filtrlarni o'chirib, sahnani bloom'siz
      // ko'rsatishda davom etamiz.
      const origRender = a.renderer.render.bind(a.renderer);
      a.renderer.render = (...args) => {
        try {
          origRender(...args);
        } catch (err) {
          if (a.stage.filters?.length) {
            console.warn('VOLTRA: GPU filtr xatosi — bloom o\'chirildi, sahna filtrsizda davom etadi.', err?.message);
            a.stage.filters = null;
            try { origRender(...args); } catch (e2) { /* bitta kadr tashlab yuboriladi */ }
          }
        }
      };

      a.canvas.style.position = 'absolute';
      a.canvas.style.inset = '0';
      hostRef.current.appendChild(a.canvas);
      // Dev: headless testda ticker'ni qo'lda haydash uchun
      if (import.meta.env?.DEV) (window.__pixiApps ||= new Set()).add(a);

      teardown = buildRef.current(a) || null;

      // Store-driven juice: popup lifecycle + screen shake (DOM transform)
      a.ticker.add((tk) => {
        const dt = Math.min(tk.deltaMS / 1000, 0.05);
        const store = useGameStore.getState();
        store.updatePopups(dt);
        store.updateShake(dt);
        if (shakeRef.current) {
          const s = store.shake;
          shakeRef.current.style.transform = s > 0
            ? `translate(${(Math.random() - 0.5) * s}px, ${(Math.random() - 0.5) * s}px)`
            : '';
        }
      });
    })();

    return () => {
      dead = true;
      if (teardown) teardown();
      if (app) {
        window.__pixiApps?.delete(app);
        app.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  return (
    <div ref={shakeRef} className={`relative w-full h-full min-h-[500px] overflow-hidden ${className}`}>
      <div ref={hostRef} className="absolute inset-0" />
      {children && <div className="absolute inset-0 pointer-events-none">{children}</div>}
      <ScorePopups />
    </div>
  );
}
