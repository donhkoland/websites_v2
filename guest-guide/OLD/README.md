# VIK Guest Guide

An editorial guest experience built on the approved Guest Guide flow and the local VIK visual system.

**Utility → Discovery → Visual impact → Utility.**

Open `index.html` through the project’s web server. The generic entry offers three properties. Room QR links go directly to `index.html?property=playa`, `?property=bahia` or `?property=estancia`; hash routes such as `index.html#/playa/dining` also preserve the property context.

- Home, Guest Information, Dining, Experiences, Wellness and Explore VIK are complete.
- Categories stay below the header while scrolling. Modules can be collapsed; 3:4 stories swipe horizontally and expand in place. Mouse drag and keyboard arrow navigation are supported.
- Prices and durations remain visible before expansion. The initial modules are open, so reaching an item detail does not require opening an extra level.
- Videos use the existing local library, load only near visible cards and pause out of view. Reduced motion and data saving retain static poster frames. Media is not repeated within an individual view.
- WhatsApp actions prepare a message with property and item context. They never send a message or create a booking automatically.

`content.js` holds guest content and explicit pending states. `guest-guide.js` owns navigation and reusable modules. `guest-guide.css` adapts local VIK typography, color and spacing. All fonts, logos, photography and video use existing relative project paths; no remote font service or framework is required.

The supplied reference HTML files remain unchanged. See [content notes](CONTENT-NOTES.md) for unresolved information before a guest-facing launch.
