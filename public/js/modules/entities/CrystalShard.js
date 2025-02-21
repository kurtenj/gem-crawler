import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class CrystalShard {
    constructor(scene, player, index) {
        this.scene = scene;
        this.player = player;
        this.index = index; // 0, 1, or 2 for positioning
        this.rotationRadius = 32; // Distance from player
        this.rotationSpeed = 0.02; // Radians per frame
        this.isActive = true;
        
        // Create the sprite
        this.sprite = scene.add.sprite(0, 0, 'tilemap', TILES.BASIC.COLLECTIBLE.EMERALD.TINY);
        this.sprite.setScale(scene.SCALE * 0.75);
        this.sprite.setTint(0x00FF00);
        
        // Create particle emitter for effects
        this.createParticles();
        
        // Set initial position
        this.updatePosition(0);
    }

    createParticles() {
        this.emitter = this.scene.add.particles(0, 0, 'tilemap', {
            frame: TILES.BASIC.COLLECTIBLE.EMERALD.TINY,
            lifespan: 400,
            speed: { min: 20, max: 40 },
            scale: { start: 0.4, end: 0 },
            quantity: 1,
            frequency: 200,
            alpha: { start: 0.5, end: 0 },
            tint: 0x00FF00
        });
    }

    updatePosition(baseRotation) {
        if (!this.isActive) return;
        
        // Calculate position around player
        const angle = baseRotation + (this.index * ((2 * Math.PI) / 3));
        const x = this.player.sprite.x + (Math.cos(angle) * this.rotationRadius);
        const y = this.player.sprite.y + (Math.sin(angle) * this.rotationRadius);
        
        this.sprite.setPosition(x, y);
        this.sprite.setRotation(angle);
        
        if (this.emitter) {
            this.emitter.setPosition(x, y);
        }
    }

    break() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Create break effect
        const breakEmitter = this.scene.add.particles(0, 0, 'tilemap', {
            frame: TILES.BASIC.COLLECTIBLE.EMERALD.TINY,
            lifespan: 500,
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            quantity: 8,
            alpha: { start: 1, end: 0 },
            tint: 0x00FF00,
            emitting: false
        });
        
        breakEmitter.setPosition(this.sprite.x, this.sprite.y);
        breakEmitter.explode(8);
        
        // Clean up after break effect
        this.scene.time.delayedCall(500, () => {
            breakEmitter.destroy();
        });
        
        // Hide the shard
        this.sprite.setVisible(false);
        if (this.emitter) {
            this.emitter.destroy();
            this.emitter = null;
        }
    }

    destroy() {
        if (this.emitter) {
            this.emitter.destroy();
        }
        this.sprite.destroy();
    }
} 