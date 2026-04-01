import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonIcon, IonButton, IonLabel, IonItem,
  IonBadge, IonChip, IonText, IonSpinner, IonModal,
  IonSearchbar, IonToast, IonHeader, IonToolbar, IonTitle, IonButtons,
} from '@ionic/react';
import {
  listOutline, checkmarkCircleOutline, checkmarkDoneOutline,
  documentTextOutline, linkOutline, downloadOutline,
  statsChartOutline, trophyOutline, ribbonOutline,
  arrowForwardOutline, closeOutline, menuOutline,
  logOutOutline, chevronBackOutline, rocketOutline, sparklesOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api, Postulante, Evaluacion, EvaluacionRequest, Resolucion, CriterioEvaluacion, Concurso } from '../../services/api';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  orange: '#E85520',
  dark: '#0d0e10',
  bg: '#f4f5f7',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
};

const BASE = import.meta.env.VITE_API_URL || 'https://api.habisite.com/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const juradoNombre = () =>
  sessionStorage.getItem('jurado_nombre') ?? localStorage.getItem('jurado_nombre') ?? 'Jurado';

const formatFecha = (f: string) =>
  new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const scoreColor = (p: number) => p >= 7 ? '#2dd36f' : p >= 5 ? C.orange : '#eb445a';

// ─── Sidebar menu ─────────────────────────────────────────────────────────────
type MenuItem = { id: string; icon: string; label: string };

const MENU: MenuItem[] = [
  { id: 'postulantes',      icon: listOutline,              label: 'Postulantes' },
  { id: 'mis-evaluaciones', icon: checkmarkCircleOutline,   label: 'Mis Evaluaciones' },
  { id: 'estadisticas',     icon: statsChartOutline,        label: 'Estadísticas' },
];

// ─── Sidebar background ──────────────────────────────────────────────────────
const SidebarBg: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, #0f1114 0%, #1a1208 50%, #0d0e10 100%)` }} />
    <div style={{ position: 'absolute', top: -40, left: -20, width: 180, height: 180, background: `${C.orange}08`, borderRadius: 999, filter: 'blur(50px)' }} />
    <div style={{ position: 'absolute', bottom: 40, right: -30, width: 120, height: 120, background: `${C.orange}06`, borderRadius: 999, filter: 'blur(40px)' }} />
    <div style={{ position: 'absolute', top: '12%', right: 10, width: 50, height: 50, border: `1px solid ${C.orange}12`, borderRadius: 6, transform: 'rotate(25deg)' }} />
    <div style={{ position: 'absolute', top: '55%', left: -10, width: 35, height: 35, border: `1px solid #ffffff08`, borderRadius: 4, transform: 'rotate(-15deg)' }} />
    <div style={{ position: 'absolute', bottom: '18%', right: 20, width: 25, height: 25, border: `1px solid ${C.orange}10`, borderRadius: 3, transform: 'rotate(40deg)' }} />
    <div style={{ position: 'absolute', top: '35%', left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, #ffffff06, transparent)` }} />
    <div style={{ position: 'absolute', top: '70%', left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, ${C.orange}08, transparent)` }} />
  </div>
);

// ─── Onboarding ───────────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'habisite_jurado_onboarding_v2';

const TOUR_STEPS = [
  { targetId: 'jnav-postulantes', sectionId: 'postulantes', icon: listOutline, title: 'Postulantes', desc: 'La lista completa de postulantes. Buscá por nombre, universidad o especialidad. Tocá una tarjeta para ver entregas y asignar puntaje del 1 al 10.', tip: 'Usá el filtro "Pendientes" para ver solo los que faltan evaluar.' },
  { targetId: 'jnav-mis-evaluaciones', sectionId: 'mis-evaluaciones', icon: checkmarkCircleOutline, title: 'Mis Evaluaciones', desc: 'Resumen de tus evaluaciones: puntaje promedio, máximo, mínimo y la lista ordenada por calificación.', tip: 'Acá podés ver tu progreso y revisar los puntajes que asignaste.' },
  { targetId: 'jnav-estadisticas', sectionId: 'estadisticas', icon: statsChartOutline, title: 'Estadísticas', desc: 'Dashboard con tu progreso, distribución de puntajes y el ranking general basado en todas las evaluaciones del jurado.', tip: 'El ranking muestra el promedio de todos los jurados, no solo tus puntajes.' },
];

interface OnboardingProps { onNavigate: (id: string) => void; onFinish: () => void; }

const OnboardingTour: React.FC<OnboardingProps> = ({ onNavigate, onFinish }) => {
  const [step, setStep] = useState(-1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (step < 0) return;
    onNavigate(TOUR_STEPS[step].sectionId);
    const timer = setTimeout(() => {
      const el = document.getElementById(TOUR_STEPS[step].targetId);
      if (el) setTargetRect(el.getBoundingClientRect());
    }, 120);
    return () => clearTimeout(timer);
  }, [step, onNavigate]);

  const finish = () => { localStorage.setItem(ONBOARDING_KEY, '1'); setVisible(false); onFinish(); };
  const goNext = () => step < TOUR_STEPS.length - 1 ? setStep(s => s + 1) : finish();

  if (!visible) return null;

  if (step === -1) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: `linear-gradient(145deg, ${C.dark} 0%, #1a1208 40%, #2a1510 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '8%', right: '10%', width: 140, height: 140, border: `1.5px solid ${C.orange}22`, borderRadius: 12, transform: 'rotate(25deg)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 100, height: 100, border: `1px solid #ffffff10`, borderRadius: 10, transform: 'rotate(40deg)' }} />
      <div style={{ position: 'absolute', top: '50%', right: '8%', width: 200, height: 200, background: `${C.orange}06`, borderRadius: 999, filter: 'blur(60px)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px', background: `linear-gradient(135deg, ${C.orange} 0%, #cc4b1c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 40px ${C.orange}44` }}>
          <IonIcon icon={rocketOutline} style={{ fontSize: '2.2rem', color: '#fff' }} />
        </div>
        <p style={{ margin: '0 0 6px', color: C.orange, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Panel de Jurado</p>
        <h1 style={{ margin: '0 0 16px', color: '#fff', fontWeight: 800, fontSize: '1.8rem', lineHeight: 1.2 }}>Bienvenido al panel</h1>
        <p style={{ margin: '0 0 40px', color: '#ffffff66', fontSize: '1rem', lineHeight: 1.65 }}>Te mostramos cómo evaluar postulantes en 3 pasos.</p>
        <button onClick={() => setStep(0)} style={{ width: '100%', padding: 16, background: C.orange, border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px ${C.orange}55` }}>
          Empezar <IonIcon icon={arrowForwardOutline} style={{ fontSize: '1.1rem' }} />
        </button>
        <button onClick={finish} style={{ width: '100%', padding: 12, background: 'transparent', border: 'none', color: '#ffffff33', fontSize: '0.85rem', cursor: 'pointer', marginTop: 8 }}>Saltar</button>
      </div>
    </div>
  );

  const current = TOUR_STEPS[step];
  const r = targetRect;
  const pad = 6;

  return (
    <>
      <svg style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }} width="100%" height="100%" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        <defs><mask id="j-mask"><rect width="100%" height="100%" fill="white" />{r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2} rx="10" fill="black" />}</mask></defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#j-mask)" />
        {r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2} rx="10" fill="none" stroke={C.orange} strokeWidth="2" strokeDasharray="6 3" />}
      </svg>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} onClick={e => e.stopPropagation()} />
      <div style={{ position: 'fixed', top: r ? Math.min(r.bottom + 16, window.innerHeight - 260) : '50%', left: r ? Math.max(r.left, 16) : '50%', transform: r ? 'none' : 'translate(-50%,-50%)', zIndex: 10000, width: 340, maxWidth: 'calc(100vw - 32px)', background: '#fff', borderRadius: 16, padding: '24px 22px 20px', boxShadow: `0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px ${C.border}`, transition: 'top 0.3s ease, left 0.3s ease' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{TOUR_STEPS.map((_, i) => <div key={i} style={{ height: 3, borderRadius: 2, flex: i === step ? 3 : 1, background: i <= step ? C.orange : '#e5e7eb', transition: 'flex 0.3s, background 0.3s' }} />)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IonIcon icon={current.icon} style={{ fontSize: '1.4rem', color: C.orange }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paso {step + 1} de {TOUR_STEPS.length}</p>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: C.text }}>{current.title}</h3>
          </div>
        </div>
        <p style={{ margin: '0 0 10px', color: '#374151', lineHeight: 1.6, fontSize: '0.92rem' }}>{current.desc}</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#fffbf5', borderRadius: 10, border: `1px solid ${C.orange}22`, marginBottom: 18 }}>
          <IonIcon icon={sparklesOutline} style={{ fontSize: '0.95rem', color: C.orange, flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>{current.tip}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: 10, background: '#f3f4f6', border: 'none', borderRadius: 10, color: C.muted, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Atrás</button>}
          <button onClick={goNext} style={{ flex: 2, padding: 10, background: C.orange, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {step === TOUR_STEPS.length - 1 ? <><IonIcon icon={checkmarkDoneOutline} style={{ fontSize: '1rem' }} /> Entendido</> : <>Siguiente <IonIcon icon={arrowForwardOutline} style={{ fontSize: '0.9rem' }} /></>}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Modal de evaluación ──────────────────────────────────────────────────────
interface ModalEvaluarProps { postulante: Postulante; numero: number; evaluacionPrevia?: Evaluacion; concursoId: number | null; onClose: () => void; onGuardado: () => void; }

const ModalEvaluar: React.FC<ModalEvaluarProps> = ({ postulante, numero, evaluacionPrevia, concursoId, onClose, onGuardado }) => {
  // Fallback single-score state (used when no criteria exist)
  const [puntaje, setPuntaje] = useState<number | null>(evaluacionPrevia?.puntaje ?? null);
  // Per-criterion scores: criterioId → puntaje
  const [puntajes, setPuntajes] = useState<Record<number, number>>({});
  const [criterios, setCriterios] = useState<CriterioEvaluacion[]>([]);
  const [loadingCriterios, setLoadingCriterios] = useState(false);
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);

  useEffect(() => { api.resoluciones.listarPorPostulante(postulante.id).then(setResoluciones).finally(() => setLoadingRes(false)); }, [postulante.id]);

  useEffect(() => {
    if (concursoId == null) return;
    setLoadingCriterios(true);
    api.criterios.listar(concursoId).then(setCriterios).catch(() => setCriterios([])).finally(() => setLoadingCriterios(false));
  }, [concursoId]);

  const usaCriterios = criterios.length > 0;

  // Weighted average: sum(score * peso) / sum(peso)
  const pesoTotal = criterios.reduce((s, c) => s + c.peso, 0);
  const puntajesPonderados = criterios.reduce((s, c) => s + (puntajes[c.id] ?? 0) * c.peso, 0);
  const promedioCalculado = pesoTotal > 0 && criterios.every(c => puntajes[c.id] != null)
    ? puntajesPonderados / pesoTotal
    : null;

  const handleGuardar = async () => {
    let finalPuntaje: number | null = null;
    if (usaCriterios) {
      if (promedioCalculado === null) { setToast({ msg: 'Asigná un puntaje a todos los criterios.', color: 'warning' }); return; }
      finalPuntaje = parseFloat(promedioCalculado.toFixed(1));
    } else {
      if (puntaje === null) { setToast({ msg: 'Seleccioná un puntaje del 1 al 10.', color: 'warning' }); return; }
      finalPuntaje = puntaje;
    }
    setLoading(true);
    const payload: EvaluacionRequest = { postulanteId: postulante.id, juradoNombre: juradoNombre(), puntaje: finalPuntaje, comentario: '' };
    try { await api.evaluaciones.crear(payload); setToast({ msg: 'Evaluación guardada.', color: 'success' }); setTimeout(onGuardado, 1200); }
    catch (err: unknown) { setToast({ msg: err instanceof Error ? err.message : 'Error', color: 'danger' }); }
    finally { setLoading(false); }
  };

  const yaTieneEval = evaluacionPrevia != null;

  return (
    <>
      <IonHeader><IonToolbar color="primary"><IonTitle style={{ fontSize: '0.95rem' }}>#{numero} — {postulante.nombres} {postulante.apellidos}</IonTitle><IonButtons slot="end"><IonButton fill="clear" color="light" onClick={onClose}>Cerrar</IonButton></IonButtons></IonToolbar></IonHeader>
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #2a1208 100%)`, padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, border: `1.5px solid ${C.orange}25`, borderRadius: 6, transform: 'rotate(20deg)' }} />
          <p style={{ margin: 0, color: '#ffffff99', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', position: 'relative', zIndex: 1 }}>{postulante.especialidad}</p>
          <h2 style={{ margin: '4px 0 2px', color: '#fff', fontWeight: 700, position: 'relative', zIndex: 1 }}>{postulante.nombres} {postulante.apellidos}</h2>
          <p style={{ margin: 0, color: '#ffffff77', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>{postulante.universidad}</p>
        </div>
        <div style={{ padding: '16px 16px' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Entregas enviadas</p>
          {loadingRes ? <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><IonSpinner name="crescent" color="primary" /></div>
           : resoluciones.length === 0 ? <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}><p style={{ margin: 0, fontSize: '0.85rem', color: C.muted }}>Este postulante aún no subió entregas.</p></div>
           : <div style={{ marginBottom: 20 }}>{resoluciones.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <IonIcon icon={documentTextOutline} style={{ color: C.orange, fontSize: '1rem' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{r.titulo}</span>
                  <IonBadge color={r.estado === 'APROBADA' ? 'success' : r.estado === 'RECHAZADA' ? 'danger' : 'warning'} style={{ marginLeft: 'auto' }}>{r.estado}</IonBadge>
                </div>
                {r.descripcion && <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: C.muted, lineHeight: 1.4 }}>{r.descripcion}</p>}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {r.tieneArchivo && <a href={`${BASE}/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: C.orange, textDecoration: 'none', fontWeight: 600 }}><IonIcon icon={downloadOutline} />{r.archivoNombre}</a>}
                  {r.urlExterno && <a href={r.urlExterno} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#3dc2ff', textDecoration: 'none', fontWeight: 600 }}><IonIcon icon={linkOutline} />Ver enlace</a>}
                </div>
              </div>
            ))}</div>}

          <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: `2px solid ${yaTieneEval ? '#2dd36f44' : C.border}` }}>
            {yaTieneEval && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 }}><IonIcon icon={checkmarkDoneOutline} style={{ color: '#2dd36f', fontSize: '1.1rem' }} /><span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>Ya evaluaste a este postulante</span></div>}
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem', color: C.text }}>{yaTieneEval ? 'Tu evaluación' : 'Asignar puntaje'}</p>

            {loadingCriterios && <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><IonSpinner name="crescent" color="primary" /></div>}

            {!loadingCriterios && usaCriterios && (
              <div style={{ marginBottom: 16 }}>
                {criterios.sort((a, b) => a.orden - b.orden).map(c => {
                  const sel = puntajes[c.id] ?? null;
                  return (
                    <div key={c.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.text }}>{c.nombre}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: C.orange, borderRadius: 6, padding: '2px 7px' }}>x{c.peso}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                          <button key={n} disabled={yaTieneEval} onClick={() => setPuntajes(prev => ({ ...prev, [c.id]: n }))}
                            style={{ width: 36, height: 36, borderRadius: 7, border: 'none', cursor: yaTieneEval ? 'default' : 'pointer', background: sel === n ? C.orange : '#f3f4f6', color: sel === n ? '#fff' : '#374151', fontWeight: sel === n ? 700 : 500, fontSize: '0.9rem', transition: 'all .15s' }}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Weighted average display */}
                <div style={{ marginTop: 8, padding: '12px 14px', background: promedioCalculado !== null ? `${C.orange}12` : '#f9fafb', borderRadius: 10, border: `1.5px solid ${promedioCalculado !== null ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.muted }}>Puntaje ponderado</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: promedioCalculado !== null ? scoreColor(promedioCalculado) : '#d1d5db', lineHeight: 1 }}>
                    {promedioCalculado !== null ? promedioCalculado.toFixed(1) : '—'}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginLeft: 2 }}>/10</span>
                  </span>
                </div>
              </div>
            )}

            {!loadingCriterios && !usaCriterios && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} disabled={yaTieneEval} onClick={() => setPuntaje(n)} style={{ width: 44, height: 44, borderRadius: 8, border: 'none', cursor: yaTieneEval ? 'default' : 'pointer', background: puntaje === n ? C.orange : '#f3f4f6', color: puntaje === n ? '#fff' : '#374151', fontWeight: puntaje === n ? 700 : 500, fontSize: '1rem', transition: 'all .15s' }}>{n}</button>
                ))}
              </div>
            )}

            {!yaTieneEval && <IonButton expand="block" onClick={handleGuardar} disabled={loading || loadingCriterios || (usaCriterios ? promedioCalculado === null : puntaje === null)} style={{ marginTop: 4, '--background': C.orange, '--border-radius': '8px' }}>{loading ? <IonSpinner name="crescent" /> : 'Guardar evaluación'}</IonButton>}
          </div>
        </div>
      </IonContent>
      <IonToast isOpen={toast !== null} onDidDismiss={() => setToast(null)} message={toast?.msg} duration={2000} color={toast?.color} position="top" />
    </>
  );
};

// ─── Sección: Postulantes ─────────────────────────────────────────────────────
const PostulantesSection: React.FC = () => {
  const nombre = juradoNombre();
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [concursoId, setConcursoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [soloSinEvaluar, setSoloSinEvaluar] = useState(false);
  const [modalPostulante, setModalPostulante] = useState<{ p: Postulante; idx: number } | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [ps, evs, concursos] = await Promise.all([api.postulantes.listar(), api.evaluaciones.listar(), api.concursos.listar()]);
      setPostulantes(ps);
      setEvaluaciones(evs);
      const activo = concursos.find((c: Concurso) => c.estado === 'ACTIVO') ?? concursos[0] ?? null;
      if (activo) setConcursoId(activo.id);
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al cargar'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const evalDeJurado = (pid: number) => evaluaciones.find(ev => ev.postulanteId === pid && ev.juradoNombre.toLowerCase() === nombre.toLowerCase());
  const filtrados = postulantes.filter(p => { const q = filtro.toLowerCase(); return p.nombres.toLowerCase().includes(q) || p.apellidos.toLowerCase().includes(q) || p.universidad.toLowerCase().includes(q) || p.especialidad.toLowerCase().includes(q); }).filter(p => !soloSinEvaluar || !evalDeJurado(p.id));
  const totalEvaluados = postulantes.filter(p => evalDeJurado(p.id)).length;
  const pendientes = postulantes.length - totalEvaluados;
  const pct = postulantes.length > 0 ? Math.round((totalEvaluados / postulantes.length) * 100) : 0;

  return (
    <>
      {!loading && postulantes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Progreso: {totalEvaluados}/{postulantes.length} evaluados</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: pct === 100 ? '#16a34a' : C.orange }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : C.orange, borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      <IonSearchbar value={filtro} onIonInput={e => setFiltro(e.detail.value ?? '')} placeholder="Buscar postulante..." style={{ '--border-radius': '10px', '--background': '#fff', margin: '0 0 8px' }} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <IonChip color={soloSinEvaluar ? 'warning' : 'medium'} onClick={() => setSoloSinEvaluar(!soloSinEvaluar)} style={{ cursor: 'pointer', fontWeight: soloSinEvaluar ? 700 : 400 }}>Pendientes ({pendientes})</IonChip>
        <IonChip color="medium" onClick={() => setSoloSinEvaluar(false)} style={{ cursor: 'pointer' }}>Todos ({postulantes.length})</IonChip>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>}
      {error && <IonText color="danger"><p>{error}</p></IonText>}

      {!loading && !error && filtrados.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: C.muted }}><p>No hay postulantes{soloSinEvaluar ? ' pendientes' : ''}.</p></div>}

      {!loading && !error && filtrados.map(p => {
        const numGlobal = postulantes.findIndex(x => x.id === p.id) + 1;
        const eval_ = evalDeJurado(p.id);
        const evaluado = eval_ != null;
        return (
          <div key={p.id} onClick={() => setModalPostulante({ p, idx: numGlobal })} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px', marginBottom: 10, cursor: 'pointer', opacity: evaluado ? 0.85 : 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: evaluado ? '#2dd36f22' : `${C.orange}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: evaluado ? '#2dd36f' : C.orange, flexShrink: 0 }}>#{numGlobal}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: C.text }}>{p.nombres} {p.apellidos}</p>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', color: C.muted }}>{p.universidad}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>{p.especialidad}</p>
            </div>
            <div style={{ textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
              {evaluado ? <><div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2dd36f', lineHeight: 1 }}>{eval_!.puntaje}</div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div></> : <IonBadge color="warning" style={{ fontSize: '0.7rem' }}>Pendiente</IonBadge>}
            </div>
          </div>
        );
      })}

      <IonModal isOpen={modalPostulante !== null} onDidDismiss={() => setModalPostulante(null)}>
        {modalPostulante && <ModalEvaluar postulante={modalPostulante.p} numero={modalPostulante.idx} evaluacionPrevia={evalDeJurado(modalPostulante.p.id)} concursoId={concursoId} onClose={() => setModalPostulante(null)} onGuardado={() => { setModalPostulante(null); cargar(); }} />}
      </IonModal>
    </>
  );
};

// ─── Sección: Mis Evaluaciones ────────────────────────────────────────────────
const MisEvaluacionesSection: React.FC = () => {
  const nombre = juradoNombre();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.evaluaciones.listar().then(evs => setEvaluaciones(evs.filter(ev => ev.juradoNombre.toLowerCase() === nombre.toLowerCase()))).finally(() => setLoading(false)); }, [nombre]);

  const promedio = evaluaciones.length ? (evaluaciones.reduce((s, ev) => s + ev.puntaje, 0) / evaluaciones.length).toFixed(1) : null;
  const maximo = evaluaciones.length ? Math.max(...evaluaciones.map(e => e.puntaje)) : null;
  const minimo = evaluaciones.length ? Math.min(...evaluaciones.map(e => e.puntaje)) : null;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  return (
    <>
      {evaluaciones.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[{ val: evaluaciones.length, label: 'Evaluaciones', color: C.orange }, { val: promedio, label: 'Promedio', color: '#2dd36f' }, { val: maximo, label: 'Máximo', color: '#16a34a' }, { val: minimo, label: 'Mínimo', color: C.muted }].map((c, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.color }}>{c.val}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {evaluaciones.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: C.muted }}><p style={{ fontSize: '1rem', fontWeight: 600 }}>Aún no evaluaste ningún postulante.</p><p style={{ fontSize: '0.85rem' }}>Andá a "Postulantes" para comenzar.</p></div>}

      {evaluaciones.sort((a, b) => b.puntaje - a.puntaje).map((ev, idx) => (
        <div key={ev.id} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.orange}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: C.orange, flexShrink: 0 }}>#{idx + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{ev.postulanteNombre}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{formatFecha(ev.evaluadoEn)}</p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}><div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: scoreColor(ev.puntaje) }}>{ev.puntaje}</div><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div></div>
        </div>
      ))}
    </>
  );
};

// ─── Sección: Estadísticas ────────────────────────────────────────────────────
const EstadisticasSection: React.FC = () => {
  const nombre = juradoNombre();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [misEvals, setMisEvals] = useState<Evaluacion[]>([]);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.evaluaciones.listar(), api.postulantes.listar()]).then(([evs, ps]) => {
      setEvaluaciones(evs); setPostulantes(ps); setMisEvals(evs.filter(ev => ev.juradoNombre.toLowerCase() === nombre.toLowerCase()));
    }).finally(() => setLoading(false));
  }, [nombre]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  const distribucion = Array.from({ length: 10 }, (_, i) => ({ score: i + 1, count: misEvals.filter(e => Math.round(e.puntaje) === i + 1).length }));
  const maxCount = Math.max(...distribucion.map(d => d.count), 1);
  const ranking = postulantes.map(p => { const evs = evaluaciones.filter(e => e.postulanteId === p.id); const avg = evs.length > 0 ? evs.reduce((s, e) => s + e.puntaje, 0) / evs.length : 0; return { postulante: p, promedio: avg, totalEvals: evs.length }; }).filter(r => r.totalEvals > 0).sort((a, b) => b.promedio - a.promedio);
  const evaluados = misEvals.length;
  const total = postulantes.length;

  return (
    <>
      {/* Mi progreso */}
      <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><IonIcon icon={ribbonOutline} style={{ fontSize: '1.2rem', color: C.orange }} /><span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Mi progreso</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[{ val: evaluados, label: 'Evaluados', color: '#16a34a' }, { val: total - evaluados, label: 'Pendientes', color: C.orange }, { val: total, label: 'Total', color: C.text }].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 10, padding: '12px 8px' }}><div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.color }}>{c.val}</div><div style={{ fontSize: '0.7rem', color: C.muted }}>{c.label}</div></div>
          ))}
        </div>
        <div style={{ height: 10, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: total > 0 ? `${(evaluados / total) * 100}%` : '0%', background: evaluados === total ? '#16a34a' : C.orange, borderRadius: 999, transition: 'width 0.4s' }} /></div>
        <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>{evaluados === total ? 'Completaste todas las evaluaciones' : `${total > 0 ? Math.round((evaluados / total) * 100) : 0}% completado`}</p>
      </div>

      {/* Distribución */}
      {misEvals.length > 0 && (
        <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}><IonIcon icon={statsChartOutline} style={{ fontSize: '1.2rem', color: '#6a64f1' }} /><span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Distribución de mis puntajes</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {distribucion.map(d => (
              <div key={d.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: d.count > 0 ? C.text : '#d1d5db' }}>{d.count > 0 ? d.count : ''}</span>
                <div style={{ width: '100%', maxWidth: 28, height: d.count > 0 ? `${(d.count / maxCount) * 70 + 10}%` : 4, background: d.count > 0 ? scoreColor(d.score) : '#f3f4f6', borderRadius: 4, transition: 'height 0.3s', minHeight: 4 }} />
                <span style={{ fontSize: '0.7rem', color: C.muted, fontWeight: 600 }}>{d.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking */}
      {ranking.length > 0 && (
        <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><IonIcon icon={trophyOutline} style={{ fontSize: '1.2rem', color: '#ffc409' }} /><span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Ranking general</span><span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: 'auto' }}>Promedio todos los jurados</span></div>
          {ranking.slice(0, 10).map((r, i) => (
            <div key={r.postulante.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(ranking.length, 10) - 1 ? `1px solid #f3f4f6` : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: i === 0 ? '#ffc409' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: i < 3 ? '#fff' : C.muted, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.postulante.nombres} {r.postulante.apellidos}</div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{r.postulante.especialidad} · {r.totalEvals} eval{r.totalEvals !== 1 ? 's' : ''}</div></div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}><div style={{ fontSize: '1.3rem', fontWeight: 700, color: scoreColor(r.promedio), lineHeight: 1 }}>{r.promedio.toFixed(1)}</div><div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>/10</div></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── JuradoPage — Layout con Sidebar ──────────────────────────────────────────
const JuradoPage: React.FC = () => {
  const history = useHistory();
  const [activeSection, setActiveSection] = useState('postulantes');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem('jurado_nombre') ?? localStorage.getItem('jurado_nombre');
    if (!ok) { history.replace('/login'); return; }
    if (!localStorage.getItem(ONBOARDING_KEY)) setTimeout(() => setShowOnboarding(true), 400);
  }, [history]);

  const handleLogout = () => { sessionStorage.setItem('habisite_logout', '1'); sessionStorage.removeItem('jurado_nombre'); localStorage.removeItem('jurado_nombre'); window.location.replace('/login'); };
  const navigate = (id: string) => { setActiveSection(id); setMobileMenuOpen(false); };
  const sectionTitle = MENU.find(m => m.id === activeSection)?.label ?? '';

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg }}>

          {showOnboarding && <OnboardingTour onNavigate={navigate} onFinish={() => setShowOnboarding(false)} />}

          <aside style={{ width: sidebarOpen ? 250 : 0, minWidth: sidebarOpen ? 250 : 0, color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.25s ease, min-width 0.25s ease', flexShrink: 0, position: window.innerWidth < 768 ? 'fixed' : 'relative', zIndex: window.innerWidth < 768 ? 999 : 1, height: '100%' }}>
            <SidebarBg />
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #ffffff0d', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Habisite</div>
              <div style={{ fontSize: '0.62rem', color: C.orange, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>Panel de Jurado</div>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ffffff0d', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}55 0%, ${C.orange}22 100%)`, border: `1.5px solid ${C.orange}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>J</div>
              <div><p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{juradoNombre()}</p><p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af' }}>Jurado</p></div>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0', position: 'relative', zIndex: 1 }}>
              {MENU.map(item => {
                const isActive = activeSection === item.id;
                return (<button key={item.id} id={`jnav-${item.id}`} onClick={() => navigate(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.7rem 1.25rem', background: isActive ? '#ffffff0d' : 'transparent', color: isActive ? C.orange : '#9ca3af', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent', transition: 'all 0.15s' }}><IonIcon icon={item.icon} style={{ fontSize: '1.1rem', flexShrink: 0 }} />{item.label}</button>);
              })}
            </nav>
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #ffffff0d', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><IonIcon icon={logOutOutline} style={{ fontSize: '0.9rem' }} />Cerrar sesión</button>
            </div>
          </aside>

          {mobileMenuOpen && window.innerWidth < 768 && <div onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />}

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <header style={{ padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { if (window.innerWidth < 768) { setSidebarOpen(o => !o); setMobileMenuOpen(o => !o); } else { setSidebarOpen(o => !o); } }} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IonIcon icon={sidebarOpen ? chevronBackOutline : menuOutline} style={{ fontSize: '1rem', color: C.muted }} />
                </button>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: C.text }}>{sectionTitle}</h2>
              </div>
            </header>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {activeSection === 'postulantes' && <PostulantesSection />}
                {activeSection === 'mis-evaluaciones' && <MisEvaluacionesSection />}
                {activeSection === 'estadisticas' && <EstadisticasSection />}
              </div>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default JuradoPage;
