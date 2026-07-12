// Shared projectile simulation for the sender's throw. The trajectory
// preview shown while aiming and the bottle's actual flight both call
// simulateThrow with the same inputs, so the preview never lies about
// where the bottle will go.

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface ThrowVelocity {
  vx: number;
  vy: number;
}

const GRAVITY = 1500; // px/s^2, tuned for on-screen feel, not real-world units
const DRAG = 0.5; // horizontal velocity decay per second

export function simulateThrow(
  velocity: ThrowVelocity,
  { steps = 40, dt = 0.03 }: { steps?: number; dt?: number } = {}
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  let x = 0;
  let y = 0;
  let vx = velocity.vx;
  let vy = velocity.vy;

  for (let i = 0; i < steps; i++) {
    points.push({ x, y });
    vy += GRAVITY * dt;
    vx *= 1 - DRAG * dt;
    x += vx * dt;
    y += vy * dt;
  }

  return points;
}

// Pulling the bottle backward (away from the water) and releasing throws
// it in the opposite direction — further pull, harder throw.
export function pullToVelocity(pull: { x: number; y: number }, powerScale = 8): ThrowVelocity {
  return { vx: -pull.x * powerScale, vy: -pull.y * powerScale };
}

export const MAX_PULL_DISTANCE = 120;
