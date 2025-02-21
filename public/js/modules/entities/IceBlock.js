import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class IceBlock {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'tilemap', 91); // Box selected glass
        this.setupSprite();
    }

    setupSprite() {
        console.log('Setting up ice block');
        this.sprite.setScale(this.scene.SCALE);
        this.sprite.setTint(0x88FFFF);
        this.sprite.setAlpha(0.8);
        this.sprite.setBounce(0);
        this.sprite.body.setGravityY(600);
        this.sprite.setOrigin(0.5, 0.5);
        
        // Set up physics body to match 16x16 sprite size
        this.sprite.body.setSize(16, 16); // Base sprite size without scaling
        this.sprite.body.setOffset(0, 0);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setImmovable(false);
        
        if (this.scene.physics.config.debug) {
            console.log('Ice block physics body:', {
                width: this.sprite.body.width,
                height: this.sprite.body.height,
                offset: this.sprite.body.offset,
                scale: this.sprite.scale
            });
        }
        
        // Add collision with platforms - using a more robust collider setup
        const platformCollider = this.scene.physics.add.collider(
            this.sprite, 
            this.scene.platforms,
            (iceBlock, platform) => {
                console.log('Ice block collided with platform:', {
                    iceBlockY: iceBlock.y,
                    platformY: platform.y,
                    velocity: iceBlock.body.velocity.y
                });
                
                // Ensure the ice block stops when landing
                if (iceBlock.body.touching.down) {
                    iceBlock.body.setVelocityY(0);
                    iceBlock.body.setAccelerationY(0);
                    // Add a bit of friction to prevent sliding
                    iceBlock.body.setDragX(100);
                }
            }
        );
        
        // Add collision with enemies
        this.scene.physics.add.collider(
            this.sprite,
            this.scene.crawlers,
            (iceBlock, enemy) => {
                console.log('Ice block collided with enemy');
                // Get the crawler instance from the sprite
                const crawler = enemy.crawler;
                if (crawler) {
                    // Create an ice particle effect
                    this.createIceEffect(enemy.x, enemy.y);
                    // Force the crawler to change direction
                    crawler.changeDirection();
                }
            }
        );
        
        // Add collision with player
        this.scene.physics.add.collider(
            this.sprite,
            this.scene.player.sprite,
            (iceBlock, player) => {
                console.log('Ice block collided with player');
            }
        );
        
        // Add particle effects for a frosty appearance
        this.emitter = this.scene.add.particles(0, 0, 'tilemap', {
            frame: 91, // Box selected glass
            lifespan: 2000,
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            quantity: 1,
            frequency: 500,
            alpha: { start: 0.5, end: 0 },
            tint: 0x88FFFF
        });
        
        this.emitter.startFollow(this.sprite);
        
        // Initially disable physics until spawn animation completes
        this.sprite.body.enable = false;
        this.sprite.setScale(0);
        
        // Add spawn effect with modified physics enabling
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.scene.SCALE,
            scaleY: this.scene.SCALE,
            alpha: 0.8,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                console.log('Ice block spawn animation complete, enabling physics');
                // Enable physics and ensure proper setup
                this.sprite.body.enable = true;
                this.sprite.body.reset(this.sprite.x, this.sprite.y);
                // Set initial velocity to ensure physics system properly activates
                this.sprite.body.setVelocity(0, 10);
            }
        });
    }

    createIceEffect(x, y) {
        // Create a burst of ice particles when enemies hit the block
        const iceEmitter = this.scene.add.particles(x, y, 'tilemap', {
            frame: 91, // Box selected glass
            lifespan: 400,
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            quantity: 8,
            alpha: { start: 0.8, end: 0 },
            tint: 0x88FFFF,
            emitting: false
        });
        
        // Explode the particles
        iceEmitter.explode(8);
        
        // Clean up the emitter after the effect
        this.scene.time.delayedCall(400, () => {
            iceEmitter.destroy();
        });
    }

    update() {
        // Add any update logic here if needed
    }

    destroy() {
        // Add destruction effect
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.emitter.destroy();
                this.sprite.destroy();
            }
        });
    }
} 