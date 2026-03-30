import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

type Estado = 'loading' | 'success' | 'error' | 'already';

const ConfirmacionPage: React.FC = () => {
  const location = useLocation();
  const [estado, setEstado] = useState<Estado>('loading');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setEstado('error');
      setMensaje('No se encontro un token de confirmacion en el enlace.');
      return;
    }

    api.confirmacion.confirmar(token)
      .then(res => {
        setEstado('success');
        setMensaje(res.mensaje);
      })
      .catch(err => {
        const msg = err?.message ?? '';
        if (msg.includes('ya') || msg.includes('already')) {
          setEstado('already');
          setMensaje('Tu participacion ya fue confirmada anteriormente.');
        } else {
          setEstado('error');
          setMensaje('El enlace de confirmacion no es valido o ya fue utilizado.');
        }
      });
  }, [location.search]);

  const C = {
    orange: '#E85520',
    dark: '#111827',
    bg: '#f4f5f7',
  };

  return (
    <IonPage>
      <IonContent>
        <div style={{
          minHeight: '100vh', background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0d0e10 0%, #2a1208 100%)',
              padding: '28px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.12em' }}>
                HABISITE
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: C.orange, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 4 }}>
                Confirmacion de participacion
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              {estado === 'loading' && (
                <>
                  <IonSpinner style={{ width: 40, height: 40, marginBottom: 16 }} />
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>Confirmando tu participacion...</p>
                </>
              )}

              {estado === 'success' && (
                <>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#f0fdf4', border: '3px solid #16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '2rem',
                  }}>
                    <span style={{ color: '#16a34a' }}>&#10003;</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: C.dark }}>
                    Inscripcion confirmada
                  </h2>
                  <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                  <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                      <strong>Revisa tu email.</strong> Te enviamos informacion sobre el proximo webinar
                      y el enlace para unirte al canal de comunicacion oficial.
                    </p>
                  </div>
                </>
              )}

              {estado === 'already' && (
                <>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#eff6ff', border: '3px solid #3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '1.6rem',
                  }}>
                    <span style={{ color: '#3b82f6' }}>i</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: C.dark }}>
                    Ya estas confirmado
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                </>
              )}

              {estado === 'error' && (
                <>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#fef2f2', border: '3px solid #dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '1.8rem',
                  }}>
                    <span style={{ color: '#dc2626' }}>&times;</span>
                  </div>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: C.dark }}>
                    Enlace invalido
                  </h2>
                  <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>
                    {mensaje}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>
                    Si crees que esto es un error, contactanos respondiendo al email que recibiste.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              background: '#f8fafc', borderTop: '1px solid #e2e8f0',
              padding: '14px 32px', textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                Habisite Design Challenge
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionPage;
