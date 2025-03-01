export const GAME_CONFIG = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    }
};

export const MOVEMENT_CONFIG = {
    WALK_SPEED: 150,          // Reduced from 200 for slower walking
    RUN_SPEED: 350,          // New constant for running
    JUMP_VELOCITY: -460,      // Initial jump force
    AIR_CONTROL: 0.8,         // Air movement multiplier
    ACCELERATION: 1500,       // Ground acceleration
    AIR_ACCELERATION: 1200,   // Air acceleration
    DRAG: 1600,               // Ground friction
    AIR_DRAG: 400,            // Air resistance
    COYOTE_TIME: 150,         // Time in ms player can jump after leaving platform
    JUMP_BUFFER_TIME: 150,    // Time in ms to buffer a jump input before landing
    MIN_JUMP_VELOCITY: -200   // Minimum jump velocity for tap jumps
};

export const LEVEL_CONFIG = {
    SCALE: 3,
    TILE_SIZE: 16 * 3, // 16 * SCALE
    CANVAS_WIDTH: 1200,
    LEVEL_WIDTH: 2400,
    LEVEL_HEIGHT: 850,
    MIN_PLATFORMS: 12,
    MAX_PLATFORMS: 16,
    PLATFORM_MIN_WIDTH: 2,
    PLATFORM_MAX_WIDTH: 4
}; 