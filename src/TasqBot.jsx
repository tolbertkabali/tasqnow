// @ts-nocheck
import { useState, useRef, useEffect } from "react";

const ORANGE = "#F07320";
const ORANGE_DARK = "#C85A10";
const ORANGE_LIGHT = "#FEF0E7";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

const FAQ = [
  {
    keywords: ["find", "search", "look", "browse", "job", "work", "gig"],
    answer: "It's easy! 👇\n1. Tap 'Find Work' in the menu\n2. Search by skill (e.g. plumbing) or browse categories\n3. Filter by location or job type\n4. Tap any job to see full details and apply!",
  },
  {
    keywords: ["apply", "application", "submit", "send cv"],
    answer: "To apply for a job:\n1. Open any job listing\n2. Tap the 'Apply Now' button\n3. Write a short message to the employer (optional)\n4. Hit 'Submit Application'\n\nThe employer will contact you via Messages. ✅",
  },
  {
    keywords: ["post", "create job", "hire", "employer", "need someone", "looking for"],
    answer: "Posting a gig is free! 📝\n1. Tap 'Post a Gig' in the menu\n2. Fill in job title, category, location and pay\n3. Add a description of what you need\n4. Tap 'Publish Gig'\n\nWorkers in Kampala will start applying immediately!",
  },
  {
    keywords: ["pay", "payment", "money", "salary", "wage", "momo", "airtel", "cash", "ugx"],
    answer: "Payment is agreed between you and the employer. Common options:\n\n💵 Cash on completion\n📱 MTN Mobile Money\n📱 Airtel Money\n\nAlways agree on the amount BEFORE starting work!",
  },
  {
    keywords: ["rating", "review", "stars", "feedback", "score"],
    answer: "After a job, both worker and employer can leave a star rating. ⭐\n\nHigher ratings = more job offers!\n✓ Show up on time\n✓ Do quality work\n✓ Communicate clearly",
  },
  {
    keywords: ["message", "chat", "contact", "talk"],
    answer: "Once you apply for a job, you can message the employer directly through TasqNow.\n\n💬 Tap 'Messages' in the menu to see all your conversations.\n\nTip: Reply quickly — employers hire fast!",
  },
  {
    keywords: ["account", "sign up", "register", "create account", "join"],
    answer: "Creating an account is free! 🆓\n1. Tap 'Join Now' at the top\n2. Choose: find work OR hire someone\n3. Enter your name, email and password\n4. Start straight away!\n\nNo fees, no credit card needed.",
  },
  {
    keywords: ["profile", "edit", "photo", "bio", "skills", "experience"],
    answer: "A complete profile gets you more jobs! 💪\n\nGo to Profile → Edit and add:\n✓ A clear photo\n✓ Your skills\n✓ Your location in Kampala\n✓ A short bio\n\nWorkers with full profiles get 3x more responses!",
  },
  {
    keywords: ["free", "cost", "charge", "fee", "price", "how much"],
    answer: "Yes! TasqNow is completely free! 🎉\n\n✓ Free to sign up\n✓ Free to apply for jobs\n✓ Free to post gigs\n✓ Free to message\n\nWe may add premium features later, but the basics are always free.",
  },
  {
    keywords: ["category", "categories", "type", "kind of job", "what jobs"],
    answer: "Jobs available in Kampala:\n\n🔧 Plumbing  💡 Electrical\n👶 Nanny  🧹 Cleaning\n🛵 Delivery  💻 Digital\n🍽️ Catering  📚 Tutoring\n🔐 Security  ✂️ Beauty\n🖌️ Painting  🏪 Shop Attendant\n\nMore categories coming soon!",
  },
  {
    keywords: ["safe", "safety", "trust", "scam", "fake", "verified"],
    answer: "Your safety is our priority! 🛡️\n\n✓ All users are registered\n✓ Ratings show trustworthy people\n✓ Report suspicious users with the flag button\n\nTip: Always meet in a public place for a first job!",
  },
  {
    keywords: ["kampala", "location", "area", "where", "nakawa", "muyenga", "kololo", "ntinda"],
    answer: "TasqNow covers all of Kampala! 🗺️\n\nNakawa, Kololo, Muyenga, Bugolobi, Ntinda, Wandegeya, Lugogo, Kisementi, Kisaasi, City Centre and everywhere else.\n\nUse the location filter to find jobs near you.",
  },
];

const FALLBACK = "I'm not sure about that one! 🤔\n\nHere are things I can help with:\n• Finding and applying for jobs\n• Posting a gig\n• How payments work\n• Setting up your profile\n• Job categories in Kampala\n\nJust ask!";

function getReply(userInput) {
  const input = userInput.toLowerCase().trim();
  const greetings = ["hi", "hello", "hey", "hie", "good morning", "good afternoon", "good evening"];
  const thanks = ["thanks", "thank you", "asante", "thx"];
  const bye = ["bye", "goodbye", "see you"];

  if (greetings.some(g => input.includes(g))) return "Hello! 👋 Welcome to TasqNow!\n\nI can help you find work or hire skilled people in Kampala. What would you like to know?";
  if (thanks.some(t => input.includes(t))) return "You're welcome! 😊 Good luck on TasqNow! 🙏";
  if (bye.some(b => input.includes(b))) return "Goodbye! 👋 Come back anytime. Hope you find great work on TasqNow! 🇺🇬";

  let best = null;
  let bestScore = 0;
  for (const faq of FAQ) {
    const score = faq.keywords.filter(kw => input.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  return bestScore > 0 ? best.answer : FALLBACK;
}

const Dots = () => (
  <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#CBD5E1",
        animation:`tb-bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
    ))}
  </div>
);

const Avatar = () => (
  <div style={{ width:26, height:26, borderRadius:"50%", background:ORANGE, display:"flex",
    alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </div>
);

const QUICK = ["How do I find a job?", "How do I post a gig?", "How does payment work?", "Is TasqNow free?"];

export default function TasqBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role:"bot", text:"Hi! 👋 I'm TasqBot.\n\nI can answer questions about finding work, posting gigs, payments and more. What can I help you with?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); } }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput("");
    setMsgs(p => [...p, { role:"user", text:msg }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs(p => [...p, { role:"bot", text:getReply(msg) }]);
      setTyping(false);
      if (!open) setUnread(u => u+1);
    }, 700 + Math.random() * 500);
  };

  return (
    <>
      <style>{`
        @keyframes tb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes tb-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tb-pop{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
        .tb-msg{animation:tb-up .18s ease}
        .tb-fab{animation:tb-pop .3s ease .5s both}
      `}</style>

      {open && (
        <div style={{ position:"fixed", bottom:82, right:20, width:320, maxWidth:"calc(100vw - 32px)",
          background:"#fff", borderRadius:20, boxShadow:"0 8px 40px rgba(0,0,0,0.15)",
          display:"flex", flexDirection:"column", zIndex:9999, overflow:"hidden",
          animation:"tb-up .22s ease", maxHeight:"72vh", border:"1px solid rgba(0,0,0,0.07)" }}>

          {/* Header */}
          <div style={{ background:ORANGE, padding:"13px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#fff", fontFamily:FONT }}>TasqBot</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.8)", fontFamily:FONT, display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80" }}/>
                Always here to help · Free
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:"rgba(255,255,255,.2)", border:"none",
              borderRadius:"50%", width:28, height:28, cursor:"pointer", color:"#fff", fontSize:18,
              display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 10px", display:"flex",
            flexDirection:"column", gap:10, minHeight:0 }}>
            {msgs.map((m,i) => (
              <div key={i} className="tb-msg" style={{ display:"flex", gap:7,
                justifyContent:m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end" }}>
                {m.role==="bot" && <Avatar/>}
                <div style={{ maxWidth:"80%", padding:"9px 12px", borderRadius:14,
                  borderBottomLeftRadius:m.role==="bot"?4:14,
                  borderBottomRightRadius:m.role==="user"?4:14,
                  background:m.role==="user"?ORANGE:"#F3F4F6",
                  color:m.role==="user"?"#fff":"#1F2937",
                  fontSize:13.5, lineHeight:1.6, fontFamily:FONT, whiteSpace:"pre-wrap" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:"flex", gap:7, alignItems:"flex-end" }}>
                <Avatar/>
                <div style={{ background:"#F3F4F6", borderRadius:14, borderBottomLeftRadius:4 }}>
                  <Dots/>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick questions */}
          {msgs.length <= 1 && !typing && (
            <div style={{ padding:"0 10px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
              {QUICK.map(q => (
                <button key={q} onClick={()=>send(q)} style={{ padding:"5px 11px", borderRadius:100,
                  border:`1.5px solid ${ORANGE}`, background:ORANGE_LIGHT, color:ORANGE_DARK,
                  fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONT, transition:"all .15s" }}
                  onMouseEnter={e=>{e.target.style.background=ORANGE;e.target.style.color="#fff"}}
                  onMouseLeave={e=>{e.target.style.background=ORANGE_LIGHT;e.target.style.color=ORANGE_DARK}}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"9px 10px", borderTop:"1px solid #F3F4F6",
            display:"flex", gap:7, alignItems:"center" }}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}}
              placeholder="Type your question..."
              style={{ flex:1, border:"1.5px solid #E5E7EB", borderRadius:100,
                padding:"9px 14px", fontSize:13, fontFamily:FONT, outline:"none",
                color:"#1F2937", background:"#FAFAFA", transition:"border .15s" }}
              onFocus={e=>e.target.style.borderColor=ORANGE}
              onBlur={e=>e.target.style.borderColor="#E5E7EB"}
            />
            <button onClick={()=>send()} disabled={!input.trim()||typing} style={{
              width:36, height:36, borderRadius:"50%", border:"none", flexShrink:0,
              background:input.trim()&&!typing?ORANGE:"#E5E7EB",
              cursor:input.trim()&&!typing?"pointer":"not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", transition:"background .15s" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>

          <div style={{ textAlign:"center", padding:"4px 0 8px", fontSize:10.5, color:"#D1D5DB", fontFamily:FONT }}>
            TasqNow Helper · Free
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={()=>setOpen(o=>!o)} className="tb-fab"
        style={{ position:"fixed", bottom:20, right:20, width:56, height:56, borderRadius:"50%",
          background:open?"#374151":ORANGE, border:"none", cursor:"pointer",
          boxShadow:"0 4px 20px rgba(240,115,32,.4)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:9999, transition:"background .2s, transform .15s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {unread>0 && !open && (
          <div style={{ position:"absolute", top:-3, right:-3, background:"#EF4444", color:"#fff",
            borderRadius:"50%", width:18, height:18, fontSize:10, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:FONT, border:"2px solid #fff" }}>{unread}</div>
        )}
      </button>
    </>
  );
}
