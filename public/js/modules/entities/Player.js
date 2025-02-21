import { MOVEMENT_CONFIG } from '../config.js';
import TileManifest from '../../tileManifest.js';
import { PowerManager } from './PowerManager.js';
import { Fireball } from './Fireball.js';
import { IceBlock } from './IceBlock.js';

const { TILES } = TileManifest;

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'tilemap', TILES.PLAYER.DEFAULT.IDLE);
        this.lastGroundedTime = 0;
        this.lastJumpPressedTime = 0;
        this.setupSprite();
        this.createAnimations();
        
        // Add shift key for running
        this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        // Add spacebar for abilities
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Initialize power manager
        this.powerManager = new PowerManager(this);
        
        // Track active fireballs
        this.activeFireballs = [];
    }

    setupSprite() {
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setScale(this.scene.SCALE);
        this.sprite.setDepth(1);
        this.sprite.setOrigin(0.5, 0.5);
        
        // Set up physics body to match 16x16 sprite size
        this.sprite.body.setSize(16, 16); // Base sprite size without scaling
        this.sprite.body.setOffset(0, 0);
        
        this.sprite.body.setMaxVelocity(MOVEMENT_CONFIG.RUN_SPEED, 800);
        this.sprite.body.setDragX(MOVEMENT_CONFIG.DRAG);
        
        if (this.scene.physics.config.debug) {
            console.log('Player physics body:', {
                width: this.sprite.body.width,
                height: this.sprite.body.height,
                offset: this.sprite.body.offset,
                scale: this.sprite.scale
            });
        }
    }

    createAnimations() {
        const createAnim = (key, type, frameRate = 6) => {
            if (!this.scene.anims.exists(key)) {
                this.scene.anims.create({
                    key,
                    frames: [
                        { key: 'tilemap', frame: type.WALK.START },
                        { key: 'tilemap', frame: type.WALK.END }
                    ],
                    frameRate,
                    repeat: -1
                });
            }
        };

        // Create animations for all character types
        createAnim('walk', TILES.PLAYER.DEFAULT);
        createAnim('emerald-walk', TILES.PLAYER.EMERALD);
        createAnim('ruby-walk', TILES.PLAYER.RUBY);
        createAnim('diamond-walk', TILES.PLAYER.DIAMOND);

        const createRunAnim = (key, type, frameRate = 10) => {
            if (!this.scene.anims.exists(key)) {
                this.scene.anims.create({
                    key,
                    frames: [
                        { key: 'tilemap', frame: type.RUN.START },
                        { key: 'tilemap', frame: type.RUN.START },
                        { key: 'tilemap', frame: type.RUN.END },
                        { key: 'tilemap', frame: type.RUN.END }
                    ],
                    frameRate,
                    repeat: -1
                });
            }
        };

        // Create run animations for all character types
        createRunAnim('run', TILES.PLAYER.DEFAULT);
        createRunAnim('emerald-run', TILES.PLAYER.EMERALD);
        createRunAnim('ruby-run', TILES.PLAYER.RUBY);
        createRunAnim('diamond-run', TILES.PLAYER.DIAMOND);
    }

    update(time, cursors) {
        const onGround = this.sprite.body.touching.down;
        const isRunning = this.shiftKey.isDown;
        
        // Update power manager for shield rotation
        this.powerManager.update();
        
        // Handle ability activation
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.useAbility();
        }
        
        // Update active fireballs
        this.activeFireballs = this.activeFireballs.filter(fireball => {
            if (fireball.sprite.active) {
                fireball.update();
                return true;
            }
            return false;
        });
        
        if (onGround) {
            this.lastGroundedTime = time;
            this.sprite.body.setDragX(MOVEMENT_CONFIG.DRAG);
        } else {
            this.sprite.body.setDragX(MOVEMENT_CONFIG.AIR_DRAG);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.lastJumpPressedTime = time;
        }

        const canJump = (time - this.lastGroundedTime <= MOVEMENT_CONFIG.COYOTE_TIME);
        
        if (time - this.lastJumpPressedTime <= MOVEMENT_CONFIG.JUMP_BUFFER_TIME && canJump) {
            this.sprite.setVelocityY(MOVEMENT_CONFIG.JUMP_VELOCITY);
            this.setJumpFrame();
            this.lastJumpPressedTime = 0;
            this.lastGroundedTime = 0;
        }

        if (!cursors.up.isDown && this.sprite.body.velocity.y < MOVEMENT_CONFIG.MIN_JUMP_VELOCITY) {
            this.sprite.body.velocity.y = MOVEMENT_CONFIG.MIN_JUMP_VELOCITY;
        }

        const acceleration = onGround ? MOVEMENT_CONFIG.ACCELERATION : MOVEMENT_CONFIG.AIR_ACCELERATION;
        const baseSpeed = isRunning ? MOVEMENT_CONFIG.RUN_SPEED : MOVEMENT_CONFIG.WALK_SPEED;
        const maxSpeed = onGround ? baseSpeed : (baseSpeed * MOVEMENT_CONFIG.AIR_CONTROL);

        if (cursors.left.isDown) {
            this.sprite.setAccelerationX(-acceleration);
            this.sprite.setFlipX(true);
            if (onGround) {
                this.playMovementAnimation(isRunning);
            }
        } else if (cursors.right.isDown) {
            this.sprite.setAccelerationX(acceleration);
            this.sprite.setFlipX(false);
            if (onGround) {
                this.playMovementAnimation(isRunning);
            }
        } else {
            this.sprite.setAccelerationX(0);
            if (onGround) {
                this.setIdleFrame();
                this.sprite.anims.stop();
            }
        }

        if (Math.abs(this.sprite.body.velocity.x) > maxSpeed) {
            this.sprite.body.velocity.x = Math.sign(this.sprite.body.velocity.x) * maxSpeed;
        }

        if (!onGround) {
            this.setJumpFrame();
        }
    }

    useAbility() {
        const power = this.powerManager.getCurrentPower();
        switch (power) {
            case 'RUBY':
                this.shootFireball();
                break;
            case 'DIAMOND':
                this.createIceBlock();
                break;
            // Emerald is passive, no active ability needed
        }
    }

    shootFireball() {
        const direction = this.sprite.flipX ? -1 : 1;
        const fireball = new Fireball(
            this.scene,
            this.sprite.x + (direction * 30),
            this.sprite.y,
            direction
        );
        this.activeFireballs.push(fireball);
    }

    createIceBlock() {
        const direction = this.sprite.flipX ? -1 : 1;
        const iceBlock = new IceBlock(
            this.scene,
            this.sprite.x + (direction * 48),
            this.sprite.y
        );
        this.powerManager.setActiveIceBlock(iceBlock);
    }

    collectGem(type) {
        console.log('Collecting gem:', type);
        this.powerManager.transformPlayer(type);
    }

    handleEnemyCollision(enemy) {
        console.log('Enemy collision detected');
        console.log('Current power:', this.powerManager.getCurrentPower());
        
        if (!this.powerManager.handleHit(enemy)) {
            console.log('Hit not blocked, player dies');
            this.die();
        } else {
            console.log('Hit blocked and enemy destroyed');
        }
    }

    setIdleFrame() {
        const power = this.powerManager.getCurrentPower();
        switch (power) {
            case 'EMERALD':
                this.sprite.setFrame(TILES.PLAYER.EMERALD.IDLE);
                break;
            case 'RUBY':
                this.sprite.setFrame(TILES.PLAYER.RUBY.IDLE);
                break;
            case 'DIAMOND':
                this.sprite.setFrame(TILES.PLAYER.DIAMOND.IDLE);
                break;
            default:
                this.sprite.setFrame(TILES.PLAYER.DEFAULT.IDLE);
        }
    }

    setJumpFrame() {
        const power = this.powerManager.getCurrentPower();
        switch (power) {
            case 'EMERALD':
                this.sprite.setFrame(TILES.PLAYER.EMERALD.JUMP);
                break;
            case 'RUBY':
                this.sprite.setFrame(TILES.PLAYER.RUBY.JUMP);
                break;
            case 'DIAMOND':
                this.sprite.setFrame(TILES.PLAYER.DIAMOND.JUMP);
                break;
            default:
                this.sprite.setFrame(TILES.PLAYER.DEFAULT.JUMP);
        }
    }

    playMovementAnimation(isRunning) {
        const power = this.powerManager.getCurrentPower();
        let animPrefix = '';
        
        switch (power) {
            case 'EMERALD':
                animPrefix = 'emerald-';
                break;
            case 'RUBY':
                animPrefix = 'ruby-';
                break;
            case 'DIAMOND':
                animPrefix = 'diamond-';
                break;
            default:
                animPrefix = '';
        }
        
        const animKey = `${animPrefix}${isRunning ? 'run' : 'walk'}`;
        this.sprite.anims.play(animKey, true);
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
                this.powerManager.clearCurrentPower();
                this.scene.scene.restart();
            }
        });
    }

    die() {
        console.log('Player died');
        this.sprite.body.enable = false;
        
        const bodySprite = this.scene.add.sprite(
            this.sprite.x,
            this.sprite.y,
            'tilemap',
            TILES.PLAYER.DEFAULT.PRONE
        );
        bodySprite.setScale(this.scene.SCALE);
        bodySprite.setFlipX(this.sprite.flipX);
        
        this.sprite.setFrame(TILES.PLAYER.DEFAULT.PRONE);
        
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            y: this.sprite.y - 40,
            duration: 1000,
            ease: 'Quad.easeOut',
            onComplete: () => {
                bodySprite.destroy();
                this.powerManager.clearCurrentPower();
                this.scene.scene.restart();
                this.scene.currentLevel = 1;
            }
        });
    }
} 