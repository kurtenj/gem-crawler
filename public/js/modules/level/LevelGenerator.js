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
        
        // Weight lower layers to have more platforms and ensure some are close to ground
        let layer;
        const layerRoll = Math.random();
        const groundProximityThreshold = this.scene.GROUND_Y - 250; // Platforms within 250px of ground
        
        // If we don't have any platforms near the ground in this section, force a lower placement
        const hasLowPlatform = usedPositions.some(pos => pos.bottom > groundProximityThreshold);
        if (!hasLowPlatform && index % 3 === 0) { // Every third platform attempt
            layer = 0; // Force ground layer
        } else if (layerRoll < 0.5) {
            layer = 0; // 50% chance for bottom layer
        } else if (layerRoll < 0.8) {
            layer = 1; // 30% chance for second layer
        } else if (layerRoll < 0.95) {
            layer = 2; // 15% chance for third layer
        } else {
            layer = 3; // 5% chance for top layer
        }
        
        const horizontalIndex = index % horizontalSections;
        const sectionX = minX + (horizontalIndex * sectionWidth);
        const layerMinY = minY + (layer * layerHeight);
        const layerMaxY = layerMinY + layerHeight;
        
        let attempts = 0;
        let validPosition = false;
        let x, y, width;
        
        // Weighted platform width distribution favoring longer platforms
        const widthRoll = Math.random();
        if (widthRoll < 0.4) {
            width = 5; // 40% chance for width 5
        } else if (widthRoll < 0.7) {
            width = 4; // 30% chance for width 4
        } else if (widthRoll < 0.9) {
            width = 3; // 20% chance for width 3
        } else {
            width = 2; // 10% chance for width 2
        }
        
        // Try to find a non-overlapping position
        while (!validPosition && attempts < 10) {
            // Ensure x position accounts for platform width
            const minSectionX = sectionX + (width * LEVEL_CONFIG.TILE_SIZE / 2);
            const maxSectionX = sectionX + sectionWidth - (width * LEVEL_CONFIG.TILE_SIZE / 2);
            
            if (maxSectionX > minSectionX) {
                x = Phaser.Math.Between(minSectionX, maxSectionX);
            } else {
                x = minSectionX;
            }
            
            // For ground layer (0), ensure some platforms are closer to ground
            if (layer === 0) {
                const maxGroundY = this.scene.GROUND_Y - 150; // Minimum 150px from ground
                const minGroundY = this.scene.GROUND_Y - 250; // Maximum 250px from ground
                y = Phaser.Math.Between(minGroundY, maxGroundY);
            } else {
                y = Phaser.Math.Between(layerMinY, layerMaxY);
            }
            
            validPosition = this.checkPlatformPosition(x, y, width, usedPositions);
            attempts++;
        }
        
        if (validPosition) {
            const platforms = this.platformManager.createPlatform(x, y, width);
            
            // Record the position
            usedPositions.push(this.getPlatformBounds(x, y, width));
            
            // Add crawler with probability based on layer and platform width
            const shouldSpawnCrawler = 
                (layer < 2 && Math.random() < 0.6) || // 60% chance in lower layers
                (width >= 4 && Math.random() < 0.7) || // 70% chance on wide platforms
                (Math.random() < 0.4); // 40% base chance
            
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
        const spacing = LEVEL_CONFIG.TILE_SIZE * 2; // Minimum 2 tiles spacing between platforms
        
        // Add spacing to the bounds check
        const boundsWithSpacing = {
            left: platformBounds.left - spacing,
            right: platformBounds.right + spacing,
            top: platformBounds.top - spacing,
            bottom: platformBounds.bottom + spacing
        };
        
        for (const pos of usedPositions) {
            if (!(boundsWithSpacing.right < pos.left || 
                boundsWithSpacing.left > pos.right ||
                boundsWithSpacing.bottom < pos.top ||
                boundsWithSpacing.top > pos.bottom)) {
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