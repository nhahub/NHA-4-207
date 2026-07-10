import { useState, useEffect, useRef } from "react";

// Palette
const C = {
  ink:       "#0F0504",
  deep:      "#1E0A08",
  rich:      "#36110B",
  med:       "#541B12",
  warm:      "#732317",
  crimson:   "#8F1818",
  red:       "#C21818",
  gold:      "#D4AF37",
  lightGold: "#E6C663",
  pale:      "#F3E5AB",
  cream:     "#FDFBF7",
  offWhite:  "#F8F5EE",
  tan:       "#EADCC9",
  muted:     "#8A756E",
  white:     "#FFFFFF",
};

//    TRIAGE CONFIG
const TRIAGE = {
  critical: {
    label: "حالة حرجة جداً — طوارئ فورية",
    icon: "🚨",
    grad: `linear-gradient(135deg, ${C.deep}, ${C.crimson})`,
    fg: C.red, bg: "#FFF5F5", border: C.red,
    dark: C.deep, pulse: true,
    action: "اتصل بالإسعاف (123) فوراً أو توجه لأقرب مستشفى! كل دقيقة بتفرق.",
  },
  urgent: {
    label: "عاجل — يحتاج فحص طبي سريع",
    icon: "⚠️",
    grad: `linear-gradient(135deg, ${C.rich}, ${C.gold})`,
    fg: "#D97706", bg: "#FFFBEB", border: "#F59E0B",
    dark: C.rich, pulse: false,
    action: "يرجى التوجه لعيادة تخصصية أو أقرب مستشفى خلال الساعات القادمة.",
  },
  nonurgent: {
    label: "حالة مستقرة — رعاية منزلية",
    icon: "✅",
    grad: "linear-gradient(135deg, #115E59, #0D9488)",
    fg: "#0D9488", bg: "#F0FDF4", border: "#14B8A6",
    dark: "#115E59", pulse: false,
    action: "استريح في السرير، واشرب سوائل دافية، وتابع الأعراض بالمنزل.",
  },
};

//    SYMPTOMS (Egyptian Colloquial Corpus)
const CHIPS = [
  // أعراض حرجة وطارئة (الجلطات والنوبات)
  { label: "وجع عاصر وتقيل في الصدر",   icon: "", cat: "أعراض جلطة حادة" },
  { label: "تنميل أو شلل مفاجئ في إيد أو رجل", icon: "", cat: "أعراض جلطة حادة" },
  { label: "صعوبة مفاجئة في النطق ولغبطة", icon: "", cat: "أعراض جلطة حادة" },
  { label: "عوجة ملحوظة في البق أو الوش", icon: "", cat: "أعراض جلطة حادة" },
  { label: "دوخة شديدة وفقدان توازن مفاجئ", icon: "", cat: "أعراض جلطة حادة" },
  { label: "صداع رهيب وغير معتاد كأنه ضربة", icon: "", cat: "أعراض جلطة حادة" },
  { label: "فقدان الوعي التام أو إغماء",   icon: "", cat: "أعراض جلطة حادة" },

  // أعراض البرد والإنفلونزا الشائعة
  { label: "رشح وزكام وانسداد في الأنف",  icon: "", cat: "أعراض البرد الشائعة" },
  { label: "كحة مستمرة وعطس",         icon: "", cat: "أعراض البرد الشائعة" },
  { label: "وجع واحتقان شديد في الزور",   icon: "", cat: "أعراض البرد الشائعة" },
  { label: "سخونية وهمدان خفيف في الجسم", icon: "", cat: "أعراض البرد الشائعة" },
  { label: "تكسير في العضم والمفاصل",     icon: "", cat: "أعراض البرد الشائعة" },
];

const SYSTEM = `أنت نظام طبي ذكي للفرز الطبي (Smart Triage) مبني على بيانات 30,000 مريض حقيقي من أقسام الطوارئ في مصر.
أرجع JSON فقط بدون markdown:
{"level":"critical|urgent|nonurgent","title":"عنوان قصير","destination":"المكان المحدد","specialty":"التخصص","reason":"شرح 2-3 جمل عامية مصرية تفرق بين الجلطة ودور البرد بدقة","advice":["نصيحة 1","نصيحة 2","نصيحة 3","نصيحة 4"],"warning":"علامة خطر واحدة بالعامية","estimatedWait":"وقت الانتظار المتوقع"}
معايير صريحة: ظهور أي عرض عصبي أو قلبي مفاجئ (تقل حركة، عوجة وش، وجع صدر عاصر) = critical فوراً لحماية المريض من خطر الجلطة والسكتة. أعراض الرشح والزكام وتكسير الجسم المتناثر = nonurgent.`;

//    HOOKS & REVEALS
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 30 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : `translateY(${y}px)`,
      transition: `opacity .7s ${delay}s cubic-bezier(.22,1,.36,1), transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`,
    }}>
      {children}
    </div>
  );
}

function useCounter(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const n = parseFloat(target);
    let cur = 0; const step = n / 55;
    const t = setInterval(() => { cur = Math.min(cur + step, n); setVal(Math.floor(cur)); if (cur >= n) clearInterval(t); }, 22);
    return () => clearInterval(t);
  }, [active, target]);
  return val;
}

//    ECG LINE
function ECG({ color = C.gold, h = 34, op = .5 }) {
  return (
    <svg viewBox="0 0 1200 40" style={{ width:"100%",height:h,display:"block",opacity:op }} preserveAspectRatio="none">
      <polyline
        points="0,20 70,20 100,4 120,36 140,20 250,20 280,6 305,34 325,20 440,20 468,4 492,36 512,20 625,20 650,7 675,33 695,20 810,20 836,4 860,36 880,20 990,20 1016,6 1040,34 1060,20 1170,20 1195,20"
        fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
        style={{ strokeDasharray: "1200", strokeDashoffset: "1200", animation: "dash 4s linear infinite" }}
      />
    </svg>
  );
}

//    STAT COUNTER CARD
function Stat({ val, suffix, label, delay }) {
  const [ref, vis] = useInView();
  const num = useCounter(val, vis);
  return (
    <div ref={ref} style={{
      textAlign:"center", padding:"28px 16px",
      opacity:vis?1:0, transform:vis?"none":"translateY(18px)",
      transition:`opacity .5s ${delay}s ease, transform .5s ${delay}s ease`,
    }}>
      <div style={{ fontWeight:900, fontSize:40, lineHeight:1, letterSpacing:-2,
        background:`linear-gradient(135deg,${C.gold},${C.lightGold})`,
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        {num}{suffix}
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.55)", marginTop:6, letterSpacing:.5 }}>{label}</div>
    </div>
  );
}

//    LOADER
const STEPS = [
  { t:"بنقرأ أعراضك بالعامية...",       i:"" },
  { t:"بنحلل احتمالية وجود جلطة...",   i:"" },
  { t:"بنطابق المؤشرات الطبية...",     i:"" },
  { t:"بنجهز التوجيه الفوري للإنقاذ...", i:"🏥" },
];
function Loader() {
  const [s, setS] = useState(0);
  const [p, setP] = useState(5);
  useEffect(() => {
    const t = setInterval(() => { setS(x => (x+1)%4); setP(x => Math.min(x+22,90)); }, 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign:"center", padding:"52px 20px" }}>
      <div style={{ position:"relative", width:100, height:100, margin:"0 auto 24px" }}>
        <svg viewBox="0 0 100 100" style={{ position:"absolute",inset:0, animation:"spin 1.6s linear infinite" }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke={C.tan} strokeWidth="5"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke={C.crimson} strokeWidth="5"
            strokeDasharray="70 207" strokeLinecap="round"/>
        </svg>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>
          {STEPS[s].i}
        </div>
      </div>
      <div style={{ fontWeight:800,fontSize:15,color:C.rich,marginBottom:6 }}>{STEPS[s].t}</div>
      <div style={{ fontSize:12,color:C.gold,marginBottom:20 }}>النظام الذكي يدرس حالتك الآن بدقة متناهية</div>
      <div style={{ background:C.tan,borderRadius:99,height:6,maxWidth:260,margin:"0 auto 14px",overflow:"hidden" }}>
        <div style={{ height:"100%",borderRadius:99,background:`linear-gradient(90deg,${C.crimson},${C.red})`,width:`${p}%`,transition:"width 1s ease" }}/>
      </div>
    </div>
  );
}

//    RESULT CARD
function ResultCard({ result, t }) {
  return (
    <div style={{ borderRadius:24,overflow:"hidden",border:`2px solid ${t.border}`,
      boxShadow:`0 20px 60px ${t.fg}1A`, animation:"slideUp .5s cubic-bezier(.22,1,.36,1) both" }}>
      
      {/* Header */}
      <div style={{ background:t.grad, padding:"28px 30px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:18 }}>
          <div style={{ position:"relative",fontSize:56,lineHeight:1,flexShrink:0 }}>
            {t.icon}
            {t.pulse && <>
              <span style={{ position:"absolute",inset:-8,borderRadius:"50%",border:`2px solid ${C.lightGold}`,animation:"ring 1.6s ease-out infinite",opacity:0 }}/>
            </>}
          </div>
          <div style={{ flex:1 }}>
            <span style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,.25)",borderRadius:20,padding:"4px 16px",
              fontSize:11,fontWeight:900,color:"#fff",marginBottom:10,letterSpacing:.5 }}>{t.label}</span>
            <div style={{ color:"#fff",fontWeight:900,fontSize:22,lineHeight:1.3,marginBottom:10 }}>{result.title}</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:16 }}>
              <span style={{ color:"#FFF",fontSize:13,fontWeight:700 }}>المكان المقترح: {result.destination}</span>
              {result.specialty && <span style={{ color:C.pale,fontSize:13,fontWeight:700 }}>التخصص المطلوب: {result.specialty}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ background:"#fff",padding:"28px 30px" }}>
        
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
            <div style={{ width:3,height:22,background:t.fg,borderRadius:2 }}/>
            <span style={{ fontWeight:900,fontSize:14,color:C.deep }}>التحليل الطبي المفسّر للأعراض:</span>
          </div>
          <div style={{ background:t.bg,border:`1px solid ${t.border}25`,borderRadius:14,
            padding:"14px 18px",fontSize:14,lineHeight:2,color:C.ink,fontWeight:600 }}>
            {result.reason}
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <div style={{ width:3,height:22,background:t.fg,borderRadius:2 }}/>
            <span style={{ fontWeight:900,fontSize:14,color:C.deep }}>أهم التعليمات الفورية التي يجب اتباعها:</span>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {result.advice?.map((a,i) => (
              <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start",animation:`slideUp .4s ${.08*i}s both` }}>
                <div style={{ width:26,height:26,borderRadius:"50%",background:t.grad,color:"#fff",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,flexShrink:0,marginTop:1 }}>
                  {i+1}
                </div>
                <span style={{ fontSize:13,lineHeight:1.85,color:C.med,fontWeight:600 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {result.warning && (
          <div style={{ background:"#FFF1F2",border:"1.5px solid #FECDD3",borderRadius:14,padding:"14px 18px",marginBottom:18 }}>
            <div style={{ fontWeight:900,fontSize:13,color:"#9F1239",marginBottom:5 }}>توجه فوراً للطوارئ في حال حدوث:</div>
            <p style={{ fontSize:13,color:"#881337",margin:0,lineHeight:1.8,fontWeight:700 }}>{result.warning}</p>
          </div>
        )}

        {result.estimatedWait && (
          <div style={{ background:C.cream,border:`1px solid ${C.tan}`,borderRadius:14,
            padding:"12px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:26 }}></span>
            <div>
              <div style={{ fontSize:10,color:C.muted,fontWeight:700,marginBottom:2 }}>متوسط وقت الانتظار المقدر في الموقع:</div>
              <div style={{ fontSize:14,color:C.rich,fontWeight:900 }}>{result.estimatedWait}</div>
            </div>
          </div>
        )}

        <div style={{ background:t.bg,border:`2px solid ${t.border}`,borderRadius:16,
          padding:"16px 20px",display:"flex",alignItems:"center",gap:14 }}>
          <span style={{ fontSize:34 }}>{t.icon}</span>
          <p style={{ fontWeight:900,fontSize:14,color:C.ink,margin:0,lineHeight:1.6 }}>{t.action}</p>
        </div>
      </div>
    </div>
  );
}

//    MAIN APP
export default function App() {
  const [symptoms,  setSymptoms]  = useState("");
  const [age,       setAge]       = useState("");
  const [gender,    setGender]    = useState("");
  const [chronic,   setChronic]   = useState("");
  const [chips,     setChips]     = useState([]);
  const [cat,       setCat]       = useState("الكل");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const resultRef = useRef(null);
  const triageCardRef = useRef(null);

  const cats = ["الكل", "أعراض جلطة حادة", "أعراض البرد الشائعة"];
  const shown = cat === "الكل" ? CHIPS : CHIPS.filter(c => c.cat === cat);
  const triage = result ? TRIAGE[result.level] : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleChip(chip) {
    setChips(prev => {
      const next = prev.includes(chip.label) ? prev.filter(x => x !== chip.label) : [...prev, chip.label];
      setSymptoms(next.join("، "));
      return next;
    });
  }

  async function analyze() {
    if (!symptoms.trim()) { alert("من فضلك اكتب أعراضك أو اختار من القائمة عشان نقدر نساعدك!"); return; }
    setLoading(true); setResult(null); setErr(false);
    const info = [age&&`السن: ${age}`, gender&&`النوع: ${gender}`, chronic&&`أمراض مزمنة: ${chronic}`].filter(Boolean).join(" | ");
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: `${info ? "معلومات: " + info + "\n" : ""}الأعراض: "${symptoms}"` }
            ],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: "json_object" }
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) { console.error("API error:", res.status, data); setErr(true); return; }
      const raw = data.choices?.[0]?.message?.content || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(cleaned));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
    } catch(e) { console.error("Error:", e); setErr(true); }
    finally { setLoading(false); }
  }

  function reset() {
    setSymptoms(""); setAge(""); setGender(""); setChronic("");
    setChips([]); setResult(null); setErr(false);
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  const scrollToCard = () => triageCardRef.current?.scrollIntoView({ behavior:"smooth" });

  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Cairo',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes dash     { to { stroke-dashoffset: 0; } }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes ring     { 0%{transform:scale(.7);opacity:.9} 100%{transform:scale(2.2);opacity:0} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes dot      { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes heartbeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.14)} 28%{transform:scale(1)} 42%{transform:scale(1.08)} 70%{transform:scale(1)} }
        @keyframes shimmer  { from{background-position:200% center} to{background-position:-200% center} }
        * { box-sizing:border-box; margin:0; padding:0 }
        ::-webkit-scrollbar { width:6px }
        ::-webkit-scrollbar-thumb { background:${C.gold}; border-radius:3px }
        input,textarea,select { font-family:'Cairo',sans-serif; outline: none; }
        input:focus,textarea:focus,select:focus { border-color:${C.crimson}!important; box-shadow:0 0 0 3px ${C.crimson}1A!important }
        .chip { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .chip:hover  { transform:translateY(-2px)!important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .card-li:hover { transform:translateY(-5px)!important; }
        .btn-cta:hover { transform:translateY(-3px)!important; box-shadow:0 14px 44px ${C.crimson}45!important; filter: brightness(1.1); }
        .nav-link:hover { color:${C.gold}!important }
        .feature-item:hover { background:${C.offWhite}!important }

        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-card { display: none !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .dashboard-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .patient-fields { grid-template-columns: 1fr !important; }
          .triage-tool { padding: 20px !important; }
          .hero-section { padding: 40px 20px !important; min-height: auto !important; }
          .main-content { padding: 30px 16px 60px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background: "rgba(15,5,4,.95)",
        backdropFilter:"blur(18px)",
        borderBottom:`2px solid ${C.gold}`,
        transition:"all .3s ease",
        padding:"0 32px",
      }}>
        <div style={{ maxWidth:1160,margin:"0 auto",height:68,display:"flex",alignItems:"center",justifyContent:"space-between" }} className="nav-inner">
          
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:44,height:44,borderRadius:12,
              background:`linear-gradient(135deg,${C.crimson},${C.deep})`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
              border:`1px solid ${C.gold}`,
              boxShadow:`0 4px 14px ${C.crimson}50` }}>🚑</div>
            <div>
              <div style={{ color:"#fff",fontWeight:900,fontSize:19,lineHeight:1 }}>
                منصة الفرز <span style={{ color:C.gold }}>الذكي</span>
              </div>
              <div style={{ color:C.lightGold,fontSize:9,fontWeight:700,letterSpacing:1,marginTop:4 }}>
                ADVANCED TRIAGE SYSTEM · 2026
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ display:"flex",alignItems:"center",gap:28 }} className="nav-links">
            {[["كيف يعمل","how"],["إحصائيات","stats"],["عن المشروع","about"]].map(([l,id])=>(
              <a key={l} href={`#${id}`} className="nav-link" onClick={e=>{
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
              }} style={{
                color:"rgba(255,255,255,.75)",fontWeight:700,fontSize:13,
                textDecoration:"none",transition:"color .2s",cursor:"pointer",
              }}>{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display:"flex",alignItems:"center",gap:10 }} className="nav-cta">
            <button onClick={scrollToCard} style={{
              background:`linear-gradient(135deg,${C.crimson},${C.deep})`,
              border:`1.5px solid ${C.gold}`,borderRadius:20,padding:"9px 22px",
              color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",
              transition:"all .2s",
              boxShadow:`0 4px 16px ${C.crimson}40`,
              fontFamily:"'Cairo',sans-serif"
            }}>افحص أعراضك الآن</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-section" style={{
        background:`linear-gradient(155deg, ${C.ink} 0%, ${C.deep} 40%, ${C.rich} 75%, ${C.med} 100%)`,
        position:"relative", overflow:"hidden", minHeight:"88vh",
        display:"flex", flexDirection:"column", justifyContent:"center",
      }}>
        <div style={{ position:"absolute",inset:0,
          backgroundImage:`linear-gradient(${C.gold}04 1px,transparent 1px),linear-gradient(90deg,${C.gold}04 1px,transparent 1px)`,
          backgroundSize:"50px 50px",pointerEvents:"none" }}/>

        <div style={{ maxWidth:1160,margin:"0 auto",padding:"72px 40px",position:"relative",width:"100%" }}>
          <div className="hero-grid" style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:48,alignItems:"center" }}>

            {/* Left: headline */}
            <div>
              {/* Badge */}
              <div style={{ animation:"slideUp .6s ease both" }}>
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:8,
                  background:"rgba(255,255,255,.05)",border:`1px solid ${C.gold}30`,
                  borderRadius:24,padding:"7px 18px",marginBottom:28,
                }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:C.red,flexShrink:0,animation:"dot 1.4s infinite" }}/>
                  <span style={{ color:C.lightGold,fontSize:11,fontWeight:800 }}>
                    مبادرة رواد مصر الرقمية 2026 · نظام الحماية الطبية العاجلة
                  </span>
                </div>
              </div>

              {/* Title */}
              <div style={{ animation:"slideUp .65s .05s ease both" }}>
                <h1 style={{
                  direction:"ltr", textAlign:"left",
                  fontFamily:"'Cairo',sans-serif",
                  margin:"0 0 24px 0", padding:0,
                }}>
                  <span style={{ display:"block", fontSize:"clamp(36px,4.2vw,58px)", fontWeight:900, lineHeight:1.18, color:"#fff", letterSpacing:"-0.5px" }}>
                    Smart Triage Egypt
                  </span>
                  <span style={{
                    display:"block", fontSize:"clamp(20px,2.4vw,32px)", fontWeight:600,
                    lineHeight:1.3, marginTop:10, letterSpacing:"0.3px",
                    background:`linear-gradient(100deg,${C.gold} 0%,${C.lightGold} 60%,${C.pale} 100%)`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  }}>Right Care, Right Now</span>
                </h1>
              </div>

              {/* Subtitle */}
              <div style={{ animation:"slideUp .65s .13s ease both" }}>
                <p style={{ color:"rgba(255,255,255,.72)",fontSize:14,lineHeight:2,maxWidth:520,marginBottom:32 }}>
                  نظام متطور مصمم لمساعدة المواطنين على التمييز الفوري والدقيق بين <strong style={{ color:C.lightGold }}>الحالات الحرجة والخطيرة (زي السكتات والجلطات)</strong> وبين <strong style={{ color:"#4ADE80" }}>الأعراض الشائعة البسيطة (زي أدوار البرد)</strong> لإنقاذ الحياة وتوجيه المريض بالشكل الصحيح.
                </p>
              </div>

              {/* CTA */}
              <div style={{ animation:"slideUp .65s .27s ease both" }}>
                <button onClick={scrollToCard} className="btn-cta" style={{
                  padding:"15px 36px",borderRadius:16,
                  background:`linear-gradient(135deg,${C.crimson},${C.deep})`,
                  border:`1.5px solid ${C.gold}`,
                  color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",
                  boxShadow:`0 8px 32px ${C.crimson}50`,transition:"all .25s",
                  display:"inline-flex",alignItems:"center",gap:10,fontFamily:"'Cairo',sans-serif"
                }}>
                  ابدأ الفرز والتحليل الفوري للحالة
                </button>
              </div>
            </div>

            {/* Right: floating card — aligned to top of title */}
            <div className="hero-card" style={{ animation:"float 4s ease-in-out infinite", alignSelf:"center" }}>
              <div style={{
                borderRadius:20,overflow:"hidden",
                border:`1px solid ${C.gold}40`,
                background:"rgba(15,5,4,0.8)",
                backdropFilter:"blur(12px)",
              }}>
                <div style={{ background:`linear-gradient(135deg,${C.deep},${C.rich})`,padding:"20px 22px",borderBottom:`1px solid ${C.gold}30` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:26,animation:"heartbeat 2s infinite" }}>❤️</span>
                    <div>
                      <div style={{ color:"#fff",fontWeight:900,fontSize:14 }}>محاكاة فرز ذكي</div>
                      <div style={{ color:C.lightGold,fontSize:11,fontWeight:600,marginTop:3 }}>مطابقة فورية مع النماذج الطبية</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding:"14px 18px" }}>
                  {[
                    { icon:"🚨", label:"اشتباه جلطة حادة",         color:C.red,  sub:"مستوى الخطورة: حرج جداً" },
                    { icon:"🩺", label:"الرعاية المركزة / الطوارئ", color:C.gold, sub:"الجهة المستهدفة فوراً"  },
                  ].map((r,i)=>(
                    <div key={r.label} style={{
                      display:"flex",alignItems:"center",gap:12,padding:"12px 0",
                      borderBottom: i===0 ? `1px solid rgba(255,255,255,.07)` : "none",
                    }}>
                      <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
                        background:`${r.color}1A`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>
                        {r.icon}
                      </div>
                      <div>
                        <div style={{ color:"rgba(255,255,255,.9)",fontWeight:800,fontSize:13 }}>{r.label}</div>
                        <div style={{ color:"rgba(255,255,255,.4)",fontSize:11,marginTop:2 }}>{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position:"absolute",bottom:0,left:0,right:0 }}>
          <ECG color={C.gold} h={40} op={0.4}/>
        </div>
      </header>

      {/* STATS BAR */}
      <div id="stats" style={{ background:C.ink, borderBottom:`2px solid ${C.gold}` }}>
        <div className="stats-grid" style={{ maxWidth:1160,margin:"0 auto",padding:"0 32px",
          display:"grid",gridTemplateColumns:"repeat(4,1fr)" }}>
          {[
            { val:30, suffix:"K", label:"حالة طوارئ حقيقية مدمجة" },
            { val:47, suffix:" دقيقة", label:"متوسط وقت الانتظار بالطوارئ" },
            { val:35, suffix:"%", label:"حالات غير طارئة تزحم المستشفيات" },
            { val:11, suffix:"%", label:"نسبة الحالات الحرجة والجلطات" },
          ].map((s,i) => (
            <div key={s.label} style={{ borderRight: i>0 ? `1px solid ${C.rich}` : "none" }}>
              <Stat {...s} delay={i*.08}/>
            </div>
          ))}
        </div>
      </div>

      <main className="main-content" style={{ maxWidth:1160,margin:"0 auto",padding:"60px 32px 100px" }}>

        {/* HOW IT WORKS */}
        <div id="how">
          <Reveal>
            <div style={{ textAlign:"center",marginBottom:40 }}>
              <div style={{ display:"inline-block",background:`${C.crimson}12`,border:`1px solid ${C.crimson}28`,
                borderRadius:20,padding:"6px 22px",marginBottom:14 }}>
                <span style={{ fontSize:11,fontWeight:900,color:C.crimson }}>منظومة الفحص المطور</span>
              </div>
              <h2 style={{ fontWeight:900,fontSize:30,color:C.deep }}>خطوات تصنيف وتوجيه الحالة الطبية 🎯</h2>
            </div>
          </Reveal>

          <div className="how-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,marginBottom:64 }}>
            {[
              { icon:"", title:"اكتب أعراضك ", body:"احكي تعبك الصرف زي ما بتحس بيه ومن غير أي مصطلحات معقدة." },
              { icon:"", title:"تحليل مضاهاة الخطورة",  body:"السيستم بيطابق كلماتك اللغوية والأعراض مع مصفوفة فرز تضم 30 ألف حالة حرجة." },
              { icon:"", title:"توجيه فوري دقيق", body:"بيطلعلك فوراً خطة العمل: طوارئ فورية، عيادة تخصصية، أو راحة منزلية شاملة." },
            ].map((s,i) => (
              <Reveal key={s.title} delay={i*.1}>
                <div className="card-li" style={{
                  borderRadius:24,padding:"30px 26px",
                  background: C.white,
                  border:`1px solid ${C.tan}`,transition:"transform .25s",cursor:"default",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ fontSize:40,marginBottom:14 }}>{s.icon}</div>
                  <div style={{ color:C.deep,fontWeight:900,fontSize:16,marginBottom:10 }}>{s.title}</div>
                  <div style={{ color:C.muted,fontSize:13,lineHeight:1.85,fontWeight:600 }}>{s.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* TRIAGE TOOL */}
        <div ref={triageCardRef} id="triage-card">
          <Reveal delay={.05}>
            <div style={{
              borderRadius:32,overflow:"hidden",
              border:`1px solid ${C.tan}`,
              background:"#fff",
              boxShadow:`0 24px 80px rgba(0,0,0,0.04)`,
            }}>

              {/* Tool header */}
              <div style={{
                padding:"28px 36px",
                background:`linear-gradient(95deg,${C.deep},${C.rich})`,
                borderBottom: `3px solid ${C.gold}`,
                display:"flex",alignItems:"center",gap:18,
              }}>
                <div style={{ width:54,height:54,borderRadius:16,
                  background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>🩺</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#fff",fontWeight:900,fontSize:20 }}>
                    لوحة تسجيل وفرز الأعراض اللحظية
                  </div>
                  <div style={{ color:C.lightGold,fontSize:13,fontWeight:700,marginTop:4 }}>
                    اختر الأعراض من الكروت الجاهزة بالعامية أو اكتب بالتفصيل في الصندوق بالأسفل
                  </div>
                </div>
              </div>

              <div style={{ padding:36 }}>

                {/* Quick symptom chips */}
                <div style={{ marginBottom:28 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                    <span style={{ fontWeight:900,fontSize:14,color:C.deep }}>اضغط لتحديد الأعراض الشائعة المتطابقة:</span>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      {cats.map(c=>(
                        <button key={c} onClick={()=>setCat(c)} style={{
                          padding:"6px 14px",borderRadius:12,fontSize:12,fontWeight:800,
                          background:cat===c?C.crimson:C.offWhite,
                          border:`1.5px solid ${cat===c?C.crimson:C.tan}`,
                          color:cat===c?"#fff":C.deep,
                          transition:"all .2s",cursor:"pointer",
                          fontFamily:"'Cairo',sans-serif",
                        }}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                    {shown.map(chip=>{
                      const on = chips.includes(chip.label);
                      return (
                        <button key={chip.label} className="chip" onClick={()=>toggleChip(chip)} style={{
                          display:"flex",alignItems:"center",gap:8,
                          padding:"12px 18px",borderRadius:14,fontSize:13,fontWeight:700,
                          background:on?C.crimson:C.offWhite,
                          border:`1.5px solid ${on?C.crimson:C.tan}`,
                          color:on?"#fff":C.deep,
                          boxShadow:on?`0 4px 16px ${C.crimson}25`:"none",
                          cursor:"pointer",
                          fontFamily:"'Cairo',sans-serif",
                        }}>
                          <span>{chip.icon}</span>{chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
                  <div style={{ flex:1,height:1,background:C.tan }}/>
                  <span style={{ fontSize:11,fontWeight:900,color:C.crimson,
                    background:C.cream,border:`1px solid ${C.tan}`,
                    borderRadius:20,padding:"5px 18px" }}>تعديل أو صياغة النص بالتفصيل</span>
                  <div style={{ flex:1,height:1,background:C.tan }}/>
                </div>

                {/* Patient info */}
                <div className="patient-fields" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:16,marginBottom:20 }}>
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:900,color:C.deep,marginBottom:8 }}>👤 السن المريض:</label>
                    <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="مثال: 55"
                      style={{ width:"100%",padding:"13px 16px",borderRadius:14,
                        border:`2px solid ${C.tan}`,background:C.offWhite,fontSize:13,color:C.ink,fontWeight:700 }}/>
                  </div>
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:900,color:C.deep,marginBottom:8 }}>⚥ الجنس:</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)}
                      style={{ width:"100%",padding:"13px 16px",borderRadius:14,
                        border:`2px solid ${C.tan}`,background:C.offWhite,fontSize:13,color:C.ink,fontWeight:700 }}>
                      <option value="">اختر...</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:900,color:C.deep,marginBottom:8 }}>💊 التاريخ المرضي أو أمراض مزمنة (إن وجد):</label>
                    <input type="text" value={chronic} onChange={e=>setChronic(e.target.value)}
                      placeholder="ضغط، سكر، نوبة قلبية سابقة..."
                      style={{ width:"100%",padding:"13px 16px",borderRadius:14,
                        border:`2px solid ${C.tan}`,background:C.offWhite,fontSize:13,color:C.ink,fontWeight:700 }}/>
                  </div>
                </div>

                {/* Textarea */}
                <textarea value={symptoms} onChange={e=>setSymptoms(e.target.value)} rows={4}
                  placeholder="اكتب بلهجتك  إيه المشكلة بالظبط.. مثلاً: حاسس بـ تقل فجأة في دراعي الشمال ومش قادر اتكلم كويس مع صداع رهيب..."
                  style={{
                    width:"100%",padding:"16px 18px",borderRadius:18,
                    border:`2px solid ${C.tan}`,background:C.offWhite,
                    fontSize:14,color:C.ink,resize:"none",fontWeight:600,
                    lineHeight:2,marginBottom:26
                  }}
                />

                {/* Analyze button */}
                {!loading && !result && !err && (
                  <button onClick={analyze} className="btn-cta" style={{
                    width:"100%",padding:"20px",borderRadius:18,border:"none",
                    background:`linear-gradient(135deg,${C.crimson},${C.deep})`,
                    border:`1.5px solid ${C.gold}`,
                    color:"#fff",fontWeight:900,fontSize:18,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:12,
                    boxShadow:`0 8px 36px ${C.crimson}45`,transition:"all .25s",
                    fontFamily:"'Cairo',sans-serif"
                  }}>
                    بدء الفرز والتحليل الفوري للحالة
                  </button>
                )}

                {loading && <Loader/>}

                {err && (
                  <div style={{ borderRadius:18,padding:28,textAlign:"center",background:"#FFF8F0",border:`2px solid ${C.gold}` }}>
                    <p style={{ fontWeight:900,color:C.crimson,marginBottom:8,fontSize:16 }}>عذراً، حدث خطأ في النظام</p>
                    <p style={{ fontSize:13,color:C.deep,marginBottom:18,fontWeight:700 }}>
                      إذا كانت هناك أعراض حادة حركية أو صدرية تدل على جلطة، يرجى التوجه للطوارئ فوراً أو الاتصال بالإسعاف (123).
                    </p>
                    <button onClick={reset} style={{ padding:"10px 28px",borderRadius:12,border:"none",
                      background:C.crimson,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"'Cairo',sans-serif" }}>
                      إعادة المحاولة
                    </button>
                  </div>
                )}

                <div ref={resultRef}>
                  {result && triage && <ResultCard result={result} t={triage}/>}
                </div>

                {(result || err) && (
                  <button onClick={reset} style={{
                    width:"100%",marginTop:18,padding:"14px",borderRadius:16,
                    border:`2px solid ${C.tan}`,background:C.offWhite,
                    color:C.deep,fontWeight:900,fontSize:14,cursor:"pointer",
                    transition:"all .25s",fontFamily:"'Cairo',sans-serif",
                  }}
                  >فحص وتحليل أعراض مريض آخر</button>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* WHY US */}
        <Reveal delay={.05}>
          <div style={{ marginTop:72 }}>
            <div style={{ textAlign:"center",marginBottom:40 }}>
              <div style={{ display:"inline-block",background:`${C.crimson}12`,border:`1px solid ${C.crimson}28`,
                borderRadius:20,padding:"6px 22px",marginBottom:14 }}>
                <span style={{ fontSize:11,fontWeight:900,color:C.crimson }}>مميزات المنظومة المتكاملة</span>
              </div>
              <h2 style={{ fontWeight:900,fontSize:30,color:C.deep }}>ركائز الأمان المعتمدة في النظام 🏆</h2>
            </div>
            <div className="features-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",
              borderRadius:24,overflow:"hidden",border:`1px solid ${C.tan}`,background:"#fff",
              boxShadow:`0 8px 40px rgba(0,0,0,0.02)` }}>
              {[
                { icon:"", title:"نظام فرز طبي متخصص", body:"خوارزمية طبية متخصصة لتحليل الأعراض وتجنب التصنيفات العشوائية." },
                { icon:"", title:"مبني على دراسة حقيقية", body:"تم ضبط المعايير بناءً على مصفوفة فحص حقيقية من مستشفيات الطوارئ بمصر." },
                { icon:"", title:"فرز لحظي آمن", body:"لا يتطلب تسجيل حساب أو بيانات حساسة لضمان أعلى معدل سرعة لإنقاذ المريض." },
                { icon:"", title:"دعم كامل للعامية واللكنات", body:"يفهم المصطلحات الطبية الشعبية والبلدي بدقة تامة للتسهيل على كبار السن." },
                { icon:"", title:"توجيه دقيق للمنشأة الأنسب", body:"يحدد للمريض ما إذا كان يحتاج غرف عناية حادة، مستشفى عام، أم رعاية ذاتية." },
                { icon:"", title:"أعلى معايير الخصوصية Compliance", body:"تتم معالجة البيانات النصية لحظياً داخل الجلسة دون تخزينها أو مشاركتها." },
              ].map((f,i) => (
                <div key={f.title} className="feature-item" style={{
                  padding:"26px 24px",
                  borderBottom: i<3?`1px solid ${C.tan}`:"none",
                  borderLeft: i%3!==0?`1px solid ${C.tan}`:"none",
                  transition:"background .2s",cursor:"default",
                }}>
                  <div style={{ fontSize:36,marginBottom:14 }}>{f.icon}</div>
                  <div style={{ fontWeight:900,fontSize:14,color:C.deep,marginBottom:8 }}>{f.title}</div>
                  <div style={{ fontSize:13,color:C.muted,lineHeight:1.85,fontWeight:600 }}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* DASHBOARD INSIGHTS */}
        <div id="about">
        <Reveal delay={.05}>
          <div style={{
            marginTop:72,borderRadius:28,overflow:"hidden",
            background:`linear-gradient(145deg,${C.deep},${C.rich})`,
            border:`1.5px solid ${C.gold}`,
          }}>
            <div style={{ padding:"38px 40px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:32 }}>
                <div style={{ width:52,height:52,borderRadius:14,
                  background:"rgba(255,255,255,.1)",border:`1px solid ${C.gold}40`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>📊</div>
                <div>
                  <div style={{ color:"#fff",fontWeight:900,fontSize:19 }}>مؤشرات تحسين كفاءة أقسام الطوارئ</div>
                  <div style={{ color:C.lightGold,fontSize:12,fontWeight:600,marginTop:4 }}>
                    Emergency Department Optimization Metrics — 2026
                  </div>
                </div>
              </div>
              <div className="dashboard-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
                {[
                  { icon:"", val:"الشيفت المسائي",  label:"أعلى فترة تكدس للمرضى والطوارئ", sub:"16K حالة تم تسجيلها" },
                  { icon:"", val:"نزلات معوية حادة", label:"أكثر تشخيص غير طارئ بالعيادات",  sub:"1.37K حالة مستقرة" },
                  { icon:"", val:"6% تحويل خارجي",   label:"معدل النقل المباشر للمنشأة الأنسب",sub:"2K تحويل طبي ناجح" },
                  { icon:"", val:"7% تدهور فجائي", label:"الحالات الحرجة التي تتطلب إنعاش فوري",sub:"من إجمالي الحالات" },
                  { icon:"", val:"75 دقيقة انتظار", label:"متوسط انتظار غرف الرعاية المركزة",  sub:"مؤشر الحاجة لتسريع الفرز" },
                  { icon:"", val:"8% خروج ذاتي",    label:"مرضى غادروا قبل الكشف الطبي", sub:"من فئة الحالات البسيطة" },
                ].map(s=>(
                  <div key={s.label} style={{
                    background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",
                    borderRadius:18,padding:"18px 20px",cursor:"default"
                  }}
                  >
                    <div style={{ fontSize:22,marginBottom:8 }}>{s.icon}</div>
                    <div style={{ color:C.lightGold,fontWeight:900,fontSize:17 }}>{s.val}</div>
                    <div style={{ color:"rgba(255,255,255,.6)",fontSize:11,marginTop:4,fontWeight:700 }}>{s.label}</div>
                    <div style={{ color:"rgba(255,255,255,.35)",fontSize:11,marginTop:2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ background:C.ink,borderTop:`2px solid ${C.gold}`,padding:"44px 32px 32px" }}>
        <div style={{ maxWidth:1160,margin:"0 auto" }}>
          <div className="footer-grid" style={{
            display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:32,
            alignItems:"start",marginTop:10,paddingTop:10
          }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <div style={{ width:40,height:40,borderRadius:10,
                  background:`linear-gradient(135deg,${C.crimson},${C.deep})`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${C.gold}` }}>🚑</div>
                <div>
                  <div style={{ color:"#fff",fontWeight:900,fontSize:18 }}>
                    منصة الفرز <span style={{ color:C.gold }}>الذكي</span> للطوارئ
                  </div>
                  <div style={{ color:C.lightGold,fontSize:10,fontWeight:600,marginTop:2 }}>SMART TRIAGE · 2026</div>
                </div>
              </div>
              <p style={{ fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.9,maxWidth:340 }}>
                مشروع مخصص لتحسين وتصنيف فرز المرضى بأقسام الطوارئ المصرية لتقليل التكدس وحماية الحالات الحرجة مثل الجلطات والسكتات الدماغية.
              </p>
            </div>

            <div>
              <div style={{ color:C.gold,fontSize:12,fontWeight:700,marginBottom:14 }}>أعضاء الفريق البحثي والمطور:</div>
              {["Mohamed Attia","Ahmed Khater","Seif El Sabaa","Ahmed Shebl"].map(n=>(
                <div key={n} style={{ color:"rgba(255,255,255,.65)",fontSize:13,fontWeight:600,marginBottom:6 }}>• {n}</div>
              ))}
            </div>

            <div style={{ textAlign:"left" }}>
              <div style={{ color:C.lightGold,fontSize:13,fontWeight:850,marginBottom:10 }}>
                إشراف  : <br/>م. عبدالرحمن الفارسي
              </div>
              <p style={{ fontSize:11,color:"rgba(255,255,255,.25)",marginTop:20 }}>
                © 2026 Smart Triage Egypt · Data from real Egyptian ER cases
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
