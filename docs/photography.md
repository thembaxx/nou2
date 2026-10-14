# Editorial photography

References retained from the user-supplied source archive. Illustrative cards and detail pages label this imagery as editorial. No identity or model verification is implied.

- Hero: https://unsplash.com/photos/photo-1503376780353-7e6692767b70 (image source: https://images.unsplash.com/photo-1503376780353-7e6692767b70)
- BMW example: https://images.unsplash.com/photo-1555215695-3004980ad54e
- Mercedes-Benz example: https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8
- Volkswagen example: https://images.unsplash.com/photo-1544829099-b9a0c07fad1a
- Toyota example: https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb

Seller uploads require the seller's permission and are compressed locally before upload.

## Corrected model photographs

The archive's Golf photograph depicted a Lamborghini and its Toyota photograph depicted a sedan. They were replaced with:

- **VW Golf GTI TCR 1X7A6182** by **Alexander Migl**: https://commons.wikimedia.org/wiki/File:VW_Golf_GTI_TCR_1X7A6182.jpg — **CC BY-SA 4.0**, https://creativecommons.org/licenses/by-sa/4.0/. This bundled image retains that licence.
- **2023 Toyota Corolla Cross XLE 4WD in Wind Chill Pearl, front left** by **Mr.choppers**: https://commons.wikimedia.org/wiki/File:2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl,_front_left.jpg — **CC BY-SA 3.0**, https://creativecommons.org/licenses/by-sa/3.0/. This bundled image retains that licence.

Both were initially resized to 800 px and converted to WebP. The current responsive derivatives are rebuilt from the original photographs. The photos are editorial references, not the specific illustrative South African vehicles or verified trim.

## Responsive assets and manufacturer references

Editorial assets have 320, 640, 960, 1600 and 2400 px WebP variants; BMW, Mercedes and Toyota also have 3200 px variants. The Golf original is 3175 px wide, so no 3200 px derivative is advertised or upscaled. The original hero also has a 2560 px variant. Higher-resolution derivatives use WebP quality 90, smaller variants use 80–85. Rebuild with `node scripts/generate-editorial-images.mjs`. These are resized derivatives of the sources above and retain their attribution/licence. Full-screen inspection requests larger responsive sources as the user zooms; it cannot add detail missing from a source or upload.

The home page renders identifiable Ferrari and BMW artist models. Eight-angle 800/1600 px previews are rendered from those same licensed assets, with the actual studio geometry and materials, using `scripts/generate-model-previews.mjs` against a local server. No generated or generic vehicle shape substitutes for a named car. See public/models/CREDITS.md for attribution and retained licences. The SVG technology diagrams are original schematic illustrations, separate from actual-car geometry.

Catalogue cards reference manufacturer-hosted Toyota pack shots through the source URLs recorded in `data/toyota-2026-10-13.json`. All 30 distinct desktop source images were fetched successfully on 14 October 2026. Their source resolution varies; no additional photographic detail is invented. The app optimises these public sources through Next.js, using WebP and responsive widths, quality 85 for browsing, 90 for inspection, and 65 for data/battery saving. It falls back to the original manufacturer image if optimisation fails. GPU/CPU tiers control 3D complexity independently of photographic sharpness. Images use containment to preserve the whole car.

Manufacturer model imagery is attributed through each model's source link, not offered as a photograph of specific Carpur stock. It remains dependent on the manufacturer's image service. Carpur does not own that imagery or infer colour availability. Uploaded seller photographs stay on the separate permission-aware photo route with no image-optimiser or service-worker cache.
