import { useState, useRef, useEffect } from "react";
import { getMidias, postMidia, curtirMidia } from "../services/api";
import Layout from "../components/layout/Layout";
import "../style/Midia.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TAG_META = {
  gol:       { border: "#22c55e", text: "#4ade80" },
  caneta:    { border: "#a855f7", text: "#c084fc" },
  highlight: { border: "#f59e0b", text: "#fbbf24" },
  lance:     { border: "#38bdf8", text: "#7dd3fc" },
  zoeira:    { border: "#f43f5e", text: "#fb7185" },
};
const TAGS = ["Todos", "gol", "caneta", "highlight", "lance", "zoeira"];
const AVATAR_COLORS = ["#22c55e","#a855f7","#f59e0b","#38bdf8","#f43f5e","#ec4899","#14b8a6","#6366f1"];
const avatarColor = (name) => {
  let h = 0; for (const c of (name || "?")) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

// ─── Mock (fallback enquanto o back não está pronto) ──────────────────────────
const MOCK = [
  { id: 1, titulo: "Caneta humilhante no jogo!", descricao: "Aquela caneta que o Pietro deu no Zé 😂", tag: "caneta",    autor: "Pietro", data: "26/04/2026", curtidas: 12, visualizacoes: 87 },
  { id: 2, titulo: "Golaço do ângulo!",           descricao: "Chute de fora da área, sem chances 🔥",    tag: "gol",       autor: "Marcos", data: "24/04/2026", curtidas: 34, visualizacoes: 210 },
  { id: 3, titulo: "Highlight do racha de sexta", descricao: "Os melhores momentos do racha!",           tag: "highlight", autor: "Leo",    data: "22/04/2026", curtidas: 8,  visualizacoes: 55 },
];

// ─── Helpers de autor ─────────────────────────────────────────────────────────
const autorNome = (autor) => autor?.nome ?? autor ?? "?";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Avatar({ name, size = 30 }) {
  return (
    <div className="midia-avatar" style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.42 }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function TagBadge({ tag }) {
  const c = TAG_META[tag] || TAG_META.lance;
  return <span className="midia-tag" style={{ borderColor: c.border, color: c.text }}>{tag}</span>;
}

function Thumbnail({ video, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className={`midia-thumb${hov ? " hov" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <svg className="midia-field-svg" viewBox="0 0 320 180" preserveAspectRatio="none">
        <rect x="20" y="20" width="280" height="140" fill="none" stroke="#22c55e" strokeWidth="2"/>
        <circle cx="160" cy="90" r="30" fill="none" stroke="#22c55e" strokeWidth="2"/>
        <line x1="160" y1="20" x2="160" y2="160" stroke="#22c55e" strokeWidth="1.5"/>
        <rect x="20" y="55" width="40" height="60" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
        <rect x="260" y="55" width="40" height="60" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
      </svg>
      <div className={`midia-play-circle${hov ? " hov" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={hov ? "#0a0e1a" : "#22c55e"}>
          <polygon points="5,3 19,12 5,21"/>
        </svg>
      </div>
      <div className="midia-views-badge">👁 {video.visualizacoes ?? 0}</div>
    </div>
  );
}

function VideoCard({ video, onOpen, onLike }) {
  const [liked, setLiked] = useState(false);
  function handleLike(e) {
    e.stopPropagation();
    setLiked((l) => !l);
    onLike(video.id, !liked);
  }
  const nome = autorNome(video.autor);
  return (
    <div className="midia-card">
      <Thumbnail video={video} onClick={() => onOpen(video)} />
      <div className="midia-card-body">
        <TagBadge tag={video.tag} />
        <h3 className="midia-card-title" onClick={() => onOpen(video)}>{video.titulo}</h3>
        <p className="midia-card-desc">{video.descricao}</p>
        <div className="midia-card-footer">
          <div className="midia-card-autor">
            <Avatar name={nome} />
            <div>
              <div className="midia-autor-nome">{nome}</div>
              <div className="midia-autor-data">{video.data ?? video.criado_em?.slice(0,10)}</div>
            </div>
          </div>
          <button className={`midia-like-btn${liked ? " liked" : ""}`} onClick={handleLike}>
            🔥 {liked ? (video.curtidas ?? 0) + 1 : (video.curtidas ?? 0)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Upload ──────────────────────────────────────────────────────────
function UploadModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ titulo: "", descricao: "", tag: "gol", arquivo: null });
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  function setFile(file) {
    if (file?.type?.startsWith("video/")) setForm((f) => ({ ...f, arquivo: file }));
  }

  const canSubmit = form.titulo.trim() && form.arquivo && !loading;

  return (
    <div className="midia-overlay" onClick={onClose}>
      <div className="midia-modal" onClick={(e) => e.stopPropagation()}>
        <div className="midia-modal-header">
          <span className="midia-modal-title">📹 NOVO CLIPE</span>
          <button className="midia-modal-close" onClick={onClose}>✕</button>
        </div>

        <div
          className={`midia-dropzone${drag ? " drag" : ""}${form.arquivo ? " has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])} />
          <span className="midia-drop-icon">🎬</span>
          {form.arquivo
            ? <span className="midia-drop-ok">✅ {form.arquivo.name}</span>
            : <>
                <span className="midia-drop-label">Arraste o vídeo ou clique para selecionar</span>
                <span className="midia-drop-hint">MP4, MOV, AVI — máx 500MB</span>
              </>
          }
        </div>

        <label className="midia-label">Título *</label>
        <input className="midia-input" placeholder="Ex: Caneta do século 😂"
          value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />

        <label className="midia-label">Descrição</label>
        <textarea className="midia-input midia-textarea" placeholder="Conta o que rolou..." rows={3}
          value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />

        <label className="midia-label">Categoria *</label>
        <div className="midia-tag-row">
          {["gol","caneta","highlight","lance","zoeira"].map((t) => {
            const c = TAG_META[t];
            return (
              <button key={t}
                className={`midia-tag-pick${form.tag === t ? " active" : ""}`}
                style={form.tag === t ? { borderColor: c.border, color: c.text, background: `${c.border}22` } : {}}
                onClick={() => setForm((f) => ({ ...f, tag: t }))}>
                {t}
              </button>
            );
          })}
        </div>

        <button className="midia-submit-btn" disabled={!canSubmit} onClick={() => onSubmit(form)}>
          {loading ? "⏳ ENVIANDO..." : "🚀 POSTAR CLIPE"}
        </button>
      </div>
    </div>
  );
}

// ─── Modal de Visualização ────────────────────────────────────────────────────
function VideoModal({ video, onClose }) {
  if (!video) return null;
  const nome = autorNome(video.autor);
  return (
    <div className="midia-overlay" onClick={onClose}>
      <div className="midia-modal midia-modal-video" onClick={(e) => e.stopPropagation()}>
        <div className="midia-player">
          {video.video_url
            ? <video src={video.video_url} controls autoPlay style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain" }} />
            : (
              <div className="midia-player-placeholder">
                <svg className="midia-field-svg" viewBox="0 0 780 438" preserveAspectRatio="none">
                  <rect x="30" y="30" width="720" height="378" fill="none" stroke="#22c55e" strokeWidth="3"/>
                  <circle cx="390" cy="219" r="80" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
                  <line x1="390" y1="30" x2="390" y2="408" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="30" y="130" width="100" height="180" fill="none" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="650" y="130" width="100" height="180" fill="none" stroke="#22c55e" strokeWidth="2"/>
                </svg>
                <span style={{ fontSize:38, position:"relative", zIndex:1 }}>🎬</span>
                <span style={{ color:"#475569", fontSize:13, position:"relative", zIndex:1 }}>Vídeo disponível após integração com API</span>
              </div>
            )
          }
        </div>
        <div className="midia-modal-info">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div>
              <TagBadge tag={video.tag} />
              <h2 className="midia-modal-video-title">{video.titulo}</h2>
            </div>
            <button className="midia-modal-close" onClick={onClose}>✕</button>
          </div>
          <p className="midia-modal-desc">{video.descricao}</p>
          <div className="midia-card-autor" style={{ marginTop:14 }}>
            <Avatar name={nome} size={34} />
            <div>
              <div className="midia-autor-nome">{nome}</div>
              <div className="midia-autor-data">{video.data ?? video.criado_em?.slice(0,10)} · {video.visualizacoes ?? 0} views</div>
            </div>
            <div style={{ marginLeft:"auto", color:"#f59e0b", fontWeight:700 }}>
              🔥 {video.curtidas ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
const Midias = () => {
  const [videos, setVideos]           = useState([]);
  const [filtroTag, setFiltroTag]     = useState("Todos");
  const [busca, setBusca]             = useState("");
  const [ordenar, setOrdenar]         = useState("recente");
  const [showUpload, setShowUpload]   = useState(false);
  const [videoAberto, setVideoAberto] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [erro, setErro]               = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await getMidias({ tag: filtroTag, busca, ordem: ordenar });
        setVideos(data?.videos ?? data ?? []);
        setErro(null);
      } catch (err) {
        console.warn("API indisponível, usando mock:", err.message);
        setVideos(MOCK);
      }
    }
    carregar();
  }, [filtroTag, busca, ordenar]);

  async function handleLike(id, liked) {
    setVideos((vs) =>
      vs.map((v) => v.id === id ? { ...v, curtidas: liked ? (v.curtidas ?? 0) + 1 : (v.curtidas ?? 0) - 1 } : v)
    );
    try {
      await curtirMidia(id);
    } catch (err) {
      console.error("Erro ao curtir:", err.message);
      setVideos((vs) =>
        vs.map((v) => v.id === id ? { ...v, curtidas: liked ? (v.curtidas ?? 0) - 1 : (v.curtidas ?? 0) + 1 } : v)
      );
    }
  }

  async function handleUpload(form) {
    setLoading(true);
    setErro(null);
    try {
      const novo = await postMidia(form);
      setVideos((vs) => [novo, ...vs]);
      setShowUpload(false);
    } catch (err) {
      console.warn("API indisponível, adicionando localmente:", err.message);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const novoLocal = {
        id: Date.now(),
        titulo:        form.titulo,
        descricao:     form.descricao,
        tag:           form.tag,
        autor:         user.nome ?? "Você",
        data:          new Date().toLocaleDateString("pt-BR"),
        curtidas:      0,
        visualizacoes: 0,
        video_url:     URL.createObjectURL(form.arquivo),
      };
      setVideos((vs) => [novoLocal, ...vs]);
      setShowUpload(false);
    } finally {
      setLoading(false);
    }
  }

  const filtrados = videos
    .filter((v) => filtroTag === "Todos" || v.tag === filtroTag)
    .filter((v) => !busca || v.titulo?.toLowerCase().includes(busca.toLowerCase()) || autorNome(v.autor).toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (ordenar === "curtidas") return (b.curtidas ?? 0) - (a.curtidas ?? 0);
      if (ordenar === "views")    return (b.visualizacoes ?? 0) - (a.visualizacoes ?? 0);
      return b.id - a.id;
    });

  return (
    <Layout>
    <div className="midias-container">
      <div className="midias-header">
        <div>
          <h2 className="midias-title">🎬 Clipes da Rapaziada</h2>
          <p className="midias-subtitle">{videos.length} vídeos · temporada 2026</p>
        </div>
        <button className="midias-post-btn" onClick={() => setShowUpload(true)}>
          + Postar Clipe
        </button>
      </div>

      {erro && (
        <div style={{ background:"#2d1a1a", border:"1px solid #f43f5e44", borderRadius:8, padding:"10px 16px", marginBottom:20, color:"#fb7185", fontSize:13 }}>
          ⚠️ {erro}
        </div>
      )}

      <div className="midias-filtros">
        <div className="midias-search-wrap">
          <span className="midias-search-icon">🔍</span>
          <input className="midias-search" placeholder="Buscar clipe ou jogador..."
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="midias-tags">
          {TAGS.map((t) => {
            const c = TAG_META[t];
            const active = filtroTag === t;
            return (
              <button key={t}
                className={`midia-tag-filter${active ? " active" : ""}`}
                style={active && c ? { borderColor: c.border, color: c.text, background:`${c.border}22` } : {}}
                onClick={() => setFiltroTag(t)}>
                {t}
              </button>
            );
          })}
        </div>
        <div className="midias-order">
          {[{k:"recente",l:"Recente"},{k:"curtidas",l:"🔥 Mais Quentes"},{k:"views",l:"👁 Mais Vistos"}].map(({k,l}) => (
            <button key={k} className={`midias-order-btn${ordenar === k ? " active" : ""}`} onClick={() => setOrdenar(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0
        ? <div className="midias-empty"><span>🎬</span><p>Nenhum clipe encontrado.<br/>Poste o primeiro!</p></div>
        : <div className="midias-grid">{filtrados.map((v) => <VideoCard key={v.id} video={v} onOpen={setVideoAberto} onLike={handleLike} />)}</div>
      }

      {showUpload  && <UploadModal  onClose={() => setShowUpload(false)}  onSubmit={handleUpload} loading={loading} />}
      {videoAberto && <VideoModal   video={videoAberto}                   onClose={() => setVideoAberto(null)} />}
    </div>
    </Layout>
  );
};

export default Midias;