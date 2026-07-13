"use client";

// The beach scene is laid out in horizontal bands (sky/ocean/sand) that
// only read correctly in landscape, so on small touch screens held
// portrait this covers the whole page with a "please rotate" prompt
// instead. Pure CSS (the .orientation-gate media query in globals.css)
// so it reacts to rotation immediately with no JS orientation listener.
// Gated on pointer: coarse (not just max-width + portrait) so a resized
// desktop browser window — mouse-driven, no touch — never triggers it.

export default function OrientationGate() {
  return (
    <div className="orientation-gate fixed inset-0 z-[200] hidden flex-col items-center justify-center gap-6 bg-[#4ebce6] p-8 text-center">
      <div className="anim-device-rotate h-16 w-9 rounded-md border-4 border-white bg-white/20" />
      <p className="max-w-xs text-lg font-semibold text-white">
        Rotate your device to landscape to send or read a message in a bottle.
      </p>
    </div>
  );
}
