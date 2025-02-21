import TileManifest from '../../tileManifest.js';
const { TILES } = TileManifest;

export class Fireball {
    constructor(scene, x, y, direction) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'tilemap', 20); // Projectile small
        this.setupSprite(direction);
        this.bounceCount = 0;
        this.maxBounces = 3;
    }

    setupSprite(direction) {
        this.sprite.setScale(this.scene.SCALE * 0.75);
        this.sprite.setVelocity(direction * 400, -200);
        this.sprite.setBounce(0.6);
        this.sprite.setAngularVelocity(direction * 360);
        this.sprite.body.setGravityY(400);
        
        // Add collision with platforms
        this.scene.physics.add.collider(
            this.sprite, 
            this.scene.platforms, 
            this.handleBounce,
            null,
            this
        );
        
        console.log('Setting up fireball-enemy collision');
        
        // Add collision with enemies
        this.scene.physics.add.overlap(
            this.sprite,
            this.scene.crawlers,
            (fireball, enemy) => {
                console.log('Fireball hit enemy:', enemy);
                this.handleEnemyHit(fireball, enemy);
            },
            null,
            this
        );
        
        // Add particle effects
        this.emitter = this.scene.add.particles(0, 0, 'tilemap', {
            frame: 20, // Projectile small
            lifespan: 500,
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            quantity: 1,
            blendMode: 'ADD'
        });
        
        this.emitter.startFollow(this.sprite);
    }

    handleBounce() {
        console.log('Fireball bounced:', this.bounceCount);
        this.bounceCount++;
        if (this.bounceCount >= this.maxBounces) {
            this.destroy();
        }
    }

    handleEnemyHit(fireball, enemy) {
        console.log('handleEnemyHit called with enemy:', enemy);
        if (!enemy.isDead) {
            console.log('Enemy is not dead, attempting to kill');
            // Get the crawler instance from the sprite
            const crawler = enemy.crawler;
            if (crawler && crawler.die) {
                console.log('Found crawler instance, calling die()');
                crawler.die();
            } else {
                console.log('No crawler instance found on enemy sprite');
            }
            this.destroy();
        } else {
            console.log('Enemy was already dead');
        }
    }

    update() {
        // Check if fireball is too far from player
        const distanceFromPlayer = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            this.scene.player.sprite.x,
            this.scene.player.sprite.y
        );
        
        if (distanceFromPlayer > 1000) {
            this.destroy();
        }
    }

    destroy() {
        this.emitter.destroy();
        this.sprite.destroy();
    }
} 