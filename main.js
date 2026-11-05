// Revive landing: reveals, the pinned "how it works" window, the formats rail, the billing switch and the FAQ.
// Every move uses the app's curves (style.css --ease / --inout). Nothing here is needed to read the page.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- the fourteen short-form formats, each playing its example clip from the app's format picker ----
  const FORMATS = [
    ["speaker", "Hook Box", "A title box over a full-frame crop on you. For one person talking to camera."],
    ["clean", "Clean", "Just you and bold captions, a word or two at a time."],
    ["studio", "Studio Podcast", "Punch-ins and captions written word by word, the argument lit in your colour."],
    ["annotation", "Colour Block", "The claim on a block of your colour, cutaways to your B-roll."],
    ["broll", "B-Roll Story", "Short cutaways to your own footage every few seconds."],
    ["documentary", "Documentary", "A big hook, then sentence captions on dark boxes."],
    ["split", "Split screen", "Two people stacked, each framed on their face."],
    ["framed", "Letterbox", "Your footage at its own shape on black, the title above it."],
    ["headline", "Headline", "A clear promise above a wide picture, a line in your accent colour."],
    ["cinema", "Cinema Box", "Wide footage in a near-square box, captions where you look."],
    ["wrap", "Wraparound", "A headline with one phrase in your accent, captions either side of your head."],
    ["margin", "Margin", "A wide picture, small lowercase captions beside you."],
    ["marginv", "Margin Vertical", "Margin in full vertical, captions at eye level."],
    ["movie", "Movie Captions", "Film subtitles on a wide picture, on screen the whole clip."],
  ];
  const rail = document.getElementById("rail");
  rail.innerHTML = FORMATS.map(([id, name, line], i) => `<article class="fmt" style="--i:${i}"><div class="phone"><video src="media/${id}.mp4" muted loop playsinline preload="none" aria-label="${name} example"></video></div><h3>${name}</h3><p>${line}</p></article>`).join("");

  // ---- videos play only while on screen ----
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; if (!reduce) v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: 0.25 });
  document.querySelectorAll("video:not(#promo)").forEach((v) => vio.observe(v));

  // ---- the promo film: muted on arrival; the button starts it over with sound, then toggles mute ----
  const promo = document.getElementById("promo"), sound = document.getElementById("sound");
  if (promo && sound) {
    const box = promo.parentElement, label = sound.firstElementChild;
    let heard = false;
    if (reduce) { promo.removeAttribute("autoplay"); promo.pause(); }
    sound.addEventListener("click", () => {
      if (!heard) { heard = true; promo.currentTime = 0; promo.muted = false; promo.play().catch(() => {}); }
      else promo.muted = !promo.muted;
      box.classList.toggle("loud", !promo.muted);
      sound.setAttribute("aria-pressed", String(!promo.muted));
      label.textContent = promo.muted ? "Sound on" : "Sound off";
    });
    // off screen it pauses; back on screen it carries on
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!reduce || heard) promo.play().catch(() => {}); } else promo.pause(); }, { threshold: 0.25 }).observe(promo);
  }

  // ---- reveal on arrival ----
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll(".r, .rail").forEach((el) => io.observe(el));
  // the hero is on screen at load: let it arrive on the next frame
  requestAnimationFrame(() => document.querySelectorAll(".hero .r").forEach((el) => el.classList.add("in")));

  // ---- nav glass after the first scroll, the hero fan opens as you scroll ----
  const nav = document.getElementById("nav"), reel = document.getElementById("reel");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 24);
    if (!reduce && reel) {
      // the fan opens on an ease-out
      // it sits under the promo film now, so it opens as it rises through the screen
      const top = reel.getBoundingClientRect().top;
      const t = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight * 0.6)));
      reel.style.setProperty("--open", (1 - Math.pow(1 - t, 3)).toFixed(3));
    }
    story();
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ---- how it works: the step nearest the middle of the screen drives the pinned window ----
  const steps = [...document.querySelectorAll(".step")], screens = [...document.querySelectorAll(".sc")], barEl = document.getElementById("storyBar");
  // the phone layout's caption under the pinned window: a copy of each step, swapped in place
  const pin = document.querySelector(".story-pin"), capBox = document.createElement("div");
  capBox.className = "story-caption"; capBox.setAttribute("aria-hidden", "true");
  capBox.innerHTML = steps.map((s) => `<div class="cap">${s.innerHTML}</div>`).join("");
  pin.appendChild(capBox);
  const caps = [...capBox.children];
  let active = -1;
  function story() {
    const mid = innerHeight * 0.5;
    let best = 0, dist = Infinity;
    steps.forEach((s, k) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + Math.min(r.height, innerHeight * 0.4) / 2 - mid); if (d < dist) { dist = d; best = k; } });
    if (best !== active) {
      active = best;
      steps.forEach((s, k) => s.classList.toggle("on", k === best));
      screens.forEach((s, k) => s.classList.toggle("on", k === best));
      caps.forEach((c, k) => c.classList.toggle("on", k === best));
    }
    const first = steps[0].getBoundingClientRect(), last = steps[steps.length - 1].getBoundingClientRect();
    const p = (mid - first.top) / (last.bottom - first.top);
    barEl.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  onScroll();
  addEventListener("resize", onScroll);

  // ---- formats rail: arrows page by a few cards; arrows dim at the ends ----
  const prev = document.getElementById("prev"), next = document.getElementById("next");
  const page = () => Math.max(rail.querySelector(".fmt").offsetWidth + 20, rail.clientWidth * 0.8);
  const ends = () => { prev.disabled = rail.scrollLeft < 8; next.disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8; };
  prev.onclick = () => rail.scrollBy({ left: -page(), behavior: "smooth" });
  next.onclick = () => rail.scrollBy({ left: page(), behavior: "smooth" });
  rail.addEventListener("scroll", ends, { passive: true });
  ends();

  // ---- billing switch: the pill glides, the numbers swap ----
  const seg = document.querySelector(".seg"), pill = document.getElementById("segPill"), opts = [...seg.querySelectorAll("button")];
  const place = (b) => { pill.style.width = `${b.offsetWidth}px`; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
  opts.forEach((b) => (b.onclick = () => {
    if (b.classList.contains("on")) return;
    opts.forEach((o) => o.classList.toggle("on", o === b)); place(b);
    const k = b.dataset.bill;
    document.querySelectorAll(".price span").forEach((s) => { s.classList.add("swap"); setTimeout(() => { s.textContent = `$${s.dataset[k]}`; s.classList.remove("swap"); }, reduce ? 0 : 220); });
    document.querySelectorAll(".billed").forEach((s) => (s.textContent = s.dataset[k]));
    // the plan buttons carry the billing period through to sign-in and checkout
    document.querySelectorAll("a[data-plan]").forEach((a) => (a.href = `start.html?plan=${a.dataset.plan}&billing=${k === "y" ? "yearly" : "monthly"}`));
  }));
  const placeOn = () => place(seg.querySelector("button.on"));
  document.fonts?.ready.then(placeOn); placeOn(); addEventListener("resize", placeOn);

  // ---- FAQ: open and close with the height easing instead of snapping ----
  document.querySelectorAll(".faq details").forEach((d) => {
    const sum = d.querySelector("summary");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) { d.classList.remove("opening"); setTimeout(() => { if (!d.classList.contains("opening")) d.open = false; }, reduce ? 0 : 600); }
      else { d.open = true; requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("opening"))); }
    });
  });
})();
