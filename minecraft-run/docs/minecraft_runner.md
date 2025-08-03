# Prompt Requirements Document: Minecraft-Style Split-Screen Endless Runner Game

## Project Overview
Create a fun, child-friendly HTML5 game that demonstrates the power of LLMs through Claude Code 4. This is a two-player split-screen endless runner game with Minecraft-inspired blocky visuals, designed for 5-year-olds to enjoy.

## Target Specifications
- **Platform**: Browser-based HTML5 game
- **Target Resolution**: 1500x900 pixels (laptop optimized)
- **Performance**: Smooth 60fps gameplay
- **Age Group**: 5-year-old friendly
- **Technology**: HTML5 with recommended 3D libraries (see Technical Requirements)
- **Perspective**: 3D/2.5D running toward the top of screen (into the distance)

## Game Mechanics

### Core Gameplay
- **Genre**: Split-screen 3D endless runner (Temple Run style)
- **Screen Layout**: Vertical split down the middle
- **Camera Perspective**: 3D/2.5D third-person view running toward the top of screen
- **Movement Direction**: Characters run "into" the screen (toward the horizon/vanishing point)
- **Win Condition**: Last player standing after both players fall/crash
- **Difficulty**: Constant easy level (no progression)
- **Round System**: Instant restart capability, no persistent state

### Player Characters
- **Left Player (Adult)**: Brown curly hair, glasses, blocky Minecraft-style design
- **Right Player (Child)**: Blonde hair, smaller size, blocky Minecraft-style design
- **Movement**: Constant forward running speed
- **Actions**: Jump (to clear low obstacles), Duck (to avoid high obstacles)

### Lane System
- **Track Layout**: Each player has 3 parallel lanes extending into the distance
- **Lane Perspective**: 3D lanes that converge toward vanishing point at top of screen
- **Starting Position**: Both players begin in center lane at bottom of their screen half
- **Lane Switching**: Smooth diagonal transitions between lanes in 3D space
- **Lane Width**: Lanes appear wider at bottom (near player) and narrower toward horizon
- **Visual Depth**: Obstacles appear small in distance and grow larger as they approach

### Controls
- **Left Player**: WASD keys
  - W: Jump
  - S: Duck
  - A: Move to left lane
  - D: Move to right lane
- **Right Player**: Arrow keys
  - Up Arrow: Jump
  - Down Arrow: Duck
  - Left Arrow: Move to left lane
  - Right Arrow: Move to right lane

### Physics & Movement
- **Running Speed**: Constant forward movement into the screen
- **Jump Duration**: ~0.8 seconds total with 3D arc trajectory
- **Duck Duration**: Hold to duck, release to stand (affects player silhouette)
- **Lane Switching**: Smooth 0.3-second diagonal movement in 3D space
- **Collision Detection**: 3D-aware hitboxes with generous boundaries
- **Lane Restrictions**: Cannot skip lanes (must go left→center→right)
- **Depth Perception**: Objects scale and move based on Z-distance from player

## Visual Design

### Art Style
- **Theme**: Minecraft-inspired blocky/voxel aesthetic
- **Character Design**: Simple, recognizable blocky figures
- **Color Palette**: Bright, cheerful colors appropriate for children

### Terrain Themes (Procedurally Generated)
1. **Grass Plains**: Green ground, light blue sky, grass texture blocks
2. **Desert**: Sandy yellow ground, orange/pink sky, sandstone texture
3. **Snow**: White ground, pale blue sky, snow/ice texture blocks
4. **Forest**: Dark green ground, green sky, wood/leaf texture blocks
5. **Stone Mountains**: Gray ground, darker sky, cobblestone texture

### Obstacles (Minecraft Materials)
- **Full-Width Low Barriers** (jump over): 1-2 block high fences/walls spanning all 3 lanes
  - Scale from small (distant) to large (near) as they approach player
- **Full-Width High Barriers** (duck under): 3-4 block high beams/arches spanning all 3 lanes
  - Maintain proper 3D proportions and collision detection
- **Single-Lane Blockers** (dodge left/right): Full-height barriers blocking only 1 lane
  - Wooden walls, cobblestone pillars, iron block towers
  - Appear in any lane with proper 3D positioning and depth
- **Material Types**: Wood planks, cobblestone, iron blocks, brick (all with 3D texturing)
- **Obstacle Timing**: 1 obstacle every 2 seconds (consistent spacing in 3D space)
- **3D Animation**: Obstacles slide toward player from vanishing point, scaling up as they approach
- **Obstacle Distribution**: 
  - 40% Single-lane blockers (dodge)
  - 35% Full-width jump obstacles
  - 25% Full-width duck obstacles

### Power-ups (Minecraft Item Style)
- **Invincibility**: Golden apple (makes player glow/sparkle for 3 seconds)
- **Slow Opponent**: Slowness potion bottle (slows other player 50% for 2 seconds)
- **Super Jump**: Feather (allows double-height jumps for 2 uses)
- **Collection**: Run over power-up to collect

## User Interface

### HUD Elements
- **Distance/Time Tracker**: Top corners of each player's screen half
  - Left player: Top-left corner
  - Right player: Top-right corner
  - Format: "Distance: XXXm" or "Time: XX.Xs"
- **Power-up Indicators**: Small icons below distance tracker when active
- **Visual Style**: Minecraft UI inspired (blocky text, earth tone backgrounds)

### Game States
1. **Start Screen**: Simple "Press any key to start" with game title
2. **Countdown**: 5-second countdown (5, 4, 3, 2, 1, GO!)
3. **Gameplay**: Split-screen running action
4. **Game Over**: Show winner, final distances/times, "Press R to restart"

## Audio Design

### Sound Effects
- **Footstep Sounds**: Blocky step sounds while running
- **Jump Sound**: Light "boing" or "hop" sound
- **Duck Sound**: Quick "whoosh" sound
- **Lane Switch Sound**: Subtle "swish" or "step" sound
- **Collision Sound**: Soft "bump" or "oof" (not scary)
- **Power-up Collection**: Pleasant "ding" or "chime"
- **Power-up Activation**: Unique sound per power-up type

### Background Music
- **Style**: Upbeat, cheerful, Minecraft-inspired chiptune
- **Volume**: Moderate level, non-intrusive
- **Loop**: Seamless background track

## Technical Requirements

### Recommended 3D Libraries
**Primary Recommendation: Three.js**
- **Why**: Industry standard for 3D web graphics, excellent documentation
- **CDN**: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- **Benefits**: Built-in 3D primitives, lighting, materials, camera controls
- **Minecraft-Style**: Easy to create blocky geometries with BoxGeometry

**Alternative Option: Babylon.js**
- **Why**: Powerful 3D engine with good performance
- **CDN**: Available via cdnjs.cloudflare.com
- **Benefits**: Built-in physics, advanced rendering features

**Lightweight Alternative: CSS 3D Transforms**
- **Why**: No additional libraries needed, good performance
- **Method**: Use CSS transform3d() and perspective for pseudo-3D effect
- **Limitations**: Less flexible but simpler implementation

### Performance Specifications
- **Frame Rate**: Consistent 60fps with 3D rendering
- **3D Optimization**: Efficient geometry management, texture reuse
- **Draw Calls**: Minimize geometry complexity for smooth performance  
- **Loading Time**: Instant start with progressive asset loading
- **Memory Usage**: Efficient 3D object pooling and disposal
- **Browser Compatibility**: Modern browsers with WebGL support

### Code Architecture
- **File Structure**: Single HTML file with embedded CSS/JS and 3D library CDN import
- **Dependencies**: Three.js (or alternative) via CDN for 3D rendering
- **No Backend**: Client-side only, no data persistence
- **No Local Storage**: Fresh start every session
- **3D Scene Management**: Proper scene graph, camera positioning, lighting setup

### Procedural Generation
- **3D Level Chunks**: Generate terrain/obstacles in 3D space extending into distance
- **Obstacle Timing**: Exactly 1 obstacle every 2 seconds, spawning at vanishing point
- **Lane Assignment**: Single-lane obstacles positioned in 3D space across lanes
- **Power-up Frequency**: Spawn every 15-20 seconds, positioned in 3D lanes with scaling
- **Terrain Switching**: Change biome every 30-60 seconds with smooth 3D transitions
- **Depth Management**: Objects spawn far away and move toward player with proper scaling
- **Obstacle Sequencing**: Ensure no impossible combinations accounting for 3D movement timing

## Game Balance

### Difficulty Tuning
- **Obstacle Frequency**: Easy spacing, plenty of reaction time
- **Obstacle Variety**: 60% jump obstacles, 30% duck obstacles, 10% mixed
- **Power-up Balance**: 
  - Invincibility: 3-second duration
  - Slow opponent: 2-second duration, 50% speed reduction
  - Super jump: 2 uses, double height
- **Collision Forgiveness**: Generous hitboxes, slight grace period

### Accessibility Features
- **Visual Cues**: Clear obstacle telegraphing
- **Audio Cues**: Sound effects help identify actions needed
- **Control Responsiveness**: Immediate input response
- **Error Recovery**: Forgiving collision detection

## Success Criteria

### Functional Requirements
- [ ] Smooth split-screen gameplay at 60fps
- [ ] Responsive WASD and arrow key controls
- [ ] Procedural level generation with 5 biome types
- [ ] Working power-up system with 3 power-up types
- [ ] Distance/time tracking display
- [ ] 5-second countdown system
- [ ] Game over detection and restart functionality
- [ ] Minecraft-style blocky visuals
- [ ] Background music and sound effects

### User Experience Goals
- [ ] Easy enough for 5-year-olds to understand and play
- [ ] Visually appealing Minecraft-inspired aesthetic  
- [ ] Immediate fun factor and replay value
- [ ] Clear winner determination
- [ ] Smooth, responsive controls

### Technical Goals
- [ ] Single HTML file deployment
- [ ] No external dependencies
- [ ] Cross-browser compatibility
- [ ] Optimized performance for target resolution
- [ ] Clean, maintainable code structure

## Implementation Notes for Claude Code 4

### Key Focus Areas
1. **3D Rendering**: Three.js scene setup with proper camera positioning and lighting
2. **Game Loop**: requestAnimationFrame with 3D object updates and movement
3. **3D Collision Detection**: AABB collision in 3D space with generous boundaries
4. **Lane System**: 3D lane positioning with smooth diagonal transitions
5. **Procedural Generation**: 3D obstacle spawning and scaling system from distance
6. **Performance Optimization**: Efficient 3D geometry management and object pooling
7. **Audio Integration**: HTML5 Audio API with 3D spatial audio considerations
8. **Input Handling**: Responsive controls for 3D lane switching and actions
9. **3D Animation**: Character animations (running, jumping, ducking) in 3D space
10. **Visual Effects**: Atmospheric perspective, fog, and depth cues for immersion

### Code Organization Priorities
- Modular 3D scene management and game logic separation
- Efficient 3D geometry creation and material systems
- Smooth 3D animation and transition systems  
- Performance-optimized rendering pipeline
- User-friendly restart mechanics with proper 3D scene cleanup

This PRD provides comprehensive guidance for creating an engaging, child-friendly endless runner that showcases LLM capabilities through Claude Code 4's ability to generate a complete, functional game from these specifications.