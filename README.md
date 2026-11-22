# Workstand

A bike maintenance log that runs as a Claude artifact. It reads your rides from Strava through Claude's Strava connector and counts ride hours on every part: chain wax, quick link uses, chain wear, tires, sealant, pads, fork and shock. Each bike gets a pixel-art portrait with status dots on its parts.

**Get your own copy:** open the [Get Workstand page](https://claude.ai/artifact/YYwebtuaNKpXcHDUJv1Rpp) (live demo and setup prompt), or follow [SETUP.md](SETUP.md).

## How it works

- `workstand.html` is the whole app: one page with no build step.
- Each person publishes their own copy into their own Claude account. Data is stored in that copy, under the viewer's private area, so nobody else can read it.
- Strava access is read-only (`get_gear` and `search_activities`) and uses the viewer's own Strava connector.
- Bike art is either a built-in pixel bike, your own pixel art, or a photo pixelized in the browser. Images are stored in the copy's asset store.

## Requirements

- A Claude account with artifacts and connectors.
- A Strava subscription (required by Strava's Claude connector).

## Repository layout

| Path | What it is |
| --- | --- |
| `workstand.html` | The app. The setup prompt fetches this file. |
| `SETUP.md` | Setup and update prompts for friends. |
| `site/get-workstand.html` | The Get Workstand landing page (published as a Claude artifact). |
| `site/demo.html` | The app running on a made-up demo garage. Built, do not edit. |
| `tools/demo-shim.js` | In-memory stand-in for the artifact runtime, with the demo bikes and rides. |
| `tools/build-demo.sh` | Rebuilds `site/demo.html` from `workstand.html` and the shim. |

After changing `workstand.html`, run `tools/build-demo.sh` and republish the landing page with `demo.html` beside it.
