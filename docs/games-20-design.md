# STEMVERSE — 20 Games Design Document

## Philosophy
Each game must be:
- **Playable in 5-10 minutes** (attention span)
- **Visually rewarding** (bright colors, animations, feedback)
- **Physically interactive** (real hardware changes the game)
- **Progressively harder** (Level 1 → 4)
- **Win condition clear** (kid knows when they succeed)

---

## GAME INDEX

| #  | Name               | Level | Components              | Skill                   |
|----|-------------------|-------|-------------------------|-------------------------|
| 1  | Energy City       | 1     | LED, Button, POT        | Digital + Analog I/O    |
| 2  | Traffic Light     | 1     | 3 LEDs, Button          | Digital Output + Timing |
| 3  | Color Magic       | 1     | RGB LED, 3 POTs         | PWM + Analog Input      |
| 4  | Light Show        | 1     | 4 LEDs, Button          | Pattern + Sequencing    |
| 5  | Secret Door       | 1     | Button, LED, Buzzer     | Button Combination      |
| 6  | Speed Runner      | 2     | POT, Button, LED        | Analog Control + Reflex |
| 7  | Light Theremin    | 2     | LDR, Buzzer, LED        | Sensor + Sound          |
| 8  | Temperature Garden| 2     | Temp Sensor, 3 LEDs     | Environmental Sensing   |
| 9  | Distance Radar    | 2     | Ultrasonic, 4 LEDs      | Distance Measurement    |
| 10 | Reaction Champion | 2     | 2 Buttons, LED, Buzzer  | Reflex + Competitiveness|
| 11 | Robot Arm         | 3     | Servo, 2 POTs           | Servo Control           |
| 12 | Piano Player      | 3     | 4 Buttons, Buzzer       | Music + Rhythm          |
| 13 | Smart Greenhouse  | 3     | Temp, Moisture, LED     | Multi-sensor            |
| 14 | Parking Assistant | 3     | Ultrasonic, LED, Buzzer | Proximity + Feedback    |
| 15 | Meteor Shower     | 3     | Button, POT, Buzzer     | Coordination            |
| 16 | Security System   | 4     | PIR Motion, Buzzer, LED | Motion Detection        |
| 17 | Music Visualizer  | 4     | POT, 4 LEDs, Buzzer     | Frequency + Visual      |
| 18 | Obstacle Course   | 4     | Ultrasonic, Servo, 2 BTN| Complex Integration     |
| 19 | Weather Station   | 4     | Temp, LDR, LED, Buzzer  | Environmental Monitoring|
| 20 | Mars Base         | 4     | ALL Components          | Final Challenge         |

---

## GAME DETAILS

### 1. ENERGY CITY 🏙️
- **Already built** — See EnergyCity.jsx
- **Hardware:** LED + Button + Potentiometer
- **Game:** LED = City lights, Button = Tram, POT = Power grid
- **Win:** LED blinks 5 times → City fully lit

### 2. TRAFFIC LIGHT 🚦
- **Hardware:** 3 LEDs (Red, Yellow, Green) + Button
- **Game:** Virtual intersection with cars waiting
  - Red LED → Cars stop, pedestrians cross
  - Yellow → Warning light
  - Green → Cars go!
  - Button → Pedestrian wants to cross
- **Win:** Successfully manage 10 traffic cycles without accidents
- **Learning:** Timing, sequence logic, if/else in code

### 3. COLOR MAGIC 🎨
- **Hardware:** RGB LED + 3 Potentiometers
- **Game:** Virtual canvas where you paint
  - POT1 → Red level (0-255)
  - POT2 → Green level (0-255)
  - POT3 → Blue level (0-255)
  - Real RGB LED shows exact color
  - Virtual canvas reflects the color
- **Win:** Match a target color (warm-up, then precise match)
- **Learning:** PWM, analog output, color theory (RGB)

### 4. LIGHT SHOW ✨
- **Hardware:** 4 LEDs (or single LED) + Button
- **Game:** Program your own light patterns
  - Button cycles through patterns (wave, blink, fade, random)
  - LED shows the pattern in real life
  - Virtual stage lights follow the same pattern
- **Win:** Create a pattern that matches the "dance" choreography
- **Learning:** Arrays, loops, pattern sequencing

### 5. SECRET DOOR 🚪
- **Hardware:** 1 Button + 1 LED + Buzzer
- **Game:** Spy-themed! Crack the secret code
  - Button enters a code sequence (tap timing matters)
  - LED shows progress (blinks = how many entered)
  - Buzzer confirms each tap
  - Virtual door with combination lock
- **Win:** Enter the correct 5-tap sequence
- **Learning:** Variables, counters, state machines

### 6. SPEED RUNNER 🏃
- **Hardware:** Potentiometer + Button
- **Game:** 2D sidescroller runner game
  - POT → Character speed
  - Button → Jump!
  - Avoid obstacles (cacti, pits)
  - Collect coins
- **Win:** Run 1000 meters without crashing
- **Learning:** Real-time control, analog precision

### 7. LIGHT THEREMIN 🎵
- **Hardware:** LDR (Light Sensor) + Buzzer + LED
- **Game:** Play music with light!
  - Cover the sensor → low pitch, dim LED
  - Expose to light → high pitch, bright LED
  - Virtual theremin shows frequency waves
- **Win:** Play "Twinkle Twinkle" by moving your hand
- **Learning:** Sensor input, frequency mapping

### 8. TEMPERATURE GARDEN 🌱
- **Hardware:** Temperature Sensor + 3 LEDs
- **Game:** Virtual garden affected by temperature
  - Cold (<20°C): Blue LED, snow, plants dormant
  - Warm (20-30°C): Green LED, flowers bloom
  - Hot (>30°C): Red LED, plants need water
  - Virtual garden reacts (flowers grow, birds appear)
- **Win:** Keep garden in "goldilocks zone" for 30 seconds
- **Learning:** Environmental monitoring, ranges

### 9. DISTANCE RADAR 📡
- **Hardware:** Ultrasonic Sensor + 4 LEDs + Buzzer
- **Game:** Radar screen with blips
  - Distance maps to virtual radar
  - Closer = more LEDs light up, faster beeps
  - Virtual radar shows blip moving
  - Find hidden objects by scanning
- **Win:** Detect and identify 5 hidden objects
- **Learning:** Distance measurement, echolocation

### 10. REACTION CHAMPION ⚡
- **Hardware:** 2 Buttons + LED + Buzzer
- **Game:** Two-player reaction game!
  - LED lights up randomly
  - First player to press their button wins
  - Buzzer confirms the winner
  - Virtual scoreboard keeps track
- **Win:** First to 5 wins in a best-of-9 match
- **Learning:** Interrupts, debouncing, multiplayer

### 11. ROBOT ARM 🦾
- **Hardware:** Servo Motor + 2 Potentiometers
- **Game:** Control a virtual robot arm
  - POT1 → Base rotation (0-180°)
  - POT2 → Arm lift (0-180°)
  - Real servo moves with the virtual arm
  - Pick up and place objects on screen
- **Win:** Stack 3 blocks in 60 seconds
- **Learning:** Servo control, angle mapping

### 12. PIANO PLAYER 🎹
- **Hardware:** 4 Buttons + Buzzer
- **Game:** Learn to play piano!
  - Each button = different note (C, D, E, F)
  - Buzzer plays the note
  - Virtual piano highlights keys
  - Song mode: falling notes you must press
- **Win:** Play "Hot Cross Buns" without mistakes
- **Learning:** Music theory, rhythm, coordination

### 13. SMART GREENHOUSE 🌿
- **Hardware:** Temp Sensor + Moisture Sensor + LED
- **Game:** Manage a virtual greenhouse
  - Temp → affects plant growth
  - Moisture → affects plant health
  - LED → auxiliary light (on/off)
  - Virtual plants grow, wilt, or thrive
  - Automatic watering system visualization
- **Win:** Grow a plant from seed to flower (3 min cycle)
- **Learning:** Multi-sensor fusion, automation logic

### 14. PARKING ASSISTANT 🚗
- **Hardware:** Ultrasonic Sensor + LED + Buzzer
- **Game:** Park a virtual car!
  - Distance sensor acts as backup camera
  - Closer to wall = faster beeping
  - LED brightness shows proximity
  - Virtual car moves on screen
- **Win:** Park within 5cm of the wall without touching
- **Learning:** Precision measurement, feedback systems

### 15. METEOR SHOWER ☄️
- **Hardware:** Button + Potentiometer + Buzzer
- **Game:** Space defense game!
  - POT → Move shield left/right
  - Button → Fire laser
  - Meteors fall from sky
  - Buzzer warns of incoming waves
  - Shield absorbs hits
- **Win:** Survive 3 waves (30 meteors total)
- **Learning:** Multi-tasking control, game logic

### 16. SECURITY SYSTEM 🔒
- **Hardware:** PIR Motion Sensor + Buzzer + LED
- **Game:** Design your own security system
  - PIR detects "intruders" (hand wave)
  - LED = system armed/disarmed status
  - Buzzer = alarm sound
  - Virtual building with rooms
  - Intruder moves through rooms
- **Win:** Detect and stop 10 intruders
- **Learning:** Motion detection, security logic

### 17. MUSIC VISUALIZER 🎵
- **Hardware:** Potentiometer + 4 LEDs + Buzzer
- **Game:** Create music with visual feedback
  - POT → Change frequency/note
  - LEDs → Visual equalizer (more LEDs for higher pitch)
  - Buzzer → plays the note
  - Virtual oscilloscope shows waveform
- **Win:** Play a sequence of 5 specific notes in order
- **Learning:** Frequency, waveforms, visual feedback

### 18. OBSTACLE COURSE 🏟️
- **Hardware:** Ultrasonic Sensor + Servo + 2 Buttons
- **Game:** Navigate a virtual maze
  - Ultrasonic → detects walls/obstacles
  - Servo → steering wheel rotation
  - Button 1 → accelerate
  - Button 2 → brake
  - Virtual car in a 3D-ish course
- **Win:** Complete the course in under 120 seconds
- **Learning:** Complex integration, multi-input control

### 19. WEATHER STATION 🌤️
- **Hardware:** Temp Sensor + LDR + LED + Buzzer
- **Game:** Run your own weather channel!
  - Temp → virtual thermometer
  - LDR → cloud cover / sun
  - LED → heat wave warning
  - Buzzer → storm alert
  - Animated weather scenes change
- **Win:** Correctly predict and announce 5 weather changes
- **Learning:** Data correlation, environmental monitoring

### 20. MARS BASE 🔴
- **Hardware:** ALL components combined
- **Game:** Build and manage a Mars colony
  - Temp → base cooling system
  - LDR → solar panel efficiency
  - Ultrasonic → rover navigation
  - Button → launch rockets
  - POT → resource allocation
  - LEDs → base status
  - Buzzer → alerts
- **Win:** Successfully establish a self-sufficient base (10 min)
- **Learning:** Everything combined — the final exam!

---

## GAME CONFIGURATION FORMAT

```json
{
  "gameType": "game_id",
  "title": "Display Title",
  "subtitle": "Short tagline",
  "description": "What the player does",
  "difficulty": 1,
  "serialMapping": {
    "component_name": { "pin": "A0", "type": "analog", "command": "KEY" }
  },
  "winCondition": { "type": "condition_type", "value": 10 },
  "xpReward": 50,
  "estimatedTime": "5 min"
}
```

## COMPONENT LIBRARY

| Component     | Pin Type  | Serial Command |
|---------------|-----------|----------------|
| LED           | Digital   | LED:0 / LED:1  |
| RGB LED       | PWM x3    | R:0-255, G:, B:|
| Button        | Digital   | BTN:0 / BTN:1  |
| Potentiometer | Analog    | POT:0-1023     |
| LDR           | Analog    | LDR:0-1023     |
| Temp Sensor   | Analog    | TEMP:20-40     |
| Ultrasonic    | Distance  | DIST:0-400     |
| Servo         | PWM       | SRV:0-180      |
| Buzzer        | Digital   | BZZ:0 / BZZ:1  |
| Moisture      | Analog    | MOIST:0-1023   |
| PIR Motion    | Digital   | PIR:0 / PIR:1  |

---

## GAME ENGINE ARCHITECTURE

```javascript
// Each game implements:
{
  render: () => JSX,        // Visual rendering
  parseSerial: (key, val) => void,  // Handle serial data
  checkWin: () => boolean,  // Win condition checker
  reset: () => void,        // Start fresh
  getHUD: () => HUDData     // Score, lives, progress
}
```

The game engine (GameEngine.jsx) routes between games based on
lesson.gameConfig.gameType.
