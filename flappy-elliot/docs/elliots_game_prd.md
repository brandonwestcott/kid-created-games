# Elliot's Game - Prompt Requirements Document

## Game Overview
**Title:** Elliot's Game  
**Genre:** Simple Side-scrolling Collection Game for Kids  
**Platform:** HTML5 (Browser-based)  
**Target Tool:** Claude Code  
**Target Audience:** 5-year-olds (demonstrating coding/LLM power)  
**Design Philosophy:** Simple, fun, functioning game - prioritize "wow factor" over complexity

## Core Gameplay Mechanics

### Player Character: Elliot
- **Appearance:** Small boy with blonde hair
- **Size:** Child-friendly sprite (approximately 32x32 pixels)
- **Movement Modes:**
  - **Flying:** Smooth aerial movement 
  - **Sky Walking:** Walking on invisible platforms in the sky
  - **Skydiving:** Fast downward movement for fun/dodging
- **Navigation:** Arrow key controls with mode switching

### Primary Objective
- Collect as many clouds as possible
- Have fun flying around the sky
- Survive friendly obstacles (no scary elements)
- Experience the magic of procedurally generated levels

## Technical Specifications

### Controls
- **Arrow Keys:** Primary navigation
  - Up Arrow: Switch to flying mode / Fly up
  - Down Arrow: Switch to skydiving mode / Dive down
  - Left Arrow: Move left
  - Right Arrow: Move right
- **Space Bar:** Switch to sky walking mode (walk on invisible platforms)
- **No complex combos:** Keep controls simple for 5-year-olds

### Game Structure
- **Level Duration:** ~1 minute per level for short attention spans
- **Difficulty:** Easy and consistent (no scaling) - focus on fun, not challenge
- **Procedural Elements:** Random enemy placement and cloud distribution
- **No Saves Needed:** Simple session-based gameplay

## Visual & Audio Requirements

### Graphics Style
- **Kid-friendly:** Bright, cheerful colors
- **Simple sprites:** Clear, recognizable shapes
- **Blonde-haired boy character:** Elliot as main character
- **Fluffy white clouds:** Easy to spot collectibles
- **Friendly obstacles:** Non-scary birds, colorful tornados

### Audio (Keep Simple)
- **Optional background music:** Upbeat, child-friendly
- **Simple sound effects:**
  - Happy "ding" for cloud collection
  - Whoosh sounds for movement changes
  - Cheerful power-up sounds

## Game Elements Specification

### Elliot (Player Character)
- **Health System:** 10 hearts (very forgiving for kids)
- **Visual feedback:** Hearts display on screen
- **Invincibility frames:** Brief protection after taking damage
- **Animation states:** Flying (arms spread), walking, diving

### Clouds (Collectibles)
- **Simple scoring:** 1 point per cloud (keep math easy)
- **Visual feedback:** Sparkle effect when collected
- **Procedural placement:** Randomly scattered but always reachable
- **No complex varieties:** Just fun, puffy white clouds

### Friendly Obstacles (Not Enemies!)
- **Birds:** Colorful, cartoon-style birds that fly in patterns
- **Tornados:** Small, colorful spinning wind effects
- **Behavior:** Simple, predictable movement patterns
- **No aggressive AI:** Just obstacles to avoid, not hunt the player
- **Procedural spawning:** Random placement but fair spacing

### Power-ups (Fun Boosts)
- **Speed Boost:** Makes Elliot move faster (blue sparkle effect)
- **Invincibility:** Makes Elliot immune to obstacles (golden glow)
- **Invisibility:** Makes obstacles ignore Elliot (transparent effect)
- **Duration:** 5-10 seconds each (long enough to feel powerful)
- **Visual clarity:** Obvious effects so kids understand what's happening

## Technical Implementation Details

### Performance Requirements
- **Frame rate:** Smooth 60 FPS for responsive feel
- **Canvas size:** 1200x600 (good for laptops/tablets)
- **No mobile optimization needed:** Focus on desktop demo

### Game Mechanics
- **Movement modes:** Clear visual indicators for flying/walking/diving
- **Sky walking:** Invisible platforms that appear briefly when stepped on
- **Gentle physics:** Forgiving movement, no harsh gravity
- **Collision detection:** Generous hit boxes (easier for kids)

### Procedural Generation (Keep Simple)
- **Cloud placement:** Random but always reachable positions
- **Obstacle spawning:** Birds and tornados in random but fair locations
- **Power-up distribution:** Occasional random spawns
- **Level variety:** Different background colors/themes per level

### Game States (Minimal)
- **Start screen:** Simple "Press any key to start"
- **Gameplay:** Main game with heart counter and score
- **Level complete:** Quick "Well done!" message, auto-advance
- **Game over:** "Try again?" with restart option
- **No complex menus:** Keep it simple for demo purposes

## Demo Success Criteria

### Primary Goal: "Wow Factor" for 5-Year-Old
- **Immediate engagement:** Game should be playable within seconds
- **Visual magic:** Seeing Elliot fly around should feel amazing
- **Easy wins:** Collecting clouds should feel rewarding
- **Movement variety:** Switching between flying/walking/diving should be fun
- **Procedural wonder:** "The computer made this level just for me!"

### Technical Success
- **Functioning game:** All core mechanics work smoothly
- **No crashes:** Stable performance throughout demo
- **Responsive controls:** Immediate feedback to key presses
- **Clear visuals:** Easy to understand what's happening on screen

## Development Priorities (For Claude Code)

### Phase 1: Core Mechanics (Priority 1)
1. Elliot character sprite (simple blonde boy)
2. Basic flying movement with arrow keys
3. Cloud collection with scoring
4. Simple collision detection
5. Heart system (10 hearts)

### Phase 2: Movement Modes (Priority 2)
1. Sky walking mode (invisible platforms)
2. Skydiving mode (faster downward movement)
3. Visual indicators for current mode
4. Smooth transitions between modes

### Phase 3: Obstacles & Fun (Priority 3)
1. Friendly birds flying in patterns
2. Colorful tornados as obstacles
3. Basic procedural placement
4. Power-ups (speed, invincibility, invisibility)

### Phase 4: Polish (If Time Permits)
1. Simple sound effects
2. Background music
3. Particle effects for collection
4. Level transition animations

## Simplified Requirements Summary

**What Claude Code needs to build:**
- HTML5 canvas game with a blonde boy character
- Arrow key controls for flying around
- Space bar for sky walking mode
- Clouds to collect (procedurally placed)
- Friendly obstacles: birds and tornados (procedurally placed)
- 10-heart health system
- Three power-ups with visual effects
- ~1 minute levels
- Simple, kid-friendly graphics
- No backend, no saves, no complex features

**Success = A working game that makes a 5-year-old say "Wow, the computer made this!"**

---

*This document should be iteratively refined based on testing and feedback during development.*