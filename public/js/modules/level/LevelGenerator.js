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
        this.placeGems(floatingPlatforms);

        console.log('Level generation complete');
    }

    clearLevel() {
        this.scene.platforms.clear(true, true);
        this.scene.crawlers.clear(true, true);
        this.scene.gems.clear(true, true);
        if (this.scene.key) this.scene.key.destroy();
        if (this.scene.door) this.scene.door.destroy();
        this.scene.hasKey = false;
    }

    generateGround() {
        const groundPlatforms = [];
        const theme = this.scene.themeManager.currentTheme;
        
        for (let x = 0; x <= LEVEL_CONFIG.LEVEL_WIDTH; x += LEVEL_CONFIG.TILE_SIZE) {
            // Create ground platform with theme tiles
            const platforms = this.platformManager.createPlatform(
                x, 
                this.scene.GROUND_Y, 
                1, 
                true, 
                false, 
                theme
            );
            groundPlatforms.push(platforms[0]);
        }
        return groundPlatforms;
    }

    generateFloatingPlatforms() {
        const floatingPlatforms = [];
        const numPlatforms = Phaser.Math.Between(LEVEL_CONFIG.MIN_PLATFORMS, LEVEL_CONFIG.MAX_PLATFORMS);
        const theme = this.scene.themeManager.currentTheme;
        
        // Define the playable area bounds
        const minX = 200;
        const maxX = LEVEL_CONFIG.LEVEL_WIDTH - 200;
        const minY = 150;
        const maxY = Math.min(
            this.scene.GROUND_Y - 100,
            LEVEL_CONFIG.LEVEL_HEIGHT - 176 - (LEVEL_CONFIG.TILE_SIZE) - (LEVEL_CONFIG.TILE_SIZE / 2)
        );

        // Create a starting platform at the left edge
        const startPlatformX = 24;
        const startPlatformY = this.scene.GROUND_Y - 128;
        const startPlatformWidth = 2;
        
        const startPlatform = this.platformManager.createPlatform(
            startPlatformX, 
            startPlatformY, 
            startPlatformWidth, 
            false, 
            true,
            theme
        );
        
        const startPlatformBounds = this.getPlatformBounds(startPlatformX, startPlatformY, startPlatformWidth);
        const usedPositions = [startPlatformBounds];
        
        // Divide the level into vertical layers with weighted distribution
        const numLayers = 5;
        const layerHeight = (maxY - minY) / numLayers;
        
        // Track platforms in each layer for validation
        const platformsByLayer = Array(numLayers).fill().map(() => []);
        
        // Create platforms with better distribution
        for (let i = 0; i < numPlatforms; i++) {
            const platformData = this.generatePlatformInSection(
                minX, maxX, minY, maxY, 
                numPlatforms, i, numLayers, 
                layerHeight, usedPositions,
                176,
                platformsByLayer,
                theme
            );
            
            if (platformData) {
                floatingPlatforms.push(platformData);
                platformsByLayer[platformData.layer].push(platformData);
            }
        }

        // Validate and fix platform accessibility
        this.ensurePlatformAccessibility(
            platformsByLayer, 
            floatingPlatforms, 
            minX, maxX, 
            layerHeight, 
            minY,
            theme
        );

        console.log('Platforms by layer:', platformsByLayer.map(layer => layer.length));
        return floatingPlatforms;
    }

    generatePlatformInSection(minX, maxX, minY, maxY, numPlatforms, index, numLayers, layerHeight, usedPositions, maxJumpHeight, platformsByLayer, theme) {
        // Calculate horizontal sections based on platform count
        const horizontalSections = Math.ceil(numPlatforms / numLayers);
        const sectionWidth = (maxX - minX) / horizontalSections;
        
        // Weight lower layers to have more platforms
        let layer;
        const layerRoll = Math.random();
        const groundProximityThreshold = this.scene.GROUND_Y - 300;
        
        const hasLowPlatform = usedPositions.some(pos => pos.bottom > groundProximityThreshold);
        if (!hasLowPlatform && index % 3 === 0) {
            layer = 0;
        } else if (layerRoll < 0.4) {
            layer = 0;
        } else if (layerRoll < 0.7) {
            layer = 1;
        } else if (layerRoll < 0.85) {
            layer = 2;
        } else if (layerRoll < 0.95) {
            layer = 3;
        } else {
            layer = 4;
        }
        
        const horizontalIndex = index % horizontalSections;
        const sectionX = minX + (horizontalIndex * sectionWidth);
        const layerMinY = minY + (layer * layerHeight);
        const layerMaxY = layerMinY + layerHeight;
        
        let attempts = 0;
        let validPosition = false;
        let x, y, width;
        
        // Weighted platform width distribution
        const widthRoll = Math.random();
        if (widthRoll < 0.4) {
            width = 5;
        } else if (widthRoll < 0.7) {
            width = 4;
        } else if (widthRoll < 0.9) {
            width = 3;
        } else {
            width = 2;
        }
        
        while (!validPosition && attempts < 10) {
            const minSectionX = sectionX + (width * LEVEL_CONFIG.TILE_SIZE / 2);
            const maxSectionX = sectionX + sectionWidth - (width * LEVEL_CONFIG.TILE_SIZE / 2);
            
            if (maxSectionX > minSectionX) {
                x = Phaser.Math.Between(minSectionX, maxSectionX);
            } else {
                x = minSectionX;
            }
            
            if (layer === 0) {
                const maxGroundY = this.scene.GROUND_Y - 150;
                const minGroundY = this.scene.GROUND_Y - 250;
                y = Phaser.Math.Between(minGroundY, maxGroundY);
            } else {
                y = Phaser.Math.Between(layerMinY, layerMaxY);
            }
            
            validPosition = this.checkPlatformPosition(x, y, width, usedPositions);
            attempts++;
        }
        
        if (validPosition) {
            const platforms = this.platformManager.createPlatform(x, y, width, false, false, theme);
            
            usedPositions.push(this.getPlatformBounds(x, y, width));
            
            const shouldSpawnCrawler = 
                (layer < 2 && Math.random() < 0.6) ||
                (width >= 4 && Math.random() < 0.7) ||
                (Math.random() < 0.4);
            
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
            TILES.BASIC.KEY.LARGE
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
            TILES.BASIC.DOOR.LOCKED
        );
        this.scene.door.setScale(LEVEL_CONFIG.SCALE);
        this.scene.door.setOrigin(0.5, 0.5);
        this.scene.door.body.setSize(48, 48, true);
        this.scene.door.body.setOffset(-16, -16);
    }

    placeGems(floatingPlatforms) {
        // Sort platforms by layer
        const sortedPlatforms = floatingPlatforms.sort((a, b) => a.layer - b.layer);
        
        // Define gem types with spawn chances
        const gemTypes = [
            { frame: 62, tint: 0x00FF00, chance: 0.6 },  // Emerald - Green (60% chance)
            { frame: 102, tint: 0x00FFFF, chance: 0.4 }, // Diamond - Light blue (40% chance)
            { frame: 82, tint: 0xFF0000, chance: 0.2 }   // Ruby - Red (20% chance)
        ];
        
        gemTypes.forEach((gemType, index) => {
            // Only attempt to spawn if random roll succeeds
            if (Math.random() > gemType.chance) {
                console.log(`Skipping gem spawn for type ${index}`);
                return;
            }
            
            // Select a platform from a different layer for each gem
            // Higher gems should spawn in higher layers
            const targetLayer = Math.floor(index * (sortedPlatforms.length / 3));
            const possiblePlatforms = sortedPlatforms.filter(p => 
                p.layer >= targetLayer && 
                p.layer < targetLayer + Math.ceil(sortedPlatforms.length / 3)
            );
            
            if (possiblePlatforms.length > 0) {
                const platform = Phaser.Math.RND.pick(possiblePlatforms).platform;
                
                // Create the gem
                const gem = this.scene.gems.create(
                    platform.x,
                    platform.y - LEVEL_CONFIG.TILE_SIZE,
                    'tilemap',
                    gemType.frame
                );
                
                gem.setScale(this.scene.SCALE);
                gem.body.setAllowGravity(false);
                gem.setTint(gemType.tint);
                
                // Add floating animation
                this.scene.tweens.add({
                    targets: gem,
                    y: gem.y - 10,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
                
                // Add gentle rotation
                this.scene.tweens.add({
                    targets: gem,
                    angle: 360,
                    duration: 3000,
                    ease: 'Linear',
                    repeat: -1
                });
                
                console.log(`Spawned gem type ${index} at layer ${platform.layer}`);
            }
        });
    }

    ensurePlatformAccessibility(platformsByLayer, allPlatforms, minX, maxX, layerHeight, minY, theme) {
        // Check each layer has at least one platform
        for (let layer = 0; layer < platformsByLayer.length; layer++) {
            if (platformsByLayer[layer].length === 0) {
                console.log(`No platforms in layer ${layer}, adding one`);
                
                const layerBottom = minY + (layer * layerHeight);
                const layerTop = layerBottom + layerHeight;
                const y = layer === 0 ? 
                    layerBottom + (layerHeight * 0.5) :
                    layerBottom + (layerHeight * 0.6);
                
                const x = Phaser.Math.Between(minX + 100, maxX - 100);
                
                const width = Phaser.Math.Between(2, 4);
                const platform = this.platformManager.createPlatform(x, y, width, false, false, theme)[0];
                
                const platformData = { platform, layer, width };
                platformsByLayer[layer].push(platformData);
                allPlatforms.push(platformData);
                
                console.log(`Added accessibility platform at layer ${layer}:`, { x, y, width });
            }
        }

        // Ensure each layer has a platform reachable from below
        for (let layer = 1; layer < platformsByLayer.length; layer++) {
            const lowerPlatforms = platformsByLayer[layer - 1];
            const currentPlatforms = platformsByLayer[layer];
            
            let hasReachablePlatform = false;
            
            for (const lowerPlatform of lowerPlatforms) {
                for (const currentPlatform of currentPlatforms) {
                    if (this.isPlatformReachable(lowerPlatform.platform, currentPlatform.platform)) {
                        hasReachablePlatform = true;
                        break;
                    }
                }
                if (hasReachablePlatform) break;
            }
            
            if (!hasReachablePlatform && lowerPlatforms.length > 0) {
                console.log(`Layer ${layer} has no reachable platforms, adding bridge platform`);
                
                const basePlatform = Phaser.Math.RND.pick(lowerPlatforms).platform;
                
                const x = Phaser.Math.Clamp(
                    basePlatform.x + Phaser.Math.Between(-100, 100),
                    minX + 100,
                    maxX - 100
                );
                const y = basePlatform.y - 176;
                
                const width = 3;
                const platform = this.platformManager.createPlatform(x, y, width, false, false, theme)[0];
                
                const platformData = { platform, layer, width };
                platformsByLayer[layer].push(platformData);
                allPlatforms.push(platformData);
                
                console.log(`Added bridge platform at layer ${layer}:`, { x, y, width });
            }
        }
    }

    isPlatformReachable(fromPlatform, toPlatform) {
        const maxJumpHeight = 176;
        const maxJumpDistance = 200;
        
        // Check vertical distance
        const verticalDist = fromPlatform.y - toPlatform.y;
        if (verticalDist > maxJumpHeight) return false;
        
        // Check horizontal distance (considering platform widths)
        const horizontalDist = Math.abs(fromPlatform.x - toPlatform.x);
        if (horizontalDist > maxJumpDistance) return false;
        
        return true;
    }
} 