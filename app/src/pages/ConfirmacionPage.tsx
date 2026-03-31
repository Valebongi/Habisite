import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonInput, IonSelect, IonSelectOption, IonButton, IonSpinner, IonToast } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const ORANGE = '#E85520';
const DARK = '#0d0e10';

const ESPECIALIDADES = ['Arquitectura', 'Diseño de Interiores', 'Diseño Industrial', 'Paisajismo', 'Otro'];
const CODIGOS_PAIS = [
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

type Estado = 'form' | 'loading' | 'submitting' | 'success' | 'already' | 'error';

const ConfirmacionPage: React.FC = () => {
  const location = useLocation();
  const [estado, setEstado] = useState<Estado>('loading');
  const [mensaje, setMensaje] = useState('');
  const [token, setToken] = useState('');

  // Form fields
  const [dni, setDni] = useState('');
  const [codigoPais, setCodigoPais] = useState('+54');
  const [numeroCelular, setNumeroCelular] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [especialidadOtro, setEspecialidadOtro] = useState('');
  const [aceptaBases, setAceptaBases] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');

    if (!t) {
      setEstado('error');
      setMensaje('No se encontró un token de confirmación en el enlace.');
      return;
    }

    setToken(t);

    // Verificar si el token es válido y no fue usado
    api.confirmacion.verificar(t)
      .then(res => {
        if (res.confirmado) {
          setEstado('already');
          setMensaje('Tu participación ya fue confirmada anteriormente.');
        } else {
          setEstado('form');
        }
      })
      .catch(() => {
        // Si no existe endpoint de verificar, mostrar el form directamente
        setEstado('form');
      });
  }, [location.search]);

  const handleSubmit = async () => {
    setError('');
    if (!dni.trim() || dni.trim().length < 7) {
      setError('Ingresá un DNI válido (mínimo 7 dígitos).'); return;
    }
    if (!numeroCelular.trim()) {
      setError('Ingresá tu número de celular.'); return;
    }
    if (!especialidad) {
      setError('Seleccioná tu especialidad.'); return;
    }
    if (especialidad === 'Otro' && !especialidadOtro.trim()) {
      setError('Especificá tu especialidad.'); return;
    }
    if (!aceptaBases) {
      setError('Debés aceptar las bases y condiciones para inscribirte.'); return;
    }

    setEstado('submitting');
    try {
      const body = {
        token,
        dni: dni.trim(),
        celular: `${codigoPais}${numeroCelular.trim()}`,
        especialidad: especialidad === 'Otro' ? especialidadOtro.trim() : especialidad,
      };
      const res = await api.confirmacion.confirmarConDatos(body);
      setEstado('success');
      setMensaje(res.mensaje || 'Tu inscripción oficial fue confirmada exitosamente.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('ya') || msg.includes('already')) {
        setEstado('already');
        setMensaje('Tu participación ya fue confirmada anteriormente.');
      } else {
        setEstado('form');
        setError(msg || 'Error al confirmar. Intentá de nuevo.');
        setToastMsg(msg || 'Error al confirmar.');
        setShowToast(true);
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY>
        <div style={{
          minHeight: '100vh', background: '#f4f5f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`,
              padding: '28px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, border: `1.5px solid ${ORANGE}33`, transform: 'rotate(20deg)' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.12em', position: 'relative', zIndex: 1 }}>
                HABISITE
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: ORANGE, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 4, position: 'relative', zIndex: 1 }}>
                Inscripción oficial
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 32px 28px' }}>

              {/* Loading */}
              {estado === 'loading' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <IonSpinner style={{ width: 40, height: 40, marginBottom: 16 }} />
                  <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>Verificando enlace...</p>
                </div>
              )}

              {/* Form */}
              {estado === 'form' && (
                <>
                  <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700, color: DARK }}>
                    Completá tus datos
                  </h2>
                  <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5 }}>
                    Para confirmar tu inscripción oficial al Habisite Design Challenge, necesitamos los siguientes datos.
                  </p>

                  {/* DNI */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={sty.label}>DNI <span style={{ color: ORANGE }}>*</span></label>
                    <div style={sty.inputWrap}>
                      <IonInput value={dni} onIonInput={e => { setDni(e.detail.value ?? ''); setError(''); }}
                        placeholder="12345678" type="text" maxlength={8} style={sty.input} />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>
                      Tu DNI será tu usuario de acceso a la plataforma.
                    </p>
                  </div>

                  {/* Celular */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={sty.label}>Celular <span style={{ color: ORANGE }}>*</span></label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IonSelect value={codigoPais} onIonChange={e => setCodigoPais(e.detail.value)} interface="popover"
                        style={{ minWidth: 110, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, '--padding-start': '10px', flexShrink: 0 }}>
                        {CODIGOS_PAIS.map(c => <IonSelectOption key={c.value} value={c.value}>{c.label}</IonSelectOption>)}
                      </IonSelect>
                      <div style={{ ...sty.inputWrap, flex: 1 }}>
                        <IonInput value={numeroCelular} onIonInput={e => { setNumeroCelular(e.detail.value ?? ''); setError(''); }}
                          placeholder="1155443322" type="tel" style={sty.input} />
                      </div>
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={sty.label}>Especialidad <span style={{ color: ORANGE }}>*</span></label>
                    <IonSelect value={especialidad} onIonChange={e => { setEspecialidad(e.detail.value); setError(''); }}
                      placeholder="Seleccioná" interface="action-sheet"
                      style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, '--padding-start': '14px', width: '100%' }}>
                      {ESPECIALIDADES.map(esp => <IonSelectOption key={esp} value={esp}>{esp}</IonSelectOption>)}
                    </IonSelect>
                  </div>

                  {especialidad === 'Otro' && (
                    <div style={{ marginBottom: 18 }}>
                      <label style={sty.label}>¿Cuál especialidad?</label>
                      <div style={sty.inputWrap}>
                        <IonInput value={especialidadOtro} onIonInput={e => setEspecialidadOtro(e.detail.value ?? '')}
                          placeholder="Ingeniería civil, Urbanismo, etc." type="text" style={sty.input} />
                      </div>
                    </div>
                  )}

                  {/* Aceptación de bases */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, margin: '20px 0 16px',
                    cursor: 'pointer', padding: '14px 16px', background: '#f9fafb', borderRadius: 10,
                    border: `1.5px solid ${aceptaBases ? ORANGE : '#e5e7eb'}`,
                    transition: 'border-color 0.15s',
                  }} onClick={() => { setAceptaBases(a => !a); setError(''); }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      border: `2px solid ${aceptaBases ? ORANGE : '#d1d5db'}`,
                      background: aceptaBases ? ORANGE : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}>
                      {aceptaBases && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>
                        Acepto las bases y condiciones
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
                        Declaro haber leído las bases del concurso y acepto los términos de participación
                        del Habisite Design Challenge 2026.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>
                      {error}
                    </p>
                  )}

                  <IonButton expand="block" onClick={handleSubmit} style={{
                    '--background': ORANGE, '--background-activated': '#cc4b1c',
                    '--border-radius': '10px', '--box-shadow': `0 4px 14px ${ORANGE}44`,
                    height: 48, fontSize: '0.95rem', fontWeight: 600, marginTop: 8,
                  }}>
                    Confirmar mi inscripción
                  </IonButton>
                </>
              )}

              {/* Submitting */}
              {estado === 'submitting' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <IonSpinner style={{ width: 40, height: 40, marginBottom: 16 }} />
                  <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>Confirmando tu inscripción...</p>
                </div>
              )}

              {/* Success */}
              {estado === 'success' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#f0fdf4', border: '3px solid #16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '2rem',
                  }}>
                    <span style={{ color: '#16a34a' }}>&#10003;</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: DARK }}>
                    Inscripción confirmada
                  </h2>
                  <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                  <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                      <strong>Revisá tu email.</strong> Te enviamos tus credenciales de acceso, información
                      sobre el próximo webinar y el enlace para unirte al canal de comunicación oficial.
                    </p>
                  </div>
                </div>
              )}

              {/* Already confirmed */}
              {estado === 'already' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#eff6ff', border: '3px solid #3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '1.6rem',
                  }}>
                    <span style={{ color: '#3b82f6' }}>i</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: DARK }}>
                    Ya estás confirmado
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                </div>
              )}

              {/* Error */}
              {estado === 'error' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#fef2f2', border: '3px solid #dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '1.8rem',
                  }}>
                    <span style={{ color: '#dc2626' }}>&times;</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: DARK }}>
                    Enlace inválido
                  </h2>
                  <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>
                    Si creés que esto es un error, contactanos respondiendo al email que recibiste.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '14px 32px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                Habisite Design Challenge 2026
              </p>
            </div>
          </div>
        </div>
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={3000} color="danger" position="top" />
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
};

export default ConfirmacionPage;
