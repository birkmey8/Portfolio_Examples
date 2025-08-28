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



----------------------------

#### Code Snippet (Redacted)
![Regex routing snippet](["ab-testing-modal/images/full_js_code.jpg"](https://github.com/birkmey8/TicketMaster_Examples/blob/408f3d60f82a3a3582cf5f9f39515b824aaa64d8/ab-testing-modal/images/full_js_code.jpg))
*This image shows the core logic only; full implementation is excluded due to company policy.*

Case Study: Personalized Promotion Routing with A/B Testing

Situation
A product team wanted to increase engagement with a promotional flow. The challenge was that only certain users qualified, and the unique identifiers that determined eligibility were embedded within the URL and datalayer.

Task
The goal was to design and implement an experiment that could reliably detect those identifiers, route users to the promotion if eligible, and measure lift in engagement metrics.

Action
I implemented a JavaScript solution that used regular expressions (regex) to parse unique identifiers from the URL, cross-checked them against the datalayer, and conditionally routed users into the promotion. I collaborated with backend developers to ensure that the logic integrated seamlessly with the existing infrastructure. Instrumentation was also set up to capture experiment results, with metrics tied to engagement and conversion events.

Result
The experiment successfully segmented traffic, increased engagement with the promotion, and delivered clear insights into conversion behavior. Most importantly, it drove a measurable business impact, contributing to a 10% lift in monthly revenue during the testing period. Beyond the immediate gains, this work also established a reusable framework for future targeting and personalization experiments, blending frontend customization with backend validation.
