# Real-car 3D assets

## BMW M3 E30

[FREE] BMW M3 E30 by **Martin Trafas** (TinoD2 / formerly Bexxie).
Original: https://sketchfab.com/3d-models/free-bmw-m3-e30-ac3c7013434e403e8faff87948caf422
Author: https://sketchfab.com/TinoD2
Licence: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/
The original model's licence and author were verified through the Sketchfab public model API on 13 October 2026.

Web-optimised derivative: https://github.com/Theo-allaeys/SmartApps-2324-MTA_Carz/blob/main/public/GLTFs/bmw_m3_e30_draco-transformed.glb
Its adjacent generated component records the same source UID, author and CC BY 4.0 licence: https://github.com/Theo-allaeys/SmartApps-2324-MTA_Carz/blob/main/src/Models/Bmw_m3_e30_draco.jsx

Modifications: upstream Draco compression, Carpur studio lighting and selectable preview paint. Rotation previews are rendered from the same artist geometry. This is not a scan of a seller's vehicle or a manufacturer-approved configuration.

## Ferrari 458 Family — Open-Roof Artist Model

Ferrari 458 Italia artist model credited to **vicent091036** by the upstream Three.js example.
Source asset: https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/ferrari.glb
Attribution: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_car.html
Distributed from the Three.js repository with its MIT licence, retained in `THREE-LICENSE.txt`. The original Sketchfab link in that example no longer resolves; no separate Creative Commons licence is claimed for this asset.
Modifications: normalised scale, lighting, preview paint, optional translucent body and rendered rotation previews. No manufacturer endorsement or particular stock vehicle is implied.
The upstream label says Italia, but visual verification shows an open-roof model. Carpur labels it as the Ferrari 458 family and never attaches it to an Italia coupe listing.
Official model-family reference: https://www.ferrari.com/en-EN/auto/458-italia (introduced 2009).

## Toyota Corolla Cross source preview

2021_toyota_corolla_cross by **007 / tangwang920**, CC BY 4.0.
https://sketchfab.com/3d-models/2021-toyota-corolla-cross-cfcaebfa5e5a4170b6f2db8db7ca3436
https://sketchfab.com/tangwang920
https://creativecommons.org/licenses/by/4.0/
The source thumbnail is resized to WebP and attributed beside its source link. The embedded viewer did not render reliably during verification, so Carpur links to the external model page and does not claim a working Toyota integration or include its geometry.

## Decoders

Three.js loader and studio utilities: MIT, retained in `THREE-LICENSE.txt`.
Google Draco WASM decoder and wrapper: Apache 2.0, retained under `draco/LICENSE`; upstream `draco/README.md` describes provenance. These vendor files remain unmodified and are excluded from source lint/format rules.
