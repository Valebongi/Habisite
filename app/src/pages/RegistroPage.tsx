import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonSpinner, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api, PostulanteRequest } from '../services/api';

const ORANGE = '#E85520';
const DARK = '#0d0e10';

// ─── Cambiar a true cuando se abra la inscripción ─────────────────────────────
const REGISTRO_ABIERTO = false;

const RegistroPage: React.FC = () => {
  const history = useHistory();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [universidad, setUniversidad] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const handleSubmit = async () => {
    setError('');
    if (!nombres.trim() || !apellidos.trim() || !correo.trim() || !universidad.trim()) {
      setError('Completá todos los campos para registrarte.');
      return;
    }

    setLoading(true);
    try {
      // Pre-registro liviano: los campos faltantes (DNI, celular, especialidad)
      // se completan en la confirmación oficial (paso 3 del flujo)
      const payload: PostulanteRequest = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        dni: '',
        celular: '',
        universidad: universidad.trim(),
        correoElectronico: correo.trim(),
        especialidad: '',
      };
      await api.postulantes.registrar(payload);
      setToastMsg('¡Pre-registro exitoso! Revisá tu email para continuar.');
      setToastColor('success');
      setShowToast(true);
      setTimeout(() => history.push('/login'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar.';
      setError(msg);
      setToastMsg(msg);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Registro cerrado ──────────────────────────────────────────────────────
  if (!REGISTRO_ABIERTO) {
    return (
      <IonPage>
        <IonContent fullscreen style={{ '--background': '#f4f5f7' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: `${ORANGE}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              fontSize: '1.6rem', color: ORANGE, fontWeight: 800,
            }}>
              ⏳
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 700, color: DARK }}>
              Inscripción no disponible aún
            </h2>
            <p style={{ margin: '0 0 32px', fontSize: '0.95rem', color: '#6b7280', maxWidth: 400, lineHeight: 1.6 }}>
              Las inscripciones al Habisite Design Challenge 2026 abrirán próximamente.
              Te avisaremos cuando puedas completar tu postulación.
            </p>
            <IonButton fill="outline" color="medium" routerLink="/login" style={{ '--border-radius': '10px' }}>
              Volver al inicio
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ── Form de pre-registro ──────────────────────────────────────────────────
  const form = (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: DARK, margin: 0 }}>
          Pre-registro
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#374151', margin: '6px 0 0', lineHeight: 1.5 }}>
          Dejá tus datos y te enviaremos toda la información del concurso por email.
        </p>
      </div>

      {[
        { label: 'Nombres', value: nombres, setter: setNombres, placeholder: 'Ej. Juan Carlos' },
        { label: 'Apellidos', value: apellidos, setter: setApellidos, placeholder: 'Ej. Pérez López' },
        { label: 'Correo electrónico', value: correo, setter: setCorreo, placeholder: 'correo@ejemplo.com', type: 'email' },
        { label: 'Universidad', value: universidad, setter: setUniversidad, placeholder: 'Ej. Universidad Nacional de Ingeniería' },
      ].map(({ label, value, setter, placeholder, type }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <label style={sty.label}>{label} <span style={{ color: ORANGE }}>*</span></label>
          <div style={sty.inputWrap}>
            <IonInput
              value={value}
              onIonInput={e => { setter(e.detail.value ?? ''); setError(''); }}
              placeholder={placeholder}
              type={(type as any) ?? 'text'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={sty.input}
            />
          </div>
        </div>
      ))}

      {error && (
        <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>
          {error}
        </p>
      )}

      <IonButton expand="block" onClick={handleSubmit} disabled={loading} style={sty.btn}>
        {loading ? <><IonSpinner name="crescent" style={{ marginRight: 8 }} />Registrando…</> : 'Pre-registrarme'}
      </IonButton>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={() => history.push('/login')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.82rem', color: '#374151', textDecoration: 'underline',
          textDecorationStyle: 'dotted', padding: 0,
        }}>
          Ya tengo cuenta — Ingresar
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: 16 }}>
        Los datos completos (DNI, celular, especialidad) se solicitan al confirmar la inscripción oficial.
      </p>
    </div>
  );

  const isDesktop = window.innerWidth >= 768;

  // ── Vista mobile ──────────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <IonPage>
        <IonContent fullscreen style={{ '--background': '#f4f5f7' }}>
          <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`, padding: '36px 24px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 24, width: 80, height: 80, border: `1.5px solid ${ORANGE}44`, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '0.15em', display: 'block' }}>HABISITE</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 500, color: ORANGE, letterSpacing: '0.25em' }}>DESIGN CHALLENGE 2026</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 24px 40px' }}>{form}</div>
          <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
        </IonContent>
      </IonPage>
    );
  }

  // ── Vista desktop — split diagonal (mismo patrón que LoginPage) ───────────
  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f4f5f7' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, width: '72%', height: '100%',
            background: `linear-gradient(145deg, ${DARK} 0%, #1a1c1f 40%, #2a1208 100%)`,
            clipPath: 'polygon(0 0, 68% 0, 54% 100%, 0 100%)',
            zIndex: 1, overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${ORANGE}22 0%, transparent 50%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 100px 48px 48px', zIndex: 2 }}>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '0.15em', display: 'block' }}>HABISITE</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: ORANGE, letterSpacing: '0.25em', textTransform: 'uppercase' }}>DESIGN CHALLENGE</span>
              </div>
              <div style={{ position: 'absolute', top: '18%', left: '32%', width: 180, height: 180, border: `1.5px solid ${ORANGE}44`, transform: 'rotate(45deg)' }} />
              <div style={{ position: 'absolute', bottom: '20%', left: '26%', width: 130, height: 130, border: `1.5px solid ${ORANGE}33`, transform: 'rotate(-15deg)' }} />
              <div style={{ maxWidth: '75%' }}>
                <p style={{ fontSize: '0.75rem', color: ORANGE, fontWeight: 600, letterSpacing: '0.2em', marginBottom: 10 }}>PRIMER PASO</p>
                <p style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 16 }}>
                  "Empezá tu camino<br />en el Design Challenge."
                </p>
                <div style={{ width: 40, height: 2, background: ORANGE, marginBottom: 12 }} />
                <p style={{ fontSize: '0.72rem', color: '#ffffff77', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Arquitectura · Interiores · Paisajismo
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginLeft: '46%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 40px', zIndex: 2 }}>
            {form}
          </div>
        </div>
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
      </IonContent>
    </IonPage>
  );
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const sty = {
  label: {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase',
  } as React.CSSProperties,
  inputWrap: {
    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
  } as React.CSSProperties,
  input: {
    '--padding-start': '14px', '--padding-end': '14px',
    '--padding-top': '12px', '--padding-bottom': '12px',
    '--background': 'transparent', '--color': DARK, fontSize: '0.95rem',
  } as React.CSSProperties,
  btn: {
    '--background': ORANGE, '--background-activated': '#cc4b1c',
    '--border-radius': '10px', '--box-shadow': `0 4px 14px ${ORANGE}44`,
    height: 48, fontSize: '0.95rem', fontWeight: 600, marginTop: 8,
  } as React.CSSProperties,
};

export default RegistroPage;
