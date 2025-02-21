import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { LEVEL_CONFIG } from '../config.js';

export class Platform {
    constructor(scene) {
        this.scene = scene;
    }

    createPlatform(x, y, width, isGround = false, isStartPlatform = false, theme = null) {
        let platforms = [];
        const totalWidth = width * LEVEL_CONFIG.TILE_SIZE;

        if (isGround) {
            platforms = this.createGroundPlatform(x, y, totalWidth, theme);
        } else if (isStartPlatform) {
            platforms = this.createStartPlatform(x, y, width, theme);
        } else {
            platforms = this.createFloatingPlatform(x, y, width, theme);
        }

        // Apply platform behavior
        platforms.forEach(platform => {
            platform.isFloating = !isGround;
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.body.checkCollision.right = false;
            
            // Set up physics body to match scaled 48x48 size
            platform.body.setSize(48, 48);
            platform.body.setOffset(-16, -16);
            platform.setOrigin(0.5, 0.5);
            
            // Debug visualization in debug mode
            if (this.scene.physics.config.debug) {
                console.log('Platform physics body:', {
                    x: platform.x,
                    y: platform.y,
                    width: platform.body.width,
                    height: platform.body.height,
                    offset: platform.body.offset,
                    scale: platform.scale
                });
            }
        });

        return platforms;
    }

    createGroundPlatform(x, y, totalWidth, theme) {
        const tileFrame = theme ? theme.ground.center : TILES.BACKGROUND.DIRT.TOP.CENTER;
        const platform = this.scene.platforms.create(x, y, 'tilemap', tileFrame);
        platform.setScale(LEVEL_CONFIG.SCALE);
        platform.platformWidth = totalWidth;
        platform.leftEdge = x - (LEVEL_CONFIG.TILE_SIZE / 2);
        platform.rightEdge = x + (LEVEL_CONFIG.TILE_SIZE / 2);

        // Randomly add accent tiles below
        if (Phaser.Math.Between(0, 2) === 0) {
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

    createStartPlatform(x, y, width, theme) {
        const platforms = [];
        const halfWidth = Math.floor(width / 2);
        const startX = x - (halfWidth * LEVEL_CONFIG.TILE_SIZE);

        for (let i = 0; i < width; i++) {
            let tileFrame;
            if (theme) {
                if (i === 0) {
                    tileFrame = theme.platform.left;
                } else if (i === width - 1) {
                    tileFrame = theme.platform.right;
                } else {
                    tileFrame = theme.platform.center;
                }
            } else {
                if (i === 0) {
                    tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.LEFT;
                } else if (i === width - 1) {
                    tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.RIGHT;
                } else {
                    tileFrame = TILES.STRUCTURAL.FLOATING_PLATFORM.DEFAULT.CENTER;
                }
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
            platforms.push(platform);
        }

        return platforms;
    }

    createFloatingPlatform(x, y, width, theme) {
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
            if (theme) {
                if (i === 0) {
                    tileFrame = theme.platform.left;
                } else if (i === width - 1) {
                    tileFrame = theme.platform.right;
                } else {
                    tileFrame = theme.platform.center;
                }
            } else {
                if (i === 0) {
                    tileFrame = selectedType.LEFT;
                } else if (i === width - 1) {
                    tileFrame = selectedType.RIGHT;
                } else {
                    tileFrame = selectedType.CENTER;
                }
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
            platforms.push(platform);
        }

        return platforms;
    }
} 