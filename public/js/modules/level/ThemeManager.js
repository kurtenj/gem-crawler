import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export const LEVEL_THEMES = {
    NATURAL: {
        name: 'Natural',
        ground: {
            left: 87,    // Foreground dirt top left
            center: 88,  // Foreground dirt top center
            right: 89    // Foreground dirt top right
        },
        platform: {
            single: 63,  // Default platform single
            left: 64,    // Default platform left
            center: 65,  // Default platform center
            right: 66    // Default platform right
        },
        decorations: [
            { frame: 53, chance: 0.3, yOffset: -48, scale: 1 },  // Single mushroom
            { frame: 54, chance: 0.2, yOffset: -48, scale: 1 },  // Mushroom group
            { frame: 39, chance: 0.3, yOffset: -48, scale: 1 },  // Small vine
            { frame: 19, chance: 0.2, yOffset: -48, scale: 1 }   // Large vine
        ]
    },
    INDUSTRIAL: {
        name: 'Industrial',
        ground: {
            left: 351,   // Foreground industrial top left
            center: 352, // Foreground industrial top center
            right: 353   // Foreground industrial top right
        },
        platform: {
            single: 83,  // Crumbly platform single
            left: 84,    // Crumbly platform left
            center: 85,  // Crumbly platform center
            right: 86    // Crumbly platform right
        },
        decorations: [
            { frame: 309, chance: 0.2, yOffset: -48, scale: 1 }, // Gear
            { frame: 369, chance: 0.3, yOffset: -48, scale: 1 }, // Fan front type 1
            { frame: 370, chance: 0.2, yOffset: -48, scale: 1 }  // Fan front type 2
        ]
    },
    TILE: {
        name: 'Ancient',
        ground: {
            left: 354,   // Foreground tile top left
            center: 355, // Foreground tile top center
            right: 356   // Foreground tile top right
        },
        platform: {
            single: 103, // Rigid platform single
            left: 104,   // Rigid platform left
            center: 105, // Rigid platform center
            right: 106   // Rigid platform right
        },
        decorations: [
            { frame: 114, chance: 0.3, yOffset: -48, scale: 1 }, // Accent square top right
            { frame: 119, chance: 0.3, yOffset: -48, scale: 1 }, // Accent line top right
            { frame: 174, chance: 0.2, yOffset: -48, scale: 1 }  // Accent square top left
        ]
    },
    METAL: {
        name: 'Mechanical',
        ground: {
            left: 357,   // Foreground metal top left
            center: 358, // Foreground metal top center
            right: 359   // Foreground metal top right
        },
        platform: {
            single: 123, // Conveyor platform single
            left: 124,   // Conveyor platform left
            center: 125, // Conveyor platform center
            right: 126   // Conveyor platform right
        },
        decorations: [
            { frame: 387, chance: 0.2, yOffset: -48, scale: 1 }, // Fan side left
            { frame: 388, chance: 0.2, yOffset: -48, scale: 1 }, // Fan side right
            { frame: 147, chance: 0.3, yOffset: -48, scale: 1 }, // Pipe left
            { frame: 148, chance: 0.3, yOffset: -48, scale: 1 }  // Pipe center
        ]
    }
};

export class ThemeManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTheme = null;
        this.decorations = scene.add.group();
    }

    selectRandomTheme() {
        const themes = Object.values(LEVEL_THEMES);
        const theme = themes[Math.floor(Math.random() * themes.length)];
        this.currentTheme = theme;
        this.scene.currentTheme = theme.name;
        return theme;
    }

    addDecorations(x, y, isGround = false) {
        if (!this.currentTheme) return;
        
        // Adjust spawn position based on whether this is ground or platform
        const baseY = isGround ? y - (this.scene.TILE_SIZE / 2) : y - (this.scene.TILE_SIZE / 2);
        
        this.currentTheme.decorations.forEach(dec => {
            if (Math.random() < dec.chance) {
                // Calculate final position
                const finalY = baseY + dec.yOffset;
                
                const decoration = this.scene.add.sprite(
                    x,
                    finalY,
                    'tilemap',
                    dec.frame
                );
                
                // Apply scale and set origin to bottom center for consistent placement
                decoration.setScale(this.scene.SCALE * (dec.scale || 1));
                decoration.setOrigin(0.5, 1);
                
                // Add to group for management
                this.decorations.add(decoration);
                
                // Debug visualization if debug mode is enabled
                if (this.scene.physics.config.debug) {
                    console.log('Decoration placed:', {
                        x,
                        y: finalY,
                        frame: dec.frame,
                        yOffset: dec.yOffset,
                        baseY,
                        isGround
                    });
                }
            }
        });
    }

    clearDecorations() {
        this.decorations.clear(true, true);
    }
} 