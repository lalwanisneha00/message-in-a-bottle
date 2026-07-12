// Shared easing curves and durations so components don't hardcode magic
// numbers for animation timing.

export const EASE_CALM = [0.4, 0.0, 0.2, 1] as const;
export const EASE_OUT = "easeOut";
export const EASE_IN_OUT = "easeInOut";

export const DUR_FAST = 0.3;
export const DUR_MED = 0.6;
export const DUR_SLOW = 1.1;

export const SPRING_SNAPPY = { type: "spring", stiffness: 300, damping: 14 } as const;
export const SPRING_SOFT = { type: "spring", stiffness: 180, damping: 20 } as const;
export const SPRING_HEAVY = { type: "spring", stiffness: 90, damping: 18, mass: 1.6 } as const;
