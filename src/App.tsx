import { useState, useEffect, useRef } from "react";

const ORANGE = "#F07320";
const ORANGE_LIGHT = "#FEF0E7";
const ORANGE_DARK = "#C85A10";
const BLUE = "#0A66C2";
const GRAY50 = "#F9FAFB";
const GRAY100 = "#F3F4F6";
const GRAY200 = "#E5E7EB";
const GRAY300 = "#D1D5DB";
const GRAY400 = "#9CA3AF";
const GRAY600 = "#6B7280";
const GRAY700 = "#374151";
const GRAY800 = "#1F2937";
const GRAY900 = "#111827";

const FONT = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${FONT}; background: #fff; color: ${GRAY900}; }
  input, button, textarea, select { font-family: ${FONT}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${GRAY200}; border-radius: 3px; }
  a { text-decoration: none; color: inherit; }
`;

// ── DATA ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "plumbing",   label: "Plumbing",    icon: "🔧", count: 34 },
  { id: "electrical", label: "Electrical",  icon: "💡", count: 28 },
  { id: "nanny",      label: "Nanny",       icon: "👶", count: 47 },
  { id: "cleaning",   label: "Cleaning",    icon: "🧹", count: 61 },
  { id: "delivery",   label: "Delivery",    icon: "🛵", count: 89 },
  { id: "digital",    label: "Digital",     icon: "💻", count: 53 },
  { id: "catering",   label: "Catering",    icon: "🍽️", count: 22 },
  { id: "tutoring",   label: "Tutoring",    icon: "📚", count: 38 },
  { id: "security",   label: "Security",    icon: "🔐", count: 19 },
  { id: "beauty",     label: "Beauty",      icon: "✂️", count: 41 },
  { id: "painting",   label: "Painting",    icon: "🖌️", count: 16 },
  { id: "shopgirl",   label: "Shop Girls",  icon: "🏪", count: 25 },
];

const JOBS = [
  { id:1, title:"Plumber Needed for Pipe Repair", company:"Nakawa Estates", logo:"NE", location:"Nakawa, Kampala", salary:"UGX 50,000/day", type:"One-time", category:"plumbing", posted:"4 days ago", urgent:true, applicants:12, desc:"We need an experienced plumber to fix burst pipes in a 3-bedroom apartment. Must bring own tools. Job expected to take 1 day. Payment on completion.", skills:["Pipe fitting","Leak detection","PVC pipes"], saved:false },
  { id:2, title:"Hire Experienced Electrician", company:"Stanbic Bank Uganda", logo:"SB", location:"Kololo, Kampala", salary:"UGX 120,000/day", type:"Contract", category:"electrical", posted:"2 days ago", urgent:false, applicants:8, desc:"Needed for electrical wiring of a newly renovated office space. 3-day job. Must have experience with commercial wiring and hold a valid certification.", skills:["Wiring","Conduit","Panel installation"], saved:false },
  { id:3, title:"Looking for Reliable Nanny", company:"Private Family", logo:"PF", location:"Muyenga, Kampala", salary:"UGX 400,000/month", type:"Full-time", category:"nanny", posted:"5 days ago", urgent:false, applicants:23, desc:"Caring family in Muyenga looking for a reliable nanny for 2 children aged 3 and 6. Live-in or live-out. Previous experience required. Must speak English.", skills:["Childcare","Cooking","First aid"], saved:true },
  { id:4, title:"Boda Boda Delivery Rider", company:"Jumia Uganda", logo:"JU", location:"Kampala (All Areas)", salary:"UGX 80,000/day", type:"Flexible", category:"delivery", posted:"1 day ago", urgent:true, applicants:45, desc:"Jumia is hiring delivery riders across Kampala. Must have own motorcycle and valid licence. Earn daily. Work flexible hours.", skills:["Motorcycle","Navigation","Customer service"], saved:false },
  { id:5, title:"House Cleaning - Weekend Job", company:"CleanPro Uganda", logo:"CP", location:"Bugolobi, Kampala", salary:"UGX 35,000/session", type:"Part-time", category:"cleaning", posted:"3 days ago", urgent:false, applicants:17, desc:"Weekend cleaning services for residential homes. 2 sessions per weekend. Must be thorough and bring cleaning supplies.", skills:["Deep cleaning","Laundry","Ironing"], saved:false },
  { id:6, title:"Social Media Manager", company:"Rolex Foods Uganda", logo:"RF", location:"Remote / Kampala", salary:"UGX 700,000/month", type:"Full-time", category:"digital", posted:"6 hours ago", urgent:false, applicants:31, desc:"Manage our Facebook, Instagram and TikTok pages. Create content, respond to DMs, run ads. Must have portfolio. Canva skills required.", skills:["Canva","Meta Ads","Content creation"], saved:true },
  { id:7, title:"Private Math Tutor – O-Level", company:"Private Client", logo:"PC", location:"Ntinda, Kampala", salary:"UGX 30,000/hour", type:"Part-time", category:"tutoring", posted:"1 day ago", urgent:false, applicants:6, desc:"Parent looking for a math tutor for S3 student. 3 sessions per week, 2 hours each. Must explain well and have teaching experience.", skills:["Mathematics","O-Level","Teaching"], saved:false },
  { id:8, title:"Event Catering Staff Needed", company:"Sheraton Kampala", logo:"SK", location:"City Centre, Kampala", salary:"UGX 60,000/event", type:"One-time", category:"catering", posted:"12 hours ago", urgent:true, applicants:9, desc:"Need 10 servers for a corporate gala dinner on Saturday evening. Smart dress required. Experience in formal service preferred.", skills:["Food service","Presentation","Team work"], saved:false },
  { id:9, title:"Female Shop Attendant", company:"Nakumatt Supermarket", logo:"NS", location:"Lugogo, Kampala", salary:"UGX 450,000/month", type:"Full-time", category:"shopgirl", posted:"3 days ago", urgent:false, applicants:38, desc:"We are looking for a friendly and organised female shop attendant for our Lugogo branch. Must have completed S4. Training provided.", skills:["Customer service","Cash handling","Stock management"], saved:false },
  { id:10, title:"Hair Braider – Walk-in Salon", company:"Queens Beauty Palace", logo:"QB", location:"Wandegeya, Kampala", salary:"UGX 25,000/client", type:"Flexible", category:"beauty", posted:"2 days ago", urgent:false, applicants:14, desc:"Experienced braider needed for a busy salon. Commission-based pay per client. Must know latest styles. Bring your own combs.", skills:["Box braids","Cornrows","Weaves"], saved:false },
  { id:11, title:"Night Security Guard", company:"Acacia Mall", logo:"AM", location:"Kisementi, Kampala", salary:"UGX 500,000/month", type:"Full-time", category:"security", posted:"5 days ago", urgent:true, applicants:20, desc:"Need a reliable and vigilant night security guard. Must have prior experience. Uniform and torch provided. 6-month contract.", skills:["Surveillance","Patrolling","Report writing"], saved:false },
  { id:12, title:"House Painter – 2-Bedroom Flat", company:"Private Client", logo:"PC", location:"Kisaasi, Kampala", salary:"UGX 150,000 flat", type:"One-time", category:"painting", posted:"4 days ago", urgent:false, applicants:7, desc:"Need interior and exterior painting for a 2-bedroom house. Must supply own brushes and rollers. Paint will be provided. Job takes approx. 3 days.", skills:["Interior painting","Exterior painting","Wall prep"], saved:false },
];

const MESSAGES = [
  { id:1, name:"Stanbic Bank Uganda", avatar:"SB", preview:"Thank you for your application...", time:"10:32 AM", unread:true, color:"#0A66C2" },
  { id:2, name:"Jumia Uganda", avatar:"JU", preview:"Hi! Are you available to start...", time:"Yesterday", unread:true, color:"#F07320" },
  { id:3, name:"CleanPro Uganda", avatar:"CP", preview:"We've reviewed your profile...", time:"Mon", unread:false, color:"#10B981" },
  { id:4, name:"Queens Beauty Palace", avatar:"QB", preview:"Please bring your portfolio...", time:"Sun", unread:false, color:"#8B5CF6" },
];

// ── ICONS ─────────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    location: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    briefcase: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    message: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    bookmark: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    bookmarkFill: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
    share: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>,
  };
  return icons[name] || null;
};

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

const LogoIcon = ({ size = 28 }) => (
  <div style={{ width: size, height: size, background: ORANGE, borderRadius: 8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <svg width={size*0.6} height={size*0.6} viewBox="0 0 16 16" fill="white">
      <rect x="2" y="2" width="5" height="5" rx="1"/>
      <rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/>
      <rect x="9" y="9" width="5" height="5" rx="1" opacity="0.5"/>
    </svg>
  </div>
);

const Avatar = ({ initials, color = ORANGE, size = 36 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.3, flexShrink:0, fontFamily:FONT }}>
    {initials}
  </div>
);

const Badge = ({ children, color = ORANGE, bg }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:100, fontSize:11, fontWeight:600, background: bg || color+"18", color, letterSpacing:"0.01em" }}>
    {children}
  </span>
);

const Tag = ({ children }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:100, fontSize:12, fontWeight:500, background:GRAY100, color:GRAY600, border:`1px solid ${GRAY200}` }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", full, style: sx, disabled }) => {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, fontFamily:FONT, border:"none", transition:"all .15s", opacity:disabled?0.6:1, whiteSpace:"nowrap", width:full?"100%":undefined };
  const sizes = { sm:{ padding:"6px 14px", fontSize:13 }, md:{ padding:"10px 20px", fontSize:14 }, lg:{ padding:"13px 28px", fontSize:15 } };
  const variants = {
    primary:{ background:ORANGE, color:"#fff" },
    outline:{ background:"transparent", color:ORANGE, border:`1.5px solid ${ORANGE}` },
    ghost:{ background:"transparent", color:GRAY600, border:`1.5px solid ${GRAY200}` },
    danger:{ background:"#EF4444", color:"#fff" },
    blue:{ background:BLUE, color:"#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>{children}</button>;
};

const Input = ({ placeholder, value, onChange, icon, type="text", style:sx }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    {icon && <span style={{ position:"absolute", left:12, color:GRAY400, display:"flex" }}>{icon}</span>}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width:"100%", padding: icon ? "10px 14px 10px 40px" : "10px 14px", border:`1.5px solid ${GRAY200}`, borderRadius:8, fontSize:14, fontFamily:FONT, color:GRAY900, background:"#fff", outline:"none", transition:"border .15s", ...sx }}
      onFocus={e => e.target.style.borderColor=ORANGE}
      onBlur={e => e.target.style.borderColor=GRAY200}
    />
  </div>
);

const Divider = ({ my = 16 }) => <div style={{ borderTop:`1px solid ${GRAY100}`, margin:`${my}px 0` }} />;

// ── JOB CARD ─────────────────────────────────────────────────────────────────

const JobCard = ({ job, onClick, onSave, compact }) => {
  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[job.id % colors.length];
  return (
    <div onClick={onClick} style={{ background:"#fff", border:`1px solid ${GRAY200}`, borderRadius:12, padding:compact?16:20, cursor:"pointer", transition:"all .15s", marginBottom:compact?8:0 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=ORANGE; e.currentTarget.style.boxShadow=`0 2px 16px ${ORANGE}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=GRAY200; e.currentTarget.style.boxShadow="none"; }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <Avatar initials={job.logo} color={color} size={44} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:GRAY900, lineHeight:1.3 }}>{job.title}</div>
              <div style={{ fontSize:13, color:GRAY600, marginTop:2 }}>{job.company}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onSave && onSave(job.id); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:job.saved?ORANGE:GRAY400, padding:4, flexShrink:0, transition:"color .15s" }}>
              <Icon name={job.saved?"bookmarkFill":"bookmark"} size={18} color={job.saved?ORANGE:GRAY400} />
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8, alignItems:"center" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:GRAY600 }}>
              <Icon name="location" size={14} color={GRAY400} /> {job.location}
            </span>
            <span style={{ color:GRAY300 }}>·</span>
            <span style={{ fontSize:13, fontWeight:600, color:ORANGE }}>{job.salary}</span>
            <span style={{ color:GRAY300 }}>·</span>
            <Badge>{job.type}</Badge>
            {job.urgent && <Badge color="#EF4444">🔴 Urgent</Badge>}
          </div>
          {!compact && (
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:10 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:GRAY400 }}>
                <Icon name="clock" size={12} color={GRAY400} /> {job.posted}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:GRAY400 }}>
                <Icon name="users" size={12} color={GRAY400} /> {job.applicants} applicants
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── AUTH MODAL ────────────────────────────────────────────────────────────────

const AuthModal = ({ mode, onClose, onAuth }) => {
  const [tab, setTab] = useState(mode);
  const [role, setRole] = useState("worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (tab === "signin" || (name && email && pass)) {
      setDone(true);
      setTimeout(() => { onAuth({ name: name || "User", role }); onClose(); }, 800);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LogoIcon size={32} />
            <span style={{ fontWeight:800, fontSize:20 }}>tasq<span style={{color:ORANGE}}>now</span></span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:GRAY400 }}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ display:"flex", background:GRAY100, borderRadius:8, padding:4, marginBottom:24 }}>
          {["signin","signup"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"8px 0", borderRadius:6, border:"none", background:tab===t?"#fff":"transparent", color:tab===t?GRAY900:GRAY600, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .15s", fontFamily:FONT }}>
              {t==="signin"?"Sign In":"Sign Up"}
            </button>
          ))}
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <div style={{ width:56, height:56, background:ORANGE+"18", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Icon name="check" size={28} color={ORANGE} />
            </div>
            <div style={{ fontWeight:700, fontSize:18 }}>Welcome!</div>
          </div>
        ) : (
          <>
            {tab==="signup" && (
              <>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:8, color:GRAY700 }}>I want to...</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["worker","Find work"],["client","Hire talent"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setRole(v)} style={{ flex:1, padding:"10px 0", border:`1.5px solid ${role===v?ORANGE:GRAY200}`, borderRadius:8, background:role===v?ORANGE_LIGHT:"#fff", color:role===v?ORANGE_DARK:GRAY600, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .15s", fontFamily:FONT }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <Input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ marginBottom:12 }}>
              <Input placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} type="email" />
            </div>
            <div style={{ marginBottom:20 }}>
              <Input placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} type="password" />
            </div>
            <Btn onClick={submit} full size="lg">{tab==="signin"?"Sign In":"Create Account"}</Btn>
            {tab==="signin" && <div style={{ textAlign:"center", marginTop:12, fontSize:13, color:BLUE, cursor:"pointer" }}>Forgot password?</div>}
            <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:GRAY400 }}>
              By continuing you agree to our <span style={{color:ORANGE,cursor:"pointer"}}>Terms</span> and <span style={{color:ORANGE,cursor:"pointer"}}>Privacy Policy</span>
            </div>
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
  if (!job) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.15)" }}>
        {applied ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ fontWeight:700, fontSize:20, marginBottom:8 }}>Application Sent!</div>
            <div style={{ color:GRAY600, fontSize:14, marginBottom:24 }}>Your application for <strong>{job.title}</strong> has been submitted. You'll hear back via messages.</div>
            <Btn onClick={onClose} full>Done</Btn>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:18 }}>Apply for this job</div>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="x" size={20} color={GRAY400} /></button>
            </div>
            <div style={{ background:GRAY50, borderRadius:10, padding:14, marginBottom:20, display:"flex", gap:12 }}>
              <Avatar initials={job.logo} size={40} />
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{job.title}</div>
                <div style={{ fontSize:13, color:GRAY600 }}>{job.company} · {job.location}</div>
                <div style={{ fontSize:13, fontWeight:600, color:ORANGE, marginTop:2 }}>{job.salary}</div>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8, color:GRAY700 }}>Cover message (optional)</div>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Tell the employer why you're a great fit..."
                style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${GRAY200}`, borderRadius:8, fontSize:14, fontFamily:FONT, resize:"none", height:100, outline:"none" }}
                onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY200}
              />
            </div>
            <div style={{ background:ORANGE_LIGHT, borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:13, color:ORANGE_DARK }}>
              📎 Your profile will be shared with the employer
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={onClose} full>Cancel</Btn>
              <Btn onClick={()=>setApplied(true)} full>Submit Application</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── NAV ───────────────────────────────────────────────────────────────────────

const Navbar = ({ page, setPage, user, setAuthMode, unread }) => (
  <nav style={{ position:"sticky", top:0, zIndex:100, background:"#fff", borderBottom:`1px solid ${GRAY200}`, padding:"0 clamp(16px,4vw,48px)", display:"flex", alignItems:"center", height:64, gap:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }} onClick={()=>setPage("home")}>
      <LogoIcon size={32} />
      <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.02em" }}>tasq<span style={{color:ORANGE}}>now</span></span>
    </div>
    <div style={{ flex:1, maxWidth:320, display:window.innerWidth>700?"flex":"none", alignItems:"center" }}>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:4, marginLeft:"auto" }}>
      {[
        {id:"home", label:"Home", icon:"home"},
        {id:"jobs", label:"Find Work", icon:"briefcase"},
        {id:"messages", label:"Messages", icon:"message"},
        {id:"post", label:"Post a Gig", icon:"plus"},
      ].map(n=>(
        <button key={n.id} onClick={()=>setPage(n.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"6px 10px", border:"none", background:"none", cursor:"pointer", color:page===n.id?ORANGE:GRAY600, fontFamily:FONT, position:"relative" }}>
          <Icon name={n.icon} size={20} color={page===n.id?ORANGE:GRAY600} />
          <span style={{ fontSize:11, fontWeight:page===n.id?700:500, display:window.innerWidth<600?"none":"block" }}>{n.label}</span>
          {n.id==="messages" && unread > 0 && (
            <span style={{ position:"absolute", top:4, right:8, background:"#EF4444", color:"#fff", borderRadius:100, fontSize:10, fontWeight:700, padding:"1px 5px", minWidth:16, textAlign:"center" }}>{unread}</span>
          )}
          {page===n.id && <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:24, height:2, background:ORANGE, borderRadius:100 }} />}
        </button>
      ))}
      {user ? (
        <button onClick={()=>setPage("profile")} style={{ marginLeft:8, background:"none", border:"none", cursor:"pointer", padding:4 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, border: page==="profile"?`2px solid ${ORANGE}`:"2px solid transparent" }}>
            {user.name.slice(0,2).toUpperCase()}
          </div>
        </button>
      ) : (
        <div style={{ display:"flex", gap:8, marginLeft:8 }}>
          <Btn size="sm" variant="ghost" onClick={()=>setAuthMode("signin")}>Sign In</Btn>
          <Btn size="sm" onClick={()=>setAuthMode("signup")}>Join Now</Btn>
        </div>
      )}
    </div>
  </nav>
);

// Bottom mobile tab bar
const MobileNav = ({ page, setPage, unread }) => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${GRAY200}`, display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" }}>
    {[
      {id:"home",label:"Home",icon:"home"},
      {id:"jobs",label:"Jobs",icon:"briefcase"},
      {id:"messages",label:"Chat",icon:"message"},
      {id:"post",label:"Post",icon:"plus"},
      {id:"profile",label:"Profile",icon:"user"},
    ].map(n=>(
      <button key={n.id} onClick={()=>setPage(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 0 8px", border:"none", background:"none", cursor:"pointer", color:page===n.id?ORANGE:GRAY400, fontFamily:FONT, position:"relative" }}>
        <Icon name={n.icon} size={22} color={page===n.id?ORANGE:GRAY400}/>
        <span style={{ fontSize:10, fontWeight:page===n.id?700:500 }}>{n.label}</span>
        {n.id==="messages" && unread>0 && <span style={{ position:"absolute", top:8, left:"50%", marginLeft:4, background:"#EF4444", color:"#fff", borderRadius:100, fontSize:9, fontWeight:700, padding:"1px 4px" }}>{unread}</span>}
      </button>
    ))}
  </div>
);

// ── HOME PAGE ─────────────────────────────────────────────────────────────────

const HomePage = ({ jobs, setPage, onJobClick, onSave, user, setAuthMode }) => {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [activecat, setActivecat] = useState(null);

  const handleSearch = () => setPage("jobs");

  const filtered = jobs.filter(j =>
    (!activecat || j.category === activecat) &&
    (!what || j.title.toLowerCase().includes(what.toLowerCase()))
  ).slice(0,6);

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 16px 100px" }}>
      {/* Hero search */}
      <div style={{ padding:"32px 0 24px" }}>
        {user && <div style={{ fontSize:16, color:GRAY600, marginBottom:4 }}>Good day, <strong style={{color:GRAY900}}>{user.name}</strong> 👋</div>}
        <h1 style={{ fontSize:28, fontWeight:800, color:GRAY900, lineHeight:1.2, marginBottom:20 }}>Find local gig jobs</h1>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px" }}>
            <div style={{ border:`1.5px solid ${GRAY200}`, borderRadius:10, display:"flex", alignItems:"center", background:"#fff", overflow:"hidden" }}>
              <span style={{ padding:"0 12px", color:GRAY400 }}><Icon name="search" size={16} /></span>
              <input placeholder="e.g. plumbing, nanny" value={what} onChange={e=>setWhat(e.target.value)}
                style={{ flex:1, padding:"12px 0", border:"none", outline:"none", fontSize:14, fontFamily:FONT, color:GRAY900 }} />
            </div>
          </div>
          <div style={{ flex:"1 1 160px" }}>
            <div style={{ border:`1.5px solid ${GRAY200}`, borderRadius:10, display:"flex", alignItems:"center", background:"#fff", overflow:"hidden" }}>
              <span style={{ padding:"0 12px", color:GRAY400 }}><Icon name="location" size={16} /></span>
              <input placeholder="City or region" value={where} onChange={e=>setWhere(e.target.value)}
                style={{ flex:1, padding:"12px 0", border:"none", outline:"none", fontSize:14, fontFamily:FONT, color:GRAY900 }} />
            </div>
          </div>
          <Btn onClick={handleSearch} size="lg" sx={{ borderRadius:10, padding:"12px 28px" }}>Search</Btn>
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:14, color:GRAY900 }}>Browse by category</div>
        <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:6 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={()=>setActivecat(activecat===c.id?null:c.id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"14px 16px", border:`1.5px solid ${activecat===c.id?ORANGE:GRAY200}`, borderRadius:12, background:activecat===c.id?ORANGE_LIGHT:"#fff", cursor:"pointer", minWidth:82, transition:"all .15s", flexShrink:0, fontFamily:FONT }}>
              <span style={{ fontSize:22 }}>{c.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:activecat===c.id?ORANGE_DARK:GRAY700 }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured banner */}
      {!user && (
        <div style={{ background:`linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`, borderRadius:14, padding:"20px 24px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#fff", marginBottom:4 }}>Join TasqNow Free</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.8)" }}>Post gigs or find work in Kampala today</div>
          </div>
          <Btn variant="outline" onClick={()=>setAuthMode("signup")} sx={{ borderColor:"#fff", color:"#fff", flexShrink:0 }}>Get Started</Btn>
        </div>
      )}

      {/* Job listings */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:16 }}>
          Job Listings {activecat && <Badge>{CATEGORIES.find(c=>c.id===activecat)?.label}</Badge>}
        </div>
        <span onClick={()=>setPage("jobs")} style={{ fontSize:13, color:ORANGE, fontWeight:600, cursor:"pointer" }}>See all →</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(j=>(
          <JobCard key={j.id} job={j} onClick={()=>onJobClick(j)} onSave={onSave} compact />
        ))}
      </div>
    </div>
  );
};

// ── JOBS PAGE ─────────────────────────────────────────────────────────────────

const JobsPage = ({ jobs, onJobClick, onSave }) => {
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("All");
  const [cat, setCat] = useState("All");

  const types = ["All","One-time","Part-time","Full-time","Flexible","Contract"];

  const filtered = jobs.filter(j =>
    (type==="All"||j.type===type) &&
    (cat==="All"||j.category===cat) &&
    (!search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())) &&
    (!loc || j.location.toLowerCase().includes(loc.toLowerCase()))
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 100px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:16 }}>Find Work</h2>

      {/* Search row */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 200px" }}>
          <Input placeholder="Job title or company" value={search} onChange={e=>setSearch(e.target.value)} icon={<Icon name="search" size={16}/>} />
        </div>
        <div style={{ flex:"1 1 160px" }}>
          <Input placeholder="Location" value={loc} onChange={e=>setLoc(e.target.value)} icon={<Icon name="location" size={16}/>} />
        </div>
      </div>

      {/* Type filters */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {types.map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${type===t?ORANGE:GRAY200}`, background:type===t?ORANGE_LIGHT:"#fff", color:type===t?ORANGE_DARK:GRAY600, fontWeight:600, fontSize:13, cursor:"pointer", flexShrink:0, transition:"all .15s", fontFamily:FONT }}>
            {t}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:20 }}>
        {["All",...CATEGORIES.map(c=>c.id)].map(c=>{
          const catObj = CATEGORIES.find(x=>x.id===c);
          return (
            <button key={c} onClick={()=>setCat(c)} style={{ padding:"6px 14px", borderRadius:100, border:`1.5px solid ${cat===c?ORANGE:GRAY200}`, background:cat===c?ORANGE_LIGHT:"#fff", color:cat===c?ORANGE_DARK:GRAY600, fontWeight:600, fontSize:12, cursor:"pointer", flexShrink:0, transition:"all .15s", fontFamily:FONT, display:"flex", alignItems:"center", gap:4 }}>
              {catObj && <span>{catObj.icon}</span>}{catObj?catObj.label:"All Categories"}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize:13, color:GRAY400, marginBottom:14 }}>{filtered.length} jobs found</div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.length ? filtered.map(j=>(
          <JobCard key={j.id} job={j} onClick={()=>onJobClick(j)} onSave={onSave} />
        )) : (
          <div style={{ textAlign:"center", padding:"48px 0", color:GRAY400 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontWeight:600, fontSize:16 }}>No jobs found</div>
            <div style={{ fontSize:14, marginTop:4 }}>Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── JOB DETAIL ────────────────────────────────────────────────────────────────

const JobDetail = ({ job, onBack, onApply, onSave, user, setAuthMode }) => {
  if (!job) return null;
  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[job.id % colors.length];

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"0 16px 120px" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:GRAY600, fontFamily:FONT, padding:"20px 0", fontSize:14, fontWeight:600 }}>
        <Icon name="chevronLeft" size={18} /> Back
      </button>

      <div style={{ background:"#fff", border:`1px solid ${GRAY200}`, borderRadius:14, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"24px 24px 20px", borderBottom:`1px solid ${GRAY100}` }}>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <Avatar initials={job.logo} color={color} size={56} />
            <div style={{ flex:1 }}>
              <h1 style={{ fontWeight:800, fontSize:20, color:GRAY900, lineHeight:1.3, marginBottom:4 }}>{job.title}</h1>
              <div style={{ fontSize:14, color:GRAY600, marginBottom:8 }}>{job.company}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:GRAY600 }}><Icon name="location" size={14} color={GRAY400}/>{job.location}</span>
                <Badge>{job.type}</Badge>
                {job.urgent && <Badge color="#EF4444">🔴 Urgent</Badge>}
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
            {[
              { label:"Pay", value:job.salary, color:ORANGE },
              { label:"Applicants", value:job.applicants, color:BLUE },
              { label:"Posted", value:job.posted, color:GRAY600 },
            ].map(s=>(
              <div key={s.label} style={{ background:GRAY50, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:GRAY400, marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
                <div style={{ fontWeight:700, fontSize:15, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${GRAY100}`, display:"flex", gap:10 }}>
          <Btn onClick={()=>{ user ? onApply(job) : setAuthMode("signin"); }} full size="lg">Apply Now</Btn>
          <button onClick={()=>onSave(job.id)} style={{ padding:"0 14px", border:`1.5px solid ${GRAY200}`, borderRadius:8, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", color:job.saved?ORANGE:GRAY400, transition:"color .15s" }}>
            <Icon name={job.saved?"bookmarkFill":"bookmark"} size={20} color={job.saved?ORANGE:GRAY400} />
          </button>
          <button style={{ padding:"0 14px", border:`1.5px solid ${GRAY200}`, borderRadius:8, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", color:GRAY400 }}>
            <Icon name="share" size={18} color={GRAY400} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:"24px" }}>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:12 }}>Job Description</div>
          <div style={{ fontSize:14, color:GRAY700, lineHeight:1.75, marginBottom:24 }}>{job.desc}</div>

          <div style={{ fontWeight:700, fontSize:16, marginBottom:12 }}>Skills Required</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
            {job.skills.map(s=><Tag key={s}>{s}</Tag>)}
          </div>

          <Divider />
          <div style={{ fontSize:13, color:GRAY400, display:"flex", alignItems:"center", gap:6, marginTop:16 }}>
            <Icon name="bell" size={14} color={GRAY400} />
            Turn on job alerts for <strong style={{color:ORANGE}}>{CATEGORIES.find(c=>c.id===job.category)?.label}</strong> in Kampala
          </div>
        </div>
      </div>
    </div>
  );
};

// ── POST A GIG ────────────────────────────────────────────────────────────────

const PostGig = ({ user, setAuthMode, onPosted }) => {
  const [form, setForm] = useState({ title:"", company:"", location:"Kampala", type:"One-time", category:"", salary:"", desc:"", urgent:false });
  const [posted, setPosted] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = () => {
    if (!user) { setAuthMode("signin"); return; }
    if (form.title && form.category) { setPosted(true); setTimeout(onPosted, 2500); }
  };

  if (posted) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
      <div style={{ fontWeight:800, fontSize:22, marginBottom:8 }}>Gig Posted!</div>
      <div style={{ color:GRAY600, marginBottom:24 }}>Your listing is now live. Applicants will reach out via messages.</div>
      <div style={{ background:ORANGE_LIGHT, borderRadius:12, padding:16, fontSize:14, color:ORANGE_DARK }}>Redirecting to home...</div>
    </div>
  );

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px 120px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>Post a Gig</h2>
      <div style={{ color:GRAY600, fontSize:14, marginBottom:24 }}>Fill in the details below to find the right person for the job.</div>

      <div style={{ background:"#fff", border:`1px solid ${GRAY200}`, borderRadius:14, padding:24, display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Job Title *</label>
          <Input placeholder="e.g. Plumber needed for pipe repair" value={form.title} onChange={e=>set("title",e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Your Name / Company</label>
          <Input placeholder="e.g. Private client or Acme Ltd" value={form.company} onChange={e=>set("company",e.target.value)} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Category *</label>
            <select value={form.category} onChange={e=>set("category",e.target.value)} style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${GRAY200}`, borderRadius:8, fontSize:14, fontFamily:FONT, color:form.category?GRAY900:GRAY400, outline:"none", background:"#fff" }}>
              <option value="">Select category</option>
              {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Job Type</label>
            <select value={form.type} onChange={e=>set("type",e.target.value)} style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${GRAY200}`, borderRadius:8, fontSize:14, fontFamily:FONT, color:GRAY900, outline:"none", background:"#fff" }}>
              {["One-time","Part-time","Full-time","Flexible","Contract"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Location</label>
            <Input placeholder="e.g. Nakawa, Kampala" value={form.location} onChange={e=>set("location",e.target.value)} icon={<Icon name="location" size={14}/>} />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Pay / Salary</label>
            <Input placeholder="e.g. UGX 50,000/day" value={form.salary} onChange={e=>set("salary",e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize:13, fontWeight:600, color:GRAY700, display:"block", marginBottom:6 }}>Job Description</label>
          <textarea value={form.desc} onChange={e=>set("desc",e.target.value)} placeholder="Describe the work, requirements, and any other relevant details..."
            style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${GRAY200}`, borderRadius:8, fontSize:14, fontFamily:FONT, resize:"vertical", height:120, outline:"none", color:GRAY900 }}
            onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY200}
          />
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <input type="checkbox" checked={form.urgent} onChange={e=>set("urgent",e.target.checked)} style={{ width:16, height:16, accentColor:ORANGE }} />
          <span style={{ fontSize:14, fontWeight:500, color:GRAY700 }}>🔴 Mark as Urgent</span>
        </label>
        <Btn onClick={submit} full size="lg">
          {user ? "Publish Gig" : "Sign In to Post"}
        </Btn>
      </div>
    </div>
  );
};

// ── MESSAGES PAGE ─────────────────────────────────────────────────────────────

const MessagesPage = ({ user, setAuthMode }) => {
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState({
    1:[{from:"them",text:"Thank you for your application for the Electrician role. Can you come for an interview on Friday?"}],
    2:[{from:"them",text:"Hi! Are you available to start deliveries this Monday? We need 5 riders urgently."}],
    3:[{from:"them",text:"We've reviewed your profile and would like to invite you for a trial cleaning session."}],
    4:[{from:"them",text:"Please bring your portfolio and a list of your recent clients when you come in."}],
  });

  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>💬</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8 }}>Your messages</div>
      <div style={{ color:GRAY600, marginBottom:24 }}>Sign in to see your conversations with employers and workers.</div>
      <Btn onClick={()=>setAuthMode("signin")} full>Sign In</Btn>
    </div>
  );

  const send = () => {
    if (!msg.trim() || !active) return;
    setChats(c=>({...c,[active]:[...(c[active]||[]),{from:"me",text:msg}]}));
    setMsg("");
  };

  const unread = MESSAGES.filter(m=>m.unread).length;

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 16px 100px" }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:16 }}>Messages</h2>
      <div style={{ border:`1px solid ${GRAY200}`, borderRadius:14, overflow:"hidden", background:"#fff", display:"flex", minHeight:480 }}>
        {/* List */}
        <div style={{ width:active?280:undefined, minWidth:active?280:undefined, borderRight:`1px solid ${GRAY200}`, overflowY:"auto", flex:active?0:1 }}>
          {MESSAGES.map(m=>(
            <div key={m.id} onClick={()=>setActive(m.id)} style={{ display:"flex", gap:12, padding:"14px 16px", cursor:"pointer", background:active===m.id?GRAY50:"#fff", borderBottom:`1px solid ${GRAY100}`, transition:"background .1s" }}
              onMouseEnter={e=>{ if(active!==m.id)e.currentTarget.style.background=GRAY50; }}
              onMouseLeave={e=>{ if(active!==m.id)e.currentTarget.style.background="#fff"; }}>
              <Avatar initials={m.avatar} color={m.color} size={42} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div style={{ fontWeight:m.unread?700:600, fontSize:14, color:GRAY900 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:GRAY400 }}>{m.time}</div>
                </div>
                <div style={{ fontSize:13, color:m.unread?GRAY700:GRAY400, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:m.unread?500:400 }}>{m.preview}</div>
              </div>
              {m.unread && <div style={{ width:8, height:8, borderRadius:"50%", background:ORANGE, flexShrink:0, marginTop:6 }} />}
            </div>
          ))}
        </div>

        {/* Chat panel */}
        {active ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${GRAY100}`, display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={()=>setActive(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="chevronLeft" size={20} color={GRAY600}/></button>
              <Avatar initials={MESSAGES.find(m=>m.id===active)?.avatar} color={MESSAGES.find(m=>m.id===active)?.color} size={36}/>
              <div style={{ fontWeight:700, fontSize:14 }}>{MESSAGES.find(m=>m.id===active)?.name}</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              {(chats[active]||[]).map((c,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:c.from==="me"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:12, background:c.from==="me"?ORANGE:GRAY100, color:c.from==="me"?"#fff":GRAY900, fontSize:14, lineHeight:1.5, borderBottomRightRadius:c.from==="me"?4:12, borderBottomLeftRadius:c.from==="them"?4:12 }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"12px 16px", borderTop:`1px solid ${GRAY100}`, display:"flex", gap:8 }}>
              <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Write a message..."
                style={{ flex:1, padding:"10px 14px", border:`1.5px solid ${GRAY200}`, borderRadius:24, fontSize:14, fontFamily:FONT, outline:"none" }}
                onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY200}
              />
              <button onClick={send} style={{ width:40, height:40, borderRadius:"50%", background:ORANGE, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="send" size={16} color="#fff"/>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", color:GRAY400, gap:8 }}>
            <Icon name="message" size={40} color={GRAY200}/>
            <div style={{ fontSize:14 }}>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────

const ProfilePage = ({ user, setAuthMode, jobs }) => {
  const [tab, setTab] = useState("saved");
  if (!user) return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>👤</div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8 }}>Your Profile</div>
      <div style={{ color:GRAY600, marginBottom:24 }}>Sign in to view your profile, saved jobs, and applications.</div>
      <Btn onClick={()=>setAuthMode("signin")} full>Sign In</Btn>
    </div>
  );

  const savedJobs = jobs.filter(j=>j.saved);
  const skills = ["Customer service","Teamwork","Fluent English","MS Word"];

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 120px" }}>
      {/* Profile card */}
      <div style={{ background:"#fff", border:`1px solid ${GRAY200}`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:80, background:`linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)` }} />
        <div style={{ padding:"0 24px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:-28, marginBottom:12 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:22, border:"3px solid #fff" }}>
              {user.name.slice(0,2).toUpperCase()}
            </div>
            <Btn variant="outline" size="sm">Edit Profile</Btn>
          </div>
          <div style={{ fontWeight:800, fontSize:20, color:GRAY900 }}>{user.name}</div>
          <div style={{ fontSize:14, color:GRAY600, marginTop:2 }}>Kampala, Uganda</div>
          <div style={{ display:"flex", gap:16, marginTop:16 }}>
            {[{n:"0",l:"Applications"},{n:savedJobs.length.toString(),l:"Saved Jobs"},{n:"4.8 ⭐",l:"Rating"}].map(s=>(
              <div key={s.l} style={{ textAlign:"center" }}>
                <div style={{ fontWeight:700, fontSize:18, color:GRAY900 }}>{s.n}</div>
                <div style={{ fontSize:12, color:GRAY400 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ background:"#fff", border:`1px solid ${GRAY200}`, borderRadius:14, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Skills</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {skills.map(s=><Tag key={s}>{s}</Tag>)}
          <button style={{ padding:"4px 12px", borderRadius:100, border:`1.5px dashed ${GRAY300}`, background:"transparent", color:ORANGE, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONT }}>+ Add skill</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, background:GRAY100, borderRadius:10, padding:4, marginBottom:16 }}>
        {[["saved","Saved Jobs"],["activity","Activity"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", background:tab===id?"#fff":"transparent", color:tab===id?GRAY900:GRAY600, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .15s", fontFamily:FONT }}>
            {l} {id==="saved"&&savedJobs.length>0&&<span style={{color:ORANGE}}>({savedJobs.length})</span>}
          </button>
        ))}
      </div>

      {tab==="saved" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {savedJobs.length ? savedJobs.map(j=><JobCard key={j.id} job={j} compact />) : (
            <div style={{ textAlign:"center", padding:"40px 0", color:GRAY400 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔖</div>
              <div style={{ fontWeight:600 }}>No saved jobs yet</div>
              <div style={{ fontSize:13, marginTop:4 }}>Tap the bookmark icon on any job to save it</div>
            </div>
          )}
        </div>
      )}
      {tab==="activity" && (
        <div style={{ textAlign:"center", padding:"48px 0", color:GRAY400 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontWeight:600 }}>No activity yet</div>
          <div style={{ fontSize:13, marginTop:4 }}>Apply to jobs to see your history here</div>
        </div>
      )}
    </div>
  );
};

// ── APP ROOT ──────────────────────────────────────────────────────────────────

export default function TasqNow() {
  const [page, setPage] = useState("home");
  const [jobs, setJobs] = useState(JOBS);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const isMobile = window.innerWidth < 720;

  const unread = MESSAGES.filter(m=>m.unread).length;

  const handleSave = (id) => setJobs(j=>j.map(x=>x.id===id?{...x,saved:!x.saved}:x));
  const handleJobClick = (job) => { setSelectedJob(job); setPage("detail"); };
  const handleAuth = (u) => setUser(u);

  const renderPage = () => {
    if (page==="detail" && selectedJob) return (
      <JobDetail job={selectedJob} onBack={()=>{ setPage("jobs"); setSelectedJob(null); }} onApply={setApplyJob} onSave={handleSave} user={user} setAuthMode={setAuthMode} />
    );
    if (page==="jobs") return <JobsPage jobs={jobs} onJobClick={handleJobClick} onSave={handleSave} />;
    if (page==="post") return <PostGig user={user} setAuthMode={setAuthMode} onPosted={()=>setPage("home")} />;
    if (page==="messages") return <MessagesPage user={user} setAuthMode={setAuthMode} />;
    if (page==="profile") return <ProfilePage user={user} setAuthMode={setAuthMode} jobs={jobs} />;
    return <HomePage jobs={jobs} setPage={setPage} onJobClick={handleJobClick} onSave={handleSave} user={user} setAuthMode={setAuthMode} />;
  };

  return (
    <>
      <style>{globalStyle}</style>
      <Navbar page={page} setPage={setPage} user={user} setAuthMode={setAuthMode} unread={unread} />
      <div style={{ paddingBottom: isMobile ? 72 : 0 }}>
        {renderPage()}
      </div>
      {isMobile && <MobileNav page={page} setPage={setPage} unread={unread} />}
      {authMode && <AuthModal mode={authMode} onClose={()=>setAuthMode(null)} onAuth={handleAuth} />}
      {applyJob && <ApplyModal job={applyJob} onClose={()=>setApplyJob(null)} user={user} />}
    </>
  );
}
// @ts - nocheck
