// Revive accounts on the website: the same account server the app uses (Supabase project "revive"). The anon key is
// public by design; what it can reach is limited by row level security (splittr/docs/supabase/*.sql).
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

export const SERVER_URL = "https://reuiwbicnphzqgckkxbp.supabase.co";
const SERVER_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldWl3YmljbnBoenFnY2treGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1ODg2MDMsImV4cCI6MjEwOTE2NDYwM30.9y3Q-SrBr833ZSqmoHpM93cACH5OGdemVBm5DuTpEu8";

export const supabase = createClient(SERVER_URL, SERVER_KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } });

// While payments are on hold, signing in is the pass: an account goes straight to the download. Flip to false at full launch.
export const EARLY_ACCESS = false;
// Stand-in for Commas until payments open: "Continue to payment" pretends it went through and goes to the welcome
// page. Nothing is charged and no plan is saved on the account. Set to false when checkout goes live.
export const FAKE_PAYMENT = true;

export const PLAN_NAMES = { hobbyist: "Hobbyist", creator: "Creator", agency: "Agency" };

// A plan counts while it is paid up, while Commas is retrying a failed renewal, or after a cancel until the paid period ends.
export function planActive(row) {
  if (!row) return false;
  if (row.status === "active" || row.status === "past_due") return true;
  return row.status === "canceled" && row.current_period_end && new Date(row.current_period_end) > new Date();
}

export async function mySubscription() {
  const { data } = await supabase.from("subscriptions").select("*").maybeSingle();
  return data;
}

// Plain words for what Supabase reports; the person never sees a raw error code.
export function say(err) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match an account.";
  if (m.includes("already registered") || m.includes("already been registered")) return "There's already an account with that email. Log in instead.";
  if (m.includes("password") && m.includes("6")) return "Use a password of at least 8 characters.";
  if (m.includes("rate")) return "Too many tries. Wait a minute, then try again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach Revive. Check your connection and try again.";
  return "Something didn't work. Try again in a moment.";
}
