---

# Example 1 — Modal Video Hero (A/B Test)

A focused example showing how I built a modal video variant for a hero section as part of an A/B test. The goal was to measure engagement uplift (clicks, modal plays) and downstream conversion.

### What this includes
- **index.html** – Hero + CTA that opens a modal video  
- **style.css** – Minimal styling for the hero and modal  
- **script.js** – jQuery logic for open/close, ESC key, overlay click, and basic hooks  
- **images/modal-variant.png** – Annotated screenshot of a representative variant  

### Instrumentation Notes
In production, I typically attach analytics events around these points:  
- `hero_cta_click` (before modal opens)  
- `modal_open` / `modal_close`  
- `video_play`, `video_complete` (if player supports events)  
- Downstream: `cta_secondary_click` or `start_checkout`  

You can wire those to GA4/GTM dataLayer pushes or direct `gtag()` calls, depending on the stack.

---

# Example 2 — Targeted Promotion Routing (A/B Test)

**TL;DR:** Regex + dataLayer validation → routed eligible users to a targeted promo → measurable lift in engagement and **+10% monthly revenue** during the test window.

[![Regex routing snippet](https://github.com/birkmey8/TicketMaster_Examples/raw/main/ab-testing-modal/images/full_js_code.jpg)](https://github.com/birkmey8/TicketMaster_Examples/blob/main/ab-testing-modal/images/full_js_code.jpg)  
*Redacted snippet: core logic only. Full implementation excluded due to company policy.*

### Case Study

**Situation**  
A product team wanted to increase engagement with a promotional flow, but only certain users qualified. The unique identifiers that determined eligibility lived in the URL and the dataLayer.

**Task**  
Design and implement an experiment that detects those identifiers, routes eligible users to the promotion, and measures lift in engagement and conversion.

**Action**  
Implemented a JavaScript solution using **regular expressions** to parse unique identifiers from the URL, cross-checked them against the **dataLayer**, and conditionally routed users into the promotion. Collaborated with backend engineers to integrate the routing cleanly with the existing stack. Added instrumentation to capture experiment results tied to engagement and conversion events.

**Result**  
The experiment successfully segmented traffic, increased engagement with the promotion, and produced clear insights into conversion behavior. It contributed to a **10% lift in monthly revenue** during the testing period and established a **reusable framework** for future targeting and personalization experiments.

<details>
  <summary><strong>What to look for in the snippet</strong></summary>

  - Regex pattern matching for unique IDs in the URL  
  - dataLayer validation (guardrails to avoid false positives)  
  - Conditional routing to a promo experience (feature-flag style branching)  
  - Minimal dependencies and clean fail-safes
</details>
