// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// TASQNOW PRICING & PAYMENT SYSTEM
// Drop this file into src/ and import into App.tsx
// Requires: npm install flutterwave-react-v3
// Get free Flutterwave keys at: dashboard.flutterwave.com
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const ORANGE = "#F07320";
const ORANGE_DARK = "#C85A10";
const ORANGE_LIGHT = "#FEF0E7";
const TEAL = "#0D9488";
const TEAL_LIGHT = "#F0FDFA";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

// ── CONFIG — change these ────────────────────────────────────────────────────
const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY || "FLWPUBK_TEST-XXXX"; // your Flutterwave public key
const TRIAL_DAYS = 90;       // 3 months
const BASIC_PRICE_UGX = 15000;
const POST_PRICE_UGX = 3000;
const COMPANY_NAME = "TasqNow";
const COMPANY_EMAIL = "pay@tasqnow.com"; // your receiving email on Flutterwave

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function getTrialInfo(user) {
  if (!user) return { active: false, daysLeft: 0, expired: true };
  const key = `tasqnow_trial_${user.email || user.name}`;
  let start = localStorage.getItem(key);
  if (!start) {
    start = new Date().toISOString();
    localStorage.setItem(key, start);
  }
  const elapsed = (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
  return { active: daysLeft > 0, daysLeft, expired: daysLeft === 0, startDate: start };
}

export function getSubscription(user) {
  if (!user) return null;
  const key = `tasqnow_sub_${user.email || user.name}`;
  const sub = localStorage.getItem(key);
  return sub ? JSON.parse(sub) : null;
}

export function setSubscription(user, plan) {
  const key = `tasqnow_sub_${user.email || user.name}`;
  const sub = { plan, activatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString() };
  localStorage.setItem(key, JSON.stringify(sub));
  return sub;
}

export function canPostJob(user) {
  if (!user) return { allowed: false, reason: "login" };
  const trial = getTrialInfo(user);
  if (trial.active) return { allowed: true, reason: "trial", daysLeft: trial.daysLeft };
  const sub = getSubscription(user);
  if (sub && new Date(sub.expiresAt) > new Date()) return { allowed: true, reason: "paid" };
  return { allowed: false, reason: "expired" };
}

// ── TRIAL BANNER ─────────────────────────────────────────────────────────────
export function TrialBanner({ user, onUpgrade }) {
  const trial = getTrialInfo(user);
  if (!user || !trial.active) return null;
  const urgent = trial.daysLeft <= 14;
  return (
    <div style={{
      background: urgent ? "#FEF3C7" : ORANGE_LIGHT,
      border: `1px solid ${urgent ? "#F59E0B" : ORANGE}`,
      borderRadius: 10, padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, flexWrap: "wrap", marginBottom: 16,
      fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{urgent ? "⚠️" : "🎉"}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: urgent ? "#92400E" : ORANGE_DARK }}>
            {urgent ? `Trial ending soon!` : `Free trial active`}
          </div>
          <div style={{ fontSize: 12, color: urgent ? "#B45309" : "#9A3412" }}>
            {trial.daysLeft} day{trial.daysLeft !== 1 ? "s" : ""} left — post jobs for free until then
          </div>
        </div>
      </div>
      {urgent && (
        <button onClick={onUpgrade} style={{
          padding: "7px 16px", borderRadius: 8, background: ORANGE, border: "none",
          color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: FONT,
          whiteSpace: "nowrap",
        }}>
          Upgrade Now
        </button>
      )}
    </div>
  );
}

// ── PRICING MODAL ─────────────────────────────────────────────────────────────
export function PricingModal({ user, onClose, onSuccess }) {
  const [selected, setSelected] = useState("basic");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const trial = getTrialInfo(user);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: BASIC_PRICE_UGX,
      period: "per month",
      tag: "Most popular",
      tagColor: TEAL,
      features: ["Unlimited job posts", "All categories", "Applicant messaging", "Job analytics"],
    },
    {
      id: "post",
      name: "Pay per post",
      price: POST_PRICE_UGX,
      period: "per job post",
      tag: "Occasional hiring",
      tagColor: "#8B5CF6",
      features: ["Single job listing", "30-day visibility", "All applicants", "Messaging included"],
    },
  ];

  const handlePay = () => {
    if (typeof window === "undefined") return;
    setPaying(true);

    const amount = selected === "basic" ? BASIC_PRICE_UGX : POST_PRICE_UGX;
    const ref = `TASQ-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

    // Load Flutterwave inline script
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => {
      window.FlutterwaveCheckout({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: ref,
        amount,
        currency: "UGX",
        payment_options: "mobilemoneyghanauganda,card",
        customer: {
          email: user?.email || "user@tasqnow.com",
          name: user?.name || "TasqNow User",
        },
        meta: { plan: selected },
        customizations: {
          title: COMPANY_NAME,
          description: selected === "basic" ? "Basic Monthly Plan" : "Single Job Post",
          logo: "https://tasqnow.vercel.app/favicon.ico",
        },
        callback: (response) => {
          if (response.status === "successful" || response.status === "completed") {
            setSubscription(user, selected);
            setDone(true);
            setTimeout(() => { onSuccess && onSuccess(selected); onClose(); }, 2000);
          }
          setPaying(false);
        },
        onclose: () => setPaying(false),
      });
    };
    document.body.appendChild(script);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460,
        boxShadow:"0 24px 64px rgba(0,0,0,0.15)", overflow:"hidden", fontFamily: FONT }}>

        {done ? (
          <div style={{ padding:"48px 32px", textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
            <div style={{ fontWeight:800, fontSize:22, marginBottom:8 }}>You're all set!</div>
            <div style={{ color:"#6B7280", fontSize:14 }}>Your plan is now active. Start posting jobs!</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
              padding:"24px 24px 20px", position:"relative" }}>
              <button onClick={onClose} style={{ position:"absolute", top:16, right:16,
                background:"rgba(255,255,255,.2)", border:"none", borderRadius:"50%",
                width:30, height:30, cursor:"pointer", color:"#fff", fontSize:18,
                display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              <div style={{ fontWeight:800, fontSize:20, color:"#fff", marginBottom:4 }}>
                {trial.expired ? "Your free trial has ended" : "Upgrade your account"}
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.8)" }}>
                {trial.expired
                  ? "Choose a plan to keep posting jobs on TasqNow"
                  : "Lock in your rate before your trial ends"}
              </div>
            </div>

            <div style={{ padding:"20px 24px 24px" }}>
              {/* Plan cards */}
              <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                {plans.map(p => (
                  <div key={p.id} onClick={() => setSelected(p.id)} style={{
                    flex:1, border:`2px solid ${selected===p.id ? ORANGE : "#E5E7EB"}`,
                    borderRadius:14, padding:"14px 14px 16px", cursor:"pointer",
                    background: selected===p.id ? ORANGE_LIGHT : "#fff",
                    transition:"all .15s", position:"relative",
                  }}>
                    <div style={{ display:"inline-block", background: p.tagColor+"18",
                      color: p.tagColor, fontSize:10, fontWeight:700, padding:"2px 8px",
                      borderRadius:100, marginBottom:8, letterSpacing:".04em" }}>
                      {p.tag}
                    </div>
                    <div style={{ fontWeight:800, fontSize:16, color:"#111827", marginBottom:2 }}>{p.name}</div>
                    <div style={{ marginBottom:12 }}>
                      <span style={{ fontWeight:800, fontSize:22, color: selected===p.id ? ORANGE : "#111827" }}>
                        UGX {p.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize:11, color:"#9CA3AF", marginLeft:4 }}>{p.period}</span>
                    </div>
                    {p.features.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:6,
                        fontSize:12, color:"#374151", marginBottom:4 }}>
                        <div style={{ width:14, height:14, borderRadius:"50%",
                          background: selected===p.id ? ORANGE : "#D1FAE5",
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        {f}
                      </div>
                    ))}
                    {selected === p.id && (
                      <div style={{ position:"absolute", top:12, right:12, width:18, height:18,
                        borderRadius:"50%", background:ORANGE, display:"flex",
                        alignItems:"center", justifyContent:"center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment methods note */}
              <div style={{ background:"#F9FAFB", borderRadius:10, padding:"10px 14px",
                marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>📱</span>
                <div style={{ fontSize:12, color:"#6B7280" }}>
                  Pay with <strong style={{color:"#111827"}}>MTN Mobile Money</strong> or{" "}
                  <strong style={{color:"#111827"}}>Airtel Money</strong> — no card needed
                </div>
              </div>

              <button onClick={handlePay} disabled={paying} style={{
                width:"100%", padding:"14px", background: paying ? "#9CA3AF" : ORANGE,
                color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15,
                cursor: paying ? "not-allowed" : "pointer", fontFamily: FONT, transition:"all .15s",
              }}>
                {paying ? "Opening payment..." : `Pay UGX ${(selected==="basic"?BASIC_PRICE_UGX:POST_PRICE_UGX).toLocaleString()}`}
              </button>

              <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#9CA3AF" }}>
                Secured by Flutterwave · Cancel anytime
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PAYWALL GATE (wrap around Post a Gig) ────────────────────────────────────
export function PostGigGate({ user, setAuthMode, children }) {
  const [showPricing, setShowPricing] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user) setStatus(canPostJob(user));
  }, [user]);

  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px", fontFamily:FONT }}>
      <div style={{ fontSize:40, marginBottom:16 }}>📋</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8 }}>Sign in to post a gig</div>
      <div style={{ color:"#6B7280", marginBottom:24, fontSize:14 }}>
        Create a free account to start hiring skilled workers in Kampala.
      </div>
      <button onClick={() => setAuthMode("signup")} style={{
        width:"100%", maxWidth:300, padding:"13px", background:ORANGE, color:"#fff",
        border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:FONT,
      }}>Create Free Account</button>
    </div>
  );

  if (status?.allowed) return (
    <div>
      <TrialBanner user={user} onUpgrade={() => setShowPricing(true)} />
      {status.reason === "trial" && (
        <div style={{ background:TEAL_LIGHT, border:`1px solid ${TEAL}`, borderRadius:10,
          padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10, fontFamily:FONT }}>
          <span style={{ fontSize:16 }}>✅</span>
          <div style={{ fontSize:13, color:"#0F766E" }}>
            <strong>Free trial active</strong> · {status.daysLeft} days remaining · Post unlimited jobs for free!
          </div>
        </div>
      )}
      {status.reason === "paid" && (
        <div style={{ background:TEAL_LIGHT, border:`1px solid ${TEAL}`, borderRadius:10,
          padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10, fontFamily:FONT }}>
          <span style={{ fontSize:16 }}>👑</span>
          <div style={{ fontSize:13, color:"#0F766E" }}>
            <strong>Active subscription</strong> · Post unlimited jobs
          </div>
        </div>
      )}
      {children}
      {showPricing && <PricingModal user={user} onClose={() => setShowPricing(false)}
        onSuccess={() => setStatus(canPostJob(user))} />}
    </div>
  );

  return (
    <>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px", fontFamily:FONT }}>
        {/* Expired state */}
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:14,
          padding:"20px 20px 24px", textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⏰</div>
          <div style={{ fontWeight:800, fontSize:18, color:"#991B1B", marginBottom:6 }}>
            Your free trial has ended
          </div>
          <div style={{ fontSize:14, color:"#B91C1C", marginBottom:0, lineHeight:1.6 }}>
            You've used your 3-month free trial. Choose a plan below to continue posting jobs on TasqNow.
          </div>
        </div>

        {/* Inline pricing cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
          {[
            { id:"basic", icon:"♾️", name:"Monthly Plan", price:15000, period:"/month",
              desc:"Best for regular hiring", color:ORANGE, features:["Unlimited posts","All categories","Priority listing"] },
            { id:"post", icon:"📌", name:"Pay per post", price:3000, period:"/post",
              desc:"For occasional hiring", color:"#8B5CF6", features:["One job listing","30-day visibility","All applicants"] },
          ].map(p => (
            <div key={p.id} style={{ border:`2px solid ${p.color}`, borderRadius:14, padding:16,
              background: p.id==="basic" ? ORANGE_LIGHT : "#F5F3FF" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{p.icon}</div>
              <div style={{ fontWeight:800, fontSize:15, color:"#111827", marginBottom:2 }}>{p.name}</div>
              <div style={{ fontWeight:800, fontSize:20, color:p.color, marginBottom:4 }}>
                UGX {p.price.toLocaleString()}<span style={{fontSize:11,fontWeight:400,color:"#9CA3AF"}}>{p.period}</span>
              </div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:10 }}>{p.desc}</div>
              {p.features.map(f => (
                <div key={f} style={{ fontSize:11, color:"#374151", marginBottom:3,
                  display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:p.color }}>✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>

        <button onClick={() => setShowPricing(true)} style={{
          width:"100%", padding:"14px", background:ORANGE, color:"#fff", border:"none",
          borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:FONT,
        }}>
          Choose a Plan & Pay with MoMo
        </button>

        <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#9CA3AF" }}>
          Pay with MTN MoMo or Airtel Money · Secured by Flutterwave
        </div>
      </div>

      {showPricing && <PricingModal user={user} onClose={() => setShowPricing(false)}
        onSuccess={() => setStatus(canPostJob(user))} />}
    </>
  );
}
