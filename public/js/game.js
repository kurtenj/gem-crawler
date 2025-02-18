import TileManifest from './tileManifest.js';
const { TILES } = TileManifest;

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.player = null;
        this.platforms = null;
        this.crawlers = null;
        this.key = null;
        this.door = null;
        this.hasKey = false;
        this.SCALE = 3;
        this.TILE_SIZE = 16 * this.SCALE;
        this.CANVAS_WIDTH = 1200;
        this.LEVEL_WIDTH = 2400;
        this.LEVEL_HEIGHT = 600;
        this.GROUND_Y = this.LEVEL_HEIGHT - (this.TILE_SIZE * 2); // Position ground near bottom

        // Movement constants
        this.WALK_SPEED = 200;          // Increased for snappier movement
        this.JUMP_VELOCITY = -460;      // Increased for higher jumps
        this.AIR_CONTROL = 0.8;         // Air control multiplier
        this.ACCELERATION = 1500;       // Ground acceleration
        this.AIR_ACCELERATION = 1200;   // Air acceleration
        this.DRAG = 1600;               // Ground drag (friction)
        this.AIR_DRAG = 400;            // Air drag (wind resistance)
        
        // Jump mechanics
        this.COYOTE_TIME = 150;         // Time in ms player can jump after leaving platform
        this.JUMP_BUFFER_TIME = 150;    // Time in ms to buffer a jump input before landing
        this.lastGroundedTime = 0;      // Track when player was last on ground
        this.lastJumpPressedTime = 0;   // Track when jump was last pressed
        this.MIN_JUMP_VELOCITY = -200;  // Minimum jump velocity for tap jumps

        // Tile indices
        this.TILES = {
            PLAYER: {
                IDLE: 240,
                WALK_1: 241,
                WALK_2: 242,
                JUMP: 245
            },
            PLATFORM: {
                SINGLE: 63,
                LEFT: 64,
                CENTER: 65,
                RIGHT: 66
            },
            KEY: 97,  // Small key
            DOOR: {
                LOCKED: 57,
                UNLOCKED: 58,
                OPEN: 59
            },
            CRAWLER: {
                IDLE: 320,
                WALK_1: 321,
                WALK_2: 322
            },
            BACKGROUND: {
                DIRT: {
                    TOP: {
                        CENTER: 116
                    }
                },
                ACCENT: {
                    SQUARE: {
                        TOP_RIGHT: 114,
                        BOTTOM_RIGHT: 134,
                        BOTTOM_LEFT: 154,
                        TOP_LEFT: 174
                    },
                    LINE: {
                        TOP_RIGHT: 119,
                        TOP_LEFT: 179
                    },
                    DOT: {
                        BOTTOM_RIGHT: 139,
                        BOTTOM_LEFT: 159
                    }
                }
            }
        };
    }

    preload() {
        console.log('Preloading assets...');
        // Load tilemap spritesheet
        this.load.spritesheet('tilemap', '/assets/tilemap.png', {
            frameWidth: 16,    // Each tile is 16x16 pixels
            frameHeight: 16,
            spacing: 0,        // No spacing between tiles
            margin: 0          // No margin around tiles
        });
    }

    create() {
        console.log('Creating scene...');
        // Initialize physics groups
        this.platforms = this.physics.add.staticGroup();
        this.crawlers = this.physics.add.group();
        
        // Generate level
        this.generateLevel();
        
        // Create player and position above ground
        this.player = this.physics.add.sprite(100, 300, 'tilemap', this.TILES.PLAYER.IDLE);
        console.log('Player created:', this.player);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setScale(this.SCALE);
        this.player.setDepth(1);
        
        // Enhanced player physics settings
        this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.1, this.player.height * 0.1);
        this.player.body.setMaxVelocity(this.WALK_SPEED, 800);
        this.player.body.setDragX(this.DRAG);
        
        // Create animations
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'tilemap', frame: this.TILES.PLAYER.WALK_1 },
                { key: 'tilemap', frame: this.TILES.PLAYER.WALK_2 }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'crawler-walk',
            frames: [
                { key: 'tilemap', frame: this.TILES.CRAWLER.WALK_1 },
                { key: 'tilemap', frame: this.TILES.CRAWLER.WALK_2 }
            ],
            frameRate: 6,
            repeat: -1
        });

        // Add colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.crawlers, this.platforms);
        this.physics.add.collider(this.player, this.crawlers, this.handleEnemyCollision, null, this);
        
        // Add key collection
        this.physics.add.overlap(this.player, this.key, this.collectKey, null, this);
        // Add door interaction
        this.physics.add.overlap(this.player, this.door, this.tryEnterDoor, null, this);
        
        // Set up controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Set up camera with smoother follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.LEVEL_WIDTH, this.LEVEL_HEIGHT);

        console.log('Scene creation complete');
    }

    createPlatform(x, y, width, isGround = false) {
        let platforms = [];
        const totalWidth = width * this.TILE_SIZE;

        if (isGround) {
            // Create the main ground platform
            const platform = this.platforms.create(x, y, 'tilemap', this.TILES.BACKGROUND.DIRT.TOP.CENTER);
            platform.setScale(this.SCALE);
            platform.platformWidth = totalWidth;
            platform.leftEdge = x - (this.TILE_SIZE / 2);
            platform.rightEdge = x + (this.TILE_SIZE / 2);
            platform.setOrigin(0.5, 0.5);
            platforms.push(platform);

            // Randomly add accent tiles below
            if (Phaser.Math.Between(0, 2) === 0) { // 33% chance
                const accentTiles = [
                    this.TILES.BACKGROUND.ACCENT.LINE.TOP_LEFT,
                    this.TILES.BACKGROUND.ACCENT.LINE.TOP_RIGHT,
                    this.TILES.BACKGROUND.ACCENT.DOT.BOTTOM_LEFT,
                    this.TILES.BACKGROUND.ACCENT.DOT.BOTTOM_RIGHT,
                    this.TILES.BACKGROUND.ACCENT.SQUARE.TOP_LEFT,
                    this.TILES.BACKGROUND.ACCENT.SQUARE.TOP_RIGHT
                ];
                
                const accent = this.add.sprite(x, y + this.TILE_SIZE, 'tilemap', Phaser.Math.RND.pick(accentTiles));
                accent.setScale(this.SCALE);
                accent.setOrigin(0.5, 0.5);
            }
        } else {
            // Regular floating platform logic
            if (width === 1) {
                const platform = this.platforms.create(x, y, 'tilemap', this.TILES.PLATFORM.SINGLE);
                platform.setScale(this.SCALE);
                platform.platformWidth = totalWidth;
                platform.leftEdge = x - (this.TILE_SIZE / 2);
                platform.rightEdge = x + (this.TILE_SIZE / 2);
                platform.setOrigin(0.5, 0.5);
                platforms.push(platform);
            } else {
                const left = this.platforms.create(x, y, 'tilemap', this.TILES.PLATFORM.LEFT);
                left.setScale(this.SCALE);
                left.platformWidth = totalWidth;
                left.leftEdge = x - (this.TILE_SIZE / 2);
                left.rightEdge = x + (width * this.TILE_SIZE) - (this.TILE_SIZE / 2);
                left.setOrigin(0.5, 0.5);
                platforms.push(left);
                
                for (let i = 1; i < width - 1; i++) {
                    const center = this.platforms.create(x + (i * this.TILE_SIZE), y, 'tilemap', this.TILES.PLATFORM.CENTER);
                    center.setScale(this.SCALE);
                    center.platformWidth = totalWidth;
                    center.leftEdge = x - (this.TILE_SIZE / 2);
                    center.rightEdge = x + (width * this.TILE_SIZE) - (this.TILE_SIZE / 2);
                    center.setOrigin(0.5, 0.5);
                    platforms.push(center);
                }
                
                const right = this.platforms.create(x + ((width - 1) * this.TILE_SIZE), y, 'tilemap', this.TILES.PLATFORM.RIGHT);
                right.setScale(this.SCALE);
                right.platformWidth = totalWidth;
                right.leftEdge = x - (this.TILE_SIZE / 2);
                right.rightEdge = x + (width * this.TILE_SIZE) - (this.TILE_SIZE / 2);
                right.setOrigin(0.5, 0.5);
                platforms.push(right);
            }
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

    createCrawler(x, y, platform) {
        const crawler = this.crawlers.create(x, y, 'tilemap', this.TILES.CRAWLER.IDLE);
        crawler.setCollideWorldBounds(true);
        crawler.setBounce(0);
        crawler.setScale(this.SCALE);
        crawler.anims.play('crawler-walk', true);
        crawler.isDead = false;
        
        // Set up platform patrolling
        crawler.currentPlatform = platform;
        crawler.setVelocityX(50); // Start moving right
        crawler.direction = 1; // 1 for right, -1 for left
        
        // Adjust crawler physics body
        crawler.body.setSize(crawler.width * 0.8, crawler.height * 0.8);
        crawler.body.setOffset(crawler.width * 0.1, crawler.height * 0.1);
        
        // Ensure crawler stays on platform
        crawler.body.setAllowGravity(true);
        
        // Add custom update function for this crawler
        crawler.update = () => {
            if (crawler.isDead) return;

            // Check if crawler is at platform edge
            if (crawler.direction === 1 && crawler.x >= crawler.currentPlatform.rightEdge - (this.TILE_SIZE / 2)) {
                crawler.direction = -1;
                crawler.setVelocityX(-50);
            } else if (crawler.direction === -1 && crawler.x <= crawler.currentPlatform.leftEdge + (this.TILE_SIZE / 2)) {
                crawler.direction = 1;
                crawler.setVelocityX(50);
            }

            // Update flip based on direction
            crawler.setFlipX(crawler.direction === -1);
        };

        return crawler;
    }

    generateLevel() {
        console.log('Generating level...');
        // Clear existing level
        this.platforms.clear(true, true);
        this.crawlers.clear(true, true);
        if (this.key) this.key.destroy();
        if (this.door) this.door.destroy();
        this.hasKey = false;

        // Generate ground using dirt tiles - ensure full coverage
        const groundPlatforms = [];
        for (let x = 0; x <= this.LEVEL_WIDTH; x += this.TILE_SIZE) {
            const platforms = this.createPlatform(x, this.GROUND_Y, 1, true);
            groundPlatforms.push(platforms[0]);
        }

        // Generate random floating platforms
        const floatingPlatforms = [];
        const minPlatforms = 6;
        const maxPlatforms = 8;
        const numPlatforms = Phaser.Math.Between(minPlatforms, maxPlatforms);
        
        // Define the playable area bounds
        const minX = 200;
        const maxX = this.LEVEL_WIDTH - 200; // Leave space for door
        const minY = 200;
        const maxY = this.GROUND_Y - 100;
        
        // Divide the level into vertical layers for better platform distribution
        const numLayers = 3; // Three vertical layers
        const layerHeight = (maxY - minY) / numLayers;
        
        // Keep track of platform positions to prevent overlapping
        const usedPositions = [];
        
        // Create platforms with better distribution
        for (let i = 0; i < numPlatforms; i++) {
            // Divide the level width into sections to ensure horizontal distribution
            const sectionWidth = (maxX - minX) / numPlatforms;
            const sectionX = minX + (i * sectionWidth);
            
            // Choose a random layer for this platform
            const layer = Phaser.Math.Between(0, numLayers - 1);
            const layerMinY = minY + (layer * layerHeight);
            const layerMaxY = layerMinY + layerHeight;
            
            let attempts = 0;
            let validPosition = false;
            let x, y, width;
            
            // Try to find a non-overlapping position
            while (!validPosition && attempts < 10) {
                x = Phaser.Math.Between(sectionX, sectionX + sectionWidth - 100);
                y = Phaser.Math.Between(layerMinY, layerMaxY);
                width = Phaser.Math.Between(2, 4);
                
                // Check if this position overlaps with any existing platforms
                validPosition = true;
                const platformBounds = {
                    left: x - (width * this.TILE_SIZE / 2),
                    right: x + (width * this.TILE_SIZE / 2),
                    top: y - this.TILE_SIZE,
                    bottom: y + this.TILE_SIZE
                };
                
                for (const pos of usedPositions) {
                    if (!(platformBounds.right < pos.left || 
                        platformBounds.left > pos.right ||
                        platformBounds.bottom < pos.top ||
                        platformBounds.top > pos.bottom)) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            if (validPosition) {
                const platforms = this.createPlatform(x, y, width);
                floatingPlatforms.push({
                    platform: platforms[0],
                    layer: layer,
                    width: width
                });
                
                // Record the position
                usedPositions.push({
                    left: x - (width * this.TILE_SIZE / 2),
                    right: x + (width * this.TILE_SIZE / 2),
                    top: y - this.TILE_SIZE,
                    bottom: y + this.TILE_SIZE
                });
                
                // Add crawler with varying probability based on platform width
                const crawlerChance = width * 0.2; // 40% chance for width 2, 60% for width 3, 80% for width 4
                if (Math.random() < crawlerChance) {
                    this.createCrawler(
                        x + (width * this.TILE_SIZE / 2),
                        y - (this.TILE_SIZE / 2),
                        platforms[0]
                    );
                }
            }
        }

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
        this.key = this.physics.add.sprite(
            keyPlatform.x,
            keyPlatform.y - this.TILE_SIZE,
            'tilemap',
            this.TILES.KEY
        );
        this.key.setScale(this.SCALE);
        this.key.setOrigin(0.5, 0.5);
        this.key.body.setSize(48, 48, true);
        this.key.body.setOffset(-16, -16);
        this.key.body.setAllowGravity(false);
        
        // Add floating animation to key
        this.tweens.add({
            targets: this.key,
            y: this.key.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Create a platform for the door at the far right
        const doorX = this.LEVEL_WIDTH - 100;
        const doorPlatform = this.createPlatform(doorX, this.GROUND_Y, 2)[0];

        // Add door at the end of the level
        this.door = this.physics.add.staticSprite(
            doorX,
            this.GROUND_Y - this.TILE_SIZE,
            'tilemap',
            this.TILES.DOOR.LOCKED
        );
        this.door.setScale(this.SCALE);
        this.door.setOrigin(0.5, 0.5);
        this.door.body.setSize(48, 48, true);
        this.door.body.setOffset(-16, -16);

        console.log('Level generation complete');
    }

    collectKey(player, key) {
        this.hasKey = true;
        key.destroy();
        
        // Play collection effect
        this.tweens.add({
            targets: this.door,
            scaleX: this.SCALE * 1.2,
            scaleY: this.SCALE * 1.2,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                // Update door sprite to show it's unlocked
                this.door.setFrame(this.TILES.DOOR.UNLOCKED);
            }
        });
    }

    tryEnterDoor(player, door) {
        if (this.hasKey) {
            // Prevent multiple triggers
            this.hasKey = false;
            
            // Show open animation
            door.setFrame(this.TILES.DOOR.OPEN);
            
            // Stop player movement
            this.player.setVelocity(0, 0);
            this.player.body.enable = false;
            
            // Play enter door animation
            this.tweens.add({
                targets: this.player,
                x: door.x,
                y: door.y,
                scaleX: 0,
                scaleY: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    // Restart level after animation
                    this.scene.restart();
                }
            });
        }
    }

    handleEnemyCollision(player, enemy) {
        if (!enemy.isDead) {
            this.scene.restart();
        }
    }

    update() {
        const time = this.time.now;
        const onGround = this.player.body.touching.down;
        
        // Update grounded time for coyote time
        if (onGround) {
            this.lastGroundedTime = time;
            this.player.body.setDragX(this.DRAG);
        } else {
            this.player.body.setDragX(this.AIR_DRAG);
        }

        // Handle jump input buffering
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.lastJumpPressedTime = time;
        }

        // Determine if we can jump (either on ground or within coyote time)
        const canJump = (time - this.lastGroundedTime <= this.COYOTE_TIME);
        
        // Check for buffered jump or regular jump
        if (time - this.lastJumpPressedTime <= this.JUMP_BUFFER_TIME && canJump) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
            this.player.setFrame(this.TILES.PLAYER.JUMP);
            this.lastJumpPressedTime = 0; // Clear the buffer
            this.lastGroundedTime = 0;    // Clear coyote time
        }

        // Variable jump height
        if (!this.cursors.up.isDown && this.player.body.velocity.y < this.MIN_JUMP_VELOCITY) {
            this.player.body.velocity.y = this.MIN_JUMP_VELOCITY;
        }

        // Horizontal movement with air control
        const acceleration = onGround ? this.ACCELERATION : this.AIR_ACCELERATION;
        const maxSpeed = onGround ? this.WALK_SPEED : (this.WALK_SPEED * this.AIR_CONTROL);

        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-acceleration);
            this.player.setFlipX(true);
            if (onGround) {
                this.player.anims.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(acceleration);
            this.player.setFlipX(false);
            if (onGround) {
                this.player.anims.play('walk', true);
            }
        } else {
            this.player.setAccelerationX(0);
            if (onGround) {
                this.player.setFrame(this.TILES.PLAYER.IDLE);
                this.player.anims.stop();
            }
        }

        // Cap horizontal speed
        if (Math.abs(this.player.body.velocity.x) > maxSpeed) {
            this.player.body.velocity.x = Math.sign(this.player.body.velocity.x) * maxSpeed;
        }

        // Update jump animation
        if (!onGround) {
            this.player.setFrame(this.TILES.PLAYER.JUMP);
        }

        // Update crawler animations and movement
        this.crawlers.getChildren().forEach(crawler => {
            if (crawler.update) {
                crawler.update();
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false // Enable debug mode to see physics bodies
        }
    },
    scene: MainScene
};

new Phaser.Game(config); 