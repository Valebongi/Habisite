import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonSpinner, IonButton } from '@ionic/react';
import { useLocation } from 'react-router-dom';

const ORANGE = '#E85520';
const DARK = '#0d0e10';
const BASE_URL = `${import.meta.env.VITE_API_URL || 'https://api.habisite.com/api'}/v1`;

type Estado = 'loading' | 'success' | 'error';

const BajaPage: React.FC = () => {
  const location = useLocation();
  const [estado, setEstado] = useState<Estado>('loading');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) { setEstado('error'); setMensaje('Enlace inválido.'); return; }

    fetch(`${BASE_URL}/baja?token=${token}`)
      .then(async r => {
        const data = await r.json();
        if (data.baja) { setEstado('success'); setMensaje(data.mensaje); }
        else { setEstado('error'); setMensaje(data.mensaje); }
      })
      .catch(() => { setEstado('error'); setMensaje('Error al procesar la baja.'); });
  }, [location.search]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`, padding: '28px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, border: `1.5px solid ${ORANGE}33`, transform: 'rotate(20deg)' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.12em', position: 'relative', zIndex: 1 }}>HABISITE</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: ORANGE, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 4, position: 'relative', zIndex: 1 }}>Baja del concurso</div>
            </div>
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              {estado === 'loading' && <>
                <IonSpinner style={{ width: 40, height: 40, marginBottom: 16 }} />
                <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>Procesando tu solicitud...</p>
              </>}
              {estado === 'success' && <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
                  <span style={{ color: '#16a34a' }}>&#10003;</span>
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: DARK }}>Baja confirmada</h2>
                <p style={{ margin: '0 0 20px', fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>{mensaje}</p>
                <IonButton routerLink="/login" fill="outline" color="medium" style={{ '--border-radius': '10px' }}>Volver al inicio</IonButton>
              </>}
              {estado === 'error' && <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', border: '3px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>
                  <span style={{ color: '#dc2626' }}>&times;</span>
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 700, color: DARK }}>Error</h2>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6 }}>{mensaje}</p>
              </>}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BajaPage;
