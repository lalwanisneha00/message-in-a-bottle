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

`public/sprites/Bottlecorkpaperroll.png`, `Crab.png`, `Starfish.png`, `Palmtree.png`, `Sandcastle_1.png`, `Sandcastle_2.png`, `Emptysky.png`, `ocean.png`, and `cloud_1–7.png` exist on disk but aren't referenced by any component yet — `AnimatedBeach.tsx` currently draws clouds/palms/shimmer as plain CSS shapes rather than these sprites. Left as-is; wiring the full animated scene from the mega-spec (Sky/Ocean/Beach layer components, FSM stores, stage system, physics, audio, etc.) is a much larger, separate undertaking and wasn't part of this pass.

## Not done

`app/components/MessageReveal.tsx` is an empty, unused file (not imported anywhere) — left untouched since deleting unused files wasn't requested and it's zero-cost as-is.
