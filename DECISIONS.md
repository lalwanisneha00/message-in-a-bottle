# Decisions

## Intro logo splash (2026-07-12)

- `IntroLogo` was converted from a standalone "replace the page" component into a gate that wraps `children`: it renders the rest of the tree immediately (mounted, just covered) and overlays the splash on top, fading it out via `AnimatePresence` after 2000ms. Reason: the previous sender-only implementation blocked the entire experience from mounting until the intro finished, which meant the intro timer and the page's own logic were coupled. A wrapping gate lets both the sender and receiver reuse the exact same component with zero duplicated timer code.
- Duration set to exactly 2000ms (was 2500ms in the old sender-only version) to match the explicit "2 seconds" request. Fade-out transition itself is a separate 0.5s on top, so the logo is fully opaque for 2s and then dissolves — the *hold* is 2s, not the total including fade.
- Applied at the top of `SenderExperience.tsx` and `ReceiverExperience.tsx` (not in `app/layout.tsx`) so it fires once per full page load of either route, but does not re-trigger on client-side navigation between in-app views that don't remount these components.

## Sprite path remapping (2026-07-12)

Found the working tree mid-reorganization: `public/*.png` had been deleted and replaced by `public/sprites/*.png` with new filenames, but no component source had been updated yet — every sprite reference in the app was a 404. This wasn't part of the requested task, but the app was completely broken without it (including the new logo splash), so the mechanical rename was fixed inline rather than left broken:

| Old path | New path |
|---|---|
| `/logo.png` | `/sprites/Logo.png` |
| `/beach.png` | `/sprites/Beach.png` |
| `/cork.png` | `/sprites/Cork.png` |
| `/paper-roll.png` | `/sprites/Paperroll.png` |
| `/old-paper.png` | `/sprites/Vintagepaper.png` |
| `/bottle-empty.png` | `/sprites/Emptybottle.png` |
| `/bottle-paper.png` | `/sprites/Bottlewithpaperroll.png` |
| `/bottle-final.png` | `/sprites/bottlefloating.png` |

`/bottle-paper.png` mapping note: in both `BottleAssembly.tsx` and the old `ReceiverExperience.tsx` "shore" stage, this sprite is always shown with the cork rendered as a *separate* absolutely-positioned drag layer on top — so the base sprite itself never includes a cork. That matches `Bottlewithpaperroll.png` (paper, no cork), not `Bottlecorkpaperroll.png` (which is currently unused/unreferenced).

## Full frontend rebuild on real sprites (2026-07-12)

Superseded the mapping above: the user clarified they wanted the whole frontend rebuilt from scratch against the actual uploaded sprites, not just pointed at them. Inspected every PNG in `public/sprites/` directly (pixel dimensions + alpha-channel sampling via a script, not guesswork) before writing any code — this changed the plan in a few ways worth recording:

- **`Logo.png` is a full title card** (1254×1254, "MESSAGE IN A BOTTLE" wordmark + palm/bottle/sandcastle art baked in, own sky-blue background), not a small icon. `IntroLogo` now shows it near-full-bleed instead of a 280–420px box, and the splash backdrop was changed from `bg-sky-950` to `bg-[#4ebce6]` to match the logo's own background color exactly (sampled from its corner pixel) so there's no visible seam.
- **`Emptysky.png` / `ocean.png` / `Beach.png` are separate layers**, not one flattened scene — confirmed by dimensions (sky and ocean are short, wide, mostly-flat-color strips: 1890×476 and 1890×336) and by the fact that `Palmtree.png`, `Sandcastle_1/2.png`, `Crab.png`, `Starfish.png` exist as standalone sprites meant to be scattered on top. Built `BeachScene.tsx` as three stacked layers (sky / scrolling ocean / sand) with props placed via data (`lib/beachProps.ts`), matching the reference beach image the user shared mid-session.
- **`Beach.png`'s sand texture has soft/feathered alpha** at its top and bottom edges (confirmed: real transparency, alpha fading to 0, not a hard pixel-art edge). Composited it over a solid sand-colored background (`#e0a868`, sampled from the sprite) so the feather blends instead of showing a hard box.
- **All prop/character/bottle sprites (Crab, Starfish, Palmtree, Sandcastle, bottles, Cork, Paperroll, Vintagepaper) do have real alpha transparency** — corner-pixel sampling confirmed alpha=0 on every one, despite some rendering with an apparent white or black backdrop in quick previews. No blend-mode workarounds were needed.
- **Bottle sprite progression** confirmed visually: `Emptybottle.png` (nothing inside) → `Bottlewithpaperroll.png` (paper, no cork) → `Bottlecorkpaperroll.png` (paper + cork, sealed) → `bottlefloating.png` (sealed bottle with water ripple/reflection baked in, for open water). Corking/uncorking and inserting/extracting are done by layering the base bottle sprite (no cork or no paper) with `Cork.png`/`Paperroll.png` as a separately draggable sprite on top — this reuses the same visual trick the original code already used (composite layers instead of one sprite with everything baked in), now with the technically-correct base sprite for each step.
- **`DragCork` and `DragPaperRoll` were unified into one `DragToThreshold` component.** Once corking (sender) and uncorking (receiver) both turned out to be "drag a sprite up past a distance threshold, spring back otherwise," keeping two near-identical components was pure duplication.
- **Verified with a real headless-browser pass**, not just `tsc`/build: installed Playwright standalone in the scratch dir (kept out of the project's own `package.json`), ran the dev server against placeholder Supabase env vars, and drove the full sender flow (write → roll → drag paper in → drag cork in → throw → save-failure handling) plus the receiver `notFound` state and a 375×667 mobile viewport. Caught and fixed a real bug this way: the interactive content was centered in the full viewport, but the sand layer only covered the bottom ~38%, so the bottle rendered floating in the ocean band instead of standing on the sand. Fixed by raising the horizon (ocean now 30–46%, sand 43–100%) so the sand covers enough of the frame that viewport-centered content lands on it.
- `app/message/[id]/page.tsx`: the Supabase call itself is untouched (same table, same `select`, same `eq`, same `.single()`). Only how its result is handed to the UI changed — `data?.message ?? "Message not found"` (a magic string baked into the message prop) became `data?.message ?? null`, so a missing row can render as an actual in-world "empty bottle" state instead of literally displaying the words "Message not found" as if they were someone's letter.
- Two React Compiler purity lint errors surfaced and were fixed: `Math.random()` called directly during a crab's render (moved into `useState(() => ...)` so it's computed once) and a `setState` called synchronously at the top of an effect in the reading typewriter (restructured so revealed text is derived at render time from a counter, and effects only call `setState` from inside interval/timeout callbacks).
- Deleted now-unused files: `BottleAssembly.tsx`, `OceanThrow.tsx`, `PaperEditor.tsx`, `AnimatedBeach.tsx`, and the already-empty, already-unused `MessageReveal.tsx`.

### Not done

Audio, the full virtual-stage coordinate system, Zustand FSM stores, a physics-simulated throw with a live trajectory-dot preview, and a `/dev` state-jump harness were all part of the original mega-spec but out of scope for this pass — this rebuild uses plain per-component `useState` state machines (matching the codebase's existing style) and framer-motion keyframe animations for the throw arc instead of a physics integrator. Flagged to the user as a separate, larger follow-up if wanted.
