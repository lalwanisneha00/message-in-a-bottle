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

// Vertical offset (from viewport center) that anchors bottle-focused
// scenes near the shoreline instead of dead-center. Sky/ocean/sand are
// equal thirds, so the literal viewport center (50%) falls inside the
// ocean band, not on the sand — this nudges resting-bottle stages down
// onto the shore without affecting stages that are meant to be in the
// water (drifting/approaching).
export const SHORE_ANCHOR_VH = 16;

// Sky/ocean/sand are equal thirds (ocean spans 33.34vh-66.67vh), so the
// ocean band's own vertical middle is ~50vh. The thrown bottle should
// splash a little below that middle, not right at the horizon edge —
// shared between the throw's flight-end calculation and the drift
// sequence's starting position so the two don't visually jump.
export const OCEAN_IMPACT_VH = 55;

// The ocean band's own top edge (BeachScene's Ocean starts at top-[33.34%]).
// The bottle drifting out to the horizon should fade away by the time it
// reaches this line, not cross into the sky band above it.
export const OCEAN_TOP_VH = 33.34;
