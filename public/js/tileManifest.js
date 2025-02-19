// Tile Manifest for 20x20 tilemap (320x320px, 16x16px per tile)
const TileManifest = {
    // Semantic grouping of tiles
    TILES: {
        BASIC: {
            BLANK: 0,
            SMALL_COIN: 1,
            LARGE_COIN: 2,
            EMERALD: {
                TINY: 20,
                SMALL: 21,
                LARGE: 22
            },
            HEART: {
                TINY: 40,
                SMALL: 41,
                LARGE: 42
            }
        },
        PLATFORM: {
            SINGLE: 63,  // Using the floating platform default single tile
            LEFT: 64,    // Using the floating platform default left tile
            CENTER: 65,  // Using the floating platform default center tile
            RIGHT: 66    // Using the floating platform default right tile
        },
        PLAYER: {
            IDLE: 240,      // Player default idle
            WALK_1: 241,    // Player default walk start
            WALK_2: 242,    // Player default walk end
            JUMP: 245,      // Player default jump
            PRONE: 246      // Player default prone
        },
        CRAWLER: {
            IDLE: 320,      // Enemy crawler idle
            WALK_1: 321,    // Enemy crawler walk start
            WALK_2: 322,    // Enemy crawler walk end
            JUMP: 323,      // Enemy crawler jump
            DEAD: 324       // Enemy crawler dead
        },
        DOOR: {
            LOCKED: 57,     // Door locked closed
            UNLOCKED: 56,   // Door unlocked closed
            OPEN: 58        // Door unlocked open
        },
        KEY: 96,            // Key large
        STRUCTURAL: {
            CHAIN: {
                TOP: 3,
                CENTER: 23,
                BOTTOM: 43,
                BROKEN: 4
            },
            HANGING_PLATFORM: {
                TOP: 5,
                CENTER: {
                    LEFT: 24,
                    MIDDLE: 25,
                    RIGHT: 26
                },
                BOTTOM: {
                    LEFT: 44,
                    CENTER: 45,
                    RIGHT: 46
                }
            },
            FLOATING_PLATFORM: {
                DEFAULT: {
                    SINGLE: 63,
                    LEFT: 64,
                    CENTER: 65,
                    RIGHT: 66
                },
                CRUMBLY: {
                    SINGLE: 83,
                    LEFT: 84,
                    CENTER: 85,
                    RIGHT: 86
                },
                RIGID: {
                    SINGLE: 103,
                    LEFT: 104,
                    CENTER: 105,
                    RIGHT: 106
                },
                CONVEYOR: {
                    SINGLE: 123,
                    LEFT: 124,
                    CENTER: 125,
                    RIGHT: 126
                },
                STICKY: {
                    SINGLE: 143,
                    LEFT: 144,
                    CENTER: 145,
                    RIGHT: 146
                },
                PIPE: {
                    LEFT: 147,
                    CENTER: 148,
                    RIGHT: 149
                },
                BRANCH: {
                    LEFT: 167,
                    CENTER: 168,
                    RIGHT: 169
                }
            },
            LADDER: {
                THICK: {
                    TOP: 60,
                    CENTER: 80,
                    BOTTOM: 100,
                    BASE: 120
                },
                THIN: {
                    TOP: 61,
                    CENTER: 81,
                    BOTTOM: 101,
                    BASE: 121
                }
            },
            TRAMPOLINE: {
                IDLE: 163,
                MID: 164,
                FULL: 165
            },
            STALACTITES: 166,
            SPIKES: {
                BASE: 122
            },
            HOOK: {
                TOP: 6
            }
        },
        BOXES: {
            SELECTED: {
                FULL: {
                    EXCLAMATION: 7,
                    COIN: 8,
                    PLAIN: 9,
                    X_MARK: 10
                },
                EMPTY: {
                    EXCLAMATION: 27,
                    COIN: 28,
                    PLAIN: 29,
                    X_MARK: 30
                },
                REINFORCED_EMPTY: 11,
                CHECKERED: 51
            },
            UNSELECTED: {
                FULL: {
                    EXCLAMATION: 47,
                    COIN: 48,
                    PLAIN: 49,
                    X_MARK: 50
                },
                REINFORCED_EMPTY: 31
            }
        },
        SCENERY: {
            BILLBOARD: {
                TOP: 12,
                CENTER: 32,
                BOTTOM: 52
            },
            MOUND: 13,
            TREE: {
                TOP: {
                    ROUND: 14,
                    POINTY: 15
                },
                TRUNK: {
                    VARIANT_1: 34,
                    VARIANT_2: 35,
                    VARIANT_3: 55
                }
            },
            FLORA: {
                FLOWER: {
                    SMALL: 16,
                    LARGE: 17
                },
                GRASS: {
                    SMALL: 38,
                    LARGE: 18
                },
                VINE: {
                    SMALL: 39,
                    LARGE: 19
                },
                SHRUB: {
                    POINTY: 33
                },
                SPROUT: {
                    SMALL: 36,
                    LARGE: 37
                },
                MUSHROOM: {
                    SINGLE: 53,
                    GROUP: 54
                }
            }
        },
        ENEMIES: {
            WALKER: {
                IDLE: 340,
                WALK: {
                    START: 341,
                    END: 342
                },
                JUMP: 343,
                DEAD: 344
            },
            ARMORED: {
                IDLE: 360,
                WALK: {
                    START: 361,
                    END: 362
                },
                JUMP: 363,
                DEAD: 364
            },
            FLYER: {
                FLY: {
                    START: 383,
                    END: 384,
                    DEAD: 385
                }
            },
            PARASHOOT: 386
        },
        INTERACTIVE: {
            FAN: {
                SIDE: {
                    LEFT: 387,
                    RIGHT: 388
                }
            },
            CHEST: {
                CLOSED: 389,
                OPEN: 390
            }
        },
        PROJECTILES: {
            TINY: 20,
            SMALL: 21,
            LARGE: 22
        },
        BACKGROUND: {
            MECHANICAL: {
                TOP: {
                    LEFT: 110,
                    CENTER: 111,
                    RIGHT: 112,
                    SINGLE: 113
                },
                CENTER: {
                    LEFT: 130,
                    CENTER: 131,
                    RIGHT: 132,
                    SINGLE: 133
                },
                BOTTOM: {
                    LEFT: 150,
                    CENTER: 151,
                    RIGHT: 152,
                    SINGLE: 153
                }
            },
            DIRT: {
                TOP: {
                    LEFT: 115,
                    CENTER: 116,
                    RIGHT: 117,
                    SINGLE: 118
                },
                CENTER: {
                    LEFT: 135,
                    CENTER: 136,
                    RIGHT: 137,
                    SINGLE: 138
                },
                BOTTOM: {
                    LEFT: 155,
                    CENTER: 156,
                    RIGHT: 157,
                    SINGLE: 158
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
        },
        FOREGROUND: {
            DIRT: {
                TOP: {
                    LEFT: 87,
                    CENTER: 88,
                    RIGHT: 89
                },
                CENTER: {
                    LEFT: 107,
                    CENTER: 108,
                    RIGHT: 109
                },
                BOTTOM: {
                    LEFT: 127,
                    CENTER: 128,
                    RIGHT: 129
                }
            }
        }
    },

    // Grid reference system
    GRID: {
        // Row 0 (0-19)
        ROW_0: {
            COL_0: 0,    // Description: Blank
            COL_1: 1,    // Description: Coin small
            COL_2: 2,    // Description: Coin large
            COL_3: 3,    // Description: Chain top
            COL_4: 4,    // Description: Chain broken
            COL_5: 5,    // Description: Hanging platform center top
            COL_6: 6,    // Description: Hook top
            COL_7: 7,    // Description: Box selected full exclamation
            COL_8: 8,    // Description: Box selected full coin
            COL_9: 9,    // Description: Box selected full plain
            COL_10: 10,  // Description: Box selected full X
            COL_11: 11,  // Description: Box selected reinforced empty
            COL_12: 12,  // Description: Billboard top
            COL_13: 13,  // Description: Mound
            COL_14: 14,  // Description: Tree top round
            COL_15: 15,  // Description: Tree top pointy
            COL_16: 16,  // Description: Flower small
            COL_17: 17,  // Description: Flower large
            COL_18: 18,  // Description: Grass large
            COL_19: 19   // Description: Vine large
        },

        // Row 1 (20-39)
        ROW_1: {
            COL_0: 20,   // Description: Projectile tiny
            COL_1: 21,   // Description: Projectile small
            COL_2: 22,   // Description: Projectile large
            COL_3: 23,   // Description: Chain center
            COL_4: 24,   // Description: Hanging platform center left
            COL_5: 25,   // Description: Hanging platform center
            COL_6: 26,   // Description: Hanging platform center right
            COL_7: 27,   // Description: Box selected empty exclamation
            COL_8: 28,   // Description: Box selected empty coin
            COL_9: 29,   // Description: Box selected empty plain
            COL_10: 30,  // Description: Box selected empty X
            COL_11: 31,  // Description: Box unselected reinforced empty
            COL_12: 32,  // Description: Billboard center
            COL_13: 33,  // Description: Shrub pointy
            COL_14: 34,  // Description: Tree trunk 1
            COL_15: 35,  // Description: Tree trunk 2
            COL_16: 36,  // Description: Sprout small
            COL_17: 37,  // Description: Sprout large
            COL_18: 38,  // Description: Grass small
            COL_19: 39   // Description: Vine small
        },

        // Row 2 (40-59)
        ROW_2: {
            COL_0: 40,   // Description: Heart tiny
            COL_1: 41,   // Description: Heart small
            COL_2: 42,   // Description: Heart large
            COL_3: 43,   // Description: Chain bottom
            COL_4: 44,   // Description: Hanging platform bottom left
            COL_5: 45,   // Description: Hanging platform bottom center
            COL_6: 46,   // Description: Hanging platform bottom right
            COL_7: 47,   // Description: Box unselected full exclamation
            COL_8: 48,   // Description: Box unselected full coin
            COL_9: 49,   // Description: Box unselected full plain
            COL_10: 50,  // Description: Box unselected full X
            COL_11: 51,  // Description: Box selected checkered
            COL_12: 52,  // Description: Billboard bottom
            COL_13: 53,  // Description: Mushroom single
            COL_14: 54,  // Description: Mushroom group
            COL_15: 55,  // Description: Tree trunk 3
            COL_16: 56,  // Description: Door unlocked closed
            COL_17: 57,  // Description: Door locked closed 
            COL_18: 58,  // Description: Door unlocked open
            COL_19: 59   // Description: Door locked open
        },

        // Row 3 (60-79)
        ROW_3: {
            COL_0: 60,   // Description: Ladder thick top
            COL_1: 61,   // Description: Ladder thin top
            COL_2: 62,   // Description: Emerald
            COL_3: 63,   // Description: Floating platform default single
            COL_4: 64,   // Description: Floating platform default left
            COL_5: 65,   // Description: Floating platform default center
            COL_6: 66,   // Description: Floating platform default right
            COL_7: 67,   // Description: Box unselected empty exclamation
            COL_8: 68,   // Description: Box unselected empty coin
            COL_9: 69,   // Description: Box unselected empty plain
            COL_10: 70,  // Description: Box unselected empty X
            COL_11: 71,  // Description: Map
            COL_12: 72,  // Description: Sign left
            COL_13: 73,  // Description: Sign right
            COL_14: 74,  // Description: Sign up
            COL_15: 75,  // Description: Sign down
            COL_16: 76,  // Description: Sign blank
            COL_17: 77,  // Description: Sign exclamation
            COL_18: 78,  // Description: Double door closed left
            COL_19: 79   // Description: Double door closed right
        },

        // Row 4 (80-99)
        ROW_4: {
            COL_0: 80,   // Description: Ladder thick center
            COL_1: 81,   // Description: Ladder thin center
            COL_2: 82,   // Description: Ruby
            COL_3: 83,   // Description: Floating platform crumbly single
            COL_4: 84,   // Description: Floating platform crumbly left
            COL_5: 85,   // Description: Floating platform crumbly center
            COL_6: 86,   // Description: Floating platform crumbly right
            COL_7: 87,   // Description: Foreground dirt top left
            COL_8: 88,   // Description: Foreground dirt top center
            COL_9: 89,   // Description: Foreground dirt top right
            COL_10: 90,  // Description: Box selected blank
            COL_11: 91,  // Description: Box selected glass
            COL_12: 92,  // Description: Left
            COL_13: 93,  // Description: Right
            COL_14: 94,  // Description: Up
            COL_15: 95,  // Description: Down
            COL_16: 96,  // Description: Key large
            COL_17: 97,  // Description: Key small
            COL_18: 98,  // Description: Double door open left
            COL_19: 99   // Description: Double door open right
        },

        // Row 5 (100-119)
        ROW_5: {
            COL_0: 100,   // Description: Ladder thick bottom
            COL_1: 101,   // Description: Ladder thin bottom
            COL_2: 102,   // Description: Diamond
            COL_3: 103,   // Description: Floating platform rigid single
            COL_4: 104,   // Description: Floating platform rigid left
            COL_5: 105,   // Description: Floating platform rigid center
            COL_6: 106,   // Description: Floating platform rigid right
            COL_7: 107,   // Description: Foreground dirt center left
            COL_8: 108,   // Description: Foreground dirt center center
            COL_9: 109,   // Description: Foreground dirt center right
            COL_10: 110,  // Description: Background mechanical top left
            COL_11: 111,  // Description: Background mechanical top center
            COL_12: 112,  // Description: Background mechanical top right
            COL_13: 113,  // Description: Background mechanical single top
            COL_14: 114,  // Description: Accent square top right
            COL_15: 115,  // Description: Background dirt top left
            COL_16: 116,  // Description: Background dirt top center
            COL_17: 117,  // Description: Background dirt top right
            COL_18: 118,  // Description: Background dirt single top
            COL_19: 119   // Description: Accent line top right
        },

        // Row 6 (120-139)
        ROW_6: {
            COL_0: 120,   // Description: Ladder thick base
            COL_1: 121,   // Description: Ladder thin base
            COL_2: 122,   // Description: Spikes base
            COL_3: 123,   // Description: Floating platform conveyor single
            COL_4: 124,   // Description: Floating platform conveyor left
            COL_5: 125,   // Description: Floating platform conveyor center
            COL_6: 126,   // Description: Floating platform conveyor right
            COL_7: 127,   // Description: Foreground dirt bottom left
            COL_8: 128,   // Description: Foreground dirt bottom center
            COL_9: 129,   // Description: Foreground dirt bottom right
            COL_10: 130,  // Description: Background mechanical center left
            COL_11: 131,  // Description: Background mechanical center center
            COL_12: 132,  // Description: Background mechanical center right
            COL_13: 133,  // Description: Background mechanical single center
            COL_14: 134,  // Description: Accent square bottom right
            COL_15: 135,  // Description: Background dirt center left
            COL_16: 136,  // Description: Background dirt center center
            COL_17: 137,  // Description: Background dirt center right
            COL_18: 138,  // Description: Background dirt single center
            COL_19: 139   // Description: Accent dot bottom right
        },

        // Row 7 (140-159)
        ROW_7: {
            COL_0: 140,   // Description: Fence rope left
            COL_1: 141,   // Description: Fence rope center
            COL_2: 142,   // Description: Fence rope right
            COL_3: 143,   // Description: Floating platform sticky single
            COL_4: 144,   // Description: Floating platform sticky left
            COL_5: 145,   // Description: Floating platform sticky center
            COL_6: 146,   // Description: Floating platform sticky right
            COL_7: 147,   // Description: Floating platform pipe left
            COL_8: 148,   // Description: Floating platform pipe center
            COL_9: 149,   // Description: Floating platform pipe right
            COL_10: 150,  // Description: Background mechanical bottom left
            COL_11: 151,  // Description: Background mechanical bottom center
            COL_12: 152,  // Description: Background mechanical bottom right
            COL_13: 153,  // Description: Background mechanical single bottom
            COL_14: 154,  // Description: Accent square bottom left
            COL_15: 155,  // Description: Background dirt bottom left
            COL_16: 156,  // Description: Background dirt bottom center
            COL_17: 157,  // Description: Background dirt bottom right
            COL_18: 158,  // Description: Background dirt single bottom
            COL_19: 159   // Description: Accent dot bottom left
        },

        // Row 8 (160-179)
        ROW_8: {
            COL_0: 160,   // Description: Fence wood left
            COL_1: 161,   // Description: Fence wood center
            COL_2: 162,   // Description: Fence wood right
            COL_3: 163,   // Description: Trampoline idle
            COL_4: 164,   // Description: Trampoline mid
            COL_5: 165,   // Description: Trampoline full
            COL_6: 166,   // Description: Stalactites
            COL_7: 167,   // Description: Floating platform branch left
            COL_8: 168,   // Description: Floating platform branch center
            COL_9: 169,   // Description: Floating platform branch right
            COL_10: 170,  // Description: Background mechanical single left
            COL_11: 171,  // Description: Background mechanical single center
            COL_12: 172,  // Description: Background mechanical single right
            COL_13: 173,  // Description: Background mechanical single
            COL_14: 174,  // Description: Accent square top left
            COL_15: 175,  // Description: Background dirt single left
            COL_16: 176,  // Description: Background dirt single center
            COL_17: 177,  // Description: Background dirt single right
            COL_18: 178,  // Description: Background dirt single
            COL_19: 179   // Description: Accent line top left
        },

        // Row 9 (180-199)
        ROW_9: {
            COL_0: 180,   // Description: 
            COL_1: 181,   // Description: 
            COL_2: 182,   // Description: 
            COL_3: 183,   // Description: 
            COL_4: 184,   // Description: 
            COL_5: 185,   // Description: 
            COL_6: 186,   // Description: 
            COL_7: 187,   // Description: 
            COL_8: 188,   // Description: 
            COL_9: 189,   // Description: 
            COL_10: 190,  // Description: 
            COL_11: 191,  // Description: 
            COL_12: 192,  // Description: 
            COL_13: 193,  // Description: 
            COL_14: 194,  // Description: 
            COL_15: 195,  // Description: 
            COL_16: 196,  // Description: 
            COL_17: 197,  // Description: 
            COL_18: 198,  // Description: 
            COL_19: 199   // Description: 
        },

        // Row 10 (200-219)
        ROW_10: {
            COL_0: 200,   // Description: 
            COL_1: 201,   // Description: 
            COL_2: 202,   // Description: 
            COL_3: 203,   // Description: 
            COL_4: 204,   // Description: 
            COL_5: 205,   // Description: 
            COL_6: 206,   // Description: 
            COL_7: 207,   // Description: 
            COL_8: 208,   // Description: 
            COL_9: 209,   // Description: 
            COL_10: 210,  // Description: 
            COL_11: 211,  // Description: 
            COL_12: 212,  // Description: 
            COL_13: 213,  // Description: 
            COL_14: 214,  // Description: 
            COL_15: 215,  // Description: 
            COL_16: 216,  // Description: 
            COL_17: 217,  // Description: 
            COL_18: 218,  // Description: 
            COL_19: 219   // Description: 
        },

        // Row 11 (220-239)
        ROW_11: {
            COL_0: 220,   // Description: 
            COL_1: 221,   // Description: 
            COL_2: 222,   // Description: 
            COL_3: 223,   // Description: 
            COL_4: 224,   // Description: 
            COL_5: 225,   // Description: 
            COL_6: 226,   // Description: 
            COL_7: 227,   // Description: 
            COL_8: 228,   // Description: 
            COL_9: 229,   // Description: 
            COL_10: 230,  // Description: 
            COL_11: 231,  // Description: 
            COL_12: 232,  // Description: 
            COL_13: 233,  // Description: 
            COL_14: 234,  // Description: 
            COL_15: 235,  // Description: 
            COL_16: 236,  // Description: 
            COL_17: 237,  // Description: 
            COL_18: 238,  // Description: 
            COL_19: 239   // Description: 
        },

        // Row 12 (240-259)
        ROW_12: {
            COL_0: 240,   // Description: Player default idle
            COL_1: 241,   // Description: Player default walk start
            COL_2: 242,   // Description: Player default walk end
            COL_3: 243,   // Description: Player default run start
            COL_4: 244,   // Description: Player default run end
            COL_5: 245,   // Description: Player default jump
            COL_6: 246,   // Description: Player default prone
            COL_7: 247,   // Description: 
            COL_8: 248,   // Description: 
            COL_9: 249,   // Description: 
            COL_10: 250,  // Description: 
            COL_11: 251,  // Description: 
            COL_12: 252,  // Description: 
            COL_13: 253,  // Description: 
            COL_14: 254,  // Description: 
            COL_15: 255,  // Description: 
            COL_16: 256,  // Description: 
            COL_17: 257,  // Description: 
            COL_18: 258,  // Description: 
            COL_19: 259   // Description: 
        },

        // Row 13 (260-279)
        ROW_13: {
            COL_0: 260,   // Description: Player diamond flying idle
            COL_1: 261,   // Description: Player diamond flying walk start
            COL_2: 262,   // Description: Player diamond flying walk end
            COL_3: 263,   // Description: Player diamond flying run start
            COL_4: 264,   // Description: Player diamond flying run end
            COL_5: 265,   // Description: Player diamond flying jump
            COL_6: 266,   // Description: Player diamond flying prone
            COL_7: 267,   // Description: 
            COL_8: 268,   // Description: 
            COL_9: 269,   // Description: 
            COL_10: 270,  // Description: 
            COL_11: 271,  // Description: 
            COL_12: 272,  // Description: 
            COL_13: 273,  // Description: 
            COL_14: 274,  // Description: 
            COL_15: 275,  // Description: 
            COL_16: 276,  // Description: 
            COL_17: 277,  // Description: 
            COL_18: 278,  // Description: 
            COL_19: 279   // Description: 
        },

        // Row 14 (280-299)
        ROW_14: {
            COL_0: 280,   // Description: Player emerald defense idle
            COL_1: 281,   // Description: Player emerald defense walk start
            COL_2: 282,   // Description: Player emerald defense walk end
            COL_3: 283,   // Description: Player emerald defense run start
            COL_4: 284,   // Description: Player emerald defense run end
            COL_5: 285,   // Description: Player emerald defense jump
            COL_6: 286,   // Description: Player emerald defense prone
            COL_7: 287,   // Description: 
            COL_8: 288,   // Description: 
            COL_9: 289,   // Description: 
            COL_10: 290,  // Description: 
            COL_11: 291,  // Description: 
            COL_12: 292,  // Description: 
            COL_13: 293,  // Description: 
            COL_14: 294,  // Description: 
            COL_15: 295,  // Description: 
            COL_16: 296,  // Description: 
            COL_17: 297,  // Description: 
            COL_18: 298,  // Description: 
            COL_19: 299   // Description: 
        },

        // Row 15 (300-319)
        ROW_15: {
            COL_0: 300,   // Description: Player ruby fire idle
            COL_1: 301,   // Description: Player ruby fire walk start
            COL_2: 302,   // Description: Player ruby fire walk end
            COL_3: 303,   // Description: Player ruby fire run start
            COL_4: 304,   // Description: Player ruby fire run end
            COL_5: 305,   // Description: Player ruby fire jump
            COL_6: 306,   // Description: Player ruby fire prone
            COL_7: 307,   // Description: 
            COL_8: 308,   // Description: 
            COL_9: 309,   // Description: 
            COL_10: 310,  // Description: 
            COL_11: 311,  // Description: 
            COL_12: 312,  // Description: 
            COL_13: 313,  // Description: 
            COL_14: 314,  // Description: 
            COL_15: 315,  // Description: 
            COL_16: 316,  // Description: 
            COL_17: 317,  // Description: 
            COL_18: 318,  // Description: 
            COL_19: 319   // Description: 
        },

        // Row 16 (320-339)
        ROW_16: {
            COL_0: 320,   // Description: Enemy crawler idle
            COL_1: 321,   // Description: Enemy crawler walk start
            COL_2: 322,   // Description: Enemy crawler walk end
            COL_3: 323,   // Description: Enemy crawler jump
            COL_4: 324,   // Description: Enemy crawler dead
            COL_5: 325,   // Description: 
            COL_6: 326,   // Description: 
            COL_7: 327,   // Description: 
            COL_8: 328,   // Description: 
            COL_9: 329,   // Description: 
            COL_10: 330,  // Description: 
            COL_11: 331,  // Description: 
            COL_12: 332,  // Description: 
            COL_13: 333,  // Description: 
            COL_14: 334,  // Description: 
            COL_15: 335,  // Description: 
            COL_16: 336,  // Description: 
            COL_17: 337,  // Description: 
            COL_18: 338,  // Description: 
            COL_19: 339   // Description: 
        },

        // Row 17 (340-359)
        ROW_17: {
            COL_0: 340,   // Description: Enemy walker idle
            COL_1: 341,   // Description: Enemy walker walk start
            COL_2: 342,   // Description: Enemy walker walk end
            COL_3: 343,   // Description: Enemy walker jump
            COL_4: 344,   // Description: Enemy walker dead
            COL_5: 345,   // Description: 
            COL_6: 346,   // Description: 
            COL_7: 347,   // Description: 
            COL_8: 348,   // Description: 
            COL_9: 349,   // Description: 
            COL_10: 350,  // Description: 
            COL_11: 351,  // Description: 
            COL_12: 352,  // Description: 
            COL_13: 353,  // Description: 
            COL_14: 354,  // Description: 
            COL_15: 355,  // Description: 
            COL_16: 356,  // Description: 
            COL_17: 357,  // Description: 
            COL_18: 358,  // Description: 
            COL_19: 359   // Description: 
        },

        // Row 18 (360-379)
        ROW_18: {
            COL_0: 360,   // Description: Enemy armored idle
            COL_1: 361,   // Description: Enemy armored walk start
            COL_2: 362,   // Description: Enemy armored walk end
            COL_3: 363,   // Description: Enemy armored jump
            COL_4: 364,   // Description: Enemy armored dead
            COL_5: 365,   // Description: 
            COL_6: 366,   // Description: 
            COL_7: 367,   // Description: 
            COL_8: 368,   // Description: 
            COL_9: 369,   // Description: 
            COL_10: 370,  // Description: 
            COL_11: 371,  // Description: 
            COL_12: 372,  // Description: 
            COL_13: 373,  // Description: 
            COL_14: 374,  // Description: 
            COL_15: 375,  // Description: 
            COL_16: 376,  // Description: 
            COL_17: 377,  // Description: 
            COL_18: 378,  // Description: 
            COL_19: 379   // Description: 
        },

        // Row 19 (380-399)
        ROW_19: {
            COL_0: 380,   // Description: Enemy crawler fly start
            COL_1: 381,   // Description: Enemy crawler fly end
            COL_2: 382,   // Description: Enemy crawler fly dead
            COL_3: 383,   // Description: Enemy flyer fly start
            COL_4: 384,   // Description: Enemy flyer fly end
            COL_5: 385,   // Description: Enemy flyer fly dead
            COL_6: 386,   // Description: Enemy parashoot
            COL_7: 387,   // Description: fan side 2 left
            COL_8: 388,   // Description: fan side 2 right
            COL_9: 389,   // Description: chest closed
            COL_10: 390,  // Description: chest open
            COL_11: 391,  // Description: 
            COL_12: 392,  // Description: 
            COL_13: 393,  // Description: 
            COL_14: 394,  // Description: 
            COL_15: 395,  // Description: 
            COL_16: 396,  // Description: 
            COL_17: 397,  // Description: 
            COL_18: 398,  // Description: 
            COL_19: 399   // Description: 
        }
    },

    // Helper functions
    getPosition: function(tileNumber) {
        return {
            row: Math.floor(tileNumber / 20),
            col: tileNumber % 20
        };
    },

    getTileNumber: function(row, col) {
        return row * 20 + col;
    },

    // Convenience method to get any tile by row and column
    getTile: function(row, col) {
        const rowKey = `ROW_${row}`;
        const colKey = `COL_${col}`;
        return this.GRID[rowKey]?.[colKey] ?? null;
    }
};

// Generate remaining grid rows programmatically
for (let row = 1; row < 20; row++) {
    TileManifest.GRID[`ROW_${row}`] = {};
    for (let col = 0; col < 20; col++) {
        const tileNumber = row * 20 + col;
        TileManifest.GRID[`ROW_${row}`][`COL_${col}`] = tileNumber;  // Description can be added later
    }
}

export default TileManifest; 