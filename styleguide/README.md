# VIK Digital Style Guide

[Explore the guide](https://donhkoland.github.io/websites_v2/styleguide/index.html) · [Brand Assets Hub](https://www.donhkoland.com/clients/vik/global/website/vik_global/brand/assets/index.html)

A working reference for VIK’s visual language, responsive states and guest journeys.

- **M01–M18:** primary modules. M01 documents header states; M02 documents five availability scenarios. Press is M15, Recognitions M16, Reservation M17 and Closing M18.
- **L:** editorial patterns. Retired IDs stay reserved.
- **R:** guest details, payment choices and enquiry. These examples never send data or make bookings.

Append future IDs within each family. Use descriptive `data-*` keys for behavior, so catalog numbering is not a code dependency.

## Shared rules

Use approved PNG brand marks, retain their proportions and supply meaningful alt text. Descriptive prose and native form options remain text. Highway Gothic Expanded is uppercase; Selva retains its original tracking. Footer structure stays consistent.

Navigation changes to compact mode when its natural content width plus comfortable spacing exceeds the available space. Forms recompose at smaller widths; they are never scaled as a whole. R uses up to 1160px with fluid margins.

L08 crossfades three paired media/text states every nine seconds while visible. Its three hairline indicators also work by keyboard. Reduced motion and data-saving preferences disable automatic playback and rotation. Galleries keep their existing inertia and lightbox behavior.

`quotes.js` holds nine short, verbatim excerpts with publication, author (where credited), property and source URL. Three distinct entries are selected on each load. Keep excerpts short enough for three lines at the smallest supported width; do not truncate or rewrite real quotes to fit. Source links now point to the verified articles.

All existing property destinations use relative routes under the GitHub Pages subpath. Missing destinations are explicitly inactive. No production styles are changed: `guide.css` and `guide.js` document this pass alongside the existing library files.

Before publishing, check 320, 390, 768, 1024, 1280 and 1440px; module IDs and anchors; relative routes; visible media; form states; and console errors.
