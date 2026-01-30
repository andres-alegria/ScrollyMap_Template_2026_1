# ScrollyMap Template 2026

This repository is a **clean, minimal scrollytelling map template** built with **React**, **Mapbox GL JS**, and **GSAP**.

It is designed for data‑driven storytelling projects where narrative chapters control map camera movements, layers, and optional animations (such as vessel tracks), while also supporting non‑map “stage” sections for rich visual storytelling.

This template intentionally avoids project‑specific logic and legacy hacks. Everything included here is meant to be reusable.


## Core Concepts

### Chapters (config.js)
The story is driven by `src/config.js`.  
Each chapter defines:

- Map position (center, zoom, pitch, bearing)
- How the map should animate to that position
- Optional callbacks triggered on chapter enter / exit
- Optional media (images, captions)

Example:

```js
{
  id: "chapter-01",
  alignment: "right",
  title: "Tracking vessels",
  description: "An animated vessel track.",

  location: {
    center: [-158.067, -18.252],
    zoom: 4.2,
    pitch: 0,
    bearing: 0,
    mapAnimation: "flyTo" // 'flyTo' | 'easeTo' | 'jumpTo'
  },

  onChapterEnter: [
    {
      callback: "trackAnimation.start",
      options: {
        vesselFile: "/data/tracks/example.geojson",
        speed: 75,
        flyToStart: true
      }
    }
  ]
}
```


### Map Animations

Each chapter can control **how** the map moves using `mapAnimation`:

- `flyTo` – cinematic, animated movement (default)
- `easeTo` – smoother, less dramatic motion
- `jumpTo` – immediate jump (no animation)

These are implemented in:
`src/components/map/map-hooks.js`

Comments in that file explain exactly where to tweak behavior.


## Stages (Non‑Map Sections)

In addition to map chapters, the template supports **Stages**: full‑width sections that are not tied to map movement.

Stages are defined by a `type` and rendered via:

`src/components/stages/stage-registry.js`

Currently included stage types:

- `GalleryHorizontalScroll`
- `GalleryFilter`
- `PlainTextStage`

Each stage is self‑contained (JS + CSS) and can use GSAP or any other animation logic internally.

Stages are ideal for:
- Image sequences
- Data explanations
- Visual breaks between map sections


## Track Animation (Optional)

The template includes an **optional vessel track animation engine**.

It:
- Loads a GeoJSON LineString
- Draws the line progressively
- Moves a dot along the track
- Optionally moves the camera

The public API is exposed as:

```js
trackAnimation.start(options)
trackAnimation.pause()
trackAnimation.resume()
trackAnimation.stop()
```

All supported options are documented directly in:
`src/components/map/track-animation.js`

If you do not need track animations, you can remove this module entirely without affecting the rest of the template.


## External Layers (Optional)

External vector or raster layers can be defined in:

`src/components/map/map-external-layers.js`

This is intentionally kept simple and disabled by default.  
Only enable it when you actually need external data sources.


## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

2. Add your Mapbox access token:
   ```
   REACT_APP_MAPBOX_ACCESS_TOKEN=your_token_here
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Start development server:
   ```bash
   yarn start
   ```


## Design Philosophy

This template follows a few strict rules:

- No hard‑coded project logic
- No embedded secrets
- No legacy callbacks or globals without explanation
- Everything configurable from `config.js`
- Stages and animations are opt‑in, not mandatory

If something looks complex, there should be a comment explaining *why it exists* and *when you should touch it*.


## Recommended Workflow

- Duplicate this template for each new project
- Customize only:
  - `config.js`
  - stages (if needed)
  - styles (fonts, colors, layout)
- Keep the core map and scroll logic unchanged unless absolutely necessary


---

ScrollyMap Template 2026  
Clean, explicit, and built to stay that way.
