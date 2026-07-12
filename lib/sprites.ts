export interface Sprite {
  src: string;
  width: number;
  height: number;
}

// Every PNG in public/sprites/, dimensions read from the source files.
// This is the single source of truth for sprite paths — never hardcode
// a "/sprites/..." path anywhere else.
export const sprites = {
  logo: { src: "/sprites/Logo.png", width: 1254, height: 1254 },

  sky: { src: "/sprites/Emptysky.png", width: 1890, height: 476 },
  ocean: { src: "/sprites/ocean.png", width: 1890, height: 336 },
  sand: { src: "/sprites/Beach.png", width: 1536, height: 1024 },

  cloud1: { src: "/sprites/cloud_1.png", width: 378, height: 126 },
  cloud2: { src: "/sprites/cloud_2.png", width: 434, height: 168 },
  cloud3: { src: "/sprites/cloud_3.png", width: 294, height: 112 },
  cloud4: { src: "/sprites/cloud_4.png", width: 434, height: 154 },
  cloud5: { src: "/sprites/cloud_5.png", width: 378, height: 154 },
  cloud6: { src: "/sprites/cloud_6.png", width: 644, height: 238 },
  cloud7: { src: "/sprites/cloud_7.png", width: 406, height: 112 },

  palmTree: { src: "/sprites/Palmtree.png", width: 448, height: 432 },
  sandcastle1: { src: "/sprites/Sandcastle_1.png", width: 512, height: 368 },
  sandcastle2: { src: "/sprites/Sandcastle_2.png", width: 336, height: 320 },
  crab: { src: "/sprites/Crab.png", width: 1920, height: 1920 },
  starfish: { src: "/sprites/Starfish.png", width: 1920, height: 1920 },

  // Bottle progression: empty -> paper, no cork -> paper + cork (sealed) -> floating in water
  bottleEmpty: { src: "/sprites/Emptybottle.png", width: 1024, height: 1536 },
  bottleWithPaper: { src: "/sprites/Bottlewithpaperroll.png", width: 1333, height: 1920 },
  bottleSealed: { src: "/sprites/Bottlecorkpaperroll.png", width: 1282, height: 1920 },
  bottleFloating: { src: "/sprites/bottlefloating.png", width: 768, height: 800 },

  cork: { src: "/sprites/Cork.png", width: 1024, height: 1536 },
  paperRoll: { src: "/sprites/Paperroll.png", width: 1920, height: 1733 },
  vintagePaper: { src: "/sprites/Vintagepaper.png", width: 1920, height: 1920 },
} as const satisfies Record<string, Sprite>;

export type SpriteKey = keyof typeof sprites;
