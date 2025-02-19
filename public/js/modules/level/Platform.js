import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { LEVEL_CONFIG } from '../config.js';

export class Platform {
    constructor(scene) {
        this.scene = scene;
    }

    createPlatform(x, y, width, isGround = false) {
        let platforms = [];
        const totalWidth = width * LEVEL_CONFIG.TILE_SIZE;

        if (isGround) {
            platforms = this.createGroundPlatform(x, y, totalWidth);
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
                TILES.BACKGROUND.ACCENT.LINE.TOP_RIGHT,
                TILES.BACKGROUND.ACCENT.DOT.BOTTOM_LEFT,
                TILES.BACKGROUND.ACCENT.DOT.BOTTOM_RIGHT,
                TILES.BACKGROUND.ACCENT.SQUARE.TOP_LEFT,
                TILES.BACKGROUND.ACCENT.SQUARE.TOP_RIGHT
            ];
            
            const accent = this.scene.add.sprite(x, y + LEVEL_CONFIG.TILE_SIZE, 'tilemap', 
                Phaser.Math.RND.pick(accentTiles));
            accent.setScale(LEVEL_CONFIG.SCALE);
            accent.setOrigin(0.5, 0.5);
        }

        return [platform];
    }

    createFloatingPlatform(x, y, width) {
        const platforms = [];
        
        if (width === 1) {
            const platform = this.createSinglePlatform(x, y, width);
            platforms.push(platform);
        } else {
            const [left, center, right] = this.createMultiPlatform(x, y, width);
            platforms.push(left, ...center, right);
        }

        return platforms;
    }

    createSinglePlatform(x, y, width) {
        const platform = this.scene.platforms.create(x, y, 'tilemap', TILES.PLATFORM.SINGLE);
        platform.setScale(LEVEL_CONFIG.SCALE);
        platform.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
        platform.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
        platform.rightEdge = x + (LEVEL_CONFIG.TILE_SIZE / 2);
        platform.setOrigin(0.5, 0.5);
        return platform;
    }

    createMultiPlatform(x, y, width) {
        const left = this.scene.platforms.create(x, y, 'tilemap', TILES.PLATFORM.LEFT);
        left.setScale(LEVEL_CONFIG.SCALE);
        left.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
        left.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
        left.rightEdge = x + (width * LEVEL_CONFIG.TILE_SIZE) - (LEVEL_CONFIG.TILE_SIZE / 2);
        left.setOrigin(0.5, 0.5);

        const center = [];
        for (let i = 1; i < width - 1; i++) {
            const centerPiece = this.scene.platforms.create(
                x + (i * LEVEL_CONFIG.TILE_SIZE), 
                y, 
                'tilemap', 
                TILES.PLATFORM.CENTER
            );
            centerPiece.setScale(LEVEL_CONFIG.SCALE);
            centerPiece.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
            centerPiece.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
            centerPiece.rightEdge = x + (width * LEVEL_CONFIG.TILE_SIZE) - (LEVEL_CONFIG.TILE_SIZE / 2);
            centerPiece.setOrigin(0.5, 0.5);
            center.push(centerPiece);
        }

        const right = this.scene.platforms.create(
            x + ((width - 1) * LEVEL_CONFIG.TILE_SIZE), 
            y, 
            'tilemap', 
            TILES.PLATFORM.RIGHT
        );
        right.setScale(LEVEL_CONFIG.SCALE);
        right.platformWidth = width * LEVEL_CONFIG.TILE_SIZE;
        right.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
        right.rightEdge = x + (width * LEVEL_CONFIG.TILE_SIZE) - (LEVEL_CONFIG.TILE_SIZE / 2);
        right.setOrigin(0.5, 0.5);

        return [left, center, right];
    }
} 