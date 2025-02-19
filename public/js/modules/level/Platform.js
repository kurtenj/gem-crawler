import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { LEVEL_CONFIG } from '../config.js';

export class Platform {
    constructor(scene) {
        this.scene = scene;
    }

    createPlatform(x, y, width, isGround = false, isStartPlatform = false) {
        let platforms = [];
        const totalWidth = width * LEVEL_CONFIG.TILE_SIZE;

        if (isGround) {
            platforms = this.createGroundPlatform(x, y, totalWidth);
        } else if (isStartPlatform) {
            platforms = this.createStartPlatform(x, y, width);
        } else {
            platforms = this.createFloatingPlatform(x, y, width);
        }

        // Apply platform behavior
        platforms.forEach(platform => {
            platform.isFloating = !isGround;
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.body.checkCollision.right = false;
            
            // Make physics body match scaled sprite size exactly (48x48)
            platform.body.setSize(48, 48, true);
            // Center the physics body on the sprite
            platform.body.setOffset(-16, -16);
        });

        return platforms;
    }

    createGroundPlatform(x, y, totalWidth) {
        const platform = this.scene.platforms.create(x, y, 'tilemap', TILES.BACKGROUND.DIRT.TOP.CENTER);
        platform.setScale(LEVEL_CONFIG.SCALE);
        platform.platformWidth = totalWidth;
        platform.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
        platform.rightEdge = x + (LEVEL_CONFIG.TILE_SIZE / 2);
        platform.setOrigin(0.5, 0.5);

        // Randomly add accent tiles below
        if (Phaser.Math.Between(0, 2) === 0) { // 33% chance
            const accentTiles = [
                TILES.BACKGROUND.ACCENT.LINE.TOP_LEFT,
                TILES.BACKGROUND.ACCENT.LINE.TOP_RIGHT
            ];
            const accentTile = Phaser.Math.RND.pick(accentTiles);
            const accentSprite = this.scene.add.sprite(x, y + LEVEL_CONFIG.TILE_SIZE, 'tilemap', accentTile);
            accentSprite.setScale(LEVEL_CONFIG.SCALE);
        }

        return [platform];
    }

    createStartPlatform(x, y, width) {
        const platforms = [];
        const halfWidth = Math.floor(width / 2);
        const startX = x - (halfWidth * LEVEL_CONFIG.TILE_SIZE);

        for (let i = 0; i < width; i++) {
            let tileFrame;
            if (i === 0) {
                tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.LEFT;
            } else if (i === width - 1) {
                tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.RIGHT;
            } else {
                tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.CENTER;
            }

            const platform = this.scene.platforms.create(
                startX + (i * LEVEL_CONFIG.TILE_SIZE),
                y,
                'tilemap',
                tileFrame
            );
            platform.setScale(LEVEL_CONFIG.SCALE);
            platform.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
            platform.leftEdge = startX;
            platform.rightEdge = startX + (width * LEVEL_CONFIG.TILE_SIZE);
            platform.setOrigin(0.5, 0.5);
            platforms.push(platform);
        }

        return platforms;
    }

    createFloatingPlatform(x, y, width) {
        const platforms = [];
        const halfWidth = Math.floor(width / 2);
        const startX = x - (halfWidth * LEVEL_CONFIG.TILE_SIZE);

        // Randomly select platform type
        const platformTypes = [
            TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT,
            TILES.STRUCTURAL.FLOATING_PLATFORM.CRUMBLY,
            TILES.STRUCTURAL.FLOATING_PLATFORM.RIGID,
            TILES.STRUCTURAL.FLOATING_PLATFORM.STICKY
        ];
        const selectedType = Phaser.Math.RND.pick(platformTypes);

        for (let i = 0; i < width; i++) {
            let tileFrame;
            if (i === 0) {
                tileFrame = selectedType.LEFT;
            } else if (i === width - 1) {
                tileFrame = selectedType.RIGHT;
            } else {
                tileFrame = selectedType.CENTER;
            }

            const platform = this.scene.platforms.create(
                startX + (i * LEVEL_CONFIG.TILE_SIZE),
                y,
                'tilemap',
                tileFrame
            );
            platform.setScale(LEVEL_CONFIG.SCALE);
            platform.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
            platform.leftEdge = startX;
            platform.rightEdge = startX + (width * LEVEL_CONFIG.TILE_SIZE);
            platform.setOrigin(0.5, 0.5);
            platforms.push(platform);
        }

        return platforms;
    }
} 