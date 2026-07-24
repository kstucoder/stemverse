import { Activity, Radio, Target, Trophy } from 'lucide-react';
import useGameStore from '../../stores/gameStore';

const GOALS = {
  led_blink_count: (value) => `${value} marta LED signalini yuboring`,
  button_presses: (value) => `${value} marta tugmani bosing`,
  power_reached: (value) => `Quvvatni ${value} ga yetkazing`,
  cycles_completed: (value) => `${value} ta siklni yakunlang`,
  dances_completed: (value) => `${value} ta patternni yakunlang`,
  distance_reached: (value) => `${value} masofaga yeting`,
  time_alive: (value) => `${Math.round(value / 1000)} soniya davom eting`,
  targets_collected: (value) => `${value} ta nishonni to'plang`,
};

function getTarget(condition) {
  return condition?.count ?? condition?.value ?? 1;
}

function getGoal(condition) {
  const target = getTarget(condition);
  return GOALS[condition?.type]?.(target) || 'Missiya maqsadini bajaring';
}

export default function MissionControl({ lesson, accentColor }) {
  const { arduinoConnected, missionProgress, score } = useGameStore((state) => ({
    arduinoConnected: state.arduinoConnected,
    missionProgress: state.missionProgress,
    score: state.score,
  }));
  const condition = lesson?.winCondition;
  const target = getTarget(condition);
  const progress = Math.min((missionProgress.value || 0) / target, 1);

  return (
    <section className="mission-control" style={{ '--mission-accent': accentColor }} aria-label="Missiya holati">
      <div className="mission-control__goal">
        <div className="mission-control__icon"><Target size={18} strokeWidth={2.2} /></div>
        <div>
          <span className="mission-control__eyebrow">Missiya maqsadi</span>
          <p>{getGoal(condition)}</p>
        </div>
      </div>

      <div className="mission-control__progress" aria-live="polite">
        <div className="mission-control__progress-copy">
          <span>Jarayon</span>
          <strong>{Math.min(Math.round(missionProgress.value || 0), target)} / {target}</strong>
        </div>
        <div className="mission-control__track" role="progressbar" aria-valuemin="0" aria-valuemax={target} aria-valuenow={Math.min(missionProgress.value || 0, target)}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="mission-control__stats">
        <div className={`mission-control__signal ${arduinoConnected ? 'is-live' : ''}`}>
          <Radio size={14} />
          <span>{arduinoConnected ? 'Arduino jonli' : 'Arduino kutilyapti'}</span>
        </div>
        <div className="mission-control__score">
          <Trophy size={14} />
          <strong>{Math.round(score)}</strong>
          <span>ball</span>
        </div>
      </div>

      <Activity className="mission-control__pulse" size={22} aria-hidden="true" />
    </section>
  );
}
