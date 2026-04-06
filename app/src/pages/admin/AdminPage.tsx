import React, { useCallback, useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonSpinner, IonSearchbar, IonToast,
} from '@ionic/react';
import {
  gridOutline, trophyOutline, peopleOutline, mailOutline,
  checkmarkCircleOutline, ribbonOutline, settingsOutline,
  menuOutline, logOutOutline, chevronBackOutline,
  rocketOutline, arrowForwardOutline, checkmarkDoneOutline,
  sparklesOutline, alertCircleOutline, timeOutline,
  addOutline, trashOutline, createOutline, closeOutline,
  personOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import {
  api, AdminStats, Postulante, Evaluacion, Concurso,
  UsuarioInfo, Resolucion, CampanaInfoRequest,
} from '../../services/api';

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

const BASE_URL = `${import.meta.env.VITE_API_URL || 'https://api.habisite.com/api'}/v1`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFecha = (f: string) =>
  new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatFechaCorta = (f: string) =>
  new Date(f).toLocaleDateString('es-AR');

const diasRestantes = (fechaFin: string) => {
  const diff = new Date(fechaFin).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const estadoConcursoBadge = (estado: Concurso['estado']) => {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVO:    { bg: '#f0fdf4', color: '#16a34a' },
    CERRADO:   { bg: '#f3f4f6', color: C.muted },
    PROXIMO:   { bg: '#fff7ed', color: '#92400e' },
    TERMINADO: { bg: '#f3f4f6', color: '#9ca3af' },
  };
  return map[estado] ?? map.CERRADO;
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: C.text }}>{title}</h2>
    {action}
  </div>
);

const StatCard: React.FC<{ value: string | number; label: string; color?: string; sub?: string }> = ({ value, label, color = C.orange, sub }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}`, flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 3 }}>{sub}</div>}
  </div>
);

const inputCss: React.CSSProperties = {
  padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10,
  fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  background: '#fff', color: C.text,
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', background: C.orange, border: 'none', borderRadius: 10,
  color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

const btnSm: React.CSSProperties = {
  padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.muted, fontWeight: 600, fontSize: '0.78rem',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
};

const msgBox = (ok: boolean): React.CSSProperties => ({
  background: ok ? '#f0fdf4' : '#fef2f2',
  borderLeft: `4px solid ${ok ? '#16a34a' : '#dc2626'}`,
  padding: '10px 16px', borderRadius: 8, marginBottom: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
});

// ─── Sidebar menu ─────────────────────────────────────────────────────────────
type MenuItem = { id: string; icon: string; label: string };

const MENU: MenuItem[] = [
  { id: 'dashboard',    icon: gridOutline,             label: 'Dashboard' },
  { id: 'concursos',   icon: trophyOutline,            label: 'Concursos' },
  { id: 'postulantes', icon: peopleOutline,            label: 'Postulantes' },
  { id: 'evaluaciones',icon: checkmarkCircleOutline,   label: 'Evaluaciones' },
  { id: 'jurado',      icon: ribbonOutline,            label: 'Jurado' },
  { id: 'configuracion',icon: settingsOutline,         label: 'Configuración' },
];

// ─── Sidebar decorative background ───────────────────────────────────────────
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

// ─── Onboarding Tour ─────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'habisite_admin_onboarding_v3';

const TOUR_STEPS = [
  {
    targetId: 'anav-dashboard',
    sectionId: 'dashboard',
    icon: gridOutline,
    title: 'Dashboard',
    desc: 'Vista general del concurso: postulantes activos, entregas, jurados y propuestas recibidas. También muestra concursos próximos a vencer y postulantes sin entregas.',
    tip: 'Actualizá esta sección para tener el estado en tiempo real.',
  },
  {
    targetId: 'anav-concursos',
    sectionId: 'concursos',
    icon: trophyOutline,
    title: 'Concursos',
    desc: 'Listado de todos los concursos con su estado (ACTIVO, CERRADO, TERMINADO). Podés editar título, descripción, bases, fechas y estado directamente.',
    tip: 'Un concurso ACTIVO acepta entregas; pasarlo a CERRADO detiene nuevas postulaciones.',
  },
  {
    targetId: 'anav-postulantes',
    sectionId: 'postulantes',
    icon: peopleOutline,
    title: 'Postulantes',
    desc: 'Lista completa de todos los inscritos. Buscá por nombre, DNI, email o universidad. Podés ver todos sus datos en un vistazo.',
    tip: 'Usá el buscador para encontrar rápidamente a un postulante específico.',
  },
  {
    targetId: 'anav-evaluaciones',
    sectionId: 'evaluaciones',
    icon: checkmarkCircleOutline,
    title: 'Evaluaciones',
    desc: 'Todas las evaluaciones del jurado: postulante, jurado, puntaje, comentario y fecha. Incluye estadísticas por jurado.',
    tip: 'El puntaje promedio te da una idea rápida del nivel general del concurso.',
  },
  {
    targetId: 'anav-jurado',
    sectionId: 'jurado',
    icon: ribbonOutline,
    title: 'Jurado',
    desc: 'Supervisá el progreso de cada miembro del jurado: cuántas evaluaciones hizo, promedio, máximo y mínimo. Barra de progreso contra el total de postulantes.',
    tip: 'Un jurado con 0 evaluaciones puede indicar que aún no ingresó al sistema.',
  },
  {
    targetId: 'anav-configuracion',
    sectionId: 'configuracion',
    icon: settingsOutline,
    title: 'Configuración',
    desc: 'Gestión de usuarios del sistema: crear nuevos jurados o admins, ver todos los usuarios activos y eliminar los que ya no se necesiten.',
    tip: 'Al crear un usuario, el username se usa para iniciar sesión. Compartilo de forma segura.',
  },
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

  // Welcome screen
  if (step === -1) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: `linear-gradient(145deg, ${C.dark} 0%, #1a1208 40%, #2a1510 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '8%', right: '10%', width: 140, height: 140, border: `1.5px solid ${C.orange}22`, borderRadius: 12, transform: 'rotate(25deg)' }} />
      <div style={{ position: 'absolute', top: '25%', left: '5%', width: 80, height: 80, border: `1.5px solid ${C.orange}15`, borderRadius: 8, transform: 'rotate(-18deg)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 100, height: 100, border: `1px solid #ffffff10`, borderRadius: 10, transform: 'rotate(40deg)' }} />
      <div style={{ position: 'absolute', top: '50%', right: '8%', width: 200, height: 200, background: `${C.orange}06`, borderRadius: 999, filter: 'blur(60px)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px', background: `linear-gradient(135deg, ${C.orange} 0%, #cc4b1c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 40px ${C.orange}44` }}>
          <IonIcon icon={rocketOutline} style={{ fontSize: '2.2rem', color: '#fff' }} />
        </div>
        <p style={{ margin: '0 0 6px', color: C.orange, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Panel de Administración</p>
        <h1 style={{ margin: '0 0 16px', color: '#fff', fontWeight: 800, fontSize: '1.8rem', lineHeight: 1.2 }}>Bienvenido al panel</h1>
        <p style={{ margin: '0 0 40px', color: '#ffffff66', fontSize: '1rem', lineHeight: 1.65 }}>Te mostramos cómo gestionar el concurso en 7 pasos.</p>
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
        <defs>
          <mask id="admin-mask">
            <rect width="100%" height="100%" fill="white" />
            {r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2} rx="10" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#admin-mask)" />
        {r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2} rx="10" fill="none" stroke={C.orange} strokeWidth="2" strokeDasharray="6 3" />}
      </svg>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} onClick={e => e.stopPropagation()} />
      <div style={{ position: 'fixed', top: r ? Math.min(r.bottom + 16, window.innerHeight - 300) : '50%', left: r ? Math.max(r.left, 16) : '50%', transform: r ? 'none' : 'translate(-50%,-50%)', zIndex: 10000, width: 340, maxWidth: 'calc(100vw - 32px)', background: '#fff', borderRadius: 16, padding: '24px 22px 20px', boxShadow: `0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px ${C.border}`, transition: 'top 0.3s ease, left 0.3s ease' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {TOUR_STEPS.map((_, i) => <div key={i} style={{ height: 3, borderRadius: 2, flex: i === step ? 3 : 1, background: i <= step ? C.orange : '#e5e7eb', transition: 'flex 0.3s, background 0.3s' }} />)}
        </div>
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

// ─── Sección: Dashboard ───────────────────────────────────────────────────────
const SecDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [s, ps, cs, rs, evs] = await Promise.all([
        api.admin.stats(),
        api.postulantes.listar(),
        api.concursos.listar(),
        api.resoluciones.listarTodas(),
        api.evaluaciones.listar(),
      ]);
      setStats(s); setPostulantes(ps); setConcursos(cs); setResoluciones(rs); setEvaluaciones(evs);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  const juradosActivos = [...new Set(evaluaciones.map(e => e.juradoNombre))].length;
  const sinEntregas = postulantes.filter(p => !resoluciones.some(r => r.postulanteId === p.id));
  const ahora = Date.now();
  const proximosAVencer = concursos.filter(c => {
    const d = diasRestantes(c.fechaFin);
    return c.estado === 'ACTIVO' && d >= 0 && d <= 14;
  }).sort((a, b) => new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime());

  return (
    <>
      <SectionHeader title="Dashboard" action={
        <button onClick={cargar} style={btnSm}>↻ Actualizar</button>
      } />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard value={stats?.totalPostulantes ?? '—'} label="Postulantes" color={C.orange} sub="inscriptos" />
        <StatCard value={stats?.resolucionesPendientes ?? '—'} label="Sin revisar" color='#f59e0b' sub="entregas pendientes" />
        <StatCard value={stats?.totalResoluciones ?? '—'} label="Propuestas" color='#6a64f1' sub="entregas recibidas" />
        <StatCard value={juradosActivos} label="Jurados" color='#2dd36f' sub="con evaluaciones" />
        <StatCard value={stats?.totalEvaluaciones ?? '—'} label="Evaluaciones" color={C.text} sub="realizadas" />
      </div>

      {/* Próximos a vencer */}
      <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <IonIcon icon={timeOutline} style={{ fontSize: '1.1rem', color: C.orange }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Entregas próximas a vencer</span>
        </div>
        {proximosAVencer.length === 0
          ? <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>No hay concursos activos con vencimiento en los próximos 14 días.</p>
          : proximosAVencer.map(c => {
              const dias = diasRestantes(c.fechaFin);
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid #f3f4f6` }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{c.titulo}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.muted }}>Vence: {formatFechaCorta(c.fechaFin)}</p>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: dias <= 3 ? '#fef2f2' : '#fff7ed', color: dias <= 3 ? '#dc2626' : '#92400e', whiteSpace: 'nowrap' }}>
                    {dias === 0 ? 'Vence hoy' : dias === 1 ? '1 día' : `${dias} días`}
                  </span>
                </div>
              );
            })
        }
      </div>

      {/* Postulantes sin entregas */}
      <div style={{ background: C.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.1rem', color: '#f59e0b' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Postulantes sin entregas</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>{sinEntregas.length}</span>
        </div>
        {sinEntregas.length === 0
          ? <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Todos los postulantes tienen al menos una entrega.</p>
          : <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {sinEntregas.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < sinEntregas.length - 1 ? `1px solid #f3f4f6` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: C.orange, flexShrink: 0 }}>
                    {p.nombres[0]}{p.apellidos[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: C.text }}>{p.nombres} {p.apellidos}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: C.muted }}>{p.universidad}</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{formatFechaCorta(p.creadoEn)}</span>
                </div>
              ))}
            </div>
        }
      </div>
    </>
  );
};

// ─── Sección: Concursos ───────────────────────────────────────────────────────
const SecConcursos: React.FC = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Concurso>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, rs] = await Promise.all([api.concursos.listar(), api.resoluciones.listarTodas()]);
      setConcursos(cs); setResoluciones(rs);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const startEdit = (c: Concurso) => { setEditId(c.id); setEditData({ ...c }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const guardar = async () => {
    if (!editId || !editData) return;
    setSaving(true);
    try {
      await fetch(`${BASE_URL}/concursos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      setMsg({ text: 'Concurso actualizado correctamente.', ok: true });
      setEditId(null); setEditData({});
      cargar();
    } catch { setMsg({ text: 'Error al guardar el concurso.', ok: false }); }
    finally { setSaving(false); }
  };

  const entregasDeConcurso = (id: number) => resoluciones.filter(r => r.concursoId === id).length;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  return (
    <>
      <SectionHeader title={`Concursos (${concursos.length})`} action={<button onClick={cargar} style={btnSm}>↻ Actualizar</button>} />

      {msg && (
        <div style={msgBox(msg.ok)}>
          <span style={{ fontSize: '0.875rem', color: msg.ok ? '#166534' : '#991b1b' }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><IonIcon icon={closeOutline} /></button>
        </div>
      )}

      {concursos.length === 0 && <div style={{ background: C.card, borderRadius: 14, padding: 40, textAlign: 'center', color: C.muted, border: `1px solid ${C.border}` }}>No hay concursos registrados.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {concursos.map(c => {
          const badge = estadoConcursoBadge(c.estado);
          const isEditing = editId === c.id;
          const entregas = entregasDeConcurso(c.id);

          return (
            <div key={c.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {/* Header strip */}
              <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1e1208 100%)`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{c.titulo}</span>
                <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: badge.bg, color: badge.color }}>{c.estado}</span>
              </div>

              {isEditing ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Título</label>
                    <input value={editData.titulo ?? ''} onChange={e => setEditData(d => ({ ...d, titulo: e.target.value }))} style={inputCss} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Descripción</label>
                    <textarea value={editData.descripcion ?? ''} onChange={e => setEditData(d => ({ ...d, descripcion: e.target.value }))} rows={3} style={{ ...inputCss, resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Bases y condiciones</label>
                    <textarea value={editData.bases ?? ''} onChange={e => setEditData(d => ({ ...d, bases: e.target.value }))} rows={3} style={{ ...inputCss, resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Fecha inicio</label>
                      <input type="datetime-local" value={(editData.fechaInicio ?? '').slice(0, 16)} onChange={e => setEditData(d => ({ ...d, fechaInicio: e.target.value }))} style={inputCss} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Fecha fin</label>
                      <input type="datetime-local" value={(editData.fechaFin ?? '').slice(0, 16)} onChange={e => setEditData(d => ({ ...d, fechaFin: e.target.value }))} style={inputCss} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Estado</label>
                      <select value={editData.estado ?? 'ACTIVO'} onChange={e => setEditData(d => ({ ...d, estado: e.target.value as Concurso['estado'] }))} style={{ ...inputCss, cursor: 'pointer' }}>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="PROXIMO">PROXIMO</option>
                        <option value="CERRADO">CERRADO</option>
                        <option value="TERMINADO">TERMINADO</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                    <button onClick={cancelEdit} style={btnSm}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.55 }}>{c.descripcion}</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.78rem', color: C.muted }}><strong style={{ color: C.text }}>Inicio:</strong> {formatFechaCorta(c.fechaInicio)}</span>
                    <span style={{ fontSize: '0.78rem', color: C.muted }}><strong style={{ color: C.text }}>Fin:</strong> {formatFechaCorta(c.fechaFin)}</span>
                    <span style={{ fontSize: '0.78rem', color: C.muted }}><strong style={{ color: C.text }}>Entregas:</strong> {entregas}</span>
                  </div>
                  <button onClick={() => startEdit(c)} style={btnSm}>
                    <IonIcon icon={createOutline} style={{ fontSize: '0.85rem' }} /> Editar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Sección: Postulantes (unificada con Campañas) ──────────────────────────
const SecPostulantes: React.FC = () => {
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [webinarUrl, setWebinarUrl] = useState('');
  const [webinarFecha, setWebinarFecha] = useState('');
  const [canalUrl, setCanalUrl] = useState('');
  const [canalNombre, setCanalNombre] = useState('WhatsApp');
  const [showConfig, setShowConfig] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, s] = await Promise.all([api.postulantes.listar(), api.admin.stats()]);
      setPostulantes(ps); setStats(s);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const BASE = import.meta.env.VITE_API_URL || 'https://api.habisite.com/api';

  // Filtros
  const buscados = postulantes.filter(p => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (p.nombres + ' ' + p.apellidos).toLowerCase().includes(s) || (p.dni || '').includes(s) || p.correoElectronico.toLowerCase().includes(s) || p.universidad.toLowerCase().includes(s);
  });
  const filtrados = buscados.filter(p => {
    if (filtroEstado === 'pendiente') return !p.infoEnviadaEn;
    if (filtroEstado === 'enviado') return !!p.infoEnviadaEn && !p.confirmadoEn;
    if (filtroEstado === 'confirmado') return !!p.confirmadoEn;
    return true;
  });

  const toggleSelect = (id: number) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => selected.size === filtrados.length ? setSelected(new Set()) : setSelected(new Set(filtrados.map(p => p.id)));

  // Acciones por tipo de email
  const enviarA = async (ids: number[], tipo: 'info' | '2da' | 'bienvenida') => {
    const label = tipo === 'info' ? 'info del concurso' : tipo === '2da' ? 'segunda convocatoria' : 'bienvenida';
    if (!confirm(`¿Enviar ${label} a ${ids.length} postulante${ids.length !== 1 ? 's' : ''}?`)) return;
    setEnviando(true); setMsg(null);
    let ok = 0;
    for (const id of ids) {
      try {
        await fetch(`${BASE}/v1/admin/campanas/reenviar/${id}?tipo=${tipo}`, { method: 'POST' });
        ok++;
      } catch { /* skip */ }
    }
    setMsg({ text: `${ok} email${ok !== 1 ? 's' : ''} de ${label} enviado${ok !== 1 ? 's' : ''}.`, ok: ok > 0 });
    setSelected(new Set());
    cargar();
    setEnviando(false);
  };

  // Envío masivo primera vez (con datos de webinar)
  const enviarInfoMasivo = async () => {
    if (!webinarUrl.trim() || !webinarFecha || !canalUrl.trim()) return;
    const pendientes = postulantes.filter(p => !p.infoEnviadaEn).length;
    if (!confirm(`Se enviarán emails a ${pendientes} postulantes pendientes. ¿Continuar?`)) return;
    setEnviando(true); setMsg(null);
    try {
      const data: CampanaInfoRequest = { webinarUrl: webinarUrl.trim(), webinarFecha: new Date(webinarFecha).toISOString(), canalUrl: canalUrl.trim(), canalNombre };
      const res = await api.campanas.enviarInfoConcurso(data);
      setMsg({ text: `${res.emailsEnviados} emails enviados.`, ok: true });
      cargar();
    } catch { setMsg({ text: 'Error al enviar.', ok: false }); }
    finally { setEnviando(false); }
  };

  const exportCSV = () => {
    const header = 'Nombres,Apellidos,DNI,Email,Universidad,Especialidad,Info enviada,Confirmado';
    const rows = filtrados.map(p => `${p.nombres},${p.apellidos},${p.dni || ''},${p.correoElectronico},${p.universidad},${p.especialidad || ''},${p.infoEnviadaEn ? 'Si' : 'No'},${p.confirmadoEn ? 'Si' : 'No'}`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'postulantes.csv'; a.click();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  const pendientesInfo = postulantes.filter(p => !p.infoEnviadaEn).length;

  return (
    <>
      <SectionHeader title={`Postulantes (${postulantes.length})`} action={
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setShowConfig(c => !c)} style={btnSm}>{showConfig ? 'Ocultar config' : 'Config envío'}</button>
          <button onClick={exportCSV} style={btnSm}>CSV</button>
        </div>
      } />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatCard value={postulantes.length} label="Total" color={C.text} />
        <StatCard value={pendientesInfo} label="Sin info" color={C.orange} />
        <StatCard value={stats?.totalConfirmados ?? 0} label="Confirmados" color='#2dd36f' />
        <StatCard value={stats?.porcentajeConfirmacion != null ? `${stats.porcentajeConfirmacion.toFixed(0)}%` : '—'} label="Tasa confirm." color='#6a64f1' />
      </div>

      {msg && (
        <div style={msgBox(msg.ok)}>
          <span style={{ fontSize: '0.85rem', color: msg.ok ? '#166534' : '#991b1b' }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><IonIcon icon={closeOutline} /></button>
        </div>
      )}

      {/* Config de webinar (colapsable) */}
      {showConfig && (
        <div style={{ background: C.card, borderRadius: 14, padding: '18px', border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Datos del webinar (para envío masivo primera vez)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 3 }}>URL Webinar</label>
              <input value={webinarUrl} onChange={e => setWebinarUrl(e.target.value)} placeholder="https://meet.google.com/..." style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 3 }}>Fecha</label>
              <input type="datetime-local" value={webinarFecha} onChange={e => setWebinarFecha(e.target.value)} style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 3 }}>URL Canal</label>
              <input value={canalUrl} onChange={e => setCanalUrl(e.target.value)} placeholder="https://chat.whatsapp.com/..." style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 3 }}>Canal</label>
              <select value={canalNombre} onChange={e => setCanalNombre(e.target.value)} style={{ ...inputCss, cursor: 'pointer' }}>
                <option>WhatsApp</option><option>Telegram</option><option>Discord</option><option>Slack</option>
              </select>
            </div>
          </div>
          <button onClick={enviarInfoMasivo} disabled={enviando || !webinarUrl.trim() || !webinarFecha || !canalUrl.trim()} style={{ ...btnPrimary, fontSize: '0.82rem', opacity: (enviando || !webinarUrl.trim()) ? 0.5 : 1 }}>
            {enviando ? 'Enviando...' : `Enviar info a ${pendientesInfo} pendientes`}
          </button>
        </div>
      )}

      {/* Buscador + filtros */}
      <IonSearchbar value={q} onIonInput={e => setQ(e.detail.value ?? '')} placeholder="Buscar por nombre, DNI, email..." style={{ '--border-radius': '10px', '--background': '#fff', margin: '0 0 10px', padding: 0 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['todos', 'pendiente', 'enviado', 'confirmado'].map(f => (
            <button key={f} onClick={() => { setFiltroEstado(f); setSelected(new Set()); }} style={{
              padding: '3px 10px', borderRadius: 20, border: `1.5px solid ${filtroEstado === f ? C.orange : C.border}`,
              background: filtroEstado === f ? `${C.orange}15` : 'transparent', color: filtroEstado === f ? C.orange : C.muted,
              fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: C.muted }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Barra de acciones masivas */}
      {selected.size > 0 && (
        <div style={{ background: `${C.orange}10`, border: `1.5px solid ${C.orange}33`, borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}:</span>
          <button onClick={() => enviarA([...selected], 'info')} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.75rem', margin: 0 }}>Info concurso</button>
          <button onClick={() => enviarA([...selected], '2da')} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.75rem', margin: 0, background: '#92400e' }}>2da convocatoria</button>
          <button onClick={() => enviarA([...selected], 'bienvenida')} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.75rem', margin: 0, background: '#16a34a' }}>Bienvenida</button>
        </div>
      )}

      {/* Tabla */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '8px 6px 8px 14px', width: 28 }}>
                  <input type="checkbox" checked={selected.size === filtrados.length && filtrados.length > 0} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                {['Nombre', 'Email', 'DNI', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: C.muted }}>Sin resultados</td></tr>
                : filtrados.map(p => {
                    const confirmado = !!p.confirmadoEn;
                    const infoEnviada = !!p.infoEnviadaEn;
                    const badge = confirmado ? { bg: '#f0fdf4', color: '#16a34a', label: 'Confirmado' }
                      : infoEnviada ? { bg: '#eff6ff', color: '#1e40af', label: 'Info enviada' }
                      : { bg: '#f3f4f6', color: C.muted, label: 'Pendiente' };
                    const isExp = expandedId === p.id;
                    return (
                      <React.Fragment key={p.id}>
                        <tr style={{ borderBottom: isExp ? 'none' : '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => setExpandedId(isExp ? null : p.id)}>
                          <td style={{ padding: '9px 6px 9px 14px' }} onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer' }} />
                          </td>
                          <td style={{ padding: '9px 10px', fontWeight: 600 }}>{p.nombres} {p.apellidos}</td>
                          <td style={{ padding: '9px 10px', color: C.muted, fontSize: '0.78rem' }}>{p.correoElectronico}</td>
                          <td style={{ padding: '9px 10px', color: C.muted, fontSize: '0.78rem' }}>{p.dni || '—'}</td>
                          <td style={{ padding: '9px 10px' }}>
                            <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>{badge.label}</span>
                          </td>
                          <td style={{ padding: '9px 10px', color: C.orange, fontSize: '0.72rem' }}>{isExp ? '▲' : '▼'}</td>
                        </tr>
                        {isExp && (
                          <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td colSpan={6} style={{ padding: '0 14px 14px', background: '#fafafa' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, padding: '10px 0 8px' }}>
                                {[
                                  { l: 'DNI', v: p.dni || 'Sin completar' }, { l: 'Celular', v: p.celular || 'Sin completar' },
                                  { l: 'Universidad', v: p.universidad }, { l: 'Especialidad', v: p.especialidad || 'Sin completar' },
                                  { l: 'Registrado', v: formatFechaCorta(p.creadoEn) }, { l: 'Info enviada', v: p.infoEnviadaEn ? formatFechaCorta(p.infoEnviadaEn) : 'No' },
                                  { l: 'Confirmado', v: p.confirmadoEn ? formatFechaCorta(p.confirmadoEn) : 'No' }, { l: 'Recordatorio', v: p.recordatorioEnviadoEn ? formatFechaCorta(p.recordatorioEnviadoEn) : 'No' },
                                ].map(d => (
                                  <div key={d.l}><p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{d.l}</p><p style={{ margin: '1px 0 0', fontSize: '0.82rem', color: C.text, fontWeight: 500 }}>{d.v}</p></div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                <button onClick={e => { e.stopPropagation(); enviarA([p.id], 'info'); }} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.72rem', margin: 0 }}>Enviar info</button>
                                <button onClick={e => { e.stopPropagation(); enviarA([p.id], '2da'); }} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.72rem', margin: 0, background: '#92400e' }}>2da convocatoria</button>
                                <button onClick={e => { e.stopPropagation(); enviarA([p.id], 'bienvenida'); }} disabled={enviando} style={{ ...btnPrimary, padding: '5px 12px', fontSize: '0.72rem', margin: 0, background: '#16a34a' }}>Bienvenida</button>
                                <button onClick={async e => { e.stopPropagation(); if (!confirm(`Regenerar clave de ${p.nombres}?`)) return; try { await api.postulantes.regenerarClave(p.id); setMsg({ text: 'Clave regenerada y enviada.', ok: true }); } catch { setMsg({ text: 'Error.', ok: false }); }}} style={{ ...btnSm, margin: 0 }}>Regen. clave</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ─── Sección: Evaluaciones ────────────────────────────────────────────────────
const SecEvaluaciones: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { api.evaluaciones.listar().then(setEvaluaciones).finally(() => setLoading(false)); }, []);

  const promedio = evaluaciones.length
    ? (evaluaciones.reduce((s, e) => s + e.puntaje, 0) / evaluaciones.length).toFixed(1)
    : null;

  const filtradas = evaluaciones.filter(e => {
    const s = q.toLowerCase();
    return !s || e.postulanteNombre.toLowerCase().includes(s) || e.juradoNombre.toLowerCase().includes(s);
  });

  const scoreColor = (p: number) => p >= 7 ? '#2dd36f' : p >= 5 ? C.orange : '#eb445a';

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  return (
    <>
      <SectionHeader title={`Evaluaciones (${evaluaciones.length})`} action={<button onClick={() => api.evaluaciones.listar().then(setEvaluaciones)} style={btnSm}>↻</button>} />

      {evaluaciones.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <StatCard value={promedio ?? '—'} label="Puntaje promedio" color='#2dd36f' />
          <StatCard value={evaluaciones.length} label="Evaluaciones" color={C.orange} />
          <StatCard value={Math.max(...evaluaciones.map(e => e.puntaje))} label="Puntaje máximo" color='#16a34a' />
          <StatCard value={Math.min(...evaluaciones.map(e => e.puntaje))} label="Puntaje mínimo" color={C.muted} />
        </div>
      )}

      <IonSearchbar value={q} onIonInput={e => setQ(e.detail.value ?? '')} placeholder="Filtrar por postulante o jurado..." style={{ '--border-radius': '10px', '--background': '#fff', margin: '0 0 16px', padding: 0 }} />

      {filtradas.length === 0 && <div style={{ background: C.card, borderRadius: 14, padding: 40, textAlign: 'center', color: C.muted, border: `1px solid ${C.border}` }}>No hay evaluaciones{q ? ' que coincidan.' : ' aún.'}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtradas.sort((a, b) => b.puntaje - a.puntaje).map(e => (
          <div key={e.id} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: C.text }}>{e.postulanteNombre}</p>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', color: C.muted }}>Jurado: {e.juradoNombre}</p>
              {e.comentario && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.4 }}>{e.comentario}</p>}
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: scoreColor(e.puntaje) }}>{e.puntaje}</div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>/10</div>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 3 }}>{formatFechaCorta(e.evaluadoEn)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Sección: Jurado ──────────────────────────────────────────────────────────
const SecJurado: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.evaluaciones.listar(), api.postulantes.listar()])
      .then(([evs, ps]) => { setEvaluaciones(evs); setPostulantes(ps); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  const total = postulantes.length;

  // Aggregate by jurado
  const porJurado: Record<string, { count: number; suma: number; max: number; min: number }> = {};
  evaluaciones.forEach(e => {
    if (!porJurado[e.juradoNombre]) porJurado[e.juradoNombre] = { count: 0, suma: 0, max: 0, min: 11 };
    const j = porJurado[e.juradoNombre];
    j.count++; j.suma += e.puntaje;
    if (e.puntaje > j.max) j.max = e.puntaje;
    if (e.puntaje < j.min) j.min = e.puntaje;
  });

  const jurados = Object.entries(porJurado).sort((a, b) => b[1].count - a[1].count);

  return (
    <>
      <SectionHeader title={`Jurado (${jurados.length} activos)`} />

      {jurados.length === 0 && <div style={{ background: C.card, borderRadius: 14, padding: 40, textAlign: 'center', color: C.muted, border: `1px solid ${C.border}` }}>Ningún jurado ha realizado evaluaciones aún.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {jurados.map(([nombre, d]) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          const promedio = (d.suma / d.count).toFixed(1);
          return (
            <div key={nombre} style={{ background: C.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}33 0%, ${C.orange}15 100%)`, border: `1.5px solid ${C.orange}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: C.orange, flexShrink: 0 }}>
                  <IonIcon icon={personOutline} style={{ fontSize: '1rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: C.text }}>{nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.muted }}>{d.count} de {total} evaluaciones · {pct}% completado</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.orange, lineHeight: 1 }}>{promedio}</div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>promedio</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : C.orange, borderRadius: 999, transition: 'width 0.4s' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[{ label: 'Evaluaciones', val: d.count, color: C.orange }, { label: 'Puntaje máx.', val: d.max + '/10', color: '#2dd36f' }, { label: 'Puntaje mín.', val: (d.min === 11 ? '—' : d.min) + '/10', color: C.muted }].map(c => (
                  <div key={c.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── Sección: Configuración ───────────────────────────────────────────────────
const SecConfiguracion: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', username: '', password: '', rol: 'JURADO' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setUsuarios(await api.usuarios.listar()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearUsuario = async () => {
    if (!form.nombre || !form.username || !form.password) { setMsg({ text: 'Completá todos los campos.', ok: false }); return; }
    setSaving(true);
    try {
      await api.usuarios.crear(form);
      setMsg({ text: `Usuario "${form.username}" creado correctamente.`, ok: true });
      setForm({ nombre: '', username: '', password: '', rol: 'JURADO' });
      setShowForm(false);
      cargar();
    } catch (e: unknown) { setMsg({ text: e instanceof Error ? e.message : 'Error al crear.', ok: false }); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number, nombre: string) => {
    if (!confirm(`Eliminar usuario "${nombre}"?`)) return;
    try { await api.usuarios.eliminar(id); cargar(); }
    catch { setMsg({ text: 'Error al eliminar usuario.', ok: false }); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><IonSpinner name="crescent" color="primary" /></div>;

  return (
    <>
      <SectionHeader title={`Usuarios del sistema (${usuarios.length})`} action={
        <button onClick={() => setShowForm(f => !f)} style={btnPrimary}>
          <IonIcon icon={showForm ? closeOutline : addOutline} style={{ fontSize: '1rem' }} />
          {showForm ? 'Cancelar' : 'Nuevo usuario'}
        </button>
      } />

      {msg && (
        <div style={msgBox(msg.ok)}>
          <span style={{ fontSize: '0.875rem', color: msg.ok ? '#166534' : '#991b1b' }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><IonIcon icon={closeOutline} /></button>
        </div>
      )}

      {showForm && (
        <div style={{ background: C.card, borderRadius: 14, padding: '20px', border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Crear nuevo usuario</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Nombre completo</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Juan Pérez" style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Username</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="juanperez" style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Rol</label>
              <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} style={{ ...inputCss, cursor: 'pointer' }}>
                <option value="JURADO">Jurado</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button onClick={crearUsuario} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      )}

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {usuarios.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No hay usuarios registrados.</div>
          : usuarios.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < usuarios.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: u.rol === 'ADMIN' ? `${C.orange}18` : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IonIcon icon={personOutline} style={{ fontSize: '1rem', color: u.rol === 'ADMIN' ? C.orange : '#1e40af' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{u.nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: C.muted }}>@{u.username} · {formatFechaCorta(u.creadoEn)}</p>
                </div>
                <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: u.rol === 'ADMIN' ? '#fff3ee' : '#eff6ff', color: u.rol === 'ADMIN' ? C.orange : '#1e40af', flexShrink: 0 }}>{u.rol}</span>
                <button onClick={() => eliminar(u.id, u.nombre)} style={{ ...btnSm, color: '#dc2626', borderColor: '#fecaca', flexShrink: 0 }}>
                  <IonIcon icon={trashOutline} style={{ fontSize: '0.85rem' }} />
                </button>
              </div>
            ))
        }
      </div>
    </>
  );
};

// ─── AdminPage — Layout principal ─────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const history = useHistory();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_ok') ?? localStorage.getItem('admin_ok');
    if (!ok) { history.replace('/login'); return; }
    if (!localStorage.getItem(ONBOARDING_KEY)) setTimeout(() => setShowOnboarding(true), 400);
  }, [history]);

  const handleLogout = () => {
    sessionStorage.setItem('habisite_logout', '1');
    sessionStorage.removeItem('admin_ok');
    localStorage.removeItem('admin_ok');
    window.location.replace('/login');
  };

  const navigate = (id: string) => { setActiveSection(id); setMobileMenuOpen(false); if (window.innerWidth < 768) setSidebarOpen(false); };
  const sectionTitle = MENU.find(m => m.id === activeSection)?.label ?? '';
  const isMobile = window.innerWidth < 768;

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg }}>

          {showOnboarding && <OnboardingTour onNavigate={navigate} onFinish={() => setShowOnboarding(false)} />}

          {/* Sidebar */}
          <aside style={{ width: sidebarOpen ? 250 : 0, minWidth: sidebarOpen ? 250 : 0, color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.25s ease, min-width 0.25s ease', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: isMobile ? 999 : 1, height: '100%' }}>
            <SidebarBg />

            {/* Logo */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #ffffff0d', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Habisite</div>
              <div style={{ fontSize: '0.62rem', color: C.orange, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>Panel de Admin</div>
            </div>

            {/* User */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ffffff0d', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}55 0%, ${C.orange}22 100%)`, border: `1.5px solid ${C.orange}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>A</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>Administrador</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af' }}>Admin</p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0', position: 'relative', zIndex: 1 }}>
              {MENU.map(item => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} id={`anav-${item.id}`} onClick={() => navigate(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.7rem 1.25rem', background: isActive ? '#ffffff0d' : 'transparent', color: isActive ? C.orange : '#9ca3af', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent', transition: 'all 0.15s' }}>
                    <IonIcon icon={item.icon} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Tutorial button */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #ffffff08', position: 'relative', zIndex: 1 }}>
              <button onClick={() => { localStorage.removeItem(ONBOARDING_KEY); setShowOnboarding(true); }} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid #ffffff10', color: '#ffffff44', borderRadius: 8, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <IonIcon icon={rocketOutline} style={{ fontSize: '0.8rem' }} /> Ver tutorial
              </button>
            </div>

            {/* Logout */}
            <div style={{ padding: '0.75rem 1.25rem 1rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <IonIcon icon={logOutOutline} style={{ fontSize: '0.9rem' }} />Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileMenuOpen && isMobile && (
            <div onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />
          )}

          {/* Main content */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top bar */}
            <header style={{ padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { if (isMobile) { const next = !sidebarOpen; setSidebarOpen(next); setMobileMenuOpen(next); } else { setSidebarOpen(o => !o); } }} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IonIcon icon={sidebarOpen ? chevronBackOutline : menuOutline} style={{ fontSize: '1rem', color: C.muted }} />
                </button>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: C.text }}>{sectionTitle}</h2>
              </div>
            </header>

            {/* Section content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 960, margin: '0 auto' }}>
                {activeSection === 'dashboard'     && <SecDashboard />}
                {activeSection === 'concursos'     && <SecConcursos />}
                {activeSection === 'postulantes'   && <SecPostulantes />}
                {activeSection === 'evaluaciones'  && <SecEvaluaciones />}
                {activeSection === 'jurado'        && <SecJurado />}
                {activeSection === 'configuracion' && <SecConfiguracion />}
              </div>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
