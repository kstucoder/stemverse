// CutscenePlayer — Universal premium cutscene engine
// Takes a sceneConfig and renders a full animation
import { useEffect, useRef } from 'react';
import {
  drawSky, drawStars, drawGround, drawBuildings, generateBuildings,
  drawLightning, drawFog, drawVignette, drawLetterbox, drawSceneText,
  drawRoad, drawTrees, drawRain, generateRain, drawCloudLayer, generateClouds,
  SceneParticleSystem, updateShake,
  playThunderSound, playAlarmSound, playExplosionSound, playPowerUpSound, playWhooshSound
} from './cutsceneEngine';

export default function CutscenePlayer({ scene, onComplete, skipable = true }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef(new SceneParticleSystem());
  const rainRef = useRef([]);
  const cloudsRef = useRef([]);
  const buildingsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const shakeRef = useRef(0);

  function getAudio() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtxRef.current;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = scene || {};

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || { width: 600, height: 400 };
      canvas.width = rect.width; canvas.height = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Init scene objects
    const groundY = s.groundY || 0.72;
    const buildings = s.buildings ? generateBuildings(s.buildings.count || 10, s.buildings.maxW, s.buildings.maxH) : null;
    const clouds = s.clouds ? generateClouds(s.clouds) : [];
    const rain = s.rain ? generateRain(s.rain) : [];
    let shakeIntensity = 0;
    let lightningFlash = 0;
    let eventTriggered = false;
    const startTime = Date.now();
    const duration = s.duration || 7;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const dt = 0.016;
      const w = canvas.width, h = canvas.height;
      const gy = h * (s.groundY || 0.72);

      // Phase
      const phase = s.phases ? s.phases(elapsed) : 'normal';

      // Shake
      if (s.shake && s.shake(elapsed)) {
        shakeIntensity = Math.max(0, shakeIntensity - dt * 3);
        if (s.shakeTrigger && s.shakeTrigger(elapsed)) shakeIntensity = s.shakeIntensity || 1;
      }
      const shk = updateShake(shakeIntensity, dt);
      shakeIntensity = shk.intensity;

      // Lightning flash
      if (s.lightning) {
        lightningFlash = Math.max(0, lightningFlash - dt * 3);
        if (elapsed > s.lightning.time && elapsed < s.lightning.time + 0.15) {
          lightningFlash = 1;
          if (!eventTriggered) { playThunderSound(getAudio()); eventTriggered = true; }
        }
      }

      ctx.save();
      ctx.translate(shk.x, shk.y);

      // Sky
      if (s.sky) drawSky(ctx, w, h, s.sky(elapsed, lightningFlash, phase));

      // Stars
      if (s.stars) drawStars(ctx, w, h, s.stars, elapsed, lightningFlash > 0.3 ? 0.1 : 0.4);

      // Clouds
      if (clouds.length) drawCloudLayer(ctx, w, clouds, dt);

      // Background scene
      if (s.drawBackground) s.drawBackground(ctx, w, h, elapsed, dt, phase);

      // Buildings
      if (buildings) {
        const isLit = phase !== 'blackout' && phase !== 'dark';
        drawBuildings(ctx, w, h, gy, buildings, elapsed, isLit);
      }

      // Ground
      if (s.ground !== false) drawGround(ctx, w, h, gy);

      // Road
      if (s.road) drawRoad(ctx, w, gy + 5);

      // Trees
      if (s.trees) drawTrees(ctx, w, h, gy, s.trees, elapsed);

      // Rain
      if (s.rain && phase !== 'calm' && phase !== 'intro') drawRain(ctx, w, h, rain, dt);

      // Event effects
      if (s.lightning && elapsed > s.lightning.time && elapsed < s.lightning.time + 0.4) {
        const intensity = Math.max(0, 1 - (elapsed - s.lightning.time) / 0.4);
        ctx.save(); ctx.globalAlpha = intensity;
        drawLightning(ctx, w * 0.65, 0, w * 0.65 + 30, gy * 0.8, intensity, 80, 5);
        ctx.restore();
        const lg = ctx.createRadialGradient(w * 0.65 + 30, gy * 0.7, 0, w * 0.65 + 30, gy * 0.7, 150);
        lg.addColorStop(0, `rgba(200,200,255,${intensity * 0.08})`);
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
      }

      // Custom draw
      if (s.draw) s.draw(ctx, w, h, elapsed, dt, phase, particlesRef.current);

      // Particles
      particlesRef.current.update(dt); particlesRef.current.draw(ctx);

      // Fog
      if (s.fog !== false) drawFog(ctx, w, h, gy);

      // Vignette
      drawVignette(ctx, w, h, phase === 'blackout' || phase === 'dark' ? 0.5 : 0.3);

      // Text
      if (s.text) {
        s.text.forEach(t => {
          if (elapsed >= t.time && elapsed < (t.end || t.time + 2)) {
            const a = Math.min(1, (elapsed - t.time) * 2);
            drawSceneText(ctx, t.text, t.x || w / 2, t.y || 50, `rgba(255,255,255,${a * (t.alpha || 0.8)})`, t.size || '16px');
          }
        });
      }

      // Letterbox
      drawLetterbox(ctx, w, h);

      // Skip hint
      if (skipable && elapsed > 1) {
        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('⏭ Skip', w - 12, h - 12);
      }

      ctx.restore();

      if (elapsed < duration) frameRef.current = requestAnimationFrame(animate);
      else if (onComplete) onComplete();
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 bg-dark-950" onClick={skipable ? onComplete : undefined}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
