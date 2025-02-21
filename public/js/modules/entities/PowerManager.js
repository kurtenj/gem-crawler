import TileManifest from '../../tileManifest.js';
import { CrystalShard } from './CrystalShard.js';
const { TILES } = TileManifest;

export class PowerManager {
    constructor(player) {
        this.player = player;
        this.scene = player.scene;
        this.currentPower = 'DEFAULT';
        this.activeIceBlock = null;
        this.crystalShards = [];
        this.baseRotation = 0;
    }

    transformPlayer(powerType) {
        console.log('Transforming player to:', powerType);
        // Clear any existing power effects
        this.clearCurrentPower();
        
        this.currentPower = powerType;
        
        // Update player sprite and set up power-specific properties
        switch (powerType) {
            case 'EMERALD':
                console.log('Setting up crystal shield');
                this.player.sprite.setFrame(TILES.PLAYER.EMERALD.IDLE);
                this.player.sprite.setTint(0x00FF00); // Green tint
                this.createCrystalShield();
                break;
            case 'RUBY':
                this.player.sprite.setFrame(TILES.PLAYER.RUBY.IDLE);
                this.player.sprite.setTint(0xFF0000); // Red tint
                break;
            case 'DIAMOND':
                this.player.sprite.setFrame(TILES.PLAYER.DIAMOND.IDLE);
                this.player.sprite.setTint(0x00FFFF); // Light blue tint
                break;
            default:
                this.player.sprite.setFrame(TILES.PLAYER.DEFAULT.IDLE);
                this.player.sprite.clearTint();
        }

        // Update UI
        this.scene.ui.setGemStatus('emerald', powerType === 'EMERALD');
        this.scene.ui.setGemStatus('ruby', powerType === 'RUBY');
        this.scene.ui.setGemStatus('diamond', powerType === 'DIAMOND');
    }

    createCrystalShield() {
        // Create three crystal shards
        for (let i = 0; i < 3; i++) {
            const shard = new CrystalShard(this.scene, this.player, i);
            this.crystalShards.push(shard);
        }
    }

    update() {
        if (this.currentPower === 'EMERALD' && this.crystalShards.length > 0) {
            // Update shield rotation
            this.baseRotation += 0.02; // Rotate speed
            this.crystalShards.forEach(shard => shard.updatePosition(this.baseRotation));
        }
    }

    clearCurrentPower() {
        console.log('Clearing current power');
        // Clean up any active power effects
        if (this.activeIceBlock) {
            this.activeIceBlock.destroy();
            this.activeIceBlock = null;
        }
        
        // Clean up crystal shards
        this.crystalShards.forEach(shard => shard.destroy());
        this.crystalShards = [];
        
        this.currentPower = 'DEFAULT';
        this.player.sprite.clearTint();
        
        // Reset UI
        this.scene.ui.setGemStatus('emerald', false);
        this.scene.ui.setGemStatus('ruby', false);
        this.scene.ui.setGemStatus('diamond', false);
    }

    handleHit(enemy) {
        console.log('Handling hit with power state:', {
            currentPower: this.currentPower,
            activeShards: this.crystalShards.filter(s => s.isActive).length
        });
        
        if (this.currentPower === 'EMERALD') {
            // Find first active shard
            const activeShard = this.crystalShards.find(shard => shard.isActive);
            if (activeShard) {
                console.log('Breaking crystal shard to block damage');
                // Kill the enemy
                if (enemy && enemy.crawler && !enemy.isDead) {
                    enemy.crawler.die();
                }
                // Break the shard
                activeShard.break();
                return true; // Hit was blocked
            }
        }
        
        console.log('Hit not blocked');
        return false; // Hit was not blocked
    }

    getCurrentPower() {
        return this.currentPower;
    }

    setActiveIceBlock(iceBlock) {
        if (this.activeIceBlock) {
            this.activeIceBlock.destroy();
        }
        this.activeIceBlock = iceBlock;
    }
} 