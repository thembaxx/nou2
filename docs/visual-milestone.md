# Nou2 3D showcase visual milestone

Adds understated double showroom turntable rings to the high-quality real-car viewer and honours reduced-motion/device-reduced preferences when automatic orbit was requested. Rendering still uses the original Ferrari 458-family and BMW M3 E30 licensed assets, material/colour matching, camera gestures, images, fallback modes, and the existing photographer/model acknowledgements.

The rings are inline original Three.js geometry (two tiny meshes), only shown on enhanced GPU tier and never on software renderers. No more GLBs are downloaded; reduced GPU modes and the static image fallback stay unchanged. **No artist 3D meshes, trim/year matching, car-sale claims or licences are altered.**

QA checklist: desktop and mobile (both 3D and 8-angle preview), reduced-motion rotation, tier auto-detection, touch camera gestures, camera presets and paint transitions, memory disposal, real-model provenance links and Next.js build. CI/account capacity failure is expected and does not mean independent browser QA has passed.

Future optional Blender-generated model changes must go through `scripts/validate-3d-assets.mjs` and the attribution checklist in `public/models/CREDITS.md`.
