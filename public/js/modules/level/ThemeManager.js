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
        }
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
        }
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
        }
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
        }
    }
};

export class ThemeManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTheme = null;
    }

    selectRandomTheme() {
        const themes = Object.values(LEVEL_THEMES);
        const theme = themes[Math.floor(Math.random() * themes.length)];
        this.currentTheme = theme;
        this.scene.currentTheme = theme.name;
        return theme;
    }
} 