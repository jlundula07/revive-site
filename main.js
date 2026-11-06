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
  document.querySelectorAll("video:not([data-player])").forEach((v) => vio.observe(v));

  // ---- the promo film, in the app's own player (enhanceVideo in revive/desktop/ui/app.js) ----
  // Before the first press it is a muted, looping preview with the play button up. Play starts it over with sound;
  // from then on it is the app's player: the glass pill, scrub with the time under the pointer, volume, fullscreen and keys.
  const RV = {
    play: `<svg viewBox="0 0 16 16"><path d="M5.6 3.9 11.9 8l-6.3 4.1Z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    pause: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5.8 4.2v7.6M10.2 4.2v7.6"/></svg>`,
    vol: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 6.3h2l3-2.5v8.4l-3-2.5h-2Z"/><path d="M10.5 6a3 3 0 0 1 0 4M12.2 4.2a5.5 5.5 0 0 1 0 7.6"/></svg>`,
    mute: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 6.3h2l3-2.5v8.4l-3-2.5h-2Z"/><path d="m10.6 6.2 3 3.6m0-3.6-3 3.6"/></svg>`,
    replay: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.55-3.6"/><path d="M13.1 2.8v2.9H10.2"/></svg>`,
    expand: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.2V3h3.2M9.8 3H13v3.2M13 9.8V13H9.8M6.2 13H3V9.8"/></svg>`,
    shrink: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 3v3.2H3M13 6.2H9.8V3M9.8 13V9.8H13M3 9.8h3.2V13"/></svg>`,
  };
  const rvTime = (x) => (Number.isFinite(x) ? `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}` : "0:00");
  const player = (v) => {
    const w = document.createElement("div");
    w.className = "rvp preview"; w.tabIndex = 0; w.dataset.state = "paused";
    v.parentNode.insertBefore(w, v);
    w.appendChild(v);
    w.insertAdjacentHTML("beforeend", `
      <button class="rv-big" type="button" aria-label="Play with sound">${RV.play}</button>
      <div class="rv-spin"><img class="spin" src="assets/mark.svg" alt="" width="40" height="40" /></div>
      <div class="rv-ui"><div class="rv-pill">
        <button class="rv-b" data-a="play" type="button" aria-label="Play">${RV.play}</button>
        <span class="rv-cur">0:00</span>
        <div class="rv-scrub" role="slider" aria-label="Seek"><div class="rv-buf"></div><div class="rv-fill"></div><i class="rv-thumb"></i><span class="rv-tip">0:00</span></div>
        <span class="rv-dur">0:00</span>
        <div class="rv-snd"><button class="rv-b" data-a="mute" type="button" aria-label="Mute">${RV.vol}</button><input class="rv-vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume" /></div>
        <button class="rv-b" data-a="fs" type="button" aria-label="Fullscreen">${RV.expand}</button>
      </div></div>`);
    const $ = (sel) => w.querySelector(sel);
    const scrub = $(".rv-scrub"), fill = $(".rv-fill"), buf = $(".rv-buf"), tip = $(".rv-tip"), cur = $(".rv-cur"), dtx = $(".rv-dur"), vol = $(".rv-vol"), big = $(".rv-big");
    let live = false, idleT = null;
    const dur = () => (Number.isFinite(v.duration) ? v.duration : 0);
    const start = () => { live = true; w.classList.remove("preview"); v.loop = false; v.currentTime = 0; v.muted = false; v.play().catch(() => {}); };
    const toggle = () => (!live ? start() : v.paused || v.ended ? v.play().catch(() => {}) : v.pause());
    const replay = () => { v.currentTime = 0; v.play().catch(() => {}); };
    const wake = () => { w.classList.remove("idle"); clearTimeout(idleT); if (live && !v.paused) idleT = setTimeout(() => w.classList.add("idle"), 2200); };
    const draw = () => {
      const d = dur(), c = v.currentTime || 0;
      fill.style.transform = `scaleX(${d ? c / d : 0})`;
      $(".rv-thumb").style.left = `${d ? (c / d) * 100 : 0}%`;
      cur.textContent = rvTime(c); dtx.textContent = rvTime(d);
    };
    const state = () => {
      const st = v.ended ? "ended" : v.paused ? "paused" : "playing";
      w.dataset.state = st;
      big.innerHTML = st === "ended" ? RV.replay : RV.play;
      $('[data-a="play"]').innerHTML = st === "playing" ? RV.pause : RV.play;
      $('[data-a="play"]').setAttribute("aria-label", st === "playing" ? "Pause" : "Play");
      if (st !== "playing") { clearTimeout(idleT); w.classList.remove("idle"); } else wake();
    };
    const sound = () => { $('[data-a="mute"]').innerHTML = v.muted || v.volume === 0 ? RV.mute : RV.vol; vol.value = v.muted ? 0 : v.volume; vol.style.setProperty("--v", `${(v.muted ? 0 : v.volume) * 100}%`); };
    const buffered = () => { const d = dur(); let e = 0; for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime + 0.5) e = Math.max(e, v.buffered.end(i)); buf.style.transform = `scaleX(${d ? e / d : 0})`; };
    ["timeupdate", "loadedmetadata", "durationchange", "seeked"].forEach((n) => v.addEventListener(n, draw));
    v.addEventListener("play", () => live && document.querySelectorAll(".rvp video").forEach((o) => o !== v && o.pause()));
    ["progress", "loadedmetadata", "timeupdate"].forEach((n) => v.addEventListener(n, buffered));
    ["play", "pause", "ended", "playing"].forEach((n) => v.addEventListener(n, () => { state(); w.classList.remove("buffering"); }));
    v.addEventListener("waiting", () => live && w.classList.add("buffering"));
    ["canplay", "playing", "seeked"].forEach((n) => v.addEventListener(n, () => w.classList.remove("buffering")));
    v.addEventListener("volumechange", sound);
    v.addEventListener("click", toggle);
    v.addEventListener("dblclick", () => live && fullscreen());
    big.addEventListener("click", (e) => { e.stopPropagation(); !live ? start() : v.ended ? replay() : toggle(); });
    vol.addEventListener("input", () => { v.muted = false; v.volume = Number(vol.value); });
    w.addEventListener("pointermove", wake);
    w.addEventListener("pointerdown", () => w.classList.add("touched"));

    // scrubbing: click or drag the line, with the time under the pointer
    const at = (e) => { const r = scrub.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
    scrub.addEventListener("pointermove", (e) => { const x = at(e); tip.textContent = rvTime(x * dur()); tip.style.left = `${x * 100}%`; if (scrub.dataset.drag) v.currentTime = x * dur(); });
    scrub.addEventListener("pointerdown", (e) => { scrub.setPointerCapture(e.pointerId); scrub.dataset.drag = "1"; v.currentTime = at(e) * dur(); });
    scrub.addEventListener("pointerup", () => delete scrub.dataset.drag);

    // fullscreen: the browser's own here (the app animates its window instead); iPhone only lets the video itself go fullscreen
    const fullscreen = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (w.requestFullscreen) w.requestFullscreen().catch(() => {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    };
    document.addEventListener("fullscreenchange", () => { $('[data-a="fs"]').innerHTML = document.fullscreenElement === w ? RV.shrink : RV.expand; });

    w.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      ({ play: toggle, mute: () => (v.muted = !v.muted), replay, fs: fullscreen })[b.dataset.a]();
    });
    w.addEventListener("keydown", (e) => {
      if (e.target === vol || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase(), go = (fn) => { e.preventDefault(); fn(); wake(); };
      if (k === " " || k === "k") go(toggle);
      else if (!live) return;
      else if (k === "m") go(() => (v.muted = !v.muted));
      else if (k === "f") go(fullscreen);
      else if (k === "r") go(replay);
      else if (k === "arrowleft") go(() => (v.currentTime = Math.max(0, v.currentTime - 5)));
      else if (k === "arrowright") go(() => (v.currentTime = Math.min(dur(), v.currentTime + 5)));
      else if (k === "arrowup") go(() => { v.muted = false; v.volume = Math.min(1, v.volume + 0.1); });
      else if (k === "arrowdown") go(() => (v.volume = Math.max(0, v.volume - 0.1)));
    });
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
    // the muted preview rests off screen; once they press play it is theirs to stop
    new IntersectionObserver(([e]) => { if (live) return; if (e.isIntersecting) { if (!reduce) v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.25 }).observe(w);
    draw(); state(); sound();
  };
  document.querySelectorAll("video[data-player]").forEach(player);

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
