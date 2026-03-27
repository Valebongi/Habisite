// TODO: reemplazar con autenticación JWT real
import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();

  // Estado Admin
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Estado Jurado
  const [juradoNombre, setJuradoNombre] = useState('');
  const [juradoPass, setJuradoPass] = useState('');
  const [juradoLoading, setJuradoLoading] = useState(false);
  const [juradoError, setJuradoError] = useState('');

  // Estado Postulante
  const [dni, setDni] = useState('');
  const [postulanteLoading, setPostulanteLoading] = useState(false);
  const [postulanteError, setPostulanteError] = useState('');

  // ── Credenciales desde .env (VITE_ADMIN_USER, VITE_ADMIN_PASS, VITE_JURADO_PASS)
  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? 'admin';
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS ?? 'habisite2025';
  const JURADO_PASS = import.meta.env.VITE_JURADO_PASS ?? 'jurado2025';

  // ── Login Admin ────────────────────────────────────────────────────────────
  const handleAdminLogin = () => {
    setAdminError('');
    if (adminUser === ADMIN_USER && adminPass === ADMIN_PASS) {
      setAdminLoading(true);
      sessionStorage.setItem('admin_ok', 'true');
      history.push('/admin');
    } else {
      setAdminError('Usuario o contraseña incorrectos.');
    }
  };

  // ── Login Jurado ───────────────────────────────────────────────────────────
  const handleJuradoLogin = () => {
    setJuradoError('');
    if (!juradoNombre.trim()) {
      setJuradoError('Ingresa tu nombre.');
      return;
    }
    if (juradoPass === JURADO_PASS) {
      setJuradoLoading(true);
      sessionStorage.setItem('jurado_nombre', juradoNombre.trim());
      history.push('/jurado');
    } else {
      setJuradoError('Contraseña incorrecta.');
    }
  };

  // ── Login Postulante ───────────────────────────────────────────────────────
  const handlePostulanteLogin = async () => {
    setPostulanteError('');
    if (!dni.trim()) {
      setPostulanteError('Ingresa tu DNI.');
      return;
    }
    setPostulanteLoading(true);
    try {
      const postulante = await api.postulantes.buscarPorDni(dni.trim());
      sessionStorage.setItem('postulante_data', JSON.stringify(postulante));
      history.push('/postulante');
    } catch {
      setPostulanteError('DNI no encontrado. ¿Ya te registraste?');
    } finally {
      setPostulanteLoading(false);
    }
  };

  // ── Toast de bienvenida (opcional) ────────────────────────────────────────
  const showWelcome = () => {
    presentToast({
      message: 'Bienvenido al Habisite Design Challenge',
      duration: 2000,
      color: 'primary',
      position: 'top',
    });
  };

  React.useEffect(() => {
    showWelcome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#f4f5f7' }}>
        {/* Encabezado de marca */}
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px 24px',
            background: 'linear-gradient(135deg, #E85520 0%, #ff7043 100%)',
            color: '#fff',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Habisite
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '1rem' }}>
            Design Challenge — Panel de acceso
          </p>
        </div>

        <IonGrid style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
          <IonRow>
            {/* ── Card Admin ── */}
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ color: '#E85520' }}>Administrador</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="full">
                    <IonLabel position="stacked">Usuario</IonLabel>
                    <IonInput
                      value={adminUser}
                      onIonInput={(e) => setAdminUser(e.detail.value ?? '')}
                      placeholder="admin"
                      type="text"
                      autocomplete="username"
                    />
                  </IonItem>
                  <IonItem lines="full" style={{ marginBottom: 8 }}>
                    <IonLabel position="stacked">Contraseña</IonLabel>
                    <IonInput
                      value={adminPass}
                      onIonInput={(e) => setAdminPass(e.detail.value ?? '')}
                      placeholder="••••••••"
                      type="password"
                      autocomplete="current-password"
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                  </IonItem>
                  {adminError && (
                    <IonText color="danger">
                      <p style={{ fontSize: '0.85rem', margin: '4px 0 8px' }}>{adminError}</p>
                    </IonText>
                  )}
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={handleAdminLogin}
                    disabled={adminLoading}
                    style={{ marginTop: 8 }}
                  >
                    {adminLoading ? 'Ingresando…' : 'Ingresar como Admin'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* ── Card Jurado ── */}
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ color: '#E85520' }}>Jurado</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="full">
                    <IonLabel position="stacked">Tu nombre</IonLabel>
                    <IonInput
                      value={juradoNombre}
                      onIonInput={(e) => setJuradoNombre(e.detail.value ?? '')}
                      placeholder="Ej. María García"
                      type="text"
                    />
                  </IonItem>
                  <IonItem lines="full" style={{ marginBottom: 8 }}>
                    <IonLabel position="stacked">Contraseña</IonLabel>
                    <IonInput
                      value={juradoPass}
                      onIonInput={(e) => setJuradoPass(e.detail.value ?? '')}
                      placeholder="••••••••"
                      type="password"
                      onKeyDown={(e) => e.key === 'Enter' && handleJuradoLogin()}
                    />
                  </IonItem>
                  {juradoError && (
                    <IonText color="danger">
                      <p style={{ fontSize: '0.85rem', margin: '4px 0 8px' }}>{juradoError}</p>
                    </IonText>
                  )}
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={handleJuradoLogin}
                    disabled={juradoLoading}
                    style={{ marginTop: 8 }}
                  >
                    {juradoLoading ? 'Ingresando…' : 'Ingresar como Jurado'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* ── Card Postulante ── */}
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ color: '#E85520' }}>Postulante</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="full" style={{ marginBottom: 8 }}>
                    <IonLabel position="stacked">Tu DNI</IonLabel>
                    <IonInput
                      value={dni}
                      onIonInput={(e) => setDni(e.detail.value ?? '')}
                      placeholder="12345678"
                      type="text"
                      maxlength={8}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostulanteLogin()}
                    />
                  </IonItem>
                  {postulanteError && (
                    <IonText color="danger">
                      <p style={{ fontSize: '0.85rem', margin: '4px 0 8px' }}>{postulanteError}</p>
                    </IonText>
                  )}
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={handlePostulanteLogin}
                    disabled={postulanteLoading}
                    style={{ marginTop: 8 }}
                  >
                    {postulanteLoading ? 'Buscando…' : 'Ingresar con DNI'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Enlace a registro */}
          <IonRow>
            <IonCol style={{ textAlign: 'center', padding: '16px 0 32px' }}>
              <IonText color="medium">
                <span>¿Aún no te registraste? </span>
              </IonText>
              <IonButton
                fill="clear"
                color="primary"
                routerLink="/registro"
                style={{ '--padding-start': '4px', '--padding-end': '4px' }}
              >
                Regístrate aquí
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
