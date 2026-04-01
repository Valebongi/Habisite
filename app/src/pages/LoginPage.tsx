import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonTextarea,
  IonModal,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';

const ORANGE = '#E85520';
const DARK   = '#0d0e10';

// ─── Hook de ancho de pantalla ────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

// ─── Modal de soporte ─────────────────────────────────────────────────────────
const ModalSoporte: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [nombre, setNombre]   = useState('');
  const [dni, setDni]         = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError]     = useState('');

  const reset = () => {
    setNombre(''); setDni(''); setMensaje('');
    setLoading(false); setEnviado(false); setError('');
  };

  const handleEnviar = async () => {
    setError('');
    if (!nombre.trim() || !mensaje.trim()) {
      setError('Completá tu nombre y el motivo.');
      return;
    }
    setLoading(true);
    try {
      await api.soporte.crearTicket({ nombre: nombre.trim(), dni: dni.trim() || undefined, mensaje: mensaje.trim() });
      setEnviado(true);
    } catch {
      setError('No se pudo enviar la solicitud. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} style={{ '--border-radius': '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a1c1f 40%, #2a1208 100%)`, padding: '28px 24px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -15, right: -15, width: 90, height: 90, border: `1.5px solid ${ORANGE}33`, borderRadius: 6, transform: 'rotate(25deg)' }} />
          <div style={{ position: 'absolute', bottom: -10, left: 30, width: 50, height: 50, border: `1px solid #ffffff12`, borderRadius: 4, transform: 'rotate(-18deg)' }} />
          <div style={{ position: 'absolute', top: 10, left: '50%', width: 120, height: 120, background: `${ORANGE}08`, borderRadius: 999, filter: 'blur(40px)' }} />
          <button onClick={handleClose} style={{
            position: 'absolute', top: 16, right: 16, zIndex: 2,
            background: '#ffffff15', border: 'none', color: '#fff', fontSize: '1.2rem',
            cursor: 'pointer', lineHeight: 1, padding: '4px 8px', borderRadius: 8,
          }}>×</button>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.6rem', fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Habisite Design Challenge</p>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>
              Solicitar acceso
            </h2>
            <p style={{ margin: '6px 0 0', color: '#ffffff66', fontSize: '0.82rem' }}>
              Te responderemos a la brevedad
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#dcfce7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.6rem',
              }}>✓</div>
              <p style={{ fontWeight: 700, color: DARK, fontSize: '1rem', margin: '0 0 8px' }}>
                ¡Solicitud enviada!
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                El equipo de Habisite revisará tu caso y te otorgará acceso pronto.
              </p>
              <IonButton expand="block" onClick={handleClose} style={{ marginTop: 32, '--background': ORANGE, '--border-radius': '10px' }}>
                Cerrar
              </IonButton>
            </div>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre completo <span style={{ color: ORANGE }}>*</span></label>
                <div style={styles.inputWrapper}>
                  <IonInput value={nombre} onIonInput={e => setNombre(e.detail.value ?? '')} placeholder="Ej. María García" type="text" style={styles.input} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>DNI <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
                <div style={styles.inputWrapper}>
                  <IonInput value={dni} onIonInput={e => setDni(e.detail.value ?? '')} placeholder="12345678" type="text" maxlength={8} style={styles.input} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>¿Por qué no podés ingresar? <span style={{ color: ORANGE }}>*</span></label>
                <div style={{ ...styles.inputWrapper, borderRadius: 10 }}>
                  <IonTextarea
                    value={mensaje}
                    onIonInput={e => setMensaje(e.detail.value ?? '')}
                    placeholder="Contanos qué está pasando con tu acceso…"
                    rows={4}
                    style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '12px', '--padding-bottom': '12px', '--background': 'transparent' } as React.CSSProperties}
                  />
                </div>
              </div>

              {error && (
                <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>
                  {error}
                </p>
              )}

              <IonButton expand="block" onClick={handleEnviar} disabled={loading}
                style={{ '--background': ORANGE, '--border-radius': '10px', height: 48 }}>
                {loading ? <><IonSpinner name="crescent" style={{ marginRight: 8 }} />Enviando…</> : 'Enviar solicitud'}
              </IonButton>
            </>
          )}
        </div>
      </div>
    </IonModal>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const history   = useHistory();
  const width     = useWindowWidth();
  const isDesktop = width >= 768;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showSoporte, setShowSoporte]       = useState(false);
  const [showRecuperar, setShowRecuperar]   = useState(false);
  const [dniRecuperar, setDniRecuperar]     = useState('');
  const [enviandoClave, setEnviandoClave]   = useState(false);
  const [showToast, setShowToast]           = useState(false);
  const [toastMsg, setToastMsg]             = useState('');

  const handleRecuperar = async () => {
    if (!dniRecuperar.trim()) return;
    setEnviandoClave(true);
    try {
      await api.postulantes.recuperarClave(dniRecuperar.trim());
    } finally {
      setEnviandoClave(false);
      setDniRecuperar('');
      setShowRecuperar(false);
      setToastMsg('Si tu DNI está registrado, recibirás tus credenciales por email.');
      setShowToast(true);
    }
  };

  // Auto-login si hay sesión guardada en localStorage (se omite si viene de un logout explícito)
  useEffect(() => {
    if (sessionStorage.getItem('habisite_logout')) {
      sessionStorage.removeItem('habisite_logout');
      return;
    }
    if (localStorage.getItem('postulante_data')) {
      history.replace('/postulante');
    } else if (localStorage.getItem('admin_ok')) {
      history.replace('/admin');
    } else if (localStorage.getItem('jurado_nombre')) {
      history.replace('/jurado');
    }
  }, [history]);

  const saveAuth = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
    if (rememberMe) localStorage.setItem(key, value);
  };

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim()) { setError('Ingresá tu DNI o usuario.'); return; }
    if (!password.trim()) { setError('Ingresá tu contraseña.'); return; }

    setLoading(true);
    try {
      const res = await api.auth.login({ username: identifier.trim(), password: password.trim() });

      if (res.rol === 'ADMIN') {
        saveAuth('admin_ok', 'true');
        history.replace('/admin');
      } else if (res.rol === 'JURADO') {
        saveAuth('jurado_nombre', res.nombre);
        history.replace('/jurado');
      } else {
        saveAuth('postulante_data', JSON.stringify(res.postulante));
        history.replace('/postulante');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(msg.replace(/^Error \d+:\s*/, ''));
    } finally {
      setLoading(false);
    }
  };

  // ── Form reutilizable ──────────────────────────────────────────────────────
  const form = (
    <div style={{ width: '100%', maxWidth: isDesktop ? 380 : 440 }}>
      <div style={{ marginBottom: isDesktop ? 36 : 28 }}>
        <h1 style={{ fontSize: isDesktop ? '2rem' : '1.6rem', fontWeight: 700, color: DARK, margin: 0 }}>
          Bienvenido
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#374151', margin: '6px 0 0' }}>
          Ingresá con tu usuario (DNI o nombre de usuario) y contraseña
        </p>
      </div>

      {/* DNI / Usuario */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>DNI o usuario</label>
        <div style={styles.inputWrapper}>
          <IonInput
            value={identifier}
            onIonInput={e => { setIdentifier(e.detail.value ?? ''); setError(''); }}
            placeholder="Ej. 12345678 o admin"
            type="text"
            autocomplete="username"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={styles.input}
          />
        </div>
      </div>

      {/* Contraseña */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>Contraseña</label>
        <div style={styles.inputWrapper}>
          <IonInput
            value={password}
            onIonInput={e => { setPassword(e.detail.value ?? ''); setError(''); }}
            placeholder="••••••••"
            type="password"
            autocomplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={styles.input}
          />
        </div>
      </div>

      {error && (
        <IonText color="danger">
          <p style={{ fontSize: '0.83rem', margin: '0 0 12px', padding: '10px 12px', background: '#fef2f2', borderRadius: 8, color: '#dc2626' }}>
            {error}
          </p>
        </IonText>
      )}

      {/* Recordarme */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <div style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          border: `2px solid ${rememberMe ? ORANGE : '#d1d5db'}`,
          background: rememberMe ? ORANGE : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease', pointerEvents: 'none',
        }}>
          {rememberMe && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#1f2937', userSelect: 'none' }}>Recordarme en este dispositivo</span>
      </label>

      <IonButton expand="block" onClick={handleLogin} disabled={loading} style={styles.submitBtn}>
        {loading ? <><IonSpinner name="crescent" style={{ marginRight: 8 }} />Ingresando…</> : 'Ingresar'}
      </IonButton>

      {/* Recuperar contraseña */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={() => { setShowRecuperar(true); setShowSoporte(false); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.82rem', color: '#374151', textDecoration: 'underline',
          textDecorationStyle: 'dotted', padding: 0,
        }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Modal recuperar contraseña */}
      <IonModal isOpen={showRecuperar} onDidDismiss={() => setShowRecuperar(false)} style={{ '--border-radius': '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
          <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a1c1f 40%, #2a1208 100%)`, padding: '28px 24px 24px', position: 'relative', overflow: 'hidden' }}>
            {/* Formas decorativas */}
            <div style={{ position: 'absolute', top: -15, right: -15, width: 90, height: 90, border: `1.5px solid ${ORANGE}33`, borderRadius: 6, transform: 'rotate(25deg)' }} />
            <div style={{ position: 'absolute', bottom: -10, left: 30, width: 50, height: 50, border: `1px solid #ffffff12`, borderRadius: 4, transform: 'rotate(-18deg)' }} />
            <div style={{ position: 'absolute', top: 10, left: '50%', width: 120, height: 120, background: `${ORANGE}08`, borderRadius: 999, filter: 'blur(40px)' }} />
            <button onClick={() => setShowRecuperar(false)} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 2,
              background: '#ffffff15', border: 'none', color: '#fff', fontSize: '1.2rem',
              cursor: 'pointer', lineHeight: 1, padding: '4px 8px', borderRadius: 8,
            }}>×</button>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.6rem', fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Habisite Design Challenge</p>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>
                Recuperar contraseña
              </h2>
              <p style={{ margin: '6px 0 0', color: '#ffffff66', fontSize: '0.82rem' }}>
                Te enviaremos una nueva contraseña por email
              </p>
            </div>
          </div>
          <div style={{ flex: 1, padding: '24px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
              Ingresá tu DNI y te enviamos una nueva contraseña al email registrado.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>DNI</label>
              <div style={styles.inputWrapper}>
                <IonInput
                  value={dniRecuperar}
                  onIonInput={e => setDniRecuperar(e.detail.value ?? '')}
                  placeholder="Tu número de DNI"
                  type="text"
                  maxlength={8}
                  style={styles.input}
                />
              </div>
            </div>
            <IonButton expand="block" onClick={handleRecuperar} disabled={enviandoClave}
              style={{ '--background': ORANGE, '--border-radius': '10px', height: 48 }}>
              {enviandoClave ? <><IonSpinner name="crescent" style={{ marginRight: 8 }} />Enviando…</> : 'Enviar nueva contraseña'}
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* Link de soporte */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button onClick={() => { setShowSoporte(true); setShowRecuperar(false); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.82rem', color: '#374151', textDecoration: 'underline',
          textDecorationStyle: 'dotted', padding: 0,
        }}>
          ¿No podés ingresar? Solicitá acceso
        </button>
      </div>

      {/* Recordar tutorial */}
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <button onClick={() => {
          localStorage.removeItem('habisite_onboarding_v3');
          localStorage.removeItem('habisite_jurado_onboarding_v2');
          localStorage.removeItem('habisite_onboarding_v2');
          setError('');
          setToastMsg('El tutorial se mostrará al ingresar.');
          setShowToast(true);
        }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.78rem', color: '#6b7280', textDecoration: 'underline',
          textDecorationStyle: 'dotted', padding: 0,
        }}>
          Ver tutorial al ingresar
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: 16 }}>
        Los accesos son gestionados por la organización.
      </p>

      <ModalSoporte isOpen={showSoporte} onClose={() => setShowSoporte(false)} />
      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} position="top" color="medium" />
    </div>
  );

  // ── Vista mobile ───────────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <IonPage>
        <IonContent fullscreen style={{ '--background': '#f4f5f7' }}>
          <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`, padding: '40px 24px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 24, width: 80, height: 80, border: `1.5px solid ${ORANGE}44`, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 60, width: 50, height: 50, border: '1.5px solid #ffffff22', transform: 'rotate(22deg)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.15em', display: 'block' }}>HABISITE</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 500, color: ORANGE, letterSpacing: '0.25em' }}>DESIGN CHALLENGE 2026</span>
              <p style={{ marginTop: 16, fontSize: '1rem', fontWeight: 600, color: '#fff', lineHeight: 1.4, opacity: 0.9 }}>
                "Diseñá el espacio<br />que el futuro necesita."
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 40px' }}>
            {form}
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ── Vista desktop — split diagonal ─────────────────────────────────────────
  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f4f5f7' }}>

          {/* Panel izquierdo oscuro */}
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
              <div style={{ position: 'absolute', top: '28%', left: '18%', width: 90, height: 90, border: '1.5px solid #ffffff22', transform: 'rotate(22deg)' }} />
              <div style={{ position: 'absolute', bottom: '20%', left: '26%', width: 130, height: 130, border: `1.5px solid ${ORANGE}33`, transform: 'rotate(-15deg)' }} />
              <div style={{ maxWidth: '75%' }}>
                <p style={{ fontSize: '0.75rem', color: ORANGE, fontWeight: 600, letterSpacing: '0.2em', marginBottom: 10 }}>2026</p>
                <p style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 16 }}>
                  "Diseñá el espacio<br />que el futuro necesita."
                </p>
                <div style={{ width: 40, height: 2, background: ORANGE, marginBottom: 12 }} />
                <p style={{ fontSize: '0.72rem', color: '#ffffff77', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Arquitectura · Interiores · Paisajismo
                </p>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div style={{ marginLeft: '46%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 40px', zIndex: 2 }}>
            {form}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  inputGroup: { marginBottom: 20 },
  label: {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  inputWrapper: { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  input: {
    '--padding-start': '14px', '--padding-end': '14px',
    '--padding-top': '12px', '--padding-bottom': '12px',
    '--background': 'transparent', '--color': DARK, fontSize: '0.95rem',
  } as React.CSSProperties,
  submitBtn: {
    '--background': ORANGE, '--background-activated': '#cc4b1c',
    '--border-radius': '10px', '--box-shadow': `0 4px 14px ${ORANGE}44`,
    height: 48, fontSize: '0.95rem', fontWeight: 600, marginTop: 8,
  } as React.CSSProperties,
};

export default LoginPage;
