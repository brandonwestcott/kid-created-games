# Speed Runner vs Hunter - Game Requirements Document

## Game Overview
A top-down 2-player chase game where a Hunter tries to catch a Speed Runner within 60 seconds. Features Minecraft-style blocky graphics with procedurally generated maps containing various terrain elements and obstacles.

## Core Gameplay

### Victory Conditions
- **Hunter wins:** Touches the Speed Runner at any point during the game
- **Speed Runner wins:** Survives for the full 60-second timer

### Player Controls
- **Speed Runner:** WASD keys for movement
- **Hunter:** Arrow keys for movement
- **Movement:** Players can stop by releasing keys, smooth directional movement

### Character Specifications
- **Speed Runner:** 
  - Visual: Character with rocket pack on back
  - Rockets activate visually during speed boosts
  - Size: ~35x35 pixels
- **Hunter:**
  - Visual: Character holding a stick/weapon
  - Size: ~35x35 pixels
- **Base Movement:** Both players move at identical base speed
- **Collision Detection:** Game ends when hunter and speed runner sprites overlap

## Map Design

### Map Specifications
- **Dimensions:** 1500x900 pixels
- **Style:** Minecraft-inspired blocky/pixelated textures
- **Generation:** Randomly generated each game with 10-70% obstacle coverage

### Terrain Elements

#### Water Features
- **Ponds:** Impassable water bodies of various sizes
- **Rivers:** Linear water features running across the map
- **Bridges:** Cross river at specific points, passable by both players

#### Land Features
- **Mud Patches:** Slow both players equally (suggest 0.5x speed)
- **Small Forests:** Impassable tree clusters
- **Houses:** Special buildings with unique mechanics

#### House Mechanics
- **Entry:** Only Speed Runner can enter houses
- **Safety Duration:** 5 seconds maximum occupancy
- **Auto-Eject:** Speed Runner automatically exits to random side after 5 seconds
- **Cooldown:** 10-second cooldown before re-entering same house
- **Visual Indicator:** Houses show unavailable state during cooldown (suggest red tint/different texture)
- **Hunter Behavior:** Hunter can wait outside but cannot enter

## Power-Up System

### Speed Boost Power-Ups
- **Effect:** 1.25x movement speed for Speed Runner only
- **Duration:** 5 seconds per pickup
- **Stacking:** Non-stackable (new pickup resets timer to 5 seconds)
- **Distribution:** Multiple power-ups scattered randomly across map
- **Visual Feedback:** Rocket pack activates/glows during boost
- **Respawn:** Consider respawning power-ups throughout the match

## User Interface

### Required UI Elements
- **Countdown Timer:** Large, prominent 60-second countdown
- **Game Status:** Clear indication of current game state
- **Player Indicators:** Visual distinction between Speed Runner and Hunter
- **House Cooldown Indicators:** Visual feedback for house availability

### Visual Feedback Requirements
- **Power-Up Collection:** Visual/audio feedback when speed boost collected
- **House Entry/Exit:** Clear indication when entering/leaving houses
- **Speed Boost Active:** Visible rocket pack activation
- **Collision Detection:** Immediate game end feedback
- **Timer Warnings:** Visual/audio cues as time runs low

### Audio Feedback
- **Game Events:** Sounds for power-up collection, house entry/exit, speed boost activation
- **Background:** Optional ambient game music
- **Victory/Defeat:** Clear audio cues for game end
- **Timer:** Audio warnings at 10 seconds remaining

## Technical Requirements

### File Structure
- **Single HTML File:** All HTML, CSS, and JavaScript in one file
- **No External Dependencies:** Self-contained game
- **Target Platform:** Desktop browsers only

### Performance Specifications
- **Smooth 60 FPS:** Consistent frame rate for gameplay
- **Responsive Controls:** Immediate input response
- **Collision Detection:** Accurate and performant hit detection
- **Map Generation:** Fast procedural generation without lag

### Code Organization
- **Modular JavaScript:** Well-organized game logic
- **Canvas-Based:** Use HTML5 Canvas for rendering
- **Game Loop:** Proper game loop with update/render cycles
- **State Management:** Clear game states (menu, playing, game over)

## Map Generation Algorithm

### Terrain Distribution
- **Random Coverage:** 10-70% of map filled with obstacles
- **Balanced Placement:** Ensure playable paths exist
- **Element Variety:** Include all terrain types in reasonable proportions
- **Player Spawn:** Ensure both players start in accessible areas

### Accessibility Requirements
- **Path Validation:** Guarantee Speed Runner can reach houses and power-ups
- **Bridge Placement:** Ensure rivers have adequate bridge crossings
- **House Distribution:** Multiple houses spread across map
- **Power-Up Access:** Speed boosts reachable by Speed Runner

## Game Balance

### Fairness Considerations
- **Equal Base Speed:** Hunter has no inherent speed advantage
- **Strategic Depth:** Houses provide tactical options for Speed Runner
- **Risk/Reward:** Speed boosts require leaving safety to collect
- **Time Pressure:** 60-second limit creates urgency

### Difficulty Tuning
- **Simple Controls:** Easy for kids to learn
- **Clear Objectives:** Obvious win conditions
- **Visual Clarity:** Easy to distinguish all game elements
- **Forgiving Mechanics:** Reasonable cooldowns and durations

## Success Criteria

### Functional Requirements
- [ ] Two-player simultaneous control (WASD + Arrow keys)
- [ ] 60-second timer with game end conditions
- [ ] All terrain types implemented with correct behavior
- [ ] House entry/exit mechanics working properly
- [ ] Speed boost system functional
- [ ] Collision detection accurate
- [ ] Random map generation working

### Visual Requirements
- [ ] Minecraft-style blocky aesthetic
- [ ] Clear visual distinction between all terrain types
- [ ] Character sprites with appropriate accessories (rocket pack, stick)
- [ ] UI elements clearly visible and functional
- [ ] Visual feedback for all game events

### Audio Requirements
- [ ] Sound effects for major game events
- [ ] Audio feedback enhances gameplay experience
- [ ] No audio conflicts or performance issues

## Additional Considerations

### Code Quality
- **Clean Architecture:** Well-structured, readable code
- **Comments:** Key functions and game logic explained
- **Error Handling:** Graceful handling of edge cases
- **Extensibility:** Code structure allows for easy modifications

### Player Experience
- **Immediate Fun:** Game is enjoyable from first play
- **Replayability:** Random maps encourage multiple games
- **Kid-Friendly:** Appropriate difficulty and content for children
- **Clear Feedback:** Players always understand game state

This requirements document provides comprehensive specifications for Claude Code to implement a polished, engaging Speed Runner vs Hunter game that meets all the specified criteria while ensuring a fun, balanced gaming experience for kids.