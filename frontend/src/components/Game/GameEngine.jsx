import EnergyCity from './EnergyCity';
import TrafficLight from './TrafficLight';
import LightShow from './LightShow';
import SpeedRunner from './SpeedRunner';
import RobotArm from './RobotArm';
import LightTheremin from './LightTheremin';
import TempGarden from './TempGarden';
import DistanceRadar from './DistanceRadar';
import ReactionChampion from './ReactionChampion';
import ColorMixer from './ColorMixer';
import SecretCodeDoor from './SecretCodeDoor';
import PianoPlayer from './PianoPlayer';
import ParkingAssistant from './ParkingAssistant';
import MotionAlarm from './MotionAlarm';
import MusicVisualizer from './MusicVisualizer';
import ObstacleCourse from './ObstacleCourse';
import IoTDashboard from './IoTDashboard';
import RemoteSensor from './RemoteSensor';
import SmartHome from './SmartHome';

const GAMES = {
  energy_city: EnergyCity,
  traffic_light: TrafficLight,
  light_show: LightShow,
  speed_runner: SpeedRunner,
  robot_arm: RobotArm,
  light_theremin: LightTheremin,
  temp_garden: TempGarden,
  distance_radar: DistanceRadar,
  reaction_champion: ReactionChampion,
  color_mixer: ColorMixer,
  piano_player: PianoPlayer,
  parking_assistant: ParkingAssistant,
  motion_alarm: MotionAlarm,
  music_visualizer: MusicVisualizer,
  obstacle_course: ObstacleCourse,
  secret_code: SecretCodeDoor,
  iot_dashboard: IoTDashboard,
  remote_sensor: RemoteSensor,
  smart_home: SmartHome,
};

export function getGameComponent(gameType) {
  return GAMES[gameType] || EnergyCity;
}

export function getGameList() {
  return Object.keys(GAMES).map(key => ({
    id: key,
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    component: GAMES[key],
  }));
}

export default { getGameComponent, getGameList };
