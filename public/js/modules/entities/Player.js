import { MOVEMENT_CONFIG } from '../config.js';
import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'tilemap', TILES.PLAYER.IDLE);
        this.lastGroundedTime = 0;
        this.lastJumpPressedTime = 0;
        this.setupSprite();
        this.createAnimations();
    }

    setupSprite() {
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setScale(this.scene.SCALE);
        this.sprite.setDepth(1);
        this.sprite.setOrigin(0.5, 0.5);
        
        // Set exact 48x48 collision box
        this.sprite.body.setSize(16, 16); // 16x16 is the base sprite size
        this.sprite.body.setOffset(0, 0); // Center the collision box
        this.sprite.body.setMaxVelocity(MOVEMENT_CONFIG.WALK_SPEED, 800);
        this.sprite.body.setDragX(MOVEMENT_CONFIG.DRAG);
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'walk',
            frames: [
                { key: 'tilemap', frame: TILES.PLAYER.WALK_1 },
                { key: 'tilemap', frame: TILES.PLAYER.WALK_2 }
            ],
            frameRate: 8,
            repeat: -1
        });
    }

    update(time, cursors) {
        const onGround = this.sprite.body.touching.down;
        
        // Update grounded time for coyote time
        if (onGround) {
            this.lastGroundedTime = time;
            this.sprite.body.setDragX(MOVEMENT_CONFIG.DRAG);
        } else {
            this.sprite.body.setDragX(MOVEMENT_CONFIG.AIR_DRAG);
        }

        // Handle jump input buffering
        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.lastJumpPressedTime = time;
        }

        // Determine if we can jump (either on ground or within coyote time)
        const canJump = (time - this.lastGroundedTime <= MOVEMENT_CONFIG.COYOTE_TIME);
        
        // Check for buffered jump or regular jump
        if (time - this.lastJumpPressedTime <= MOVEMENT_CONFIG.JUMP_BUFFER_TIME && canJump) {
            this.sprite.setVelocityY(MOVEMENT_CONFIG.JUMP_VELOCITY);
            this.sprite.setFrame(TILES.PLAYER.JUMP);
            this.lastJumpPressedTime = 0; // Clear the buffer
            this.lastGroundedTime = 0;    // Clear coyote time
        }

        // Variable jump height
        if (!cursors.up.isDown && this.sprite.body.velocity.y < MOVEMENT_CONFIG.MIN_JUMP_VELOCITY) {
            this.sprite.body.velocity.y = MOVEMENT_CONFIG.MIN_JUMP_VELOCITY;
        }

        // Horizontal movement with air control
        const acceleration = onGround ? MOVEMENT_CONFIG.ACCELERATION : MOVEMENT_CONFIG.AIR_ACCELERATION;
        const maxSpeed = onGround ? MOVEMENT_CONFIG.WALK_SPEED : (MOVEMENT_CONFIG.WALK_SPEED * MOVEMENT_CONFIG.AIR_CONTROL);

        if (cursors.left.isDown) {
            this.sprite.setAccelerationX(-acceleration);
            this.sprite.setFlipX(true);
            if (onGround) {
                this.sprite.anims.play('walk', true);
            }
        } else if (cursors.right.isDown) {
            this.sprite.setAccelerationX(acceleration);
            this.sprite.setFlipX(false);
            if (onGround) {
                this.sprite.anims.play('walk', true);
            }
        } else {
            this.sprite.setAccelerationX(0);
            if (onGround) {
                this.sprite.setFrame(TILES.PLAYER.IDLE);
                this.sprite.anims.stop();
            }
        }

        // Cap horizontal speed
        if (Math.abs(this.sprite.body.velocity.x) > maxSpeed) {
            this.sprite.body.velocity.x = Math.sign(this.sprite.body.velocity.x) * maxSpeed;
        }

        // Update jump animation
        if (!onGround) {
            this.sprite.setFrame(TILES.PLAYER.JUMP);
        }
    }

    enterDoor(door) {
        this.sprite.setVelocity(0, 0);
        this.sprite.body.enable = false;
        
        this.scene.tweens.add({
            targets: this.sprite,
            x: door.x,
            y: door.y,
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.scene.scene.restart();
            }
        });
    }

    die() {
        // Disable physics and input during death animation
        this.sprite.body.enable = false;
        
        // Create the "body" sprite that stays on the ground
        const bodySprite = this.scene.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'tilemap',
            TILES.PLAYER.PRONE
        );
        bodySprite.setScale(this.scene.SCALE);
        bodySprite.setFlipX(this.sprite.flipX);
        
        // Set the main sprite to be the "soul" that floats up
        this.sprite.setFrame(TILES.PLAYER.PRONE);
        
        // Soul rising animation
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            y: this.sprite.y - 40,
            duration: 1000,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Clean up and reset the scene after animation
                bodySprite.destroy();
                this.scene.scene.restart();
                this.scene.currentLevel = 1;
            }
        });
    }
} 