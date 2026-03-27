import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  arrowForwardOutline, arrowBackOutline, checkmarkOutline, closeOutline,
  gridOutline, peopleOutline, starOutline, clipboardOutline,
  barChartOutline, documentTextOutline, helpCircleOutline,
  ribbonOutline, menuOutline, syncOutline,
} from 'ionicons/icons';

// ─── Constantes ───────────────────────────────────────────────────────────────
const ORANGE = '#E85520';
const DARK   = '#111827';

const MAIN_KEY    = 'habisite_onboarding_v2';
const SECTION_KEY = (s: string) => `habisite_tour_${s}`;

export const onboardingPending = () => !localStorage.getItem(MAIN_KEY);
export const sectionTourPending = (s: string) => !localStorage.getItem(SECTION_KEY(s));
export const markSectionSeen = (s: string) => localStorage.setItem(SECTION_KEY(s), '1');

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Side = 'right' | 'left' | 'bottom' | 'top' | 'center';

export interface TourStep {
  targetId?: string;
  section?: string;
  title: string;
  description: string;
  side?: Side;
  icon: string;
  color?: string;
}

// ─── Pasos del tour principal ─────────────────────────────────────────────────
export const MAIN_TOUR: TourStep[] = [
  {
    targetId: 'admin-sidebar',
    section: 'dashboard',
    title: 'Menú lateral',
    description: 'Desde aquí navegás entre todas las secciones del panel. Podés contraerlo para ganar espacio.',
    side: 'right',
    icon: menuOutline,
    color: DARK,
  },
  {
    targetId: 'admin-topbar',
    section: 'dashboard',
    title: 'Dashboard',
    description: 'Visión general del concurso: postulantes, evaluaciones, estado del sitio y últimos registros. El botón ↻ Sync refresca las estadísticas.',
    side: 'bottom',
    icon: gridOutline,
    color: ORANGE,
  },
  {
    targetId: 'admin-content',
    section: 'postulantes',
    title: 'Postulantes',
    description: 'Listado completo de inscriptos. Buscá por nombre, DNI o universidad, filtrá por especialidad, exportá a CSV y regenerá la clave con el botón 🔑.',
    side: 'top',
    icon: peopleOutline,
    color: '#3dc2ff',
  },
  {
    targetId: 'admin-content',
    section: 'evaluaciones',
    title: 'Evaluaciones del jurado',
    description: 'Revisá las calificaciones registradas por cada miembro del jurado, el puntaje promedio y el detalle completo de cada evaluación.',
    side: 'top',
    icon: starOutline,
    color: '#ffc409',
  },
  {
    targetId: 'admin-content',
    section: 'entregas',
    title: 'Entregas',
    description: 'Propuestas enviadas por los participantes. Aprobá o rechazá cada entrega, y descargá los archivos adjuntos o los enlaces externos.',
    side: 'top',
    icon: documentTextOutline,
    color: '#2dd36f',
  },
  {
    targetId: 'admin-content',
    section: 'soporte',
    title: 'Soporte',
    description: 'Tickets de solicitud de acceso enviados desde la pantalla de login. Revisá el mensaje y marcalos como resueltos.',
    side: 'top',
    icon: helpCircleOutline,
    color: '#eb445a',
  },
  {
    targetId: 'admin-content',
    section: 'estadisticas',
    title: 'Estadísticas',
    description: 'Gráficos interactivos: distribución de postulantes por especialidad y universidad, y estado de las entregas.',
    side: 'top',
    icon: barChartOutline,
    color: '#6a64f1',
  },
  {
    targetId: 'admin-content',
    section: 'areas-sitio',
    title: 'Relevamiento de Áreas',
    description: 'Control editorial del sitio: qué secciones están publicadas, quién es responsable de cada una y cuándo fue la última modificación.',
    side: 'top',
    icon: clipboardOutline,
    color: '#f97316',
  },
  {
    targetId: 'admin-content',
    section: 'jurado',
    title: 'Panel del Jurado',
    description: 'Rendimiento consolidado de cada miembro del jurado: cantidad de evaluaciones, puntaje promedio, máximo y mínimo.',
    side: 'top',
    icon: ribbonOutline,
    color: '#ffc409',
  },
];

// ─── Tours por sección ────────────────────────────────────────────────────────
export const SECTION_TOURS: Record<string, TourStep[]> = {
  postulantes: [
    {
      targetId: 'tour-postulantes-filter',
      title: 'Búsqueda y filtros',
      description: 'Filtrá por nombre, DNI o universidad. El selector de especialidad reduce la lista al instante.',
      side: 'bottom',
      icon: peopleOutline,
      color: '#3dc2ff',
    },
    {
      targetId: 'tour-postulantes-actions',
      title: 'Acciones rápidas',
      description: '↻ recarga la lista desde la API. ↓ CSV exporta los resultados filtrados. 🔑 regenera y envía una nueva contraseña por email.',
      side: 'bottom',
      icon: syncOutline,
      color: ORANGE,
    },
  ],
  entregas: [
    {
      targetId: 'tour-entregas-filter',
      title: 'Filtro por estado',
      description: 'Mostrá solo Pendientes, Aprobadas o Rechazadas para priorizar tu revisión.',
      side: 'bottom',
      icon: documentTextOutline,
      color: '#2dd36f',
    },
  ],
  soporte: [
    {
      targetId: 'tour-soporte-alert',
      title: 'Tickets pendientes',
      description: 'Este banner te avisa cuántos tickets esperan respuesta. Resolvelos desde la misma tarjeta.',
      side: 'bottom',
      icon: helpCircleOutline,
      color: '#eb445a',
    },
  ],
  'areas-sitio': [
    {
      targetId: 'tour-areas-table',
      title: 'Relevamiento de contenido',
      description: 'Asigná un responsable a cada sección y cambiá su estado. Los cambios son locales hasta integrar la API de CMS.',
      side: 'top',
      icon: clipboardOutline,
      color: '#f97316',
    },
  ],
};

// ─── Cálculo de posición del tooltip ─────────────────────────────────────────
interface Rect { x: number; y: number; w: number; h: number }

function getTooltipPos(
  target: Rect,
  side: Side,
  tw: number,   // tooltip width
  th: number,   // tooltip height
  vw: number,   // viewport width
  vh: number,   // viewport height
  pad = 16,
): { x: number; y: number; side: Side } {
  if (side === 'center') return { x: (vw - tw) / 2, y: (vh - th) / 2, side: 'center' };

  let x = 0, y = 0, finalSide = side;

  if (side === 'right') {
    x = target.x + target.w + pad;
    y = target.y + target.h / 2 - th / 2;
    if (x + tw > vw - 8) { side = 'left'; finalSide = 'left'; }
  }
  if (side === 'left') {
    x = target.x - tw - pad;
    y = target.y + target.h / 2 - th / 2;
    if (x < 8) { side = 'bottom'; finalSide = 'bottom'; }
  }
  if (side === 'bottom') {
    x = target.x + target.w / 2 - tw / 2;
    y = target.y + target.h + pad;
    if (y + th > vh - 8) { side = 'top'; finalSide = 'top'; }
  }
  if (side === 'top') {
    x = target.x + target.w / 2 - tw / 2;
    y = target.y - th - pad;
    if (y < 8) { finalSide = 'bottom'; y = target.y + target.h + pad; }
  }

  // clamp inside viewport
  x = Math.max(8, Math.min(vw - tw - 8, x));
  y = Math.max(8, Math.min(vh - th - 8, y));

  return { x, y, side: finalSide };
}

// ─── Arrow ────────────────────────────────────────────────────────────────────
const Arrow: React.FC<{ side: Side; color: string }> = ({ side, color }) => {
  if (side === 'center') return null;
  const s: React.CSSProperties = { position: 'absolute', width: 0, height: 0 };
  const size = 9;
  if (side === 'left')   Object.assign(s, { right: -size, top: '50%', transform: 'translateY(-50%)', borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderLeft: `${size}px solid ${color}` });
  if (side === 'right')  Object.assign(s, { left: -size,  top: '50%', transform: 'translateY(-50%)', borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderRight: `${size}px solid ${color}` });
  if (side === 'top')    Object.assign(s, { bottom: -size, left: '50%', transform: 'translateX(-50%)', borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderTop: `${size}px solid ${color}` });
  if (side === 'bottom') Object.assign(s, { top: -size,   left: '50%', transform: 'translateX(-50%)', borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderBottom: `${size}px solid ${color}` });
  return <div style={s} />;
};

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props {
  steps: TourStep[];
  onNavigate?: (section: string) => void;
  onFinish: () => void;
  storageKey?: string;
}

const SpotlightTour: React.FC<Props> = ({ steps, onNavigate, onFinish, storageKey = MAIN_KEY }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; side: Side }>({ x: 0, y: 0, side: 'center' });
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const navigatedRef = useRef(false);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const total = steps.length;

  // ── Navega a la sección indicada y luego posiciona el tooltip ──────────────
  const positionTooltip = useCallback(() => {
    const el = step.targetId ? document.getElementById(step.targetId) : null;
    const tw = tooltipRef.current?.offsetWidth  ?? 320;
    const th = tooltipRef.current?.offsetHeight ?? 180;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!el) {
      setSpotRect(null);
      setTooltipPos({ x: (vw - tw) / 2, y: (vh - th) / 2, side: 'center' });
    } else {
      const r = el.getBoundingClientRect();
      const rect: Rect = { x: r.left, y: r.top, w: r.width, h: r.height };
      setSpotRect(rect);
      setTooltipPos(getTooltipPos(rect, step.side ?? 'right', tw, th, vw, vh));
    }
    setVisible(true);
  }, [step]);

  useLayoutEffect(() => {
    setVisible(false);
    navigatedRef.current = false;

    if (step.section && onNavigate) {
      onNavigate(step.section);
      navigatedRef.current = true;
      // wait for section to render
      const id = setTimeout(positionTooltip, 80);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(positionTooltip, 40);
      return () => clearTimeout(id);
    }
  }, [stepIdx]);

  // reposicionar en resize
  useEffect(() => {
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [positionTooltip]);

  const finish = () => {
    localStorage.setItem(storageKey, '1');
    onFinish();
  };

  const next = () => {
    if (isLast) finish();
    else { setVisible(false); setTimeout(() => setStepIdx(i => i + 1), 120); }
  };

  const prev = () => {
    if (stepIdx > 0) { setVisible(false); setTimeout(() => setStepIdx(i => i - 1), 120); }
  };

  const PAD = 10;
  const color = step.color ?? ORANGE;

  return (
    <>
      {/* ── Overlay SVG con spotlight ── */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 9000, pointerEvents: 'all' }}
        onClick={e => { if (e.target === e.currentTarget) finish(); }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotRect && (
              <rect
                x={spotRect.x - PAD} y={spotRect.y - PAD}
                width={spotRect.w + PAD * 2} height={spotRect.h + PAD * 2}
                rx="10" fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.72)"
          mask="url(#tour-mask)"
          style={{ transition: 'opacity 0.2s' }}
        />
        {/* Borde naranja alrededor del spotlight */}
        {spotRect && (
          <rect
            x={spotRect.x - PAD} y={spotRect.y - PAD}
            width={spotRect.w + PAD * 2} height={spotRect.h + PAD * 2}
            rx="10" fill="none"
            stroke={color} strokeWidth="2"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s' }}
          />
        )}
      </svg>

      {/* ── Tooltip card ── */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          left: tooltipPos.x,
          top: tooltipPos.y,
          width: 320,
          zIndex: 9001,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(6px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
          pointerEvents: visible ? 'all' : 'none',
        }}
      >
        <div style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            background: color,
            padding: '14px 16px 12px',
            display: 'flex', alignItems: 'center', gap: 12,
            position: 'relative',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IonIcon icon={step.icon} style={{ fontSize: '1.1rem', color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {stepIdx + 1} / {total}
              </div>
              <div style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.2 }}>
                {step.title}
              </div>
            </div>
            <button
              onClick={finish}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <IonIcon icon={closeOutline} style={{ fontSize: '1rem', color: '#fff' }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 16px 0' }}>
            <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '12px 0 4px' }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === stepIdx ? 16 : 5, height: 5,
                borderRadius: 999,
                background: i === stepIdx ? color : '#e5e7eb',
                transition: 'width 0.22s, background 0.22s',
              }} />
            ))}
          </div>

          {/* Nav */}
          <div style={{ padding: '10px 14px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {stepIdx > 0 && (
              <button onClick={prev} style={{
                padding: '7px 14px', background: 'transparent',
                border: '1.5px solid #e5e7eb', borderRadius: 999,
                fontSize: '0.78rem', color: '#6b7280', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <IonIcon icon={arrowBackOutline} style={{ fontSize: '0.85rem' }} />
                Anterior
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={next} style={{
              padding: '7px 18px',
              background: color, border: 'none', borderRadius: 999,
              fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {isLast ? 'Listo' : 'Siguiente'}
              <IonIcon icon={isLast ? checkmarkOutline : arrowForwardOutline} style={{ fontSize: '0.9rem' }} />
            </button>
          </div>
        </div>

        {/* Flecha hacia el elemento */}
        <Arrow side={tooltipPos.side} color={color} />
      </div>

      <style>{`
        @keyframes tour-fade { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </>
  );
};

// ─── Tour principal (exportado para AdminPage) ────────────────────────────────
interface MainTourProps {
  onNavigate: (s: string) => void;
  onFinish: () => void;
}
export const AdminMainTour: React.FC<MainTourProps> = ({ onNavigate, onFinish }) => (
  <SpotlightTour
    steps={MAIN_TOUR}
    onNavigate={onNavigate}
    onFinish={onFinish}
    storageKey={MAIN_KEY}
  />
);

// ─── Mini-tour por sección (exportado para AdminPage) ─────────────────────────
interface SectionTourProps {
  section: string;
  onFinish: () => void;
}
export const AdminSectionTour: React.FC<SectionTourProps> = ({ section, onFinish }) => {
  const steps = SECTION_TOURS[section];
  if (!steps) { markSectionSeen(section); onFinish(); return null; }
  return (
    <SpotlightTour
      steps={steps}
      onFinish={() => { markSectionSeen(section); onFinish(); }}
      storageKey={SECTION_KEY(section)}
    />
  );
};

export default SpotlightTour;
