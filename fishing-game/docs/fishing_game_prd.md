# The Fishing Game - Prompt Requirements Document

## Project Overview
**Game Name:** The Fishing Game
**Target Platform:** HTML5 (Web Browser)
**Development Tool:** Claude Code
**Audience:** Educational project for a 5-year-old learning about LLMs
**Game Type:** Single-player 2D fishing simulation

## Visual Style & Design
- **Art Style:** 16-bit retro pixel art aesthetic
- **Perspective:** 2D front-facing view
- **Color Palette:** Bright, child-friendly colors with good contrast
- **Animation Style:** Simple sprite-based animations with smooth transitions

## Game Layout & Environment
- **Screen Layout:** Horizontal split-screen design
  - Left side: Water/ocean area (approximately 70% of screen width)
  - Right side: Small piece of land where player stands (approximately 30% of screen width)
- **Water Depth:** Visual indication of water depth with darker blues toward the bottom
- **Background:** Simple sky and horizon line above water surface

## Player Character & Controls
- **Player Position:** Standing on the left side land area
- **Primary Control:** Spacebar only
- **Casting Mechanics:**
  - Hold spacebar to charge cast power (visual power meter recommended)
  - Longer hold = further cast distance
  - Release spacebar to cast fishing line
- **Reeling Mechanics:**
  - Once lure hits water surface, it automatically begins sinking
  - Hold spacebar to reel in (lure moves up toward surface)
  - Release spacebar to let lure sink again
  - Continuous control over lure depth

## Fish & Marine Life
- **Fish Types:**
  1. **Small Fish:** Easy to catch, common, less valuable
  2. **Large Fish:** Harder to catch, less common, more valuable
  3. **Sharks:** Including hammerhead sharks, rare, challenging to catch
- **Fish Behavior:**
  - Fish spawn randomly throughout the water area
  - When fish detect lure proximity, they actively chase it
  - Different fish types have different chase speeds and detection ranges
  - Fish should have simple swimming animations

## Game Mechanics

### Fishing System
- Lure physics: Realistic sinking and rising based on player input
- Fish attraction: Fish move toward lure when within detection range
- Catch mechanics: Fish caught when lure and fish collision occurs
- Visual feedback for successful catches

### Inventory & Scoring
- **Fish Counter:** Display total count of each fish type caught
- **Inventory Display:** Clear visual representation of caught fish
- **Categorization:** Separate counters for small fish, large fish, and sharks

### Hunger System
- **Hunger Bar:** Visual bar starting at 100% full
- **Hunger Depletion:** Random hunger loss occurs periodically while fishing
- **Eating Mechanics:**
  - Player can choose to consume caught fish to restore hunger
  - Different fish types restore different amounts of hunger
  - Clear UI for selecting which fish to eat

## Technical Requirements

### HTML5 Implementation
- Single HTML file with embedded CSS and JavaScript
- Canvas-based rendering for smooth 2D graphics
- No external dependencies or libraries required
- Responsive design that works on different screen sizes

### Performance Considerations
- Smooth 60fps gameplay
- Efficient sprite rendering
- Optimized collision detection
- Memory-efficient fish spawning system

### Audio (Optional)
- Simple sound effects for casting, reeling, and catching fish
- Ambient water/nature sounds
- All audio should be lightweight and optional (mutable)

## User Interface Elements
- **Power Meter:** Visual indicator for cast strength while holding spacebar
- **Fish Counter:** Display showing quantity of each fish type caught
- **Hunger Bar:** Visual hunger meter with clear full/empty states
- **Instructions:** Simple on-screen text explaining controls
- **Eat Fish Button/Menu:** Interface for consuming caught fish

## Educational Value
- Simple cause-and-effect learning (hold longer = cast further)
- Resource management (hunger vs. fish consumption)
- Pattern recognition (different fish behaviors)
- Goal-oriented gameplay (collecting different fish types)

## Success Criteria
1. **Functional Gameplay:** All core mechanics work as described
2. **Visual Appeal:** 16-bit style graphics that are engaging for a child
3. **Intuitive Controls:** Single-button control scheme is easy to understand
4. **Educational Value:** Game teaches basic concepts while being fun
5. **Technical Stability:** No crashes or game-breaking bugs
6. **Complete Experience:** All features implemented and working together

## Development Notes for Claude Code
- Prioritize clean, readable code structure
- Include helpful comments explaining game logic
- Use semantic HTML and organized CSS
- Implement robust error handling
- Test all game mechanics thoroughly
- Ensure cross-browser compatibility

## Optional Enhancements (If Time Permits)
- Simple particle effects for water splashes
- Background fish that don't interact with lure
- Day/night cycle visual changes
- Achievement system for catching certain fish combinations
- Save/load game state functionality

---

**Note:** This game should be fully functional and engaging while remaining simple enough for a 5-year-old to understand and enjoy. The focus should be on smooth gameplay mechanics and clear visual feedback rather than complex features.
