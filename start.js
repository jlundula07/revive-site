// Get started: sign in (or create the account), choose a plan, pay. The landing page's pricing buttons arrive here with
// ?plan=…&billing=…, which pre-select the choice. Paying opens a Commas checkout made for this account (the `checkout`
// server function); Commas then sends the buyer to welcome.html, which waits for the signed payment notice.
import { supabase, SERVER_URL, PLAN_NAMES, planActive, mySubscription, say } from "./account.js";

const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
let plan = PLAN_NAMES[q.get("plan")] ? q.get("plan") : "creator";
let billing = q.get("billing") === "yearly" ? "yearly" : "monthly";
let mode = q.get("mode") === "login" ? "login" : "signup";

const show = (id) => ["paneAuth", "panePlan", "paneWait"].forEach((p) => {
  const el = $(p);
  el.hidden = p !== id;
  if (p === id) { el.classList.remove("in"); requestAnimationFrame(() => el.classList.add("in")); }
});
const wait = (title) => { $("waitTitle").textContent = title; show("paneWait"); };

// the gliding pill under a segmented switch, as on the landing page
const glide = (seg, pill) => { const b = seg.querySelector("button.on"); pill.style.width = `${b.offsetWidth}px`; pill.style.transform = `translateX(${b.offsetLeft}px)`; };

// ---- step 1: account ----
function drawAuth() {
  const signup = mode === "signup";
  $("authTitle").textContent = signup ? "Create your account." : "Welcome back.";
  $("authSub").textContent = signup ? "The same account signs you in to the Revive app." : "Log in to choose your plan.";
  $("authGo").textContent = signup ? "Create account" : "Log in";
  $("password").autocomplete = signup ? "new-password" : "current-password";
  $("pwHint").hidden = !signup;
  document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("on", b.dataset.mode === mode));
  glide(document.querySelector(".auth-seg"), $("authPill"));
  $("authErr").textContent = "";
}
document.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => { mode = b.dataset.mode; drawAuth(); }));

$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("email").value.trim(), password = $("password").value;
  if (!/^\S+@\S+\.\S+$/.test(email)) return ($("authErr").textContent = "Enter your email address.");
  if (password.length < 8) return ($("authErr").textContent = "Use a password of at least 8 characters.");
  $("authGo").disabled = true;
  const { error } = mode === "signup"
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password });
  $("authGo").disabled = false;
  if (error) return ($("authErr").textContent = say(error));
  route();
};

$("google").onclick = async () => {
  // Google comes back to this page with the same plan choice
  const back = new URL(location.href);
  back.searchParams.set("plan", plan); back.searchParams.set("billing", billing);
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: back.toString() } });
  if (error) $("authErr").textContent = say(error);
};

// ---- step 2: plan ----
function drawPlan() {
  document.querySelectorAll("[data-billing]").forEach((b) => b.classList.toggle("on", b.dataset.billing === billing));
  document.querySelectorAll(".choice").forEach((c) => {
    c.classList.toggle("on", c.dataset.plan === plan);
    const price = c.querySelector("em"); price.textContent = billing === "yearly" ? price.dataset.y : price.dataset.m;
  });
  glide($("billSeg"), $("billPill"));
  $("pay").textContent = `Continue to payment · ${PLAN_NAMES[plan]}`;
  $("planErr").textContent = "";
}
document.querySelectorAll("[data-billing]").forEach((b) => (b.onclick = () => { billing = b.dataset.billing; drawPlan(); }));
document.querySelectorAll(".choice").forEach((c) => (c.onclick = () => { plan = c.dataset.plan; drawPlan(); }));

$("pay").onclick = async () => {
  $("pay").disabled = true;
  wait("Opening checkout.");
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${SERVER_URL}/functions/v1/checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ plan, billing }),
  }).catch(() => null);
  const body = res ? await res.json().catch(() => ({})) : {};
  $("pay").disabled = false;
  if (res?.ok && body.url) return location.assign(body.url);
  if (body.error === "already_subscribed") return location.assign(`welcome.html?plan=${body.plan}`);
  show("panePlan");
  $("planErr").textContent = res?.status === 401 ? "Your sign-in ran out. Log in again." : body.error || "Checkout couldn't open. Try again in a moment.";
};

$("signout").onclick = async () => { await supabase.auth.signOut(); mode = "login"; route(); };

// ---- where this person belongs ----
async function route() {
  const { data: { session } } = await supabase.auth.getSession();
  const who = $("who");
  who.hidden = !session; who.textContent = session?.user?.email || "";
  if (!session) { show("paneAuth"); drawAuth(); return; }
  // already paying: straight to the welcome page and the download
  if (planActive(await mySubscription().catch(() => null))) return location.replace("welcome.html");
  show("panePlan"); drawPlan();
}

addEventListener("resize", () => { if (!$("paneAuth").hidden) drawAuth(); if (!$("panePlan").hidden) drawPlan(); });
wait("One moment.");
document.fonts?.ready.then(route) ?? route();
