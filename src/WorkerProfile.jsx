// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  supabase, fetchFullProfile, updateProfile, uploadImage,
  addPortfolioPhoto, deletePortfolioPhoto,
  addWorkHistory, deleteWorkHistory,
  addCertification, deleteCertification,
  addRecommendation, recalculateTasqScore, sendMessage
} from "./supabase";

const ORANGE = "#F07320";
const TEAL = "#0D9488";
const FONT = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

// ── HELPERS ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"48px 0" }}>
    <div style={{ width:32, height:32, border:"3px solid var(--border)", borderTopColor:ORANGE, borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
  </div>
);

const Btn = ({ children, onClick, variant="primary", size="md", full, style:sx, disabled }) => {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, fontFamily:FONT, border:"none", transition:"all .15s", opacity:disabled?0.6:1, width:full?"100%":undefined };
  const sizes = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 18px",fontSize:14}, lg:{padding:"12px 28px",fontSize:15} };
  const variants = {
    primary:{ background:ORANGE, color:"#fff" },
    teal:{ background:TEAL, color:"#fff" },
    outline:{ background:"transparent", color:ORANGE, border:`1.5px solid ${ORANGE}` },
    ghost:{ background:"transparent", color:"var(--text2)", border:"1.5px solid var(--border)" },
    danger:{ background:"#EF4444", color:"#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>{children}</button>;
};

const Input = ({ label, placeholder, value, onChange, type="text", multiline, rows=3 }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 }}>{label}</label>}
    {multiline ? (
      <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        style={{ width:"100%", padding:"9px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, resize:"vertical", outline:"none", background:"var(--input-bg)", color:"var(--text)" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="var(--border)"}
      />
    ) : (
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ width:"100%", padding:"9px 12px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:14, fontFamily:FONT, outline:"none", background:"var(--input-bg)", color:"var(--text)" }}
        onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor="var(--border)"}
      />
    )}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:"var(--card)", borderRadius:16, padding:24, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.3)", maxHeight:"85vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:17, color:"var(--text)" }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--text3)", lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ── TASQSCORE BADGE ───────────────────────────────────────────────────────────

const TasqScoreBadge = ({ score, size="md" }) => {
  const color = score>=70?"#10B981":score>=40?"#F59E0B":"#9CA3AF";
  const bg = score>=70?"#D1FAE5":score>=40?"#FEF3C7":"var(--bg3)";
  const label = score>=70?"Top Rated":score>=40?"Good":"New";
  return (
    <div style={{ background:bg, borderRadius:10, padding:"6px 10px", textAlign:"center", flexShrink:0 }}>
      <div style={{ fontWeight:800, fontSize:15, color, lineHeight:1 }}>{score}</div>
      <div style={{ fontSize:8, fontWeight:700, color, textTransform:"uppercase", letterSpacing:".06em", marginTop:2 }}>TasqScore</div>
      <div style={{ fontSize:9, color, marginTop:1 }}>{label}</div>
    </div>
  );
};

const Stars = ({ rating, max=5 }) => (
  <div style={{ display:"flex", gap:2 }}>
    {Array.from({length:max}).map((_,i)=>(
      <span key={i} style={{ color:i<rating?"#F59E0B":"var(--border)", fontSize:14 }}>★</span>
    ))}
  </div>
);

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────

function MessageModal({ worker, currentUser, onClose, isHire }) {
  const [text, setText] = useState(isHire ? `Hi ${worker.name}, I'd like to hire you for a job. Are you available?` : "");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(currentUser.id, worker.id, text);
      setSent(true);
    } catch(e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <Modal title={isHire ? `Hire ${worker.name}` : `Message ${worker.name}`} onClose={onClose}>
      {sent ? (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:8 }}>Message sent!</div>
          <div style={{ color:"var(--text2)", fontSize:14, marginBottom:16 }}>{worker.name} will reply via Messages.</div>
          <Btn onClick={onClose} full>Done</Btn>
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:12, alignItems:"center", background:"var(--bg2)", borderRadius:10, padding:12, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16, flexShrink:0 }}>
              {(worker.name||"U").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{worker.name}</div>
              <div style={{ fontSize:12, color:"var(--text2)" }}>{worker.skills?.slice(0,2).join(" · ") || "Gig worker"} · {worker.location}</div>
            </div>
          </div>
          <Input
            label="Your message"
            placeholder={`Write your message to ${worker.name}...`}
            value={text}
            onChange={e=>setText(e.target.value)}
            multiline
            rows={4}
          />
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="ghost" onClick={onClose} full>Cancel</Btn>
            <Btn onClick={send} full disabled={sending||!text.trim()} style={{ background:isHire?TEAL:ORANGE }}>
              {sending?"Sending...":isHire?"Send Hire Request":"Send Message"}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── WORKER PROFILE VIEW ───────────────────────────────────────────────────────

export function WorkerProfileView({ userId, currentUser, onBack, onMessage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [recText, setRecText] = useState("");
  const [recRating, setRecRating] = useState(5);
  const [submittingRec, setSubmittingRec] = useState(false);

  const isOwn = currentUser?.id === userId;

  useEffect(()=>{
    setLoading(true);
    fetchFullProfile(userId)
      .then(p=>{ setProfile(p); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [userId]);

  const submitRecommendation = async()=>{
    if (!recText.trim()) return;
    setSubmittingRec(true);
    try {
      await addRecommendation(userId, currentUser.id, currentUser.name, currentUser.primary_role==="employer"?"Employer":"Worker", recText, recRating);
      setShowRecommendModal(false);
      setRecText("");
      const updated = await fetchFullProfile(userId);
      setProfile(updated);
    } catch(e){ console.error(e); }
    finally{ setSubmittingRec(false); }
  };

  if (loading) return <Spinner/>;
  if (!profile) return <div style={{ padding:24, color:"var(--text2)" }}>Profile not found.</div>;

  const colors = ["#F07320","#0A66C2","#10B981","#8B5CF6","#EF4444","#F59E0B"];
  const color = colors[profile.name?.charCodeAt(0) % colors.length] || ORANGE;
  const avgRating = profile.ratings?.length
    ? (profile.ratings.reduce((s,r)=>s+r.score,0)/profile.ratings.length).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"0 16px 100px", animation:"fadeIn .2s ease" }}>

      {/* ── BACK BUTTON ── */}
      <button onClick={onBack}
        style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:ORANGE, fontFamily:FONT, padding:"18px 0 12px", fontSize:15, fontWeight:700 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>

      {/* ── COVER + AVATAR ── */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", marginBottom:12 }}>
        <div style={{ height:130, background:profile.cover_url?`url(${profile.cover_url}) center/cover`:`linear-gradient(135deg, ${color}cc 0%, ${color}55 100%)`, position:"relative" }}>
          {isOwn && <CoverUploader userId={userId} onUpload={url=>setProfile(p=>({...p,cover_url:url}))}/>}
        </div>

        <div style={{ padding:"0 20px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:-44 }}>
            <div style={{ position:"relative" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:profile.avatar_url?"transparent":color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:28, border:"3px solid var(--card)", overflow:"hidden" }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : (profile.name||"U").slice(0,2).toUpperCase()}
              </div>
              {isOwn && <AvatarUploader userId={userId} onUpload={url=>setProfile(p=>({...p,avatar_url:url}))}/>}
            </div>
            <TasqScoreBadge score={profile.tasq_score||0}/>
          </div>

          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{ fontWeight:800, fontSize:22, color:"var(--text)" }}>{profile.name}</div>
              {profile.is_id_verified && (
                <span style={{ background:"#DBEAFE", color:"#1D4ED8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>✓ ID Verified</span>
              )}
            </div>
            <div style={{ fontSize:14, color:"var(--text2)", marginTop:3 }}>
              {profile.skills?.slice(0,3).join(" · ") || "Gig worker"}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:6, flexWrap:"wrap" }}>
              {profile.location && <span style={{ fontSize:13, color:"var(--text3)" }}>📍 {profile.location}</span>}
              {avgRating && <span style={{ fontSize:13, color:"#F59E0B", fontWeight:600 }}>★ {avgRating} ({profile.ratings.length} reviews)</span>}
              {profile.total_jobs > 0 && <span style={{ fontSize:13, color:"var(--text3)" }}>✅ {profile.total_jobs} jobs done</span>}
            </div>
          </div>

          {profile.bio && (
            <div style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, marginTop:12, padding:"12px 0", borderTop:"1px solid var(--border)" }}>
              {profile.bio}
            </div>
          )}

          {/* ── ACTION BUTTONS ── */}
          {!isOwn && currentUser && (
            <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
              <Btn onClick={()=>setShowMessageModal(true)} full>💬 Message</Btn>
              <Btn variant="teal" onClick={()=>setShowHireModal(true)} full>🤝 Hire Now</Btn>
              <Btn variant="ghost" onClick={()=>setShowRecommendModal(true)}>✍️ Recommend</Btn>
            </div>
          )}
          {!isOwn && !currentUser && (
            <div style={{ marginTop:14, background:"var(--bg2)", borderRadius:10, padding:"12px 14px", fontSize:13, color:"var(--text2)", textAlign:"center" }}>
              <a href="#" style={{ color:ORANGE, fontWeight:700 }}>Sign in</a> to message or hire this worker
            </div>
          )}
          {isOwn && (
            <div style={{ marginTop:14 }}>
              <EditProfileSection profile={profile} onUpdate={p=>setProfile(prev=>({...prev,...p}))}/>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:12 }}>
        {[
          { n:profile.portfolio?.length||0, l:"Portfolio" },
          { n:profile.workHistory?.length||0, l:"Experience" },
          { n:profile.certifications?.length||0, l:"Certificates" },
          { n:profile.recommendations?.length||0, l:"Reviews" },
        ].map(s=>(
          <div key={s.l} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontWeight:800, fontSize:20, color:"var(--text)" }}>{s.n}</div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", gap:0, background:"var(--bg3)", borderRadius:10, padding:4, marginBottom:16 }}>
        {[["portfolio","📸 Portfolio"],["experience","💼 Experience"],["certs","🏅 Certificates"],["reviews","⭐ Reviews"]].map(([id,l])=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            style={{ flex:1, padding:"8px 4px", borderRadius:7, border:"none", background:activeTab===id?"var(--card)":"transparent", color:activeTab===id?"var(--text)":"var(--text2)", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:FONT, transition:"all .15s" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── PORTFOLIO ── */}
      {activeTab==="portfolio" && (
        <div>
          {isOwn && <PortfolioUploader userId={userId} onAdd={p=>setProfile(prev=>({...prev,portfolio:[p,...prev.portfolio]}))}/>}
          {profile.portfolio?.length > 0 ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
              {profile.portfolio.map(p=>(
                <div key={p.id} style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", background:"var(--bg3)" }}>
                  <img src={p.image_url} alt={p.caption} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  {p.caption && (
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,.7))", padding:"20px 8px 8px" }}>
                      <div style={{ fontSize:11, color:"#fff", fontWeight:500 }}>{p.caption}</div>
                    </div>
                  )}
                  {isOwn && (
                    <button onClick={async()=>{ await deletePortfolioPhoto(p.id); setProfile(prev=>({...prev,portfolio:prev.portfolio.filter(x=>x.id!==p.id)})); }}
                      style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,.6)", border:"none", borderRadius:"50%", width:24, height:24, color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  )}
                </div>
              ))}
            </div>
          ) : <EmptyState icon="📸" text="No portfolio photos yet" sub={isOwn?"Add photos of your work to attract employers":""}/>}
        </div>
      )}

      {/* ── EXPERIENCE ── */}
      {activeTab==="experience" && (
        <div>
          {isOwn && <AddWorkHistoryForm userId={userId} onAdd={e=>setProfile(prev=>({...prev,workHistory:[e,...prev.workHistory]}))}/>}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {profile.workHistory?.length ? profile.workHistory.map(w=>(
              <div key={w.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{w.title}</div>
                    <div style={{ fontSize:13, color:ORANGE, fontWeight:600, marginTop:2 }}>{w.company}</div>
                    <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{w.start_date} → {w.current?"Present":w.end_date} {w.location&&`· ${w.location}`}</div>
                    {w.description && <div style={{ fontSize:13, color:"var(--text2)", marginTop:8, lineHeight:1.6 }}>{w.description}</div>}
                  </div>
                  {isOwn && (
                    <button onClick={async()=>{ await deleteWorkHistory(w.id); setProfile(prev=>({...prev,workHistory:prev.workHistory.filter(x=>x.id!==w.id)})); }}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:18, padding:4 }}>×</button>
                  )}
                </div>
              </div>
            )) : <EmptyState icon="💼" text="No work history yet" sub={isOwn?"Add your past jobs and experience":""}/>}
          </div>
        </div>
      )}

      {/* ── CERTIFICATIONS ── */}
      {activeTab==="certs" && (
        <div>
          {isOwn && <AddCertForm userId={userId} onAdd={c=>setProfile(prev=>({...prev,certifications:[c,...prev.certifications]}))}/>}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {profile.certifications?.length ? profile.certifications.map(c=>(
              <div key={c.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:44, height:44, background:"#FEF3C7", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🏅</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{c.name}</div>
                  <div style={{ fontSize:13, color:"var(--text2)", marginTop:2 }}>{c.issuer}</div>
                  {c.issued_date && <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Issued: {c.issued_date}</div>}
                  {c.document_url && <a href={c.document_url} target="_blank" rel="noreferrer" style={{ fontSize:12, color:ORANGE, fontWeight:600, marginTop:4, display:"block" }}>View Certificate →</a>}
                </div>
                {isOwn && (
                  <button onClick={async()=>{ await deleteCertification(c.id); setProfile(prev=>({...prev,certifications:prev.certifications.filter(x=>x.id!==c.id)})); }}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:18 }}>×</button>
                )}
              </div>
            )) : <EmptyState icon="🏅" text="No certifications yet" sub={isOwn?"Add your professional certificates":""}/>}
          </div>
        </div>
      )}

      {/* ── REVIEWS ── */}
      {activeTab==="reviews" && (
        <div>
          {profile.ratings?.length > 0 && (() => {
            const avg = (profile.ratings.reduce((s,r)=>s+r.score,0)/profile.ratings.length).toFixed(1);
            return (
              <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, marginBottom:12, display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:800, fontSize:36, color:"#F59E0B", lineHeight:1 }}>{avg}</div>
                  <Stars rating={Math.round(parseFloat(avg))}/>
                  <div style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>{profile.ratings.length} ratings</div>
                </div>
                <div style={{ flex:1 }}>
                  {[5,4,3,2,1].map(n=>{
                    const count = profile.ratings.filter(r=>r.score===n).length;
                    const pct = profile.ratings.length?(count/profile.ratings.length)*100:0;
                    return (
                      <div key={n} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:11, color:"var(--text3)", width:8 }}>{n}</span>
                        <div style={{ flex:1, height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:"#F59E0B", borderRadius:3 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {profile.recommendations?.length ? profile.recommendations.map(r=>(
              <div key={r.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>
                      {(r.recommender_name||"U").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>{r.recommender_name}</div>
                      <div style={{ fontSize:12, color:"var(--text3)" }}>{r.recommender_role}</div>
                    </div>
                  </div>
                  <Stars rating={r.rating}/>
                </div>
                <div style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, fontStyle:"italic" }}>"{r.text}"</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:8 }}>{new Date(r.created_at).toLocaleDateString('en-UG',{day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
            )) : <EmptyState icon="⭐" text="No reviews yet" sub={isOwn?"Complete jobs to earn reviews":""}/>}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showMessageModal && profile && currentUser && (
        <MessageModal worker={profile} currentUser={currentUser} onClose={()=>setShowMessageModal(false)} isHire={false}/>
      )}
      {showHireModal && profile && currentUser && (
        <MessageModal worker={profile} currentUser={currentUser} onClose={()=>setShowHireModal(false)} isHire={true}/>
      )}
      {showRecommendModal && (
        <Modal title="Write a Recommendation" onClose={()=>setShowRecommendModal(false)}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text2)", marginBottom:8 }}>Your rating</div>
            <div style={{ display:"flex", gap:8 }}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setRecRating(n)}
                  style={{ fontSize:28, background:"none", border:"none", cursor:"pointer", opacity:n<=recRating?1:0.25, transition:"opacity .15s" }}>★</button>
              ))}
            </div>
          </div>
          <Input label="Your recommendation" placeholder={`Share your experience working with ${profile.name}...`} value={recText} onChange={e=>setRecText(e.target.value)} multiline rows={4}/>
          <Btn onClick={submitRecommendation} full disabled={submittingRec||!recText.trim()}>{submittingRec?"Submitting...":"Submit Recommendation"}</Btn>
        </Modal>
      )}
    </div>
  );
}

// ── EDIT PROFILE ──────────────────────────────────────────────────────────────

function EditProfileSection({ profile, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bio:profile.bio||"", location:profile.location||"", phone:profile.phone||"", skills:(profile.skills||[]).join(", ") });
  const [saving, setSaving] = useState(false);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const save = async()=>{
    setSaving(true);
    try {
      const skillsArray = form.skills?form.skills.split(",").map(s=>s.trim()).filter(Boolean):[];
      const updated = await updateProfile(profile.id, { bio:form.bio, location:form.location, phone:form.phone, skills:skillsArray });
      await recalculateTasqScore(profile.id);
      onUpdate(updated);
      setOpen(false);
    } catch(e){ console.error(e); }
    finally{ setSaving(false); }
  };

  return (
    <>
      <Btn variant="ghost" onClick={()=>setOpen(true)} size="sm">✏️ Edit Profile</Btn>
      {open && (
        <Modal title="Edit Your Profile" onClose={()=>setOpen(false)}>
          <Input label="Bio / About me" placeholder="Tell employers about yourself and your experience..." value={form.bio} onChange={e=>set("bio",e.target.value)} multiline rows={4}/>
          <Input label="Location in Kampala" placeholder="e.g. Nakawa, Kampala" value={form.location} onChange={e=>set("location",e.target.value)}/>
          <Input label="Phone number" placeholder="e.g. 0701234567" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
          <Input label="Skills (comma separated)" placeholder="e.g. Plumbing, Pipe fitting, Welding" value={form.skills} onChange={e=>set("skills",e.target.value)}/>
          <Btn onClick={save} full disabled={saving}>{saving?"Saving...":"Save Changes"}</Btn>
        </Modal>
      )}
    </>
  );
}

// ── AVATAR UPLOADER ───────────────────────────────────────────────────────────

function AvatarUploader({ userId, onUpload }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const handle = async(e)=>{
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file, `avatars/${userId}`); await updateProfile(userId,{avatar_url:url}); onUpload(url); }
    catch(err){ console.error(err); } finally{ setUploading(false); }
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display:"none" }}/>
      <button onClick={()=>ref.current?.click()}
        style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:ORANGE, border:"2px solid var(--card)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12, color:"#fff" }}>
        {uploading?"⏳":"📷"}
      </button>
    </>
  );
}

// ── COVER UPLOADER ────────────────────────────────────────────────────────────

function CoverUploader({ userId, onUpload }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const handle = async(e)=>{
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file, `covers/${userId}`); await updateProfile(userId,{cover_url:url}); onUpload(url); }
    catch(err){ console.error(err); } finally{ setUploading(false); }
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display:"none" }}/>
      <button onClick={()=>ref.current?.click()}
        style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,.5)", border:"none", borderRadius:8, padding:"5px 10px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:FONT, fontWeight:600 }}>
        {uploading?"Uploading...":"📷 Change cover"}
      </button>
    </>
  );
}

// ── PORTFOLIO UPLOADER ────────────────────────────────────────────────────────

function PortfolioUploader({ userId, onAdd }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const selectFile = (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const upload = async()=>{
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `portfolio/${userId}`);
      const photo = await addPortfolioPhoto(userId, url, caption, "");
      onAdd(photo);
      setPreview(null); setFile(null); setCaption("");
      await recalculateTasqScore(userId);
    } catch(err){ console.error(err); }
    finally{ setUploading(false); }
  };

  return (
    <div style={{ background:"var(--card)", border:"1px dashed var(--border)", borderRadius:12, padding:16, marginBottom:16 }}>
      <input ref={ref} type="file" accept="image/*" onChange={selectFile} style={{ display:"none" }}/>
      {preview ? (
        <>
          <img src={preview} style={{ width:"100%", height:180, objectFit:"cover", borderRadius:10, marginBottom:10 }}/>
          <Input placeholder="Caption (e.g. Completed plumbing job in Nakawa)" value={caption} onChange={e=>setCaption(e.target.value)}/>
          <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={upload} full disabled={uploading}>{uploading?"Uploading...":"Add to Portfolio"}</Btn>
            <Btn variant="ghost" onClick={()=>{ setPreview(null); setFile(null); }}>Cancel</Btn>
          </div>
        </>
      ) : (
        <div onClick={()=>ref.current?.click()} style={{ textAlign:"center", cursor:"pointer", padding:"10px 0" }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📸</div>
          <div style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>Add portfolio photo</div>
          <div style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>Show your best work to attract employers</div>
        </div>
      )}
    </div>
  );
}

// ── ADD WORK HISTORY ──────────────────────────────────────────────────────────

function AddWorkHistoryForm({ userId, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:"", company:"", location:"", start_date:"", end_date:"", current:false, description:"" });
  const [saving, setSaving] = useState(false);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const save = async()=>{
    if (!form.title) return;
    setSaving(true);
    try { const e = await addWorkHistory(userId, form); onAdd(e); setOpen(false); setForm({ title:"", company:"", location:"", start_date:"", end_date:"", current:false, description:"" }); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  return (
    <>
      <Btn variant="ghost" onClick={()=>setOpen(true)} size="sm" style={{ marginBottom:12 }}>+ Add Experience</Btn>
      {open && (
        <Modal title="Add Work Experience" onClose={()=>setOpen(false)}>
          <Input label="Job Title *" placeholder="e.g. Senior Plumber" value={form.title} onChange={e=>set("title",e.target.value)}/>
          <Input label="Company / Employer" placeholder="e.g. ABC Construction" value={form.company} onChange={e=>set("company",e.target.value)}/>
          <Input label="Location" placeholder="e.g. Kampala" value={form.location} onChange={e=>set("location",e.target.value)}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Start date" placeholder="e.g. Jan 2022" value={form.start_date} onChange={e=>set("start_date",e.target.value)}/>
            <Input label="End date" placeholder="e.g. Dec 2023" value={form.end_date} onChange={e=>set("end_date",e.target.value)}/>
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, cursor:"pointer" }}>
            <input type="checkbox" checked={form.current} onChange={e=>set("current",e.target.checked)} style={{ accentColor:ORANGE }}/>
            <span style={{ fontSize:13, color:"var(--text2)" }}>I currently work here</span>
          </label>
          <Input label="Description" placeholder="Describe what you did..." value={form.description} onChange={e=>set("description",e.target.value)} multiline rows={3}/>
          <Btn onClick={save} full disabled={saving||!form.title}>{saving?"Saving...":"Add Experience"}</Btn>
        </Modal>
      )}
    </>
  );
}

// ── ADD CERTIFICATION ─────────────────────────────────────────────────────────

function AddCertForm({ userId, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", issuer:"", issued_date:"" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const save = async()=>{
    if (!form.name) return;
    setSaving(true);
    try {
      let doc_url = null;
      if (file) doc_url = await uploadImage(file, `certs/${userId}`);
      const cert = await addCertification(userId, { ...form, document_url:doc_url });
      onAdd(cert);
      await recalculateTasqScore(userId);
      setOpen(false); setForm({ name:"", issuer:"", issued_date:"" }); setFile(null);
    } catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  return (
    <>
      <Btn variant="ghost" onClick={()=>setOpen(true)} size="sm" style={{ marginBottom:12 }}>+ Add Certificate</Btn>
      {open && (
        <Modal title="Add Certification" onClose={()=>setOpen(false)}>
          <Input label="Certificate Name *" placeholder="e.g. Certified Electrician - Level 2" value={form.name} onChange={e=>set("name",e.target.value)}/>
          <Input label="Issued by" placeholder="e.g. Uganda Technical College" value={form.issuer} onChange={e=>set("issuer",e.target.value)}/>
          <Input label="Issue Date" placeholder="e.g. March 2023" value={form.issued_date} onChange={e=>set("issued_date",e.target.value)}/>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 }}>Upload Certificate (optional)</label>
            <input ref={ref} type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files?.[0])} style={{ display:"none" }}/>
            <div onClick={()=>ref.current?.click()} style={{ border:"1.5px dashed var(--border)", borderRadius:8, padding:"10px 14px", cursor:"pointer", fontSize:13, color:"var(--text3)", textAlign:"center" }}>
              {file?`✅ ${file.name}`:"📄 Click to upload certificate image or PDF"}
            </div>
          </div>
          <Btn onClick={save} full disabled={saving||!form.name}>{saving?"Uploading...":"Add Certificate"}</Btn>
        </Modal>
      )}
    </>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)" }}>
      <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
      <div style={{ fontWeight:600, fontSize:15, color:"var(--text2)" }}>{text}</div>
      {sub && <div style={{ fontSize:13, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default WorkerProfileView;
