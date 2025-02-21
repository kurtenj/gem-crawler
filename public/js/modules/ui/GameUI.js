import { LEVEL_CONFIG } from '../config.js';
import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class GameUI {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
    }

    createUI() {
        // Create UI container that stays fixed to the camera
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        
        // Add semi-transparent background for level info (top left)
        const padding = 10;
        const levelBackground = this.scene.add.rectangle(
            padding, 
            padding, 
            200, 
            40, 
            0x000000, 
            0.3
        );
        levelBackground.setOrigin(0, 0);
        this.container.add(levelBackground);

        // Add level and theme text (top left)
        this.levelThemeText = this.scene.add.text(
            padding + 10, 
            padding + 10,
            'Dungeon: Level 1',
            { 
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff'
            }
        );
        this.container.add(this.levelThemeText);

        // Add semi-transparent background for items (top right)
        const itemsBackground = this.scene.add.rectangle(
            LEVEL_CONFIG.CANVAS_WIDTH - 140 - padding, 
            padding, 
            140, 
            50, 
            0x000000, 
            0.3
        );
        itemsBackground.setOrigin(0, 0);
        this.container.add(itemsBackground);

        // Add item indicators (top right)
        const itemStartX = LEVEL_CONFIG.CANVAS_WIDTH - 120;
        const itemY = padding + 25;
        const itemSpacing = 30;

        // Key
        this.keyIcon = this.scene.add.sprite(
            itemStartX,
            itemY,
            'tilemap',
            TILES.BASIC.KEY.LARGE
        );
        this.keyIcon.setScale(2);
        this.keyIcon.setAlpha(0.3);
        this.container.add(this.keyIcon);

        // Emerald (first)
        this.emeraldIcon = this.scene.add.sprite(
            itemStartX + itemSpacing,
            itemY,
            'tilemap',
            62 // Emerald tile
        );
        this.emeraldIcon.setScale(2);
        this.emeraldIcon.setAlpha(0.3);
        this.emeraldIcon.setTint(0x00FF00); // Green tint
        this.container.add(this.emeraldIcon);

        // Diamond (second)
        this.diamondIcon = this.scene.add.sprite(
            itemStartX + (itemSpacing * 2),
            itemY,
            'tilemap',
            102 // Diamond tile
        );
        this.diamondIcon.setScale(2);
        this.diamondIcon.setAlpha(0.3);
        this.diamondIcon.setTint(0x00FFFF); // Light blue tint
        this.container.add(this.diamondIcon);

        // Ruby (third)
        this.rubyIcon = this.scene.add.sprite(
            itemStartX + (itemSpacing * 3),
            itemY,
            'tilemap',
            82 // Ruby tile
        );
        this.rubyIcon.setScale(2);
        this.rubyIcon.setAlpha(0.3);
        this.rubyIcon.setTint(0xFF0000); // Red tint
        this.container.add(this.rubyIcon);
    }

    updateLevel(level) {
        this.levelThemeText.setText(`${this.scene.currentTheme}: Level ${level}`);
    }

    updateTheme(theme) {
        this.levelThemeText.setText(`${theme}: Level ${this.scene.currentLevel}`);
    }

    setKeyStatus(hasKey) {
        this.keyIcon.setAlpha(hasKey ? 1 : 0.3);
    }

    setGemStatus(type, hasGem) {
        switch(type) {
            case 'emerald':
                this.emeraldIcon.setAlpha(hasGem ? 1 : 0.3);
                break;
            case 'ruby':
                this.rubyIcon.setAlpha(hasGem ? 1 : 0.3);
                break;
            case 'diamond':
                this.diamondIcon.setAlpha(hasGem ? 1 : 0.3);
                break;
        }
    }
} 