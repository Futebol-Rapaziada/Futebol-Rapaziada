import { useState, useRef, useEffect } from "react";
import { getMidias, postMidia, curtirMidia } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Midia.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TAG_META = {
  gol:       { border: "#22c55e", text: "#4ade80", emoji: "⚽" },
  caneta:    { border: "#a855f7", text: "#c084fc", emoji: "🩰" },
  highlight: { border: "#f59e0b", text: "#fbbf24", emoji: "✨" },
  lance:     { border: "#38bdf8", text: "#7dd3fc", emoji: "🎯" },
  zoeira:    { border: "#f43f5e", text: "#fb7185", emoji: "😂" },
};
const TAGS = ["Todos", "gol", "caneta", "highlight", "lance", "zoeira"];
const AVATAR_COLORS = ["#22c55e","#a855f7","#f59e0b","#38bdf8","#f43f5e","#ec4899","#14b8a6","#6366f1"];

const avatarColor = (name) => {
  let h = 0;
  for (const c of (name || "?")) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};
const autorNome = (autor) => autor?.nome ?? autor ?? "?";

function tempoRelativo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)      return "agora mesmo";
  if (diff < 3600)    return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400)   return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `há ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-BR");
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK = [
  { id: 1, titulo: "Caneta humilhante no jogo!", descricao: "Aquela caneta que o Pietro deu no Zé 😂 sem volta nenhuma cara, nível outro", tag: "caneta", autor: { nome: "Pietro" }, criado_em: new Date(Date.now() - 3600 * 2 * 1000).toISOString(), curtidas: 12, visualizacoes: 87, video_url: null },
  { id: 2, titulo: "Golaço do ângulo!", descricao: "Chute de fora da área, sem chances pro goleiro 🔥", tag: "gol", autor: { nome: "Marcos" }, criado_em: new Date(Date.now() - 86400 * 1000).toISOString(), curtidas: 34, visualizacoes: 210, video_url: null },
  { id: 3, titulo: "Highlight do racha de sexta", descricao: "Os melhores momentos do racha! Que partida épica demais", tag: "highlight", autor: { nome: "Leo" }, criado_em: new Date(Date.now() - 86400 * 3 * 1000).toISOString(), curtidas: 8, visualizacoes: 55, video_url: null },
];

// ─── FieldBg ──────────────────────────────────────────────────────────────────
function FieldBg() {
  return (
    <svg className="reel-field-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <rect x="20" y="80" width="360" height="540" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
      <circle cx="200" cy="350" r="60" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
      <line x1="200" y1="80" x2="200" y2="620" stroke="#22c55e" strokeWidth="1"/>
      <rect x="20" y="230" width="80" height="240" fill="none" stroke="#22c55e" strokeWidth="1.2"/>
      <rect x="300" y="230" width="80" height="240" fill="none" stroke="#22c55e" strokeWidth="1.2"/>
      <rect x="20" y="270" width="38" height="160" fill="none" stroke="#22c55e" strokeWidth="1"/>
      <rect x="342" y="270" width="38" height="160" fill="none" stroke="#22c55e" strokeWidth="1"/>
      <circle cx="200" cy="350" r="3" fill="#22c55e" opacity="0.5"/>
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 44 }) {
  const color = avatarColor(name);
  return (
    <div className="reel-avatar"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}88)`, fontSize: size * 0.38, boxShadow: `0 0 0 2.5px #080c17, 0 0 0 4px ${color}` }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

// ─── Reel Item ────────────────────────────────────────────────────────────────
function ReelItem({ video, isActive, onLike }) {
  const nome = autorNome(video.autor);
  const tag  = TAG_META[video.tag] || TAG_META.lance;

  const [liked, setLiked]               = useState(false);
  const [localCurtidas, setLocalCurtidas] = useState(video.curtidas ?? 0);
  const [likeAnim, setLikeAnim]         = useState(false);
  const [playing, setPlaying]           = useState(false);
  const [muted, setMuted]               = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const videoRef = useRef(null);

  // Auto-play / pause
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video.video_url) return;
    if (isActive) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  }, [isActive, video.video_url]);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else          { el.play(); setPlaying(true); }
  }

  function handleLike() {
    const next = !liked;
    setLiked(next);
    setLocalCurtidas((n) => next ? n + 1 : n - 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 500);
    onLike(video.id, next);
  }

  function handleDoubleTap() {
    if (!liked) handleLike();
    else { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 500); }
  }

  const desc = video.descricao || "";
  const shortDesc = desc.length > 90 ? desc.slice(0, 90) + "…" : desc;

  return (
    <div className="reel-item">

      {/* ── Mídia ── */}
      <div className="reel-media" onDoubleClick={handleDoubleTap} onClick={togglePlay}>
        {video.video_url ? (
          <video ref={videoRef} src={video.video_url} className="reel-video" loop muted={muted} playsInline />
        ) : (
          <div className="reel-placeholder"><FieldBg /></div>
        )}

        <div className="reel-grad-bottom" />
        <div className="reel-grad-top" />

        {/* Play / Pause overlay */}
        {!playing && (
          <div className="reel-play-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        )}

        {likeAnim && <div className="reel-like-burst">🔥</div>}
      </div>

      {/* ── Ações (lado direito) ── */}
      <div className="reel-actions">
        {/* Avatar */}
        <div className="reel-action-avatar-wrap">
          <Avatar name={nome} size={48} />
        </div>

        {/* Like */}
        <button className={`reel-action-btn${liked ? " liked" : ""}`} onClick={handleLike} aria-label="Curtir">
          <span className={`reel-fire${likeAnim ? " pop" : ""}${liked ? " on" : ""}`}>🔥</span>
          <span className="reel-action-num">{localCurtidas}</span>
        </button>

        {/* Views */}
        <div className="reel-action-btn">
          <span style={{ fontSize: 26 }}>👁</span>
          <span className="reel-action-num">{video.visualizacoes ?? 0}</span>
        </div>

        {/* Mute */}
        {video.video_url && (
          <button className="reel-action-btn" onClick={(e) => { e.stopPropagation(); videoRef.current.muted = !muted; setMuted((m) => !m); }} aria-label="Som">
            <span style={{ fontSize: 24 }}>{muted ? "🔇" : "🔊"}</span>
          </button>
        )}

        {/* Tag */}
        <div className="reel-action-btn">
          <span className="reel-tag-bubble" style={{ color: tag.text, background: `${tag.border}22`, border: `1.5px solid ${tag.border}` }}>
            {tag.emoji}
          </span>
          <span className="reel-action-num" style={{ color: tag.text, fontSize: 10, textTransform: "uppercase" }}>{video.tag}</span>
        </div>
      </div>

      {/* ── Info inferior ── */}
      <div className="reel-info">
        <div className="reel-info-autor">
          <Avatar name={nome} size={36} />
          <div className="reel-autor-col">
            <span className="reel-autor-nome">{nome}</span>
            <span className="reel-autor-tempo">{tempoRelativo(video.criado_em)}</span>
          </div>
        </div>
        <h3 className="reel-titulo">{video.titulo}</h3>
        {desc && (
          <p className="reel-desc" onClick={() => setDescExpanded((e) => !e)}>
            {descExpanded ? desc : shortDesc}
            {desc.length > 90 && (
              <span className="reel-mais"> {descExpanded ? "menos" : "mais"}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ titulo: "", descricao: "", tag: "gol", arquivo: null });
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  function setFile(f) { if (f?.type?.startsWith("video/")) setForm((p) => ({ ...p, arquivo: f })); }
  const canSubmit = form.titulo.trim() && form.arquivo && !loading;

  return (
    <div className="reel-overlay" onClick={onClose}>
      <div className="reel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reel-modal-header">
          <span className="reel-modal-title">📹 NOVO CLIPE</span>
          <button className="reel-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className={`reel-dropzone${drag ? " drag" : ""}${form.arquivo ? " has" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}>
          <input ref={fileRef} type="file" accept="video/*" style={{ display:"none" }} onChange={(e) => setFile(e.target.files[0])} />
          <span style={{ fontSize:30 }}>🎬</span>
          {form.arquivo
            ? <span style={{ color:"#22c55e", fontSize:13, fontWeight:600 }}>✅ {form.arquivo.name}</span>
            : <><span style={{ color:"#94a3b8", fontSize:13 }}>Arraste ou clique para selecionar</span><span style={{ color:"#475569", fontSize:11 }}>MP4, MOV, AVI — máx 500MB</span></>
          }
        </div>

        <label className="reel-label">Título *</label>
        <input className="reel-input" placeholder="Ex: Caneta do século 😂" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} />

        <label className="reel-label">Descrição</label>
        <textarea className="reel-input reel-textarea" placeholder="Conta o que rolou..." rows={3} value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} />

        <label className="reel-label">Categoria *</label>
        <div className="reel-tag-row">
          {["gol","caneta","highlight","lance","zoeira"].map((t) => {
            const c = TAG_META[t];
            return (
              <button key={t} className={`reel-tag-pick${form.tag === t ? " active" : ""}`}
                style={form.tag === t ? { borderColor:c.border, color:c.text, background:`${c.border}22` } : {}}
                onClick={() => setForm((p) => ({ ...p, tag: t }))}>
                {c.emoji} {t}
              </button>
            );
          })}
        </div>

        <button className="reel-submit-btn" disabled={!canSubmit} onClick={() => onSubmit(form)}>
          {loading ? "⏳ ENVIANDO..." : "🚀 POSTAR CLIPE"}
        </button>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
const Midias = () => {
  const [videos, setVideos]           = useState([]);
  const [filtroTag, setFiltroTag]     = useState("Todos");
  const [showUpload, setShowUpload]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showTags, setShowTags]       = useState(false);
  const feedRef = useRef(null);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await getMidias({ tag: filtroTag });
        setVideos(data?.videos ?? data ?? []);
      } catch { setVideos(MOCK); }
    }
    carregar();
  }, [filtroTag]);

  // IntersectionObserver — detecta reel ativo
  useEffect(() => {
    const items = feedRef.current?.querySelectorAll(".reel-item-wrapper");
    if (!items?.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveIndex(Number(e.target.dataset.index));
        });
      },
      { threshold: 0.55 }
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [videos]);

  async function handleLike(id, liked) {
    setVideos((vs) => vs.map((v) => v.id === id ? { ...v, curtidas: liked ? (v.curtidas ?? 0) + 1 : (v.curtidas ?? 0) - 1 } : v));
    try { await curtirMidia(id); } catch {}
  }

  async function handleUpload(form) {
    setLoading(true);
    try {
      const novo = await postMidia(form);
      setVideos((vs) => [novo, ...vs]);
      setShowUpload(false);
    } catch {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setVideos((vs) => [{
        id: Date.now(), titulo: form.titulo, descricao: form.descricao, tag: form.tag,
        autor: { nome: user.nome ?? "Você" }, criado_em: new Date().toISOString(),
        curtidas: 0, visualizacoes: 0, video_url: URL.createObjectURL(form.arquivo),
      }, ...vs]);
      setShowUpload(false);
    } finally { setLoading(false); }
  }

  const filtrados = videos.filter((v) => filtroTag === "Todos" || v.tag === filtroTag);

  return (
    <Layout>
      <div className="reel-container">

        {/* ── Top Bar ── */}
        <div className="reel-topbar">
          <span className="reel-logo">⚽ Clipes</span>
          <div className="reel-topbar-right">
            <button className="reel-icon-btn" onClick={() => setShowTags((s) => !s)} title="Filtrar por categoria">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
            </button>
            <button className="reel-post-btn" onClick={() => setShowUpload(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Postar
            </button>
          </div>
        </div>

        {/* ── Tags filtro ── */}
        {showTags && (
          <div className="reel-tags-bar">
            {TAGS.map((t) => {
              const c = TAG_META[t];
              const active = filtroTag === t;
              return (
                <button key={t}
                  className={`reel-tag-filter-btn${active ? " active" : ""}`}
                  style={active && c ? { borderColor:c.border, color:c.text, background:`${c.border}22` } : {}}
                  onClick={() => { setFiltroTag(t); setShowTags(false); setActiveIndex(0); }}>
                  {c ? `${c.emoji} ${t}` : t}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Feed ── */}
        <div className="reel-feed" ref={feedRef}>
          {filtrados.length === 0 ? (
            <div className="reel-empty">
              <span>🎬</span>
              <p>Nenhum clipe ainda.<br/>Seja o primeiro a postar!</p>
            </div>
          ) : (
            filtrados.map((v, i) => (
              <div key={v.id} className="reel-item-wrapper" data-index={String(i)}>
                <ReelItem video={v} isActive={i === activeIndex} onLike={handleLike} />
              </div>
            ))
          )}
        </div>

        {/* ── Dots de posição ── */}
        {filtrados.length > 1 && (
          <div className="reel-dots">
            {filtrados.map((_, i) => (
              <div key={i} className={`reel-dot${i === activeIndex ? " active" : ""}`} />
            ))}
          </div>
        )}

        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSubmit={handleUpload} loading={loading} />}
      </div>
    </Layout>
  );
};

export default Midias;