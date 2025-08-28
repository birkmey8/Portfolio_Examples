# LookML + SQL – GA4 Campaign Analytics View

A  LookML view that models GA4 purchase events with user properties and campaign attribution fields. This is intended to power dashboards focused on campaign performance and revenue attribution.

## Notes
- Replace `project.dataset.events_*` with your BigQuery GA4 export dataset.
- The derived table filters to `event_name = 'purchase'` over the last 365 days and to users where `logged_in_status = 'true'`.
- Dimensions expose common entities like `accountId`, `shiptoId`, `page_location`, last-click campaign attributes, and `purchase_revenue`.
