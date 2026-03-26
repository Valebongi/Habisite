import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import {
  personOutline,
  createOutline,
  starOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, Postulante, PostulanteRequest, Evaluacion } from '../../services/api';

// ─── Constantes compartidas ───────────────────────────────────────────────────
const ESPECIALIDADES = [
  'Arquitectura',
  'Diseño de Interiores',
  'Diseño Industrial',
  'Paisajismo',
  'Otro',
];

const CODIGOS_PAIS = [
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

// ─── Guard de sesión ──────────────────────────────────────────────────────────
const usePostulanteGuard = () => {
  const history = useHistory();
  useEffect(() => {
    if (!sessionStorage.getItem('postulante_data')) {
      history.replace('/login');
    }
  }, [history]);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPostulanteFromSession = (): Postulante | null => {
  const raw = sessionStorage.getItem('postulante_data');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Postulante;
  } catch {
    return null;
  }
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

// ─── Tab: Mi postulación ──────────────────────────────────────────────────────
const MiPostulacionTab: React.FC = () => {
  usePostulanteGuard();
  const postulante = getPostulanteFromSession();

  if (!postulante) {
    return (
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ padding: 24 }}>
          <IonText color="danger">
            <p>No se encontraron datos de postulante. Por favor inicia sesión nuevamente.</p>
          </IonText>
        </div>
      </IonContent>
    );
  }

  const campos: Array<{ label: string; valor: string }> = [
    { label: 'Nombres', valor: postulante.nombres },
    { label: 'Apellidos', valor: postulante.apellidos },
    { label: 'DNI', valor: postulante.dni },
    { label: 'Celular', valor: postulante.celular },
    { label: 'Universidad', valor: postulante.universidad },
    { label: 'Correo electrónico', valor: postulante.correoElectronico },
    { label: 'Especialidad', valor: postulante.especialidad },
    { label: 'Fecha de registro', valor: formatFecha(postulante.creadoEn) },
  ];

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      <IonCard style={{ maxWidth: 600, margin: '16px auto' }}>
        <IonCardHeader>
          <IonCardTitle style={{ color: '#E85520' }}>Mis datos de postulación</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ padding: 0 }}>
          <IonList>
            {campos.map(({ label, valor }) => (
              <IonItem key={label} lines="full">
                <IonLabel>
                  <p style={{ fontSize: '0.78rem', color: '#92949c', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontWeight: 500, color: '#111827' }}>{valor}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

// ─── Tab: Editar datos ────────────────────────────────────────────────────────
const EditarTab: React.FC = () => {
  usePostulanteGuard();
  const postulante = getPostulanteFromSession();

  // Separar código de país del número al cargar
  const parseCelular = (celular: string) => {
    for (const cp of CODIGOS_PAIS) {
      if (celular.startsWith(cp.value)) {
        return { codigo: cp.value, numero: celular.slice(cp.value.length) };
      }
    }
    return { codigo: '+51', numero: celular };
  };

  const celularParsed = parseCelular(postulante?.celular ?? '');

  const [nombres, setNombres] = useState(postulante?.nombres ?? '');
  const [apellidos, setApellidos] = useState(postulante?.apellidos ?? '');
  const [codigoPais, setCodigoPais] = useState(celularParsed.codigo);
  const [numeroCelular, setNumeroCelular] = useState(celularParsed.numero);
  const [universidad, setUniversidad] = useState(postulante?.universidad ?? '');
  const [correoElectronico, setCorreoElectronico] = useState(postulante?.correoElectronico ?? '');
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

  if (!postulante) {
    return (
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ padding: 24 }}>
          <IonText color="danger"><p>Sesión expirada.</p></IonText>
        </div>
      </IonContent>
    );
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombres || !apellidos || !numeroCelular || !universidad || !correoElectronico || !especialidad) {
      setError('Por favor completa todos los campos.');
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
      dni: postulante.dni, // DNI no se modifica
      celular: celularCompleto,
      universidad: universidad.trim(),
      correoElectronico: correoElectronico.trim(),
      especialidad: especialidadFinal,
    };

    setLoading(true);
    try {
      const actualizado = await api.postulantes.actualizar(postulante.id, payload);
      // Actualizar sessionStorage con los datos nuevos
      sessionStorage.setItem('postulante_data', JSON.stringify(actualizado));
      setToastMsg('Datos actualizados correctamente.');
      setToastColor('success');
      setShowToast(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar cambios.';
      setError(msg);
      setToastMsg(msg);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      <IonCard style={{ maxWidth: 600, margin: '16px auto' }}>
        <IonCardHeader>
          <IonCardTitle style={{ color: '#E85520' }}>Editar mis datos</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form onSubmit={handleGuardar} noValidate>
            <IonItem lines="full">
              <IonLabel position="stacked">Nombres</IonLabel>
              <IonInput value={nombres} onIonInput={(e) => setNombres(e.detail.value ?? '')} type="text" />
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked">Apellidos</IonLabel>
              <IonInput value={apellidos} onIonInput={(e) => setApellidos(e.detail.value ?? '')} type="text" />
            </IonItem>

            {/* DNI solo lectura */}
            <IonItem lines="full">
              <IonLabel position="stacked">DNI (no modificable)</IonLabel>
              <IonInput value={postulante.dni} readonly style={{ color: '#92949c' }} />
            </IonItem>

            {/* Celular */}
            <IonItem lines="full">
              <IonLabel position="stacked">Celular</IonLabel>
              <div style={{ display: 'flex', gap: 8, width: '100%', paddingTop: 6 }}>
                <IonSelect
                  value={codigoPais}
                  onIonChange={(e) => setCodigoPais(e.detail.value)}
                  interface="popover"
                  style={{ minWidth: 120, flex: '0 0 auto' }}
                >
                  {CODIGOS_PAIS.map((c) => (
                    <IonSelectOption key={c.value} value={c.value}>{c.label}</IonSelectOption>
                  ))}
                </IonSelect>
                <IonInput
                  value={numeroCelular}
                  onIonInput={(e) => setNumeroCelular(e.detail.value ?? '')}
                  type="tel"
                  style={{ flex: 1 }}
                />
              </div>
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked">Universidad</IonLabel>
              <IonInput value={universidad} onIonInput={(e) => setUniversidad(e.detail.value ?? '')} type="text" />
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked">Correo electrónico</IonLabel>
              <IonInput value={correoElectronico} onIonInput={(e) => setCorreoElectronico(e.detail.value ?? '')} type="email" />
            </IonItem>

            <IonItem lines={especialidad === 'Otro' ? 'full' : 'none'}>
              <IonLabel position="stacked">Especialidad</IonLabel>
              <IonSelect
                value={especialidad}
                onIonChange={(e) => setEspecialidad(e.detail.value)}
                interface="action-sheet"
              >
                {ESPECIALIDADES.map((esp) => (
                  <IonSelectOption key={esp} value={esp}>{esp}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            {especialidad === 'Otro' && (
              <IonItem lines="none">
                <IonLabel position="stacked">¿Cuál es tu especialidad?</IonLabel>
                <IonInput
                  value={especialidadOtro}
                  onIonInput={(e) => setEspecialidadOtro(e.detail.value ?? '')}
                  placeholder="Especifica tu especialidad"
                  type="text"
                />
              </IonItem>
            )}

            {error && (
              <IonText color="danger">
                <p style={{ fontSize: '0.85rem', margin: '8px 0' }}>{error}</p>
              </IonText>
            )}

            <IonButton expand="block" color="primary" type="submit" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: 8 }} />
                  Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMsg}
        duration={2500}
        color={toastColor}
        position="top"
      />
    </IonContent>
  );
};

// ─── Tab: Mis evaluaciones ────────────────────────────────────────────────────
const EvaluacionesTab: React.FC = () => {
  usePostulanteGuard();
  const postulante = getPostulanteFromSession();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!postulante) return;
    api.evaluaciones
      .listarPorPostulante(postulante.id)
      .then(setEvaluaciones)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar evaluaciones';
        setError(msg);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promedio =
    evaluaciones.length > 0
      ? (evaluaciones.reduce((acc, ev) => acc + ev.puntaje, 0) / evaluaciones.length).toFixed(1)
      : null;

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      )}

      {error && (
        <div style={{ padding: 16 }}>
          <IonText color="danger"><p>{error}</p></IonText>
        </div>
      )}

      {!loading && !error && evaluaciones.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <IonText color="medium">
            <p style={{ fontSize: '1rem' }}>No hay evaluaciones aún</p>
            <p style={{ fontSize: '0.85rem' }}>El jurado aún no ha evaluado tu postulación.</p>
          </IonText>
        </div>
      )}

      {!loading && !error && evaluaciones.length > 0 && (
        <>
          {/* Promedio destacado */}
          <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
            <p style={{ margin: 0, color: '#92949c', fontSize: '0.9rem' }}>Puntaje promedio</p>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#E85520', lineHeight: 1.1 }}>
              {promedio}
            </span>
            <span style={{ fontSize: '1.2rem', color: '#92949c' }}>/10</span>
            <p style={{ margin: '4px 0 0', color: '#92949c', fontSize: '0.85rem' }}>
              basado en {evaluaciones.length} evaluación{evaluaciones.length !== 1 ? 'es' : ''}
            </p>
          </div>

          <IonList style={{ background: 'transparent', padding: '0 8px 16px' }}>
            {evaluaciones.map((ev) => (
              <IonCard key={ev.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ev.juradoNombre}</h2>
                    {ev.comentario && (
                      <p style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>{ev.comentario}</p>
                    )}
                    <p style={{ color: '#92949c', fontSize: '0.78rem', marginTop: 4 }}>
                      {formatFecha(ev.evaluadoEn)}
                    </p>
                  </IonLabel>
                  <div slot="end" style={{ textAlign: 'center', minWidth: 52 }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#E85520' }}>
                      {ev.puntaje}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#92949c' }}>/10</span>
                  </div>
                </IonItem>
              </IonCard>
            ))}
          </IonList>
        </>
      )}
    </IonContent>
  );
};

// ─── PostulantePage principal con Tabs ────────────────────────────────────────
const PostulantePage: React.FC = () => {
  const history = useHistory();
  const postulante = getPostulanteFromSession();
  const nombre = postulante ? `${postulante.nombres}` : 'Postulante';

  const handleLogout = () => {
    sessionStorage.removeItem('postulante_data');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Hola, {nombre}</IonTitle>
          <IonButtons slot="end">
            <IonButton color="light" fill="clear" onClick={handleLogout}>
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/postulante/mi-postulacion" render={() => <IonTab tab="mi-postulacion"><MiPostulacionTab /></IonTab>} />
          <Route exact path="/postulante/editar" render={() => <IonTab tab="editar"><EditarTab /></IonTab>} />
          <Route exact path="/postulante/evaluaciones" render={() => <IonTab tab="evaluaciones"><EvaluacionesTab /></IonTab>} />
          <Route exact path="/postulante">
            <Redirect to="/postulante/mi-postulacion" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="mi-postulacion" href="/postulante/mi-postulacion">
            <IonIcon icon={personOutline} />
            <IonLabel>Mi postulación</IonLabel>
          </IonTabButton>
          <IonTabButton tab="editar" href="/postulante/editar">
            <IonIcon icon={createOutline} />
            <IonLabel>Editar</IonLabel>
          </IonTabButton>
          <IonTabButton tab="evaluaciones" href="/postulante/evaluaciones">
            <IonIcon icon={starOutline} />
            <IonLabel>Evaluaciones</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default PostulantePage;
