// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  supabase, signUp, signIn, signOut, getProfile, updateProfile, switchMode,
  fetchJobs, postJob, fetchMyJobs,
  fetchWorkers,
  applyToJob, fetchMyApplications, hasApplied,
  fetchSavedJobs, saveJob, unsaveJob, fetchSavedJobIds,
  fetchThread, sendMessage, fetchConversations,
  countUnread, subscribeToMessages, markMessagesRead
} from "./supabase";
import { ThemeProvider, ThemeToggle } from "./Theme";
import { WorkerProfileView } from "./WorkerProfile";

const ORANGE = "#F07320";
const ORANGE_LIGHT = "var(--orange-light)";
const ORANGE_DARK = "var(--orange-dark)";
const BLUE = "#0A66C2";
const TEAL = "#0D9488";
const GRAY200 = "var(--border)";
const GRAY400 = "var(--text3)";
const GRAY600 = "var(--text2)";
const GRAY900 = "var(--text)";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { transition: background-color .25s, color .25s; }
  body { font-family: ${FONT}; background: var(--bg); color: var(--text); transition: background-color .25s; }
  input, button, textarea, select { font-family: ${FONT}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

const CATEGORIES = [
  { id:"plumbing",   label:"Plumbing",   icon:"🔧" },
  { id:"electrical", label:"Electrical", icon:"💡" },
  { id:"nanny",      label:"Nanny",      icon:"👶" },
  { id:"cleaning",   label:"Cleaning",   icon:"🧹" },
  { id:"delivery",   label:"Delivery",   icon:"🛵" },
  { id:"digital",    label:"Digital",    icon:"💻" },
  { id:"catering",   label:"Catering",   icon:"🍽️" },
  { id:"tutoring",   label:"Tutoring",   icon:"📚" },
  { id:"security",   label:"Security",   icon:"🔐" },
  { id:"beauty",     label:"Beauty",     icon:"✂️" },
  { id:"painting",   label:"Painting",   icon:"🖌️" },
  { id:"shopgirl",   label:"Shop Girls", icon:"🏪" },
];

// ── SHARED UI ─────────────────────────────────────────────────────────────────

const LogoIcon = ({ size = 28 }) => (
  <div style={{ width:size, height:size, background:ORANGE, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <svg width={size*0.6} height={size*0.6} viewBox="0 0 16 16" fill="white">
      <rect x="2" y="2" width="5" height="5" rx="1"/>
      <rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/>
      <rect x="9" y="9" width="5" height="5" rx="1" opacity="0.5"/>
    </svg>
  </div>
);

const Avatar = ({ initials, color = ORANGE, size = 36, url }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:url?"transparent":color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.3, flexShrink:0, overflow:"hidden" }}>
    {url ? <img src={url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : initials}
  </div>
);

const Badge = ({ children, color = ORANGE }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:100, fontSize:11, fontWeight:600, background:color+"22", color }}>
    {children}
  </span>
);

const Tag = ({ children }) => (
  <span style={{ display:"inline-flex", padding:"4px 10px", borderRadius:100, fontSize:12, fontWeight:500, background:"var(--bg3)", color:"var(--text2)", border:"1px solid var(--border)" }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant="primary", size="md", full, style:sx, disabled }) => {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, fontFamily:FONT, border:"none", transition:"all .15s", opacity:disabled?0.6:1, whiteSpace:"nowrap", width:full?"100%":undefined };
  const sizes = { sm:{padding:"6px 14px",fontSize:13}, md:{padding:"10px 20px",fontSize:14}, lg:{padding:"13px 28px",fontSize:15} };
  const variants = {
    primary:{ background:ORANGE, color:"#fff" },
    outline:{ background:"transparent", color:ORANGE, border:`1.5px solid ${ORANGE}` },
    ghost:{ background:"transparent", color:"var(--text2)", border:"1.5px solid var(--border)" },
    teal:{ background:TEAL, color:"#fff" },
    danger:{ background:"#EF4444", color:"#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>{children}</button>;
};

const Input = ({ placeholder, value, onChange, icon, type="text", style:sx }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    {icon && <span style={{ position:"absolute", left:12, color:"var(--text3)", display:"flex" }}>{icon}</span>}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width:"100%", padding:icon?"10px 14px 10px 40px":"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, color:"var(--text)", background:"var(--input-bg)", outline:"none", transition:"border .15s", ...sx }}
      onFocus={e=>e.target.style.borderColor=ORANGE}
      onBlur={e=>e.target.style.borderColor="var(--border)"}
    />
  </div>
);

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
    <div style={{ width:32, height:32, border:"3px solid var(--border)", borderTopColor:ORANGE, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
  </div>
);

const Icon = ({ name, size=20, color="currentColor" }) => {
  const icons = {
    search:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    location:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    home:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    briefcase:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    plus:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    message:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    user:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    bookmark:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    bookmarkFill:<svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    clock:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
    x:           <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    check:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    send:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
    share:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>,
  };
  return icons[name] || null;
};

// ── MODE TOGGLE ───────────────────────────────────────────────────────────────

const ModeToggle = ({ mode, onSwitch, loading }) => (
  <div style={{ display:"flex", alignItems:"center", background:"var(--bg3)", borderRadius:100, padding:3, gap:2, border:"1px solid var(--border)" }}>
    <button onClick={()=>mode!=="worker"&&onSwitch("worker")} disabled={loading}
      style={{ padding:"5px 14px", borderRadius:100, border:"none", background:mode==="worker"?ORANGE:"transparent", color:mode==="worker"?"#fff":"var(--text2)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:FONT, transition:"all .2s" }}>
      🔨 Worker
    </button>
    <button onClick={()=>mode!=="employer"&&onSwitch("employer")} disabled={loading}
      style={{ padding:"5px 14px", borderRadius:100, border:"none", background:mode==="employer"?TEAL:"transparent", color:mode==="employer"?"#fff":"var(--text2)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:FONT, transition:"all .2s" }}>
      🏢 Employer
    </button>
  </div>
);

// ── JOB CARD ──────────────────────────────────────────────────────────────────

const JobCard = ({ job, onClick, onSave, compact, savedIds=[] }) => {
  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[job.title?.charCodeAt(0) % colors.length] || ORANGE;
  const initials = (job.company||job.profiles?.name||"TN").slice(0,2).toUpperCase();
  const isSaved = savedIds.includes(job.id);
  return (
    <div onClick={onClick}
      style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:compact?16:20, cursor:"pointer", transition:"all .15s", marginBottom:compact?8:0, animation:"fadeIn .2s ease" }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=ORANGE; e.currentTarget.style.boxShadow=`0 2px 16px ${ORANGE}22`; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.boxShadow="none"; }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <Avatar initials={initials} color={color} size={44}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", lineHeight:1.3 }}>{job.title}</div>
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:2 }}>{job.company||job.profiles?.name||"Private Client"}</div>
            </div>
            <button onClick={e=>{ e.stopPropagation(); onSave&&onSave(job.id,isSaved); }}
              style={{ background:"none", border:"none", cursor:"pointer", padding:4, flexShrink:0 }}>
              <Icon name={isSaved?"bookmarkFill":"bookmark"} size={18} color={isSaved?ORANGE:"var(--text3)"}/>
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8, alignItems:"center" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:"var(--text2)" }}>
              <Icon name="location" size={14} color="var(--text3)"/> {job.location}
            </span>
            <span style={{ color:"var(--text3)" }}>·</span>
            <span style={{ fontSize:13, fontWeight:600, color:ORANGE }}>{job.salary}</span>
            <span style={{ color:"var(--text3)" }}>·</span>
            <Badge>{job.type}</Badge>
            {job.urgent&&<Badge color="#EF4444">🔴 Urgent</Badge>}
          </div>
          {!compact && (
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:10 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"var(--text3)" }}>
                <Icon name="clock" size={12} color="var(--text3)"/> {new Date(job.created_at).toLocaleDateString('en-UG',{day:'numeric',month:'short'})}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"var(--text3)" }}>
                <Icon name="users" size={12} color="var(--text3)"/> {job.applicant_count||0} applicants
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── WORKER CARD ───────────────────────────────────────────────────────────────

const WorkerCard = ({ worker, onClick }) => {
  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[worker.name?.charCodeAt(0) % colors.length] || ORANGE;
  const score = worker.tasq_score || 0;
  return (
    <div onClick={onClick}
      style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, cursor:"pointer", transition:"all .15s", animation:"fadeIn .2s ease" }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=TEAL; e.currentTarget.style.boxShadow=`0 2px 16px ${TEAL}22`; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.boxShadow="none"; }}>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <Avatar initials={(worker.name||"U").slice(0,2).toUpperCase()} color={color} size={52} url={worker.avatar_url}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{worker.name}</div>
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:2 }}>
                {worker.skills?.slice(0,2).join(" · ") || "General worker"}
              </div>
            </div>
            <div style={{ background:score>=70?"#D1FAE5":score>=40?"#FEF3C7":"var(--bg3)", borderRadius:10, padding:"6px 10px", textAlign:"center", flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize:16, color:score>=70?"#10B981":score>=40?"#F59E0B":"var(--text3)", lineHeight:1 }}>{score}</div>
              <div style={{ fontSize:9, fontWeight:700, color:score>=70?"#10B981":score>=40?"#F59E0B":"var(--text3)", textTransform:"uppercase", letterSpacing:".04em", marginTop:2 }}>TasqScore</div>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10, alignItems:"center" }}>
            {worker.location && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"var(--text2)" }}><Icon name="location" size={12} color="var(--text3)"/> {worker.location}</span>}
            {worker.skills?.slice(0,2).map(s=><Tag key={s}>{s}</Tag>)}
          </div>
          {worker.bio && <div style={{ fontSize:12, color:"var(--text3)", marginTop:8, lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{worker.bio}</div>}
          <div style={{ marginTop:10, fontSize:12, color:TEAL, fontWeight:600 }}>View full profile →</div>
        </div>
      </div>
    </div>
  );
};

// ── AUTH MODAL ────────────────────────────────────────────────────────────────

const AuthModal = ({ mode, onClose, onAuth }) => {
  const [tab, setTab] = useState(mode);
  const [primaryRole, setPrimaryRole] = useState("worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab==="signup") { await signUp(email,pass,name,primaryRole); setDone(true); }
      else {
        const data = await signIn(email,pass);
        const profile = await getProfile(data.user.id);
        onAuth({ ...data.user, name:profile?.name||email.split("@")[0], active_mode:profile?.active_mode||"worker", ...profile });
        onClose();
      }
    } catch(e) { setError(e.message||"Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"var(--card)", borderRadius:16, padding:32, width:"100%", maxWidth:440, boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LogoIcon size={32}/>
            <span style={{ fontWeight:800, fontSize:20, color:"var(--text)" }}>tasq<span style={{color:ORANGE}}>now</span></span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><Icon name="x" size={20}/></button>
        </div>
        <div style={{ display:"flex", background:"var(--bg3)", borderRadius:8, padding:4, marginBottom:24 }}>
          {["signin","signup"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setError("");}}
              style={{ flex:1, padding:"8px 0", borderRadius:6, border:"none", background:tab===t?"var(--card)":"transparent", color:tab===t?"var(--text)":"var(--text2)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:FONT }}>
              {t==="signin"?"Sign In":"Sign Up"}
            </button>
          ))}
        </div>
        {done ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:8, color:"var(--text)" }}>Welcome to TasqNow!</div>
            <div style={{ color:"var(--text2)", fontSize:14, marginBottom:16 }}>Your account is ready.</div>
            <Btn onClick={()=>setTab("signin")} full>Sign In Now</Btn>
          </div>
        ) : (
          <>
            {tab==="signup" && (
              <>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:"var(--text2)" }}>I'm joining to...</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { v:"worker", icon:"🔨", title:"Find Work", desc:"Apply for gigs in Kampala" },
                      { v:"employer", icon:"🏢", title:"Hire People", desc:"Post jobs & find talent" },
                    ].map(r=>(
                      <button key={r.v} onClick={()=>setPrimaryRole(r.v)}
                        style={{ padding:"14px 10px", border:`2px solid ${primaryRole===r.v?r.v==="worker"?ORANGE:TEAL:"var(--border)"}`, borderRadius:12, background:primaryRole===r.v?r.v==="worker"?"var(--orange-light)":`${TEAL}15`:"var(--card)", cursor:"pointer", textAlign:"center", fontFamily:FONT, transition:"all .15s" }}>
                        <div style={{ fontSize:24, marginBottom:4 }}>{r.icon}</div>
                        <div style={{ fontWeight:700, fontSize:13, color:primaryRole===r.v?r.v==="worker"?ORANGE:TEAL:"var(--text)" }}>{r.title}</div>
                        <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:8, textAlign:"center" }}>✌️ You can switch modes anytime</div>
                </div>
                <div style={{ marginBottom:12 }}><Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/></div>
              </>
            )}
            <div style={{ marginBottom:12 }}><Input placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} type="email"/></div>
            <div style={{ marginBottom:error?12:20 }}><Input placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} type="password"/></div>
            {error&&<div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#B91C1C", marginBottom:16 }}>{error}</div>}
            <Btn onClick={submit} full size="lg" disabled={loading}>{loading?"Please wait...":tab==="signin"?"Sign In":"Create Account"}</Btn>
          </>
        )}
      </div>
    </div>
  );
};

// ── APPLY MODAL ───────────────────────────────────────────────────────────────

const ApplyModal = ({ job, onClose, user }) => {
  const [msg, setMsg] = useState("");
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(()=>{ if(job&&user) hasApplied(job.id,user.id).then(setAlreadyApplied); },[job,user]);
  if (!job) return null;

  const submit = async()=>{
    setLoading(true);
    try { await applyToJob(job.id,user.id,msg); setApplied(true); }
    catch(e){ if(e.message?.includes("unique")) setAlreadyApplied(true); }
    finally{ setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"var(--card)", borderRadius:16, padding:28, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        {applied ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ fontWeight:700, fontSize:20, marginBottom:8, color:"var(--text)" }}>Application Sent!</div>
            <div style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Your application for <strong>{job.title}</strong> has been submitted!</div>
            <Btn onClick={onClose} full>Done</Btn>
          </div>
        ) : alreadyApplied ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:700, fontSize:18, color:"var(--text)" }}>Already Applied</div>
            <div style={{ marginTop:16 }}><Btn onClick={onClose} full>Close</Btn></div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:18, color:"var(--text)" }}>Apply for this job</div>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="x" size={20} color="var(--text3)"/></button>
            </div>
            <div style={{ background:"var(--bg2)", borderRadius:10, padding:14, marginBottom:20 }}>
              <div style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{job.title}</div>
              <div style={{ fontSize:13, color:"var(--text2)" }}>{job.company} · {job.location}</div>
              <div style={{ fontSize:13, fontWeight:600, color:ORANGE, marginTop:2 }}>{job.salary}</div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8, color:"var(--text2)" }}>Cover message (optional)</div>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Tell the employer why you're a great fit..."
                style={{ width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, resize:"none", height:100, outline:"none", background:"var(--input-bg)", color:"var(--text)" }}
                onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="var(--border)"}
              />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={onClose} full>Cancel</Btn>
              <Btn onClick={submit} full disabled={loading}>{loading?"Submitting...":"Submit Application"}</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────

const Navbar = ({ page, setPage, user, setAuthMode, unread, mode, onSwitchMode, switching }) => (
  <nav style={{ position:"sticky", top:0, zIndex:100, background:"var(--nav-bg)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", padding:"0 clamp(12px,4vw,48px)", display:"flex", alignItems:"center", height:64, gap:8 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }} onClick={()=>setPage("home")}>
      <LogoIcon size={32}/>
      <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.02em", color:"var(--text)", display:window.innerWidth<480?"none":"block" }}>tasq<span style={{color:ORANGE}}>now</span></span>
    </div>
    {user && (
      <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
        <ModeToggle mode={mode} onSwitch={onSwitchMode} loading={switching}/>
      </div>
    )}
    <div style={{ display:"flex", alignItems:"center", gap:2, marginLeft:user?"0":"auto" }}>
      {user && mode==="worker" && [{id:"home",label:"Home",icon:"home"},{id:"jobs",label:"Find Work",icon:"briefcase"},{id:"messages",label:"Chat",icon:"message"}].map(n=>(
        <button key={n.id} onClick={()=>setPage(n.id)}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 8px", border:"none", background:"none", cursor:"pointer", color:page===n.id?ORANGE:"var(--text2)", fontFamily:FONT, position:"relative" }}>
          <Icon name={n.icon} size={20} color={page===n.id?ORANGE:"var(--text2)"}/>
          <span style={{ fontSize:10, fontWeight:page===n.id?700:500, display:window.innerWidth<600?"none":"block" }}>{n.label}</span>
          {n.id==="messages"&&unread>0&&<span style={{ position:"absolute", top:2, right:6, background:"#EF4444", color:"#fff", borderRadius:100, fontSize:10, fontWeight:700, padding:"1px 5px" }}>{unread}</span>}
          {page===n.id&&<div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:20, height:2, background:ORANGE, borderRadius:100 }}/>}
        </button>
      ))}
      {user && mode==="employer" && [{id:"home",label:"Home",icon:"home"},{id:"browse",label:"Workers",icon:"users"},{id:"post",label:"Post Gig",icon:"plus"},{id:"messages",label:"Chat",icon:"message"}].map(n=>(
        <button key={n.id} onClick={()=>setPage(n.id)}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 8px", border:"none", background:"none", cursor:"pointer", color:page===n.id?TEAL:"var(--text2)", fontFamily:FONT, position:"relative" }}>
          <Icon name={n.icon} size={20} color={page===n.id?TEAL:"var(--text2)"}/>
          <span style={{ fontSize:10, fontWeight:page===n.id?700:500, display:window.innerWidth<600?"none":"block" }}>{n.label}</span>
          {n.id==="messages"&&unread>0&&<span style={{ position:"absolute", top:2, right:6, background:"#EF4444", color:"#fff", borderRadius:100, fontSize:10, fontWeight:700, padding:"1px 5px" }}>{unread}</span>}
          {page===n.id&&<div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:20, height:2, background:TEAL, borderRadius:100 }}/>}
        </button>
      ))}
      <ThemeToggle/>
      {user ? (
        <button onClick={()=>setPage("profile")} style={{ marginLeft:4, background:"none", border:"none", cursor:"pointer", padding:4 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:mode==="employer"?TEAL:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, border:page==="profile"?`2px solid ${mode==="employer"?TEAL:ORANGE}`:"2px solid transparent" }}>
            {(user.name||"U").slice(0,2).toUpperCase()}
          </div>
        </button>
      ) : (
        <div style={{ display:"flex", gap:8, marginLeft:4 }}>
          <Btn size="sm" variant="ghost" onClick={()=>setAuthMode("signin")}>Sign In</Btn>
          <Btn size="sm" onClick={()=>setAuthMode("signup")}>Join Now</Btn>
        </div>
      )}
    </div>
  </nav>
);

const MobileNav = ({ page, setPage, unread, mode }) => {
  const workerTabs = [{id:"home",label:"Home",icon:"home"},{id:"jobs",label:"Jobs",icon:"briefcase"},{id:"messages",label:"Chat",icon:"message"},{id:"profile",label:"Profile",icon:"user"}];
  const employerTabs = [{id:"home",label:"Home",icon:"home"},{id:"browse",label:"Workers",icon:"users"},{id:"post",label:"Post",icon:"plus"},{id:"messages",label:"Chat",icon:"message"},{id:"profile",label:"Profile",icon:"user"}];
  const tabs = mode==="employer"?employerTabs:workerTabs;
  const ac = mode==="employer"?TEAL:ORANGE;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--nav-bg)", backdropFilter:"blur(12px)", borderTop:"1px solid var(--border)", display:"flex", zIndex:100 }}>
      {tabs.map(n=>(
        <button key={n.id} onClick={()=>setPage(n.id)}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 0 8px", border:"none", background:"none", cursor:"pointer", color:page===n.id?ac:"var(--text3)", fontFamily:FONT, position:"relative" }}>
          <Icon name={n.icon} size={22} color={page===n.id?ac:"var(--text3)"}/>
          <span style={{ fontSize:10, fontWeight:page===n.id?700:500 }}>{n.label}</span>
          {n.id==="messages"&&unread>0&&<span style={{ position:"absolute", top:8, left:"50%", marginLeft:4, background:"#EF4444", color:"#fff", borderRadius:100, fontSize:9, fontWeight:700, padding:"1px 4px" }}>{unread}</span>}
        </button>
      ))}
    </div>
  );
};

// ── HOME PAGE ─────────────────────────────────────────────────────────────────

const HomePage = ({ setPage, onJobClick, user, setAuthMode, savedIds, onSave, mode, onWorkerClick }) => {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [activecat, setActivecat] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const ac = mode==="employer"?TEAL:ORANGE;

  useEffect(()=>{
    setLoading(true);
    if (mode==="employer") {
      fetchWorkers({}).then(w=>{ setWorkers(w); setLoading(false); }).catch(()=>setLoading(false));
    } else {
      fetchJobs({ category:activecat }).then(j=>{ setJobs(j); setLoading(false); }).catch(()=>setLoading(false));
    }
  }, [activecat, mode]);

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 16px 100px" }}>
      <div style={{ padding:"28px 0 20px" }}>
        {user && <div style={{ fontSize:15, color:"var(--text2)", marginBottom:4 }}>Good day, <strong style={{color:"var(--text)"}}>{user.name}</strong> {mode==="employer"?"🏢":"👋"}</div>}
        <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text)", lineHeight:1.2, marginBottom:18 }}>
          {mode==="employer"?"Find skilled workers":"Find local gig jobs"}
        </h1>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 180px", border:"1.5px solid var(--border)", borderRadius:10, display:"flex", alignItems:"center", background:"var(--input-bg)", overflow:"hidden" }}>
            <span style={{ padding:"0 12px", color:"var(--text3)", display:"flex" }}><Icon name="search" size={16}/></span>
            <input placeholder={mode==="employer"?"Search by skill...":"e.g. plumbing, nanny"} value={what} onChange={e=>setWhat(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&setPage(mode==="employer"?"browse":"jobs")}
              style={{ flex:1, padding:"12px 0", border:"none", outline:"none", fontSize:14, fontFamily:FONT, background:"transparent", color:"var(--text)" }}/>
          </div>
          <div style={{ flex:"1 1 140px", border:"1.5px solid var(--border)", borderRadius:10, display:"flex", alignItems:"center", background:"var(--input-bg)", overflow:"hidden" }}>
            <span style={{ padding:"0 12px", color:"var(--text3)", display:"flex" }}><Icon name="location" size={16}/></span>
            <input placeholder="City or region" value={where} onChange={e=>setWhere(e.target.value)}
              style={{ flex:1, padding:"12px 0", border:"none", outline:"none", fontSize:14, fontFamily:FONT, background:"transparent", color:"var(--text)" }}/>
          </div>
          <Btn onClick={()=>setPage(mode==="employer"?"browse":"jobs")} size="lg" style={{ borderRadius:10, background:ac }}>Search</Btn>
        </div>
      </div>

      {mode==="worker" && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12, color:"var(--text)" }}>Browse by category</div>
          <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:6 }}>
            {CATEGORIES.map(c=>(
              <button key={c.id} onClick={()=>setActivecat(activecat===c.id?null:c.id)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 14px", border:`1.5px solid ${activecat===c.id?ORANGE:"var(--border)"}`, borderRadius:12, background:activecat===c.id?"var(--orange-light)":"var(--card)", cursor:"pointer", minWidth:78, transition:"all .15s", flexShrink:0, fontFamily:FONT }}>
                <span style={{ fontSize:20 }}>{c.icon}</span>
                <span style={{ fontSize:11, fontWeight:600, color:activecat===c.id?ORANGE:"var(--text2)" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <div style={{ background:`linear-gradient(135deg, ${ORANGE} 0%, #C85A10 100%)`, borderRadius:14, padding:"20px 24px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#fff", marginBottom:4 }}>Join TasqNow Free</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.8)" }}>Find work or hire people in Kampala</div>
          </div>
          <Btn variant="outline" onClick={()=>setAuthMode("signup")} style={{ borderColor:"#fff", color:"#fff", flexShrink:0 }}>Get Started</Btn>
        </div>
      )}

      {user && mode==="employer" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
          <div onClick={()=>setPage("post")} style={{ background:`${TEAL}15`, border:`1.5px solid ${TEAL}44`, borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=TEAL}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`${TEAL}44`}>
            <div style={{ fontSize:24, marginBottom:8 }}>📋</div>
            <div style={{ fontWeight:700, fontSize:14, color:TEAL }}>Post a Gig</div>
            <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>Find the right person</div>
          </div>
          <div onClick={()=>setPage("browse")} style={{ background:"var(--orange-light)", border:`1.5px solid ${ORANGE}44`, borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=ORANGE}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`${ORANGE}44`}>
            <div style={{ fontSize:24, marginBottom:8 }}>👷</div>
            <div style={{ fontWeight:700, fontSize:14, color:ORANGE }}>Browse Workers</div>
            <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>Hire directly</div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{mode==="employer"?"Available Workers":"Latest Jobs"}</div>
        <span onClick={()=>setPage(mode==="employer"?"browse":"jobs")} style={{ fontSize:13, color:ac, fontWeight:600, cursor:"pointer" }}>See all →</span>
      </div>

      {loading ? <Spinner/> : mode==="employer" ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {workers.slice(0,4).map(w=><WorkerCard key={w.id} worker={w} onClick={()=>onWorkerClick(w.id)}/>)}
          {!workers.length && <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}><div style={{ fontSize:36, marginBottom:8 }}>👷</div><div style={{ fontWeight:600 }}>No workers yet</div></div>}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {jobs.slice(0,6).map(j=><JobCard key={j.id} job={j} onClick={()=>onJobClick(j)} onSave={onSave} compact savedIds={savedIds}/>)}
          {!jobs.length && <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}><div style={{ fontSize:36, marginBottom:8 }}>📭</div><div style={{ fontWeight:600 }}>No jobs posted yet</div></div>}
        </div>
      )}
    </div>
  );
};

// ── JOBS PAGE ─────────────────────────────────────────────────────────────────

const JobsPage = ({ onJobClick, onSave, savedIds }) => {
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("All");
  const [cat, setCat] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    fetchJobs({ search, type, category:cat==="All"?null:cat, location:loc })
      .then(j=>{ setJobs(j); setLoading(false); }).catch(()=>setLoading(false));
  }, [search, type, cat, loc]);

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 100px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:16, color:"var(--text)" }}>Find Work</h2>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 200px" }}><Input placeholder="Job title or keyword" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon name="search" size={16}/>}/></div>
        <div style={{ flex:"1 1 160px" }}><Input placeholder="Location" value={loc} onChange={e=>setLoc(e.target.value)} icon={<Icon name="location" size={16}/>}/></div>
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {["All","One-time","Part-time","Full-time","Flexible","Contract"].map(t=>(
          <button key={t} onClick={()=>setType(t)}
            style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${type===t?ORANGE:"var(--border)"}`, background:type===t?"var(--orange-light)":"var(--card)", color:type===t?ORANGE:"var(--text2)", fontWeight:600, fontSize:13, cursor:"pointer", flexShrink:0, fontFamily:FONT }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {["All",...CATEGORIES.map(c=>c.id)].map(c=>{
          const catObj = CATEGORIES.find(x=>x.id===c);
          return (
            <button key={c} onClick={()=>setCat(c)}
              style={{ padding:"6px 14px", borderRadius:100, border:`1.5px solid ${cat===c?ORANGE:"var(--border)"}`, background:cat===c?"var(--orange-light)":"var(--card)", color:cat===c?ORANGE:"var(--text2)", fontWeight:600, fontSize:12, cursor:"pointer", flexShrink:0, fontFamily:FONT, display:"flex", alignItems:"center", gap:4 }}>
              {catObj&&<span>{catObj.icon}</span>}{catObj?catObj.label:"All Categories"}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize:13, color:"var(--text3)", marginBottom:14 }}>{jobs.length} jobs found</div>
      {loading?<Spinner/>:(
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {jobs.length?jobs.map(j=><JobCard key={j.id} job={j} onClick={()=>onJobClick(j)} onSave={onSave} savedIds={savedIds}/>):(
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:600, fontSize:16 }}>No jobs found</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── BROWSE WORKERS ────────────────────────────────────────────────────────────

const BrowseWorkers = ({ onWorkerClick }) => {
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("All");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    fetchWorkers({ search, location:loc })
      .then(w=>{ setWorkers(w); setLoading(false); }).catch(()=>setLoading(false));
  }, [search, loc]);

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 100px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4, color:"var(--text)" }}>Find Workers</h2>
      <div style={{ color:"var(--text2)", fontSize:14, marginBottom:16 }}>Browse skilled workers available in Kampala — click any worker to see their full profile</div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 200px" }}><Input placeholder="Search by name or skill" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon name="search" size={16}/>}/></div>
        <div style={{ flex:"1 1 160px" }}><Input placeholder="Location" value={loc} onChange={e=>setLoc(e.target.value)} icon={<Icon name="location" size={16}/>}/></div>
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:20 }}>
        {["All",...CATEGORIES.map(c=>c.id)].map(c=>{
          const catObj = CATEGORIES.find(x=>x.id===c);
          return (
            <button key={c} onClick={()=>setCat(c)}
              style={{ padding:"6px 14px", borderRadius:100, border:`1.5px solid ${cat===c?TEAL:"var(--border)"}`, background:cat===c?`${TEAL}15`:"var(--card)", color:cat===c?TEAL:"var(--text2)", fontWeight:600, fontSize:12, cursor:"pointer", flexShrink:0, fontFamily:FONT, display:"flex", alignItems:"center", gap:4 }}>
              {catObj&&<span>{catObj.icon}</span>}{catObj?catObj.label:"All Skills"}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize:13, color:"var(--text3)", marginBottom:14 }}>{workers.length} workers available</div>
      {loading?<Spinner/>:(
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
          {workers.length?workers.map(w=>(
            <WorkerCard key={w.id} worker={w} onClick={()=>onWorkerClick(w.id)}/>
          )):(
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)", gridColumn:"1/-1" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👷</div>
              <div style={{ fontWeight:600 }}>No workers found</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── JOB DETAIL ────────────────────────────────────────────────────────────────

const JobDetail = ({ job, onBack, onApply, onSave, user, setAuthMode, savedIds, mode }) => {
  if (!job) return null;
  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[job.title?.charCodeAt(0) % colors.length] || ORANGE;
  const isSaved = savedIds.includes(job.id);
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"0 16px 120px" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"var(--text2)", fontFamily:FONT, padding:"20px 0", fontSize:14, fontWeight:600 }}>
        <Icon name="chevronLeft" size={18}/> Back
      </button>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"24px 24px 20px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <Avatar initials={(job.company||"TN").slice(0,2).toUpperCase()} color={color} size={56}/>
            <div style={{ flex:1 }}>
              <h1 style={{ fontWeight:800, fontSize:20, color:"var(--text)", lineHeight:1.3, marginBottom:4 }}>{job.title}</h1>
              <div style={{ fontSize:14, color:"var(--text2)", marginBottom:8 }}>{job.company}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:"var(--text2)" }}><Icon name="location" size={14} color="var(--text3)"/>{job.location}</span>
                <Badge>{job.type}</Badge>
                {job.urgent&&<Badge color="#EF4444">🔴 Urgent</Badge>}
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
            {[{label:"Pay",value:job.salary,color:ORANGE},{label:"Applicants",value:job.applicant_count||0,color:BLUE},{label:"Posted",value:new Date(job.created_at).toLocaleDateString('en-UG',{day:'numeric',month:'short'}),color:"var(--text2)"}].map(s=>(
              <div key={s.label} style={{ background:"var(--bg2)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em" }}>{s.label}</div>
                <div style={{ fontWeight:700, fontSize:15, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)", display:"flex", gap:10 }}>
          {mode==="worker"&&<Btn onClick={()=>{ user?onApply(job):setAuthMode("signin"); }} full size="lg">Apply Now</Btn>}
          <button onClick={()=>onSave(job.id,isSaved)} style={{ padding:"0 14px", border:"1.5px solid var(--border)", borderRadius:8, background:"var(--card)", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <Icon name={isSaved?"bookmarkFill":"bookmark"} size={20} color={isSaved?ORANGE:"var(--text3)"}/>
          </button>
          <button onClick={()=>navigator.share?.({title:job.title,url:window.location.href})} style={{ padding:"0 14px", border:"1.5px solid var(--border)", borderRadius:8, background:"var(--card)", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <Icon name="share" size={18} color="var(--text3)"/>
          </button>
        </div>
        <div style={{ padding:"24px" }}>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:12, color:"var(--text)" }}>Job Description</div>
          <div style={{ fontSize:14, color:"var(--text2)", lineHeight:1.75, marginBottom:24 }}>{job.description}</div>
          {job.skills?.length>0 && (
            <>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:12, color:"var(--text)" }}>Skills Required</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{job.skills.map(s=><Tag key={s}>{s}</Tag>)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── POST A GIG ────────────────────────────────────────────────────────────────

const PostGig = ({ user, setAuthMode, onPosted }) => {
  const [form, setForm] = useState({ title:"", company:"", location:"Kampala", type:"One-time", category:"", salary:"", description:"", urgent:false, skills:"" });
  const [posted, setPosted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>📋</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8, color:"var(--text)" }}>Sign in to post a gig</div>
      <Btn onClick={()=>setAuthMode("signup")} full>Create Free Account</Btn>
    </div>
  );

  const submit = async()=>{
    if (!form.title||!form.category) { setError("Please fill in the job title and category."); return; }
    setError(""); setLoading(true);
    try {
      const skillsArray = form.skills?form.skills.split(",").map(s=>s.trim()).filter(Boolean):[];
      await postJob({ ...form, skills:skillsArray }, user.id);
      setPosted(true); setTimeout(onPosted, 2500);
    } catch(e){ setError(e.message||"Failed to post."); }
    finally{ setLoading(false); }
  };

  if (posted) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
      <div style={{ fontWeight:800, fontSize:22, marginBottom:8, color:"var(--text)" }}>Gig Posted!</div>
      <div style={{ color:"var(--text2)" }}>Your listing is now live. Workers will start applying!</div>
    </div>
  );

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px 120px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4, color:"var(--text)" }}>Post a Gig</h2>
      <div style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>Fill in the details to find the right person.</div>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:24, display:"flex", flexDirection:"column", gap:16 }}>
        <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Job Title *</label><Input placeholder="e.g. Plumber needed for pipe repair" value={form.title} onChange={e=>set("title",e.target.value)}/></div>
        <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Your Name / Company</label><Input placeholder="e.g. Private client or Acme Ltd" value={form.company} onChange={e=>set("company",e.target.value)}/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Category *</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, outline:"none", background:"var(--input-bg)", color:"var(--text)" }}>
              <option value="">Select category</option>
              {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Job Type</label>
            <select value={form.type} onChange={e=>set("type",e.target.value)} style={{ width:"100%", padding:"10px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, outline:"none", background:"var(--input-bg)", color:"var(--text)" }}>
              {["One-time","Part-time","Full-time","Flexible","Contract"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Location</label><Input placeholder="e.g. Nakawa, Kampala" value={form.location} onChange={e=>set("location",e.target.value)} icon={<Icon name="location" size={14}/>}/></div>
          <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Pay / Salary</label><Input placeholder="e.g. UGX 50,000/day" value={form.salary} onChange={e=>set("salary",e.target.value)}/></div>
        </div>
        <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Skills <span style={{fontWeight:400,color:"var(--text3)"}}>(comma separated)</span></label><Input placeholder="e.g. pipe fitting, welding, PVC" value={form.skills} onChange={e=>set("skills",e.target.value)}/></div>
        <div><label style={{ fontSize:13, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:6 }}>Job Description</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the work, requirements, and any other details..."
            style={{ width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, resize:"vertical", height:120, outline:"none", color:"var(--text)", background:"var(--input-bg)" }}
            onFocus={e=>e.target.style.borderColor=TEAL} onBlur={e=>e.target.style.borderColor="var(--border)"}
          />
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <input type="checkbox" checked={form.urgent} onChange={e=>set("urgent",e.target.checked)} style={{ width:16, height:16, accentColor:ORANGE }}/>
          <span style={{ fontSize:14, fontWeight:500, color:"var(--text2)" }}>🔴 Mark as Urgent</span>
        </label>
        {error&&<div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#B91C1C" }}>{error}</div>}
        <Btn onClick={submit} full size="lg" disabled={loading} style={{ background:TEAL }}>{loading?"Posting...":"Publish Gig"}</Btn>
      </div>
    </div>
  );
};

// ── MESSAGES PAGE ─────────────────────────────────────────────────────────────

const MessagesPage = ({ user, setAuthMode }) => {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(()=>{
    if (!user) return;
    fetchConversations(user.id).then(data=>{
      const unique = {};
      data.forEach(m=>{
        const otherId = m.sender_id===user.id?m.receiver_id:m.sender_id;
        const otherName = m.sender_id===user.id?m.receiver?.name:m.sender?.name;
        if (!unique[otherId]) unique[otherId] = { id:otherId, name:otherName||"User", lastMsg:m.text, time:m.created_at, unread:!m.read&&m.receiver_id===user.id };
      });
      setConvos(Object.values(unique)); setLoading(false);
    }).catch(()=>setLoading(false));
  }, [user]);

  useEffect(()=>{
    if (!active||!user) return;
    fetchThread(user.id,active.id).then(setThread);
    markMessagesRead(user.id,active.id);
    const sub = subscribeToMessages(user.id, payload=>{
      if (payload.new.sender_id===active.id) setThread(t=>[...t,payload.new]);
    });
    return ()=>sub.unsubscribe();
  }, [active, user]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); }, [thread]);

  const send = async()=>{
    if (!msg.trim()||!active) return;
    const text=msg; setMsg("");
    setThread(t=>[...t,{ sender_id:user.id, receiver_id:active.id, text, created_at:new Date().toISOString() }]);
    await sendMessage(user.id,active.id,text).catch(()=>{});
  };

  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>💬</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8, color:"var(--text)" }}>Your messages</div>
      <Btn onClick={()=>setAuthMode("signin")} full>Sign In</Btn>
    </div>
  );

  const COLORS = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444"];
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 100px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:16, color:"var(--text)" }}>Messages</h2>
      <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", background:"var(--card)", display:"flex", minHeight:480 }}>
        <div style={{ width:active?280:undefined, minWidth:active?280:undefined, borderRight:"1px solid var(--border)", overflowY:"auto", flex:active?0:1 }}>
          {loading?<Spinner/>:convos.length?convos.map((c,i)=>(
            <div key={c.id} onClick={()=>setActive(c)}
              style={{ display:"flex", gap:12, padding:"14px 16px", cursor:"pointer", background:active?.id===c.id?"var(--bg2)":"var(--card)", borderBottom:"1px solid var(--border)" }}
              onMouseEnter={e=>{ if(active?.id!==c.id) e.currentTarget.style.background="var(--bg2)"; }}
              onMouseLeave={e=>{ if(active?.id!==c.id) e.currentTarget.style.background="var(--card)"; }}>
              <Avatar initials={(c.name||"U").slice(0,2).toUpperCase()} color={COLORS[i%COLORS.length]} size={42}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:c.unread?700:600, fontSize:14, color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontSize:13, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.lastMsg}</div>
              </div>
              {c.unread&&<div style={{ width:8, height:8, borderRadius:"50%", background:ORANGE, flexShrink:0, marginTop:6 }}/>}
            </div>
          )):(
            <div style={{ textAlign:"center", padding:"48px 16px", color:"var(--text3)" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
              <div style={{ fontWeight:600 }}>No messages yet</div>
            </div>
          )}
        </div>
        {active?(
          <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={()=>setActive(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="chevronLeft" size={20} color="var(--text2)"/></button>
              <Avatar initials={(active.name||"U").slice(0,2).toUpperCase()} size={36}/>
              <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{active.name}</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              {thread.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:m.sender_id===user.id?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:12, background:m.sender_id===user.id?ORANGE:"var(--bg3)", color:m.sender_id===user.id?"#fff":"var(--text)", fontSize:14, lineHeight:1.5 }}>{m.text}</div>
                </div>
              ))}
              <div ref={endRef}/>
            </div>
            <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
              <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Write a message..."
                style={{ flex:1, padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:24, fontSize:14, fontFamily:FONT, outline:"none", background:"var(--input-bg)", color:"var(--text)" }}
                onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="var(--border)"}
              />
              <button onClick={send} style={{ width:40, height:40, borderRadius:"50%", background:ORANGE, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="send" size={16} color="#fff"/>
              </button>
            </div>
          </div>
        ):(
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", color:"var(--text3)", gap:8 }}>
            <Icon name="message" size={40} color="var(--border)"/>
            <div style={{ fontSize:14 }}>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── PROFILE PAGE (own profile) ────────────────────────────────────────────────

const ProfilePage = ({ user, setAuthMode, onSignOut, mode, onSwitchMode, onViewOwnProfile }) => {
  const [tab, setTab] = useState("saved");
  const [savedJobs, setSavedJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const ac = mode==="employer"?TEAL:ORANGE;

  useEffect(()=>{
    if (!user) return;
    Promise.all([fetchSavedJobs(user.id), fetchMyApplications(user.id), fetchMyJobs(user.id)])
      .then(([saved,apps,jobs])=>{ setSavedJobs(saved); setMyApps(apps); setMyJobs(jobs); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [user]);

  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>👤</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8, color:"var(--text)" }}>Your Profile</div>
      <Btn onClick={()=>setAuthMode("signin")} full>Sign In</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 120px" }}>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:80, background:`linear-gradient(135deg, ${ac} 0%, ${mode==="employer"?"#065F46":"#C85A10"} 100%)` }}/>
        <div style={{ padding:"0 24px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:-28, marginBottom:12 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:ac, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:22, border:"3px solid var(--card)" }}>
              {(user.name||"U").slice(0,2).toUpperCase()}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="ghost" size="sm" onClick={onViewOwnProfile}>✏️ Edit Profile</Btn>
              <button onClick={onSignOut} style={{ padding:"7px 14px", borderRadius:8, border:"1.5px solid var(--border)", background:"var(--card)", cursor:"pointer", fontSize:13, fontWeight:600, color:"var(--text2)", fontFamily:FONT }}>Sign Out</button>
            </div>
          </div>
          <div style={{ fontWeight:800, fontSize:20, color:"var(--text)" }}>{user.name}</div>
          {/* No email shown — privacy */}
          <div style={{ fontSize:13, color:"var(--text3)", marginTop:2 }}>{user.location||"Kampala, Uganda"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
            <Badge color={ac}>{mode==="employer"?"🏢 Employer Mode":"🔨 Worker Mode"}</Badge>
            <span onClick={()=>onSwitchMode(mode==="employer"?"worker":"employer")}
              style={{ fontSize:12, color:ac, cursor:"pointer", fontWeight:600 }}>
              Switch to {mode==="employer"?"Worker":"Employer"} →
            </span>
          </div>
          <div style={{ display:"flex", gap:20, marginTop:16 }}>
            {[{n:myApps.length,l:"Applications"},{n:savedJobs.length,l:"Saved Jobs"},{n:myJobs.length,l:"Jobs Posted"}].map(s=>(
              <div key={s.l} style={{ textAlign:"center" }}>
                <div style={{ fontWeight:700, fontSize:18, color:"var(--text)" }}>{s.n}</div>
                <div style={{ fontSize:12, color:"var(--text3)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:0, background:"var(--bg3)", borderRadius:10, padding:4, marginBottom:16 }}>
        {[["saved","Saved Jobs"],["applications","Applications"],["posted","Posted Jobs"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", background:tab===id?"var(--card)":"transparent", color:tab===id?"var(--text)":"var(--text2)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:FONT }}>
            {l}
          </button>
        ))}
      </div>

      {loading?<Spinner/>:(
        <>
          {tab==="saved"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {savedJobs.length?savedJobs.map(j=><JobCard key={j.id} job={j} compact savedIds={savedJobs.map(x=>x.id)}/>):(
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}><div style={{ fontSize:32, marginBottom:8 }}>🔖</div><div style={{ fontWeight:600 }}>No saved jobs</div></div>
              )}
            </div>
          )}
          {tab==="applications"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {myApps.length?myApps.map(a=>(
                <div key={a.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{a.jobs?.title}</div>
                  <div style={{ fontSize:13, color:"var(--text2)", marginTop:2 }}>{a.jobs?.company} · {a.jobs?.location}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:ORANGE }}>{a.jobs?.salary}</span>
                    <Badge color={a.status==="hired"?"#10B981":a.status==="rejected"?"#EF4444":ORANGE}>{a.status}</Badge>
                  </div>
                </div>
              )):(
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}><div style={{ fontSize:32, marginBottom:8 }}>📋</div><div style={{ fontWeight:600 }}>No applications yet</div></div>
              )}
            </div>
          )}
          {tab==="posted"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {myJobs.length?myJobs.map(j=>(
                <div key={j.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{j.title}</div>
                  <div style={{ fontSize:13, color:"var(--text2)" }}>{j.location} · {j.salary}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                    <span style={{ fontSize:13, color:"var(--text3)" }}>{j.applicant_count||0} applicants</span>
                    <Badge color={j.active?"#10B981":"#9CA3AF"}>{j.active?"Active":"Closed"}</Badge>
                  </div>
                </div>
              )):(
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}><div style={{ fontSize:32, marginBottom:8 }}>📌</div><div style={{ fontWeight:600 }}>No jobs posted yet</div></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── APP ROOT ──────────────────────────────────────────────────────────────────

function AppInner() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("worker");
  const [switching, setSwitching] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null); // worker userId
  const [applyJob, setApplyJob] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [unread, setUnread] = useState(0);
  const isMobile = window.innerWidth < 720;

  useEffect(()=>{
    supabase.auth.getSession().then(({ data:{ session } })=>{
      if (session?.user) {
        getProfile(session.user.id).then(profile=>{
          setUser({ ...session.user, name:profile?.name||session.user.email?.split("@")[0], ...profile });
          setMode(profile?.active_mode||"worker");
          fetchSavedJobIds(session.user.id).then(setSavedIds);
          countUnread(session.user.id).then(setUnread);
        });
      }
    });
    supabase.auth.onAuthStateChange((_event, session)=>{
      if (!session) { setUser(null); setSavedIds([]); setMode("worker"); }
    });
  }, []);

  const handleSwitchMode = async(newMode)=>{
    setSwitching(true);
    setMode(newMode);
    setPage("home");
    if (user) {
      await switchMode(user.id, newMode).catch(()=>{});
      setUser(u=>({ ...u, active_mode:newMode }));
    }
    setSwitching(false);
  };

  const handleSave = async(jobId, isSaved)=>{
    if (!user) { setAuthMode("signin"); return; }
    if (isSaved) { await unsaveJob(user.id,jobId); setSavedIds(ids=>ids.filter(id=>id!==jobId)); }
    else { await saveJob(user.id,jobId); setSavedIds(ids=>[...ids,jobId]); }
  };

  const handleJobClick = (job)=>{ setSelectedJob(job); setPage("detail"); };

  // Open a worker's full profile
  const handleWorkerClick = (workerId)=>{
    setSelectedWorker(workerId);
    setPage("workerprofile");
  };

  const handleAuth = (u)=>{
    setUser(u);
    setMode(u.active_mode||"worker");
    fetchSavedJobIds(u.id).then(setSavedIds);
  };

  const handleSignOut = async()=>{ await signOut(); setUser(null); setSavedIds([]); setMode("worker"); setPage("home"); };

  const renderPage = ()=>{
    // Worker profile view (both own and others)
    if (page==="workerprofile" && selectedWorker)
      return <WorkerProfileView
        userId={selectedWorker}
        currentUser={user}
        onBack={()=>{ setPage(mode==="employer"?"browse":"profile"); }}
        onMessage={(w)=>{ setPage("messages"); }}
      />;

    if (page==="detail"&&selectedJob)
      return <JobDetail job={selectedJob} onBack={()=>{ setPage("jobs"); setSelectedJob(null); }} onApply={setApplyJob} onSave={handleSave} user={user} setAuthMode={setAuthMode} savedIds={savedIds} mode={mode}/>;

    if (page==="jobs") return <JobsPage onJobClick={handleJobClick} onSave={handleSave} savedIds={savedIds}/>;
    if (page==="browse") return <BrowseWorkers onWorkerClick={handleWorkerClick}/>;
    if (page==="post") return <PostGig user={user} setAuthMode={setAuthMode} onPosted={()=>setPage("home")}/>;
    if (page==="messages") return <MessagesPage user={user} setAuthMode={setAuthMode}/>;
    if (page==="profile") return <ProfilePage
      user={user} setAuthMode={setAuthMode} onSignOut={handleSignOut}
      mode={mode} onSwitchMode={handleSwitchMode}
      onViewOwnProfile={()=>{ if(user){ setSelectedWorker(user.id); setPage("workerprofile"); } }}
    />;
    return <HomePage
      setPage={setPage} onJobClick={handleJobClick} onSave={handleSave}
      user={user} setAuthMode={setAuthMode} savedIds={savedIds}
      mode={mode} onWorkerClick={handleWorkerClick}
    />;
  };

  return (
    <>
      <style>{globalStyle}</style>
      <Navbar page={page} setPage={setPage} user={user} setAuthMode={setAuthMode} unread={unread} mode={mode} onSwitchMode={handleSwitchMode} switching={switching}/>
      <div style={{ paddingBottom:isMobile?72:0 }}>{renderPage()}</div>
      {isMobile&&<MobileNav page={page} setPage={setPage} unread={unread} mode={mode}/>}
      {authMode&&<AuthModal mode={authMode} onClose={()=>setAuthMode(null)} onAuth={handleAuth}/>}
      {applyJob&&<ApplyModal job={applyJob} onClose={()=>setApplyJob(null)} user={user}/>}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner/>
    </ThemeProvider>
  );
}
