# NOVA — Luxury Real Estate

A cinematic, interactive real estate site built with React, Vite, React Three Fiber, GSAP, Framer Motion and Tailwind CSS.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
npm run preview  # serve the production build
```

Node 18.18+ (or 20+) is recommended.

## What's inside

```
src/
  App.jsx                    page composition, routing of the residence detail (#residence/<id>), scroll lock
  data/                      residences, amenities, gallery frames, map destinations, 3D hotspots
  lib/                       gsap setup, WebGL detection, scroll helpers
  hooks/                     reduced motion, in-view, fine-pointer detection
  components/
    layout/                  Loader, Navbar, MenuOverlay, Footer
    ui/                      MagneticButton, TiltCard, Cursor, RevealText, Artwork, ErrorBoundary, LazyMount
    three/                   Tower (instanced), Particles, HeroScene, ExperienceScene, towerGeometry
  sections/                  Hero, Residences, PropertyDetail, Experience, About, Amenities, Gallery, Location, Contact
```

## Notes

- **Imagery.** Every image is drawn procedurally as SVG by `components/ui/Artwork.jsx`, so there are no remote image URLs to break. To use photography, replace `<Artwork … />` with `<img>` elements; the containers already handle cropping, zoom and parallax.
- **3D and performance.** Both 3D scenes are code-split with `React.lazy`. The hero scene loads behind the loading screen; the interactive tower only loads when its section comes within ~700px of the viewport. Render loops pause when a canvas is off screen. The tower is three instanced meshes, so it costs only a handful of draw calls.
- **WebGL fallback.** If WebGL is unavailable, or a scene throws, an error boundary swaps in a static illustration and the hotspots keep working over it.
- **Reduced motion.** With `prefers-reduced-motion`, scroll-scrubbed effects, the pinned gallery, the magnetic and tilt effects, the custom cursor ring and particle drift are all turned off; the gallery becomes a native horizontal scroller.
- **Booking form.** There is no backend. `sections/Contact.jsx` validates the fields and simulates the request in `onSubmit`; replace the `setTimeout` with your API call.
- **Fonts.** Bodoni Moda (display) and Manrope (text) load from Google Fonts in `index.html`, with system fallbacks.
