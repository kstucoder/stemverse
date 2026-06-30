import { create } from 'zustand';
import { playCombo, playWin } from '../components/Game/gameAudio';

const useGameStore = create((set, get) => ({
  gameActive: false,
  gamePaused: false,
  score: 0,
  level: 1,
  combo: 0,
  maxCombo: 0,
  shake: 0,       // screen shake intensity (ms)
  popups: [],     // floating score popups [{id, x, y, text, color}]
  lastAction: 0,  // timestamp of last action for combo tracking

  cityState: {
    power: 0,
    lightsOn: false,
    tramActive: false,
    buildingsLit: 0,
    totalBuildings: 8,
    energyLevel: 0,
    citizenHappiness: 50,
    isNight: true,
  },

  serialData: { led: 0, button: 0, potentiometer: 0, distance: 0, temperature: 0 },
  progress: { ledBlinks: 0, buttonPresses: 0, maxPower: 0 },
  winConditions: null,
  onWin: null,

  setWinConfig: (conditions, cb) => set({ winConditions: conditions, onWin: cb }),

  startGame: () =>
    set({
      gameActive: true,
      gamePaused: false,
      score: 0,
      combo: 0,
      maxCombo: 0,
      shake: 0,
      popups: [],
      lastAction: 0,
      cityState: { power: 0, lightsOn: false, tramActive: false, buildingsLit: 0, totalBuildings: 8, energyLevel: 0, citizenHappiness: 50, isNight: true },
      progress: { ledBlinks: 0, buttonPresses: 0, maxPower: 0 },
    }),

  pauseGame: () => set({ gamePaused: true }),
  resumeGame: () => set({ gamePaused: false }),
  stopGame: () => set({ gameActive: false, gamePaused: false }),

  updateSerialData: (key, value) => {
    const state = get();
    const nd = { ...state.serialData, [key]: value };
    const nc = { ...state.cityState };
    const np = { ...state.progress };

    if (key === 'led') {
      nc.lightsOn = value === 1;
      if (value === 1) {
        nc.buildingsLit = Math.min(state.cityState.buildingsLit + 1, state.cityState.totalBuildings);
        nc.isNight = false;
        np.ledBlinks += 0.5;
      } else {
        nc.buildingsLit = Math.max(state.cityState.buildingsLit - 0.5, 0);
        if (nc.buildingsLit <= 0) nc.isNight = true;
      }
    }

    if (key === 'button' && value === 1) {
      nc.tramActive = !state.cityState.tramActive;
      np.buttonPresses += 1;
      nc.citizenHappiness = Math.min(state.cityState.citizenHappiness + 2, 100);
    }

    if (key === 'potentiometer') {
      nc.energyLevel = Math.round((value / 1023) * 100);
      nc.power = value;
      np.maxPower = Math.max(state.progress.maxPower, value);
      nc.citizenHappiness = Math.round(50 + (value / 1023) * 50);
    }

    const { winConditions, onWin } = state;
    if (winConditions && onWin) {
      let won = false;
      if (winConditions.type === 'led_blink_count' && np.ledBlinks >= winConditions.count) won = true;
      if (winConditions.type === 'button_presses' && np.buttonPresses >= winConditions.count) won = true;
      if (winConditions.type === 'power_reached' && np.maxPower >= winConditions.value) won = true;
      if (won) onWin(state.score);
    }

    set({ serialData: nd, cityState: nc, progress: np });
  },

  incrementScore: (points) => {
    const state = get();
    const now = Date.now();
    const timeSinceLast = now - state.lastAction;
    let newCombo = state.combo;

    if (timeSinceLast < 2000 && state.lastAction > 0) {
      newCombo = state.combo + 1;
      if (newCombo % 5 === 0) playCombo(newCombo);
    } else {
      newCombo = 1;
    }

    const comboBonus = Math.floor(newCombo / 5) * points * 0.5;
    const totalPoints = points + comboBonus;
    const newScore = state.score + totalPoints;

    const popup = {
      id: Date.now() + Math.random(),
      x: 40 + Math.random() * 20,
      y: 50,
      text: comboBonus > 0 ? `+${Math.round(totalPoints)} 🔥` : `+${points}`,
      color: newCombo > 10 ? '#ff00e5' : newCombo > 5 ? '#ffdd00' : '#00ff88',
      life: 1.0,
    };

    set({
      score: newScore,
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      lastAction: now,
      popups: [...state.popups, popup],
      shake: totalPoints > 50 ? 5 : totalPoints > 20 ? 3 : 0,
    });
  },

  updatePopups: (dt) => {
    const state = get();
    const alive = state.popups
      .map(p => ({ ...p, y: p.y - 20 * dt, life: p.life - dt }))
      .filter(p => p.life > 0);
    if (alive.length !== state.popups.length) set({ popups: alive });
  },

  updateShake: (dt) => {
    const s = get().shake;
    if (s > 0) set({ shake: Math.max(0, s - dt * 20) });
  },

  triggerShake: (intensity) => {
    set({ shake: Math.max(get().shake, intensity) });
  },

  addPopup: (x, y, text, color = '#00ff88') => {
    set((s) => ({
      popups: [...s.popups, { id: Date.now() + Math.random(), x, y, text, color, life: 1.0 }],
    }));
  },

  resetCombo: () => set({ combo: 0 }),
  getComboMultiplier: () => Math.floor((get().combo || 0) / 5) + 1,

  // Universal progress reporter — game components call this to trigger win checks
  // for non-sensor-driven conditions (cycles, dances, distance, time, targets)
  reportProgress: (type, value) => {
    const state = get();
    const { winConditions, onWin, gameActive } = state;
    if (!winConditions || !onWin || !gameActive) return;
    if (winConditions.type !== type) return;

    let won = false;
    const needed = winConditions.count ?? winConditions.value ?? 1;
    if (value >= needed) won = true;

    if (won) {
      set({ gameActive: false });
      playWin();
      onWin(state.score);
    }
  },
}));

export default useGameStore;
