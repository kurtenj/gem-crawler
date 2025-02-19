import { LEVEL_CONFIG } from '../config.js';
import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;
import { Platform } from './Platform.js';
import { Crawler } from '../entities/Enemy.js';

export class LevelGenerator {
    constructor(scene) {
        this.scene = scene;
        this.platformManager = new Platform(scene);
    }

    generate() {
        console.log('Generating level...');
        this.clearLevel();
        
        const groundPlatforms = this.generateGround();
        const floatingPlatforms = this.generateFloatingPlatforms();
        
        this.placeKey(floatingPlatforms);
        this.placeDoor();

        console.log('Level generation complete');
    }

    clearLevel() {
        this.scene.platforms.clear(true, true);
        this.scene.crawlers.clear(true, true);
        if (this.scene.key) this.scene.key.destroy();
        if (this.scene.door) this.scene.door.destroy();
        this.scene.hasKey = false;
    }

    generateGround() {
        const groundPlatforms = [];
        for (let x = 0; x <= LEVEL_CONFIG.LEVEL_WIDTH; x += LEVEL_CONFIG.TILE_SIZE) {
            const platforms = this.platformManager.createPlatform(x, this.scene.GROUND_Y, 1, true);
            groundPlatforms.push(platforms[0]);
        }
        return groundPlatforms;
    }

    generateFloatingPlatforms() {
        const floatingPlatforms = [];
        const numPlatforms = Phaser.Math.Between(LEVEL_CONFIG.MIN_PLATFORMS, LEVEL_CONFIG.MAX_PLATFORMS);
        
        // Define the playable area bounds
        const minX = 200; // Minimum x position for floating platforms
        const maxX = LEVEL_CONFIG.LEVEL_WIDTH - 200; // Leave space for door
        const minY = 150;
        
        // Calculate maximum safe platform height
        const jumpClearance = 176 + (LEVEL_CONFIG.TILE_SIZE) + (LEVEL_CONFIG.TILE_SIZE / 2);
        const maxY = Math.min(
            this.scene.GROUND_Y - 100,
            LEVEL_CONFIG.LEVEL_HEIGHT - jumpClearance
        );
        
        // Create a starting platform at the left edge
        const startPlatformX = 24; // Exactly 24px from left edge
        const startPlatformY = this.scene.GROUND_Y - 96; // Exactly 96px from ground
        const startPlatformWidth = 2; // 2 tiles wide
        
        // Create the starting platform with specific tiles for wall extension appearance
        const startPlatform = this.platformManager.createPlatform(
            startPlatformX, 
            startPlatformY, 
            startPlatformWidth, 
            false, 
            true // Flag to indicate this is the starting platform
        );
        
        const startPlatformBounds = this.getPlatformBounds(startPlatformX, startPlatformY, startPlatformWidth);
        const usedPositions = [startPlatformBounds];
        
        // Divide the level into vertical layers with weighted distribution
        const numLayers = 4;
        const layerHeight = (maxY - minY) / numLayers;
        
        // Create platforms with better distribution
        for (let i = 0; i < numPlatforms; i++) {
            const platformData = this.generatePlatformInSection(
                minX, maxX, minY, maxY, 
                numPlatforms, i, numLayers, 
                layerHeight, usedPositions
            );
            
            if (platformData) {
                floatingPlatforms.push(platformData);
            }
        }

        return floatingPlatforms;
    }

    generatePlatformInSection(minX, maxX, minY, maxY, numPlatforms, index, numLayers, layerHeight, usedPositions) {
        // Calculate horizontal sections based on platform count
        const horizontalSections = Math.ceil(numPlatforms / numLayers);
        const sectionWidth = (maxX - minX) / horizontalSections;
        
        // Weight lower layers to have more platforms
        let layer;
        const layerRoll = Math.random();
        if (layerRoll < 0.4) {
            layer = 0; // 40% chance for bottom layer
        } else if (layerRoll < 0.7) {
            layer = 1; // 30% chance for second layer
        } else if (layerRoll < 0.9) {
            layer = 2; // 20% chance for third layer
        } else {
            layer = 3; // 10% chance for top layer
        }
        
        const horizontalIndex = index % horizontalSections;
        const sectionX = minX + (horizontalIndex * sectionWidth);
        const layerMinY = minY + (layer * layerHeight);
        const layerMaxY = layerMinY + layerHeight;
        
        let attempts = 0;
        let validPosition = false;
        let x, y, width;
        
        // Try to find a non-overlapping position
        while (!validPosition && attempts < 10) {
            x = Phaser.Math.Between(sectionX, sectionX + sectionWidth - 100);
            y = Phaser.Math.Between(layerMinY, layerMaxY);
            width = Phaser.Math.Between(LEVEL_CONFIG.PLATFORM_MIN_WIDTH, LEVEL_CONFIG.PLATFORM_MAX_WIDTH);
            
            validPosition = this.checkPlatformPosition(x, y, width, usedPositions);
            attempts++;
        }
        
        if (validPosition) {
            const platforms = this.platformManager.createPlatform(x, y, width);
            
            // Record the position
            usedPositions.push(this.getPlatformBounds(x, y, width));
            
            // Add crawler with probability based on layer and distance
            const distanceFromStart = (x - minX) / (maxX - minX);
            const shouldSpawnCrawler = 
                (layer < 2 && Math.random() < 0.7) || // 70% chance in lower layers
                (Math.random() < 0.5); // 50% chance in upper layers
            
            if (shouldSpawnCrawler) {
                Crawler.createForPlatform(this.scene, platforms[0], width);
            }
            
            return {
                platform: platforms[0],
                layer: layer,
                width: width
            };
        }
        
        return null;
    }

    checkPlatformPosition(x, y, width, usedPositions) {
        const platformBounds = this.getPlatformBounds(x, y, width);
        
        for (const pos of usedPositions) {
            if (!(platformBounds.right < pos.left || 
                platformBounds.left > pos.right ||
                platformBounds.bottom < pos.top ||
                platformBounds.top > pos.bottom)) {
                return false;
            }
        }
        
        return true;
    }

    getPlatformBounds(x, y, width) {
        return {
            left: x - (width * LEVEL_CONFIG.TILE_SIZE / 2),
            right: x + (width * LEVEL_CONFIG.TILE_SIZE / 2),
            top: y - LEVEL_CONFIG.TILE_SIZE,
            bottom: y + LEVEL_CONFIG.TILE_SIZE
        };
    }

    placeKey(floatingPlatforms) {
        // Sort platforms by layer to find a reachable one for the key
        const sortedPlatforms = floatingPlatforms.sort((a, b) => a.layer - b.layer);
        
        // Select a platform from the middle layer if possible, otherwise from lower layers
        let keyPlatform;
        const middleLayerPlatforms = sortedPlatforms.filter(p => p.layer === 1);
        if (middleLayerPlatforms.length > 0) {
            keyPlatform = Phaser.Math.RND.pick(middleLayerPlatforms).platform;
        } else {
            // Fall back to platforms from the bottom layer
            const lowerPlatforms = sortedPlatforms.filter(p => p.layer <= 1);
            keyPlatform = Phaser.Math.RND.pick(lowerPlatforms).platform;
        }
        
        // Add key on the selected platform
        this.scene.key = this.scene.physics.add.sprite(
            keyPlatform.x,
            keyPlatform.y - LEVEL_CONFIG.TILE_SIZE,
            'tilemap',
            TILES.KEY
        );
        this.scene.key.setScale(LEVEL_CONFIG.SCALE);
        this.scene.key.setOrigin(0.5, 0.5);
        this.scene.key.body.setSize(48, 48, true);
        this.scene.key.body.setOffset(-16, -16);
        this.scene.key.body.setAllowGravity(false);

        // Add floating animation
        this.scene.tweens.add({
            targets: this.scene.key,
            y: this.scene.key.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add gentle rotation
        this.scene.tweens.add({
            targets: this.scene.key,
            angle: 5,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    placeDoor() {
        // Create a platform for the door at the far right
        const doorX = LEVEL_CONFIG.LEVEL_WIDTH - 100;
        const doorPlatform = this.platformManager.createPlatform(doorX, this.scene.GROUND_Y, 2)[0];

        // Add door at the end of the level
        this.scene.door = this.scene.physics.add.staticSprite(
            doorX,
            this.scene.GROUND_Y - LEVEL_CONFIG.TILE_SIZE,
            'tilemap',
            TILES.DOOR.LOCKED
        );
        this.scene.door.setScale(LEVEL_CONFIG.SCALE);
        this.scene.door.setOrigin(0.5, 0.5);
        this.scene.door.body.setSize(48, 48, true);
        this.scene.door.body.setOffset(-16, -16);
    }
} 