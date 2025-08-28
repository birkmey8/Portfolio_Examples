# A/B Test – Modal Video Hero

A focused example showing how I built a modal video variant for a hero section as part of an A/B test. The goal was to measure engagement uplift (clicks, modal plays) and downstream conversion.

## What this includes
- **index.html** – Hero + CTA that opens a modal video
- **style.css** – Minimal styling for the hero and modal
- **script.js** – jQuery logic for open/close, ESC key, overlay click, and basic hooks
- **images/modal-variant.png** – Annotated screenshot of a representative variant

## Instrumentation notes
In production, I typically attach analytics events around these points:
- `hero_cta_click` (before modal opens)
- `modal_open` / `modal_close`
- `video_play`, `video_complete` (if player supports events)
- Downstream `cta_secondary_click` or `start_checkout`

You can wire those to GA4/GTM dataLayer pushes or direct `gtag()` calls, depending on the stack.
