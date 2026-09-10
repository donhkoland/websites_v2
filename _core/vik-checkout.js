/* ══════════════════════════════════════════════════════════════
   VIK JOSÉ IGNACIO · BOOKING LIGHTBOX + CHECKOUT WALKTHROUGH

   Two things live here.

   1 · Check Availability opens Bookassist in a lightbox rather than a
       new tab, so the guest never leaves the site. The engine runs in
       an iframe against the URL vik-booking.js composes.

   2 · A four-step checkout walkthrough — stay, guest, payment,
       confirmation — for reviewing the flow end to end.

   On payment: this is a prototype of the FLOW, not a card capture.
   Bookassist and PayPal take the card on their own PCI-compliant
   pages, which is where it belongs; putting a real card field on a
   marketing site would move the site into PCI scope for no reason.
   The card block here is a disabled preview so the step can be seen
   and approved, and it says so on screen.

   Markup: <div data-vik-checkout></div> anywhere on the page.

   Authored by Nicolás Castillo · @donhkoland
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $  = (s, sc = document) => sc.querySelector(s);
  const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

  window.VIK = window.VIK || {};

  const RETREATS = {
    any:      "VIK José Ignacio",
    estancia: "Estancia VIK",
    playa:    "Playa VIK",
    bahia:    "Bahía VIK"
  };

  const fmt = iso => {
    if (!iso) return "—";
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const nights = (a, b) => {
    if (!a || !b) return 0;
    return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
  };

  /* ── The shell ───────────────────────────────────────────── */
  const markup = () => `
  <div class="ck" id="vikCheckout" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Book your stay">
    <div class="ck-backdrop" data-ck-close></div>
    <div class="ck-panel">

      <header class="ck-head">
        <div class="ck-steps">
          <button class="ck-step is-on" type="button" data-ck-step="1"><span class="n">01</span><span class="l">Stay</span></button>
          <button class="ck-step" type="button" data-ck-step="2"><span class="n">02</span><span class="l">Guest</span></button>
          <button class="ck-step" type="button" data-ck-step="3"><span class="n">03</span><span class="l">Payment</span></button>
          <button class="ck-step" type="button" data-ck-step="4"><span class="n">04</span><span class="l">Confirmed</span></button>
        </div>
        <button class="ck-close" type="button" data-ck-close aria-label="Close">✕</button>
      </header>

      <div class="ck-body">

        <!-- 01 · the stay, straight from the booking engine -->
        <section class="ck-pane is-on" data-ck-pane="1">
          <div class="ck-live">
            <span class="ui-label" style="opacity:.45">Availability</span>
            <p class="ck-note">Live rates and rooms come from Bookassist. The engine loads below; everything after it is the VIK layer around it.</p>
            <div class="ck-frame">
              <iframe id="ckEngine" title="Bookassist booking engine" loading="lazy" referrerpolicy="no-referrer"></iframe>
              <div class="ck-frame-fallback">
                <p>The booking engine opens here once the live Bookassist URL is set in <span class="text-vik">vik-booking.js</span>.</p>
                <a class="btn-line" id="ckEngineLink" href="#" target="_blank" rel="noopener"><span>Open the engine in a new tab</span><span class="arw">→</span></a>
              </div>
            </div>
          </div>
          <aside class="ck-summary">
            <span class="ui-label" style="opacity:.45">Your stay</span>
            <div class="ck-facts">
              <div><span>Retreat</span><span data-ck="retreat">—</span></div>
              <div><span>Arrive</span><span data-ck="in">—</span></div>
              <div><span>Depart</span><span data-ck="out">—</span></div>
              <div><span>Nights</span><span data-ck="nights">—</span></div>
              <div><span>Guests</span><span data-ck="guests">—</span></div>
            </div>
            <p class="ck-note">Rate confirmed at the next step. Nothing is charged until you approve it.</p>
            <button class="bk-submit standalone" type="button" data-ck-next="2"><span>Continue</span><span class="arw">→</span></button>
          </aside>
        </section>

        <!-- 02 · who is coming -->
        <section class="ck-pane" data-ck-pane="2">
          <form class="enq-form ck-form" onsubmit="return false">
            <div class="enq-field"><span class="n">01</span><label for="ckName">Full name</label><input id="ckName" type="text" placeholder="As it appears on your passport"></div>
            <div class="enq-field"><span class="n">02</span><label for="ckMail">Email</label><input id="ckMail" type="email" placeholder="you@email.com"></div>
            <div class="enq-pair">
              <div class="enq-field"><span class="n">03</span><label for="ckPhone">Phone</label><input id="ckPhone" type="tel" placeholder="+598"></div>
              <div class="enq-field"><span class="n">04</span><label for="ckCountry">Country</label><input id="ckCountry" type="text" placeholder="Uruguay"></div>
            </div>
            <div class="enq-field"><span class="n">05</span><label for="ckNotes">Anything we should know</label><textarea id="ckNotes" rows="2" placeholder="Arrival time, dietary needs, a birthday, children's ages."></textarea></div>
          </form>
          <aside class="ck-summary">
            <span class="ui-label" style="opacity:.45">Your stay</span>
            <div class="ck-facts">
              <div><span>Retreat</span><span data-ck="retreat">—</span></div>
              <div><span>Dates</span><span data-ck="range">—</span></div>
              <div><span>Guests</span><span data-ck="guests">—</span></div>
            </div>
            <p class="ck-note">A Journey Designer reads every booking and writes back before you arrive.</p>
            <div class="ck-actions">
              <button class="btn-line" type="button" data-ck-next="1"><span>Back</span></button>
              <button class="bk-submit standalone" type="button" data-ck-next="3"><span>Continue to payment</span><span class="arw">→</span></button>
            </div>
          </aside>
        </section>

        <!-- 03 · payment, handed to the provider -->
        <section class="ck-pane" data-ck-pane="3">
          <div class="ck-pay">
            <span class="ui-label" style="opacity:.45">Payment</span>
            <h3 class="ck-h">Choose how to pay.</h3>
            <div class="ck-methods">
              <button class="ck-method is-on" type="button" data-ck-method="card">
                <span class="k">Card</span>
                <span class="v">Visa · Mastercard · Amex</span>
                <span class="s">Taken on the Bookassist secure page</span>
              </button>
              <button class="ck-method" type="button" data-ck-method="paypal">
                <span class="k">PayPal</span>
                <span class="v">Available for the José Ignacio properties</span>
                <span class="s">You approve the amount in your PayPal account</span>
              </button>
              <button class="ck-method" type="button" data-ck-method="hold">
                <span class="k">Hold</span>
                <span class="v">Reserve for 24 hours</span>
                <span class="s">No card now — a Journey Designer confirms</span>
              </button>
            </div>

            <div class="ck-cardpreview" data-ck-when="card">
              <p class="ck-note ck-warn">Preview only. The card is entered on the provider's own secure page — never on this site, which is what keeps VIK out of PCI scope.</p>
              <div class="ck-cardgrid" aria-hidden="true">
                <div class="enq-field"><label>Card number</label><input type="text" value="•••• •••• •••• ••••" disabled></div>
                <div class="enq-field"><label>Expiry</label><input type="text" value="MM / YY" disabled></div>
                <div class="enq-field"><label>CVC</label><input type="text" value="•••" disabled></div>
              </div>
            </div>
            <div class="ck-cardpreview" data-ck-when="paypal" hidden>
              <p class="ck-note">You will be handed to PayPal to approve the amount, then returned here.</p>
            </div>
            <div class="ck-cardpreview" data-ck-when="hold" hidden>
              <p class="ck-note">The room is held for 24 hours. A Journey Designer writes to confirm and takes payment however suits you.</p>
            </div>
          </div>

          <aside class="ck-summary">
            <span class="ui-label" style="opacity:.45">Total</span>
            <div class="ck-facts">
              <div><span>Retreat</span><span data-ck="retreat">—</span></div>
              <div><span>Dates</span><span data-ck="range">—</span></div>
              <div><span>Nights</span><span data-ck="nights">—</span></div>
              <div><span>Rate</span><span>Confirmed by the engine</span></div>
            </div>
            <p class="ck-note">Free cancellation applies outside the season window. Terms shown by the engine before you confirm.</p>
            <div class="ck-actions">
              <button class="btn-line" type="button" data-ck-next="2"><span>Back</span></button>
              <button class="bk-submit standalone" type="button" data-ck-next="4"><span>Confirm booking</span><span class="arw">→</span></button>
            </div>
          </aside>
        </section>

        <!-- 04 · done -->
        <section class="ck-pane ck-done" data-ck-pane="4">
          <div class="ck-donein">
            <span class="ui-label text-vik">Confirmed</span>
            <h3 class="ck-h">We will be expecting you.</h3>
            <p class="ck-note">A confirmation is on its way to <span data-ck="email">your email</span>. Your Journey Designer writes separately, before you travel, to arrange transfers, tables and anything else.</p>
            <div class="ck-facts">
              <div><span>Retreat</span><span data-ck="retreat">—</span></div>
              <div><span>Dates</span><span data-ck="range">—</span></div>
              <div><span>Guests</span><span data-ck="guests">—</span></div>
              <div><span>Reference</span><span data-ck="ref">—</span></div>
            </div>
            <div class="ck-actions">
              <a class="btn-line" href="../contact/"><span>Pre-arrival requests</span><span class="arw">→</span></a>
              <button class="bk-submit standalone" type="button" data-ck-close><span>Done</span></button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>`;

  /* ── Behaviour ───────────────────────────────────────────── */
  const boot = () => {
    const mount = $("[data-vik-checkout]");
    if (!mount) return;
    mount.outerHTML = markup();

    const box = $("#vikCheckout");
    const panes = $$(".ck-pane", box);
    const steps = $$(".ck-step", box);
    let lastFocus = null;

    const setStep = n => {
      panes.forEach(p => p.classList.toggle("is-on", p.dataset.ckPane === String(n)));
      steps.forEach(s => {
        const k = Number(s.dataset.ckStep);
        s.classList.toggle("is-on", k === n);
        s.classList.toggle("is-done", k < n);
      });
      const body = $(".ck-body", box);
      if (body) body.scrollTop = 0;
    };

    const fill = data => {
      const set = (k, v) => $$('[data-ck="' + k + '"]', box).forEach(e => e.textContent = v);
      const n = nights(data.in, data.out);
      set("retreat", RETREATS[data.property] || RETREATS.any);
      set("in", fmt(data.in));
      set("out", fmt(data.out));
      set("range", fmt(data.in) + " — " + fmt(data.out));
      set("nights", n ? n + (n === 1 ? " night" : " nights") : "—");
      set("guests", (data.adults || 2) + " · " + (data.rooms || 1) + " room");
      set("ref", "VIK-" + String(Date.now()).slice(-6));
      const url = window.VIK.booking ? window.VIK.booking.buildURL(data) : "";
      const frame = $("#ckEngine", box), link = $("#ckEngineLink", box);
      if (url && url.indexOf("http") === 0) {
        if (frame) frame.src = url;
        if (link) link.href = url;
      }
    };

    const open = data => {
      lastFocus = document.activeElement;
      fill(data || {});
      setStep(1);
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("ck-open");
      window.VIK.lenis && window.VIK.lenis.stop();
      const c = $(".ck-close", box);
      c && c.focus({ preventScroll: true });
    };

    const close = () => {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("ck-open");
      window.VIK.lenis && window.VIK.lenis.start();
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    };

    $$("[data-ck-close]", box).forEach(b => b.addEventListener("click", close));
    $$("[data-ck-next]", box).forEach(b =>
      b.addEventListener("click", () => {
        if (b.dataset.ckNext === "4") {
          const mail = $("#ckMail", box);
          $$('[data-ck="email"]', box).forEach(e => {
            if (mail && mail.value) e.textContent = mail.value;
          });
        }
        setStep(Number(b.dataset.ckNext));
      }));
    steps.forEach(s => s.addEventListener("click", () => setStep(Number(s.dataset.ckStep))));
    $$("[data-ck-method]", box).forEach(b => b.addEventListener("click", () => {
      $$("[data-ck-method]", box).forEach(x => x.classList.toggle("is-on", x === b));
      $$("[data-ck-when]", box).forEach(w => w.hidden = w.dataset.ckWhen !== b.dataset.ckMethod);
    }));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
    });

    /* Every booking form and Book Your Stay link comes through here. */
    document.addEventListener("vik:book", e => {
      e.detail && e.detail.data && open(e.detail.data);
    });

    window.VIK.checkout = { open, close, setStep };
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
