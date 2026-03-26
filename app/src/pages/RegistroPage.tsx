import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonText,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api, PostulanteRequest } from '../services/api';

// Opciones de especialidad
const ESPECIALIDADES = [
  'Arquitectura',
  'Diseño de Interiores',
  'Diseño Industrial',
  'Paisajismo',
  'Otro',
];

// Prefijos telefónicos comunes
const CODIGOS_PAIS = [
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

const RegistroPage: React.FC = () => {
  const history = useHistory();

  // Campos del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [codigoPais, setCodigoPais] = useState('+51');
  const [numeroCelular, setNumeroCelular] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [especialidadOtro, setEspecialidadOtro] = useState('');

  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');

  const mostrarToast = (msg: string, color: 'success' | 'danger') => {
    setToastMsg(msg);
    setToastColor(color);
    setShowToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!nombres || !apellidos || !dni || !numeroCelular || !universidad || !correoElectronico || !especialidad) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (especialidad === 'Otro' && !especialidadOtro.trim()) {
      setError('Por favor especifica tu especialidad.');
      return;
    }

    const celularCompleto = `${codigoPais}${numeroCelular}`;
    const especialidadFinal = especialidad === 'Otro' ? especialidadOtro.trim() : especialidad;

    const payload: PostulanteRequest = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim(),
      celular: celularCompleto,
      universidad: universidad.trim(),
      correoElectronico: correoElectronico.trim(),
      especialidad: especialidadFinal,
    };

    setLoading(true);
    try {
      await api.postulantes.registrar(payload);
      mostrarToast('¡Registro exitoso! Ya puedes ingresar con tu DNI.', 'success');
      // Redirigir al login después de 2 segundos
      setTimeout(() => history.push('/login'), 2200);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al registrar. Intenta de nuevo.';
      mostrarToast(mensaje, 'danger');
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" text="Volver" />
          </IonButtons>
          <IonTitle>Registro de Postulante</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4f5f7' }}>
        {/* Subtítulo decorativo */}
        <div style={{ textAlign: 'center', padding: '20px 16px 4px' }}>
          <IonText color="medium">
            <p style={{ margin: 0 }}>Completa tus datos para postular al Habisite Design Challenge</p>
          </IonText>
        </div>

        <IonCard style={{ maxWidth: 600, margin: '16px auto' }}>
          <IonCardContent>
            <form onSubmit={handleSubmit} noValidate>
              {/* Nombres */}
              <IonItem lines="full">
                <IonLabel position="stacked">Nombres <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonInput
                  value={nombres}
                  onIonInput={(e) => setNombres(e.detail.value ?? '')}
                  placeholder="Ej. Juan Carlos"
                  type="text"
                  required
                />
              </IonItem>

              {/* Apellidos */}
              <IonItem lines="full">
                <IonLabel position="stacked">Apellidos <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonInput
                  value={apellidos}
                  onIonInput={(e) => setApellidos(e.detail.value ?? '')}
                  placeholder="Ej. Pérez López"
                  type="text"
                  required
                />
              </IonItem>

              {/* DNI */}
              <IonItem lines="full">
                <IonLabel position="stacked">DNI <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonInput
                  value={dni}
                  onIonInput={(e) => setDni(e.detail.value ?? '')}
                  placeholder="12345678"
                  type="text"
                  maxlength={8}
                  required
                />
              </IonItem>

              {/* Celular con código de país */}
              <IonItem lines="full">
                <IonLabel position="stacked">Celular <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <div style={{ display: 'flex', gap: 8, width: '100%', paddingTop: 6 }}>
                  <IonSelect
                    value={codigoPais}
                    onIonChange={(e) => setCodigoPais(e.detail.value)}
                    interface="popover"
                    style={{ minWidth: 120, flex: '0 0 auto' }}
                  >
                    {CODIGOS_PAIS.map((c) => (
                      <IonSelectOption key={c.value} value={c.value}>
                        {c.label}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonInput
                    value={numeroCelular}
                    onIonInput={(e) => setNumeroCelular(e.detail.value ?? '')}
                    placeholder="987654321"
                    type="tel"
                    style={{ flex: 1 }}
                  />
                </div>
              </IonItem>

              {/* Universidad */}
              <IonItem lines="full">
                <IonLabel position="stacked">Universidad <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonInput
                  value={universidad}
                  onIonInput={(e) => setUniversidad(e.detail.value ?? '')}
                  placeholder="Ej. Universidad Nacional de Ingeniería"
                  type="text"
                  required
                />
              </IonItem>

              {/* Correo electrónico */}
              <IonItem lines="full">
                <IonLabel position="stacked">Correo electrónico <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonInput
                  value={correoElectronico}
                  onIonInput={(e) => setCorreoElectronico(e.detail.value ?? '')}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  required
                />
              </IonItem>

              {/* Especialidad */}
              <IonItem lines={especialidad === 'Otro' ? 'full' : 'none'}>
                <IonLabel position="stacked">Especialidad <span style={{ color: '#E85520' }}>*</span></IonLabel>
                <IonSelect
                  value={especialidad}
                  onIonChange={(e) => setEspecialidad(e.detail.value)}
                  placeholder="Selecciona una especialidad"
                  interface="action-sheet"
                >
                  {ESPECIALIDADES.map((esp) => (
                    <IonSelectOption key={esp} value={esp}>
                      {esp}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {/* Campo extra si eligió "Otro" */}
              {especialidad === 'Otro' && (
                <IonItem lines="none">
                  <IonLabel position="stacked">¿Cuál es tu especialidad? <span style={{ color: '#E85520' }}>*</span></IonLabel>
                  <IonInput
                    value={especialidadOtro}
                    onIonInput={(e) => setEspecialidadOtro(e.detail.value ?? '')}
                    placeholder="Especifica tu especialidad"
                    type="text"
                  />
                </IonItem>
              )}

              {/* Mensaje de error */}
              {error && (
                <IonText color="danger">
                  <p style={{ fontSize: '0.85rem', margin: '12px 0 4px', padding: '0 4px' }}>{error}</p>
                </IonText>
              )}

              {/* Botón de envío */}
              <IonButton
                expand="block"
                color="primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: 20 }}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: 8 }} />
                    Registrando…
                  </>
                ) : (
                  'Registrarme'
                )}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        {/* Toast de feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMsg}
          duration={2500}
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default RegistroPage;
