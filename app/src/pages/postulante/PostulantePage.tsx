import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  IonPage, IonContent, IonIcon, IonButton, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonText, IonSpinner, IonToast, IonBadge,
  IonChip, IonTextarea,
} from '@ionic/react';
import {
  personOutline, trophyOutline, cloudUploadOutline,
  documentOutline, linkOutline, gridOutline, menuOutline,
  logOutOutline, chevronBackOutline, chevronForwardOutline,
  rocketOutline, arrowForwardOutline, checkmarkCircleOutline,
  sparklesOutline, peopleOutline, trashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api, Postulante, PostulanteRequest, Concurso, Resolucion, EquipoMiembro } from '../../services/api';

// ─── Design tokens (mismos que LoginPage) ─────────────────────────────────────
const C = {
  orange: '#E85520',
  dark: '#0d0e10',
  bg: '#f4f5f7',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
};

const ESPECIALIDADES = ['Arquitectura', 'Diseño de Interiores', 'Diseño Industrial', 'Paisajismo', 'Otro'];
const CODIGOS_PAIS = [
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPostulante = (): Postulante | null => {
  const raw = sessionStorage.getItem('postulante_data') ?? localStorage.getItem('postulante_data');
  if (!raw) return null;
  try { return JSON.parse(raw) as Postulante; } catch { return null; }
};

const parseCelular = (celular: string) => {
  for (const cp of CODIGOS_PAIS) {
    if (celular.startsWith(cp.value)) return { codigo: cp.value, numero: celular.slice(cp.value.length) };
  }
  return { codigo: '+51', numero: celular };
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

const estadoBadgeColor = (e: string) =>
  e === 'APROBADA' ? 'success' : e === 'RECHAZADA' ? 'danger' : e === 'INDETERMINADO' ? 'medium' : 'warning';

// ─── Sidebar menu ─────────────────────────────────────────────────────────────

type MenuItem = { id: string; icon: string; label: string };

const MENU: MenuItem[] = [
  { id: 'perfil',    icon: personOutline,        label: 'Mi Perfil' },
  { id: 'concursos', icon: trophyOutline,        label: 'Concursos' },
  { id: 'entregas',  icon: cloudUploadOutline,   label: 'Mis Entregas' },
  { id: 'equipo',    icon: peopleOutline,         label: 'Mi Equipo' },
  { id: 'resumen',   icon: gridOutline,          label: 'Resumen' },
];

// ─── Onboarding Tour ──────────────────────────────────────────────────────────

const ONBOARDING_KEY = 'habisite_onboarding_v3';

const TOUR_STEPS = [
  {
    targetId: 'nav-perfil',
    sectionId: 'perfil',
    icon: personOutline,
    title: 'Tu Perfil',
    desc: 'Acá están tus datos de inscripción: nombre, DNI, carrera y contacto.',
    tip: 'Tu DNI es tu usuario de ingreso — no se puede cambiar.',
  },
  {
    targetId: 'nav-concursos',
    sectionId: 'concursos',
    icon: trophyOutline,
    title: 'Concursos',
    desc: 'Explorá todos los desafíos activos. Cada tarjeta muestra el estado, las fechas y los días restantes.',
    tip: 'Tocá "Ver bases" para leer las reglas completas antes de postularte.',
  },
  {
    targetId: 'nav-entregas',
    sectionId: 'entregas',
    icon: cloudUploadOutline,
    title: 'Mis Entregas',
    desc: 'Subí tu proyecto: archivo (PDF, ZIP, imagen) o link de Google Drive.',
    tip: 'El jurado revisa cada entrega. Vas a ver el estado acá: Pendiente, Aprobada o Rechazada.',
  },
  {
    targetId: 'nav-equipo',
    sectionId: 'equipo',
    icon: peopleOutline,
    title: 'Mi Equipo',
    desc: 'Agregá a los integrantes de tu equipo. Buscalos por DNI — si ya están registrados, sus datos se completan automáticamente.',
    tip: 'Los integrantes de tu equipo comparten tus entregas y figuran en tu postulación.',
  },
  {
    targetId: 'nav-resumen',
    sectionId: 'resumen',
    icon: gridOutline,
    title: 'Resumen',
    desc: 'Un dashboard rápido con tus estadísticas: entregas, aprobaciones y concursos activos.',
    tip: 'Usalo para tener un panorama general de tu participación.',
  },
];

interface OnboardingProps {
  onNavigate: (sectionId: string) => void;
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingProps> = ({ onNavigate, onFinish }) => {
  const [step, setStep] = useState(-1); // -1 = welcome
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(!localStorage.getItem(ONBOARDING_KEY));
  const [animating, setAnimating] = useState(false);

  const updateTarget = useCallback((stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= TOUR_STEPS.length) return;
    const el = document.getElementById(TOUR_STEPS[stepIdx].targetId);
    if (el) setTargetRect(el.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!visible || step < 0) return;
    onNavigate(TOUR_STEPS[step].sectionId);
    // Small delay for DOM to settle
    const timer = setTimeout(() => updateTarget(step), 120);
    return () => clearTimeout(timer);
  }, [step, visible, onNavigate, updateTarget]);

  const goNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const goPrev = () => {
    if (animating || step <= 0) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    setStep(s => s - 1);
  };

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
    onFinish();
  };

  if (!visible) return null;

  // ── Welcome screen ────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: `linear-gradient(145deg, ${C.dark} 0%, #1a1208 40%, #2a1510 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 28px', overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <div style={{ position: 'absolute', top: '8%', right: '10%', width: 140, height: 140, border: `1.5px solid ${C.orange}22`, borderRadius: 12, transform: 'rotate(25deg)' }} />
        <div style={{ position: 'absolute', top: '25%', left: '5%', width: 80, height: 80, border: `1.5px solid ${C.orange}15`, borderRadius: 8, transform: 'rotate(-18deg)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 100, height: 100, border: `1px solid #ffffff10`, borderRadius: 10, transform: 'rotate(40deg)' }} />
        <div style={{ position: 'absolute', bottom: '30%', left: '12%', width: 60, height: 60, background: `${C.orange}08`, borderRadius: 999, filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '8%', width: 200, height: 200, background: `${C.orange}06`, borderRadius: 999, filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
            background: `linear-gradient(135deg, ${C.orange} 0%, #cc4b1c 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 40px ${C.orange}44`,
          }}>
            <IonIcon icon={rocketOutline} style={{ fontSize: '2.2rem', color: '#fff' }} />
          </div>

          <p style={{ margin: '0 0 6px', color: C.orange, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Design Challenge 2026
          </p>
          <h1 style={{ margin: '0 0 16px', color: '#fff', fontWeight: 800, fontSize: '1.8rem', lineHeight: 1.2 }}>
            Bienvenido a tu panel
          </h1>
          <p style={{ margin: '0 0 40px', color: '#ffffff66', fontSize: '1rem', lineHeight: 1.65 }}>
            Te mostramos en 5 pasos cómo usar el panel para gestionar tu postulación.
          </p>

          <button onClick={() => setStep(0)} style={{
            width: '100%', padding: '16px', background: C.orange, border: 'none',
            borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 8px 24px ${C.orange}55`,
          }}>
            Empezar el tour <IonIcon icon={arrowForwardOutline} style={{ fontSize: '1.1rem' }} />
          </button>
          <button onClick={finish} style={{
            width: '100%', padding: '12px', background: 'transparent', border: 'none',
            color: '#ffffff33', fontSize: '0.85rem', cursor: 'pointer', marginTop: 8,
          }}>
            Saltar
          </button>
        </div>
      </div>
    );
  }

  // ── Spotlight overlay ─────────────────────────────────────────────────
  const current = TOUR_STEPS[step];
  const r = targetRect;
  const pad = 6;

  return (
    <>
      {/* SVG overlay with cutout */}
      <svg style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
        width="100%" height="100%" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2} rx="10" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#onboarding-mask)" />
        {r && <rect x={r.left - pad} y={r.top - pad} width={r.width + pad * 2} height={r.height + pad * 2}
          rx="10" fill="none" stroke={C.orange} strokeWidth="2" strokeDasharray="6 3" />}
      </svg>

      {/* Click blocker */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} onClick={e => e.stopPropagation()} />

      {/* Tooltip card */}
      <div style={{
        position: 'fixed',
        top: r ? Math.min(r.bottom + 16, window.innerHeight - 280) : '50%',
        left: r ? Math.max(r.left, 16) : '50%',
        transform: r ? 'none' : 'translate(-50%, -50%)',
        zIndex: 10000, width: 340, maxWidth: 'calc(100vw - 32px)',
        background: '#fff', borderRadius: 16, padding: '24px 22px 20px',
        boxShadow: `0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px ${C.border}`,
        transition: 'top 0.3s ease, left 0.3s ease',
      }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              height: 3, borderRadius: 2, flex: i === step ? 3 : 1,
              background: i <= step ? C.orange : '#e5e7eb',
              transition: 'flex 0.3s ease, background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.orange}20 0%, ${C.orange}08 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IonIcon icon={current.icon} style={{ fontSize: '1.4rem', color: C.orange }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Paso {step + 1} de {TOUR_STEPS.length}
            </p>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: C.text }}>{current.title}</h3>
          </div>
        </div>

        <p style={{ margin: '0 0 10px', color: '#374151', lineHeight: 1.6, fontSize: '0.92rem' }}>{current.desc}</p>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
          background: '#fffbf5', borderRadius: 10, border: `1px solid ${C.orange}22`, marginBottom: 18,
        }}>
          <IonIcon icon={sparklesOutline} style={{ fontSize: '0.95rem', color: C.orange, flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>{current.tip}</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <button onClick={goPrev} style={{
              flex: 1, padding: '10px', background: '#f3f4f6', border: 'none',
              borderRadius: 10, color: C.muted, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              Atrás
            </button>
          )}
          <button onClick={goNext} style={{
            flex: 2, padding: '10px', background: C.orange, border: 'none',
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {step === TOUR_STEPS.length - 1
              ? <><IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1rem' }} /> Entendido</>
              : <>Siguiente <IonIcon icon={arrowForwardOutline} style={{ fontSize: '0.9rem' }} /></>}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Sidebar decorative background ────────────────────────────────────────────

const SidebarBackground: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {/* Base gradient */}
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, #0f1114 0%, #1a1208 50%, #0d0e10 100%)` }} />
    {/* Warm glow top */}
    <div style={{ position: 'absolute', top: -40, left: -20, width: 180, height: 180, background: `${C.orange}08`, borderRadius: 999, filter: 'blur(50px)' }} />
    {/* Warm glow bottom */}
    <div style={{ position: 'absolute', bottom: 40, right: -30, width: 120, height: 120, background: `${C.orange}06`, borderRadius: 999, filter: 'blur(40px)' }} />
    {/* Geometric shapes */}
    <div style={{ position: 'absolute', top: '12%', right: 10, width: 50, height: 50, border: `1px solid ${C.orange}12`, borderRadius: 6, transform: 'rotate(25deg)' }} />
    <div style={{ position: 'absolute', top: '55%', left: -10, width: 35, height: 35, border: `1px solid #ffffff08`, borderRadius: 4, transform: 'rotate(-15deg)' }} />
    <div style={{ position: 'absolute', bottom: '18%', right: 20, width: 25, height: 25, border: `1px solid ${C.orange}10`, borderRadius: 3, transform: 'rotate(40deg)' }} />
    {/* Subtle grid lines */}
    <div style={{ position: 'absolute', top: '35%', left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, #ffffff06, transparent)` }} />
    <div style={{ position: 'absolute', top: '70%', left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, ${C.orange}08, transparent)` }} />
  </div>
);

// ─── Sección: Perfil ──────────────────────────────────────────────────────────

const PerfilSection: React.FC = () => {
  const [editando, setEditando] = useState(false);
  const postulante = getPostulante();

  const cel = parseCelular(postulante?.celular ?? '');
  const [nombres, setNombres] = useState(postulante?.nombres ?? '');
  const [apellidos, setApellidos] = useState(postulante?.apellidos ?? '');
  const [codigoPais, setCodigoPais] = useState(cel.codigo);
  const [numeroCelular, setNumeroCelular] = useState(cel.numero);
  const [universidad, setUniversidad] = useState(postulante?.universidad ?? '');
  const [correo, setCorreo] = useState(postulante?.correoElectronico ?? '');
  const [especialidad, setEspecialidad] = useState(
    ESPECIALIDADES.includes(postulante?.especialidad ?? '') ? postulante!.especialidad : 'Otro'
  );
  const [especialidadOtro, setEspecialidadOtro] = useState(
    ESPECIALIDADES.includes(postulante?.especialidad ?? '') ? '' : (postulante?.especialidad ?? '')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  if (!postulante) return null;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombres || !apellidos || !numeroCelular || !universidad || !correo || !especialidad) {
      setError('Completá todos los campos.'); return;
    }
    if (especialidad === 'Otro' && !especialidadOtro.trim()) {
      setError('Especificá tu especialidad.'); return;
    }
    setLoading(true);
    try {
      const payload: PostulanteRequest = {
        nombres: nombres.trim(), apellidos: apellidos.trim(), dni: postulante.dni,
        celular: `${codigoPais}${numeroCelular}`,
        universidad: universidad.trim(), correoElectronico: correo.trim(),
        especialidad: especialidad === 'Otro' ? especialidadOtro.trim() : especialidad,
      };
      const actualizado = await api.postulantes.actualizar(postulante.id, payload);
      sessionStorage.setItem('postulante_data', JSON.stringify(actualizado));
      if (localStorage.getItem('postulante_data')) localStorage.setItem('postulante_data', JSON.stringify(actualizado));
      setToastMsg('Datos actualizados.'); setToastColor('success');
      setShowToast(true); setEditando(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally { setLoading(false); }
  };

  const campos = [
    { label: 'Nombres', valor: postulante.nombres },
    { label: 'Apellidos', valor: postulante.apellidos },
    { label: 'DNI', valor: postulante.dni },
    { label: 'Celular', valor: postulante.celular },
    { label: 'Universidad', valor: postulante.universidad },
    { label: 'Correo', valor: postulante.correoElectronico },
    { label: 'Especialidad', valor: postulante.especialidad },
    { label: 'Registrado', valor: formatFecha(postulante.creadoEn) },
  ];

  return (
    <>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.dark} 0%, #2a1208 100%)`,
        padding: '32px 28px', borderRadius: 16, marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, border: `1.5px solid ${C.orange}33`, borderRadius: 8, transform: 'rotate(20deg)' }} />
        <div style={{ position: 'absolute', bottom: -10, right: 80, width: 60, height: 60, border: '1.5px solid #ffffff18', borderRadius: 4, transform: 'rotate(-15deg)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: `${C.orange}33`,
            border: `2px solid ${C.orange}88`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#fff',
          }}>
            {postulante.nombres[0]}{postulante.apellidos[0]}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              {postulante.nombres} {postulante.apellidos}
            </h2>
            <p style={{ margin: '2px 0 0', color: C.orange, fontSize: '0.82rem', fontWeight: 600 }}>
              {postulante.especialidad}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem' }}>Mis datos</h3>
        {!editando && (
          <button onClick={() => setEditando(true)} style={{
            background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8,
            padding: '6px 16px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: C.muted,
          }}>Editar</button>
        )}
      </div>

      {!editando ? (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {campos.map(({ label, valor }, i) => (
            <div key={label} style={{
              padding: '14px 20px', borderBottom: i < campos.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: '0.9rem', color: C.text, fontWeight: 500 }}>{valor}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <form onSubmit={handleGuardar} noValidate>
            {[
              { label: 'Nombres', value: nombres, setter: setNombres },
              { label: 'Apellidos', value: apellidos, setter: setApellidos },
            ].map(({ label, value, setter }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={sty.label}>{label}</label>
                <div style={sty.inputWrap}>
                  <IonInput value={value} onIonInput={e => setter(e.detail.value ?? '')} type="text" style={sty.input} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>DNI (no modificable)</label>
              <div style={{ ...sty.inputWrap, background: '#f9fafb' }}>
                <IonInput value={postulante.dni} readonly style={{ ...sty.input, '--color': '#9ca3af' } as React.CSSProperties} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Celular</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <IonSelect value={codigoPais} onIonChange={e => setCodigoPais(e.detail.value)} interface="popover"
                  style={{ minWidth: 110, background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '10px' }}>
                  {CODIGOS_PAIS.map(c => <IonSelectOption key={c.value} value={c.value}>{c.label}</IonSelectOption>)}
                </IonSelect>
                <div style={{ ...sty.inputWrap, flex: 1 }}>
                  <IonInput value={numeroCelular} onIonInput={e => setNumeroCelular(e.detail.value ?? '')} type="tel" style={sty.input} />
                </div>
              </div>
            </div>
            {[
              { label: 'Universidad', value: universidad, setter: setUniversidad, type: 'text' },
              { label: 'Correo electrónico', value: correo, setter: setCorreo, type: 'email' },
            ].map(({ label, value, setter, type }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={sty.label}>{label}</label>
                <div style={sty.inputWrap}>
                  <IonInput value={value} onIonInput={e => setter(e.detail.value ?? '')} type={type as any} style={sty.input} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Especialidad</label>
              <IonSelect value={especialidad} onIonChange={e => setEspecialidad(e.detail.value)} interface="action-sheet"
                style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '14px', width: '100%' }}>
                {ESPECIALIDADES.map(esp => <IonSelectOption key={esp} value={esp}>{esp}</IonSelectOption>)}
              </IonSelect>
            </div>
            {especialidad === 'Otro' && (
              <div style={{ marginBottom: 16 }}>
                <label style={sty.label}>¿Cuál especialidad?</label>
                <div style={sty.inputWrap}>
                  <IonInput value={especialidadOtro} onIonInput={e => setEspecialidadOtro(e.detail.value ?? '')} type="text" style={sty.input} />
                </div>
              </div>
            )}
            {error && <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <IonButton expand="block" type="submit" disabled={loading} style={{ flex: 1, '--background': C.orange, '--border-radius': '10px' }}>
                {loading ? <IonSpinner name="crescent" /> : 'Guardar'}
              </IonButton>
              <IonButton expand="block" fill="outline" color="medium" onClick={() => setEditando(false)} style={{ flex: 1, '--border-radius': '10px' }}>
                Cancelar
              </IonButton>
            </div>
          </form>
        </div>
      )}
      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </>
  );
};

// ─── Sección: Concursos ───────────────────────────────────────────────────────

const ConcursosSection: React.FC = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    api.concursos.listar().then(setConcursos).finally(() => setLoading(false));
  }, []);

  const diasRestantes = (fechaFin: string) => {
    const diff = new Date(fechaFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  if (concursos.length === 0) return (
    <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
      <p style={{ fontSize: '1rem' }}>No hay concursos disponibles por el momento.</p>
    </div>
  );

  return (
    <>
      {concursos.map(c => {
        const estadoColor = c.estado === 'ACTIVO' ? 'success' : c.estado === 'PROXIMO' ? 'warning' : 'medium';
        return (
          <div key={c.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.dark} 0%, #2a1208 100%)`,
              padding: '22px 24px 18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, border: `1.5px solid ${C.orange}33`, borderRadius: 4, transform: 'rotate(20deg)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, position: 'relative', zIndex: 1 }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25 }}>{c.titulo}</h2>
                <IonChip color={estadoColor} style={{ fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>{c.estado}</IonChip>
              </div>
              <p style={{ margin: 0, color: '#ffffff88', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
                {formatFecha(c.fechaInicio)} → {formatFecha(c.fechaFin)}
                {c.estado === 'ACTIVO' && <span style={{ color: C.orange, marginLeft: 8, fontWeight: 600 }}>{diasRestantes(c.fechaFin)} días restantes</span>}
              </p>
            </div>
            <div style={{ padding: '18px 24px' }}>
              <p style={{ color: '#374151', lineHeight: 1.6, margin: '0 0 12px', fontSize: '0.9rem' }}>{c.descripcion}</p>
              {c.bases && (
                <>
                  <button onClick={() => setExpandido(expandido === c.id ? null : c.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: '0.82rem', color: C.orange, fontWeight: 600,
                  }}>
                    {expandido === c.id ? 'Ocultar bases' : 'Ver bases del concurso'}
                  </button>
                  {expandido === c.id && (
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginTop: 10 }}>
                      {c.bases.split('\n').map((linea: string, i: number) => (
                        <p key={i} style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{linea}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ─── Sección: Entregas ────────────────────────────────────────────────────────

const EntregasSection: React.FC = () => {
  const postulante = getPostulante();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [concursoId, setConcursoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlExterno, setUrlExterno] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [propuestaInputs, setPropuestaInputs] = useState<Record<number, string>>({});
  const [enviandoPropuesta, setEnviandoPropuesta] = useState<Record<number, boolean>>({});

  const cargar = () => {
    if (!postulante) return;
    setLoading(true);
    Promise.all([
      api.resoluciones.listarPorPostulante(postulante.id),
      api.concursos.listar(),
    ]).then(([res, con]) => { setResoluciones(res); setConcursos(con); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const concursosActivos = concursos.filter(c => c.estado === 'ACTIVO');
  const yaEntregados = resoluciones.map(r => r.concursoId);

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!concursoId) { setError('Seleccioná un concurso.'); return; }
    if (!titulo.trim()) { setError('Ingresá un título para tu entrega.'); return; }
    if (!archivo && !urlExterno.trim()) { setError('Adjuntá un archivo o ingresá una URL.'); return; }
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('postulanteId', String(postulante!.id));
      formData.append('concursoId', concursoId);
      formData.append('titulo', titulo.trim());
      if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
      if (urlExterno.trim()) formData.append('urlExterno', urlExterno.trim());
      if (archivo) formData.append('archivo', archivo);
      await api.resoluciones.subir(formData);
      setToastMsg('Entrega enviada exitosamente.'); setToastColor('success'); setShowToast(true);
      setMostrarForm(false);
      setTitulo(''); setDescripcion(''); setUrlExterno(''); setArchivo(null); setConcursoId('');
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally { setSubiendo(false); }
  };

  const handleSeleccionarPropuesta = async (id: number) => {
    const propuesta = propuestaInputs[id]?.trim();
    if (!propuesta) return;
    setEnviandoPropuesta(p => ({ ...p, [id]: true }));
    try {
      await api.resoluciones.seleccionarPropuesta(id, propuesta);
      setToastMsg('Propuesta seleccionada.'); setToastColor('success'); setShowToast(true);
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al seleccionar propuesta.';
      setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally {
      setEnviandoPropuesta(p => ({ ...p, [id]: false }));
    }
  };

  return (
    <>
      {!mostrarForm && (
        <IonButton expand="block" onClick={() => setMostrarForm(true)}
          style={{ '--background': C.orange, '--border-radius': '10px', marginBottom: 20, fontWeight: 600 }}>
          <IonIcon icon={cloudUploadOutline} slot="start" /> Nueva entrega
        </IonButton>
      )}

      {mostrarForm && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, color: C.orange, fontSize: '1rem' }}>Nueva entrega</h3>
          <form onSubmit={handleSubir} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Concurso *</label>
              <IonSelect value={concursoId} onIonChange={e => setConcursoId(e.detail.value)} placeholder="Seleccioná un concurso" interface="action-sheet"
                style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '14px', width: '100%' }}>
                {concursosActivos.filter(c => !yaEntregados.includes(c.id))
                  .map(c => <IonSelectOption key={c.id} value={String(c.id)}>{c.titulo}</IonSelectOption>)}
              </IonSelect>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Título de tu entrega *</label>
              <div style={sty.inputWrap}><IonInput value={titulo} onIonInput={e => setTitulo(e.detail.value ?? '')} placeholder="Ej. Propuesta Centro Comunitario" style={sty.input} /></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Descripción (opcional)</label>
              <div style={{ ...sty.inputWrap, borderRadius: 10 }}>
                <IonTextarea value={descripcion} onIonInput={e => setDescripcion(e.detail.value ?? '')} placeholder="Contá brevemente tu propuesta…" rows={3}
                  style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '12px', '--background': 'transparent' } as React.CSSProperties} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Archivo (PDF, imagen, ZIP — máx. 20 MB)</label>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.zip,.dwg" style={{ display: 'none' }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
              <div onClick={() => fileInputRef.current?.click()} style={{
                border: `2px dashed ${archivo ? C.orange : '#d1d5db'}`, borderRadius: 10, padding: 20,
                textAlign: 'center', cursor: 'pointer', background: archivo ? '#fff7f5' : '#fafafa',
              }}>
                {archivo
                  ? <p style={{ margin: 0, color: C.orange, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <IonIcon icon={documentOutline} />{archivo.name}
                    </p>
                  : <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Tocá para seleccionar un archivo</p>}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>O pegá un enlace (Google Drive, etc.)</label>
              <div style={sty.inputWrap}>
                <IonInput value={urlExterno} onIonInput={e => setUrlExterno(e.detail.value ?? '')} placeholder="https://drive.google.com/..." type="url" style={sty.input} />
              </div>
            </div>
            {error && <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <IonButton expand="block" type="submit" disabled={subiendo} style={{ flex: 1, '--background': C.orange, '--border-radius': '10px' }}>
                {subiendo ? <IonSpinner name="crescent" /> : 'Enviar entrega'}
              </IonButton>
              <IonButton expand="block" fill="outline" color="medium" onClick={() => setMostrarForm(false)} style={{ flex: 1, '--border-radius': '10px' }}>
                Cancelar
              </IonButton>
            </div>
          </form>
        </div>
      )}

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>}

      {!loading && resoluciones.length === 0 && !mostrarForm && (
        <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
          <p style={{ fontSize: '1rem' }}>Sin entregas aún</p>
          <p style={{ fontSize: '0.85rem' }}>Usá el botón de arriba para subir tu primera resolución.</p>
        </div>
      )}

      {resoluciones.map(r => (
        <div key={r.id} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: C.text }}>{r.titulo}</span>
            <IonBadge color={estadoBadgeColor(r.estado)}>{r.estado}</IonBadge>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: C.muted }}>{r.concursoTitulo}</p>
          {r.descripcion && <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#374151' }}>{r.descripcion}</p>}
          {r.propuesta && (
            <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#374151', background: '#f8fafc', borderRadius: 6, padding: '6px 10px', borderLeft: `3px solid ${C.orange}` }}>
              <span style={{ color: C.muted, fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Propuesta: </span>
              {r.propuesta}
            </p>
          )}
          {r.estado === 'INDETERMINADO' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ ...sty.inputWrap, flex: 1 }}>
                <IonInput
                  value={propuestaInputs[r.id] ?? ''}
                  onIonInput={e => setPropuestaInputs(p => ({ ...p, [r.id]: e.detail.value ?? '' }))}
                  placeholder="Nombre de tu propuesta…"
                  style={sty.input}
                />
              </div>
              <IonButton
                size="small"
                disabled={enviandoPropuesta[r.id] || !propuestaInputs[r.id]?.trim()}
                onClick={() => handleSeleccionarPropuesta(r.id)}
                style={{ '--background': C.orange, '--border-radius': '8px', flexShrink: 0 }}
              >
                {enviandoPropuesta[r.id] ? <IonSpinner name="crescent" /> : 'Seleccionar propuesta'}
              </IonButton>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {r.tieneArchivo && (
              <a href={`/api/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.78rem', color: C.orange, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IonIcon icon={documentOutline} style={{ fontSize: '0.9rem' }} />{r.archivoNombre}
              </a>
            )}
            {r.urlExterno && (
              <a href={r.urlExterno} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.78rem', color: C.orange, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IonIcon icon={linkOutline} style={{ fontSize: '0.9rem' }} />Ver enlace
              </a>
            )}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{formatFecha(r.creadoEn)}</p>
        </div>
      ))}

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </>
  );
};

// ─── Sección: Mi Equipo ───────────────────────────────────────────────────────

const EquipoSection: React.FC = () => {
  const postulante = getPostulante();
  const [miembros, setMiembros] = useState<EquipoMiembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [error, setError] = useState('');

  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');

  const cargar = () => {
    if (!postulante) return;
    setLoading(true);
    api.equipo.listar(postulante.id)
      .then(setMiembros)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const resetForm = () => {
    setDni(''); setNombres(''); setApellidos(''); setEmail(''); setCelular('');
    setYaRegistrado(false); setError('');
  };

  const handleBlurDni = async () => {
    if (!dni.trim()) return;
    setBuscandoDni(true);
    setYaRegistrado(false);
    try {
      const resultado = await api.equipo.buscarDni(dni.trim());
      if (resultado.encontrado) {
        setNombres(resultado.nombres ?? '');
        setApellidos(resultado.apellidos ?? '');
        setEmail(resultado.email ?? '');
        setCelular(resultado.celular ?? '');
        setYaRegistrado(true);
      } else {
        setNombres(''); setApellidos(''); setEmail(''); setCelular('');
        setYaRegistrado(false);
      }
    } catch {
      // Si falla la búsqueda, dejamos los campos vacíos para ingreso manual
    } finally {
      setBuscandoDni(false);
    }
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dni.trim() || !nombres.trim() || !apellidos.trim() || !email.trim() || !celular.trim()) {
      setError('Completá todos los campos.'); return;
    }
    if (!postulante) return;
    setGuardando(true);
    try {
      await api.equipo.agregar(postulante.id, {
        dni: dni.trim(), nombres: nombres.trim(), apellidos: apellidos.trim(),
        email: email.trim(), celular: celular.trim(),
      });
      setToastMsg('Integrante agregado al equipo.'); setToastColor('success'); setShowToast(true);
      resetForm();
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar integrante.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (equipoId: number) => {
    try {
      await api.equipo.eliminar(equipoId);
      setToastMsg('Integrante eliminado.'); setToastColor('success'); setShowToast(true);
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar integrante.';
      setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    }
  };

  return (
    <>
      {/* Add member form */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontWeight: 700, color: C.orange, fontSize: '1rem' }}>Agregar integrante</h3>
        <form onSubmit={handleAgregar} noValidate>
          {/* DNI with lookup */}
          <div style={{ marginBottom: 16 }}>
            <label style={sty.label}>DNI *</label>
            <div style={{ ...sty.inputWrap, display: 'flex', alignItems: 'center' }}>
              <IonInput
                value={dni}
                onIonInput={e => { setDni(e.detail.value ?? ''); setYaRegistrado(false); }}
                onIonBlur={handleBlurDni}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleBlurDni(); } }}
                placeholder="Ingresá el DNI"
                type="text"
                style={sty.input}
              />
              {buscandoDni && <IonSpinner name="crescent" style={{ marginRight: 10, color: C.orange, flexShrink: 0 }} />}
            </div>
            {yaRegistrado && (
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: 6, borderLeft: '3px solid #059669' }}>
                Ya registrado — se compartirán entregas
              </p>
            )}
          </div>

          {[
            { label: 'Nombres', value: nombres, setter: setNombres, type: 'text' },
            { label: 'Apellidos', value: apellidos, setter: setApellidos, type: 'text' },
            { label: 'Email', value: email, setter: setEmail, type: 'email' },
            { label: 'Celular', value: celular, setter: setCelular, type: 'tel' },
          ].map(({ label, value, setter, type }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={sty.label}>{label} *</label>
              <div style={sty.inputWrap}>
                <IonInput
                  value={value}
                  onIonInput={e => setter(e.detail.value ?? '')}
                  type={type as any}
                  placeholder={`Ingresá ${label.toLowerCase()}`}
                  style={sty.input}
                />
              </div>
            </div>
          ))}

          {error && (
            <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>{error}</p>
          )}
          <IonButton expand="block" type="submit" disabled={guardando} style={{ '--background': C.orange, '--border-radius': '10px' }}>
            {guardando ? <IonSpinner name="crescent" /> : 'Agregar al equipo'}
          </IonButton>
        </form>
      </div>

      {/* Members list */}
      <h3 style={{ margin: '0 0 14px', fontWeight: 700, color: C.text, fontSize: '1rem' }}>Integrantes actuales</h3>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>
      )}
      {!loading && miembros.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>
          <IonIcon icon={peopleOutline} style={{ fontSize: '2.5rem', marginBottom: 8, opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Aún no agregaste integrantes al equipo.</p>
        </div>
      )}
      {miembros.map(m => (
        <div key={m.id} style={{
          background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
          padding: '14px 18px', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `${C.orange}22`, border: `1.5px solid ${C.orange}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: C.orange, flexShrink: 0,
            }}>
              {m.nombres[0]}{m.apellidos[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem', color: C.text }}>
                {m.nombres} {m.apellidos}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.muted }}>
                DNI {m.dni} · {m.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleEliminar(m.id)}
            style={{
              background: '#fef2f2', border: `1px solid #fecaca`, borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer', color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
            }}
          >
            <IonIcon icon={trashOutline} style={{ fontSize: '0.9rem' }} />
            Quitar
          </button>
        </div>
      ))}

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </>
  );
};

// ─── Sección: Resumen / Dashboard ─────────────────────────────────────────────

const ResumenSection: React.FC = () => {
  const postulante = getPostulante();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postulante) return;
    Promise.all([
      api.resoluciones.listarPorPostulante(postulante.id),
      api.concursos.listar(),
    ]).then(([res, con]) => { setResoluciones(res); setConcursos(con); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  const activos = concursos.filter(c => c.estado === 'ACTIVO').length;
  const pendientes = resoluciones.filter(r => r.estado === 'PENDIENTE').length;
  const aprobadas = resoluciones.filter(r => r.estado === 'APROBADA').length;

  const stats = [
    { label: 'Concursos activos', valor: activos, color: '#3b82f6' },
    { label: 'Entregas enviadas', valor: resoluciones.length, color: C.orange },
    { label: 'Pendientes de revisión', valor: pendientes, color: '#f59e0b' },
    { label: 'Aprobadas', valor: aprobadas, color: '#10b981' },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
            padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.valor}</span>
            <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {resoluciones.length > 0 && (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Últimas entregas</h4>
          </div>
          {resoluciones.slice(0, 5).map((r, i) => (
            <div key={r.id} style={{ padding: '12px 20px', borderBottom: i < Math.min(resoluciones.length, 5) - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.text }}>{r.titulo}</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.muted }}>{r.concursoTitulo}</p>
              </div>
              <IonBadge color={estadoBadgeColor(r.estado)}>{r.estado}</IonBadge>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── PostulantePage — Layout con Sidebar ──────────────────────────────────────

const PostulantePage: React.FC = () => {
  const history = useHistory();
  const [activeSection, setActiveSection] = useState('perfil');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem('postulante_data') ?? localStorage.getItem('postulante_data');
    if (!ok) { history.replace('/login'); return; }
    // Show onboarding after mount if not seen
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setTimeout(() => setShowOnboarding(true), 400);
    }
  }, [history]);

  const postulante = getPostulante();

  const handleLogout = () => {
    sessionStorage.setItem('habisite_logout', '1');
    sessionStorage.removeItem('postulante_data');
    localStorage.removeItem('postulante_data');
    window.location.replace('/login');
  };

  const navigate = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const sectionTitle = MENU.find(m => m.id === activeSection)?.label ?? '';

  const renderSection = () => {
    switch (activeSection) {
      case 'perfil': return <PerfilSection />;
      case 'concursos': return <ConcursosSection />;
      case 'entregas': return <EntregasSection />;
      case 'equipo': return <EquipoSection />;
      case 'resumen': return <ResumenSection />;
      default: return <PerfilSection />;
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg }}>

          {/* Onboarding */}
          {showOnboarding && (
            <OnboardingTour
              onNavigate={navigate}
              onFinish={() => setShowOnboarding(false)}
            />
          )}

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside style={{
            width: sidebarOpen ? 250 : 0,
            minWidth: sidebarOpen ? 250 : 0,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease, min-width 0.25s ease',
            flexShrink: 0,
            position: window.innerWidth < 768 ? 'fixed' : 'relative',
            zIndex: window.innerWidth < 768 ? 999 : 1,
            height: '100%',
          }}>
            {/* Decorative background */}
            <SidebarBackground />

            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #ffffff0d', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Habisite</div>
              <div style={{ fontSize: '0.62rem', color: C.orange, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>
                Panel de Postulante
              </div>
            </div>

            {/* User info */}
            {postulante && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #ffffff0d', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.orange}55 0%, ${C.orange}22 100%)`,
                  border: `1.5px solid ${C.orange}66`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {postulante.nombres[0]}{postulante.apellidos[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {postulante.nombres} {postulante.apellidos}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af' }}>{postulante.especialidad}</p>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0', position: 'relative', zIndex: 1 }}>
              {MENU.map(item => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} id={`nav-${item.id}`} onClick={() => navigate(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.7rem 1.25rem',
                    background: isActive ? '#ffffff0d' : 'transparent',
                    color: isActive ? C.orange : '#9ca3af',
                    border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left',
                    borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    <IonIcon icon={item.icon} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #ffffff0d', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <button onClick={handleLogout} style={{
                width: '100%', padding: '0.6rem', background: 'transparent',
                border: '1px solid #ffffff15', color: '#9ca3af', borderRadius: 999,
                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <IonIcon icon={logOutOutline} style={{ fontSize: '0.9rem' }} />
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileMenuOpen && window.innerWidth < 768 && (
            <div onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />
          )}

          {/* ── Main content ─────────────────────────────────────── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top bar */}
            <header style={{
              padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarOpen(o => !o);
                    setMobileMenuOpen(o => !o);
                  } else {
                    setSidebarOpen(o => !o);
                  }
                }} style={{
                  background: '#f3f4f6', border: 'none', cursor: 'pointer',
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IonIcon icon={sidebarOpen ? chevronBackOutline : menuOutline} style={{ fontSize: '1rem', color: C.muted }} />
                </button>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: C.text }}>{sectionTitle}</h2>
              </div>
            </header>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {renderSection()}
              </div>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── Shared input styles ──────────────────────────────────────────────────────
const sty = {
  label: {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase',
  } as React.CSSProperties,
  inputWrap: {
    background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
  } as React.CSSProperties,
  input: {
    '--padding-start': '14px', '--padding-end': '14px',
    '--padding-top': '12px', '--padding-bottom': '12px',
    '--background': 'transparent', '--color': C.dark, fontSize: '0.95rem',
  } as React.CSSProperties,
};

export default PostulantePage;
