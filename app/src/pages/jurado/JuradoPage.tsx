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
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonBadge,
  IonChip,
  IonText,
  IonSpinner,
  IonModal,
  IonTextarea,
  IonToolbar as IonModalToolbar,
  IonTitle as IonModalTitle,
  useIonToast,
} from '@ionic/react';
import { listOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, Postulante, Evaluacion, EvaluacionRequest } from '../../services/api';

// ─── Guard de sesión ──────────────────────────────────────────────────────────
const useJuradoGuard = () => {
  const history = useHistory();
  useEffect(() => {
    if (!sessionStorage.getItem('jurado_nombre')) {
      history.replace('/login');
    }
  }, [history]);
};

// ─── Modal de evaluación ──────────────────────────────────────────────────────
interface ModalEvaluarProps {
  postulante: Postulante;
  juradoNombre: string;
  onClose: () => void;
  onGuardado: () => void;
}

const ModalEvaluar: React.FC<ModalEvaluarProps> = ({ postulante, juradoNombre, onClose, onGuardado }) => {
  const [puntaje, setPuntaje] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [presentToast] = useIonToast();

  const handleGuardar = async () => {
    if (puntaje === null) {
      presentToast({ message: 'Selecciona un puntaje del 1 al 10.', duration: 2000, color: 'warning', position: 'top' });
      return;
    }
    setLoading(true);
    const payload: EvaluacionRequest = {
      postulanteId: postulante.id,
      juradoNombre,
      puntaje,
      comentario: comentario.trim(),
    };
    try {
      await api.evaluaciones.crear(payload);
      presentToast({ message: 'Evaluación guardada correctamente.', duration: 2000, color: 'success', position: 'top' });
      onGuardado();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la evaluación.';
      presentToast({ message: msg, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IonModalToolbar color="primary">
        <IonModalTitle>Evaluar postulante</IonModalTitle>
        <IonButtons slot="end">
          <IonButton fill="clear" color="light" onClick={onClose}>Cancelar</IonButton>
        </IonButtons>
      </IonModalToolbar>

      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: '0 0 4px', fontWeight: 600 }}>
            {postulante.nombres} {postulante.apellidos}
          </h2>
          <p style={{ margin: '0 0 20px', color: '#92949c' }}>{postulante.universidad}</p>

          {/* Selector de puntaje 1-10 */}
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Puntaje:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <IonChip
                key={n}
                color={puntaje === n ? 'primary' : 'medium'}
                onClick={() => setPuntaje(n)}
                style={{
                  cursor: 'pointer',
                  fontWeight: puntaje === n ? 700 : 400,
                  minWidth: 44,
                  justifyContent: 'center',
                }}
              >
                {n}
              </IonChip>
            ))}
          </div>

          {/* Comentario */}
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Comentario (opcional):</p>
          <IonTextarea
            value={comentario}
            onIonInput={(e) => setComentario(e.detail.value ?? '')}
            placeholder="Escribe tus observaciones sobre el postulante…"
            rows={4}
            style={{
              '--background': '#fff',
              '--border-radius': '8px',
              '--padding-start': '12px',
              '--padding-end': '12px',
              '--padding-top': '10px',
              '--padding-bottom': '10px',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
            }}
          />

          <IonButton
            expand="block"
            color="primary"
            onClick={handleGuardar}
            disabled={loading}
            style={{ marginTop: 24 }}
          >
            {loading ? (
              <>
                <IonSpinner name="crescent" style={{ marginRight: 8 }} />
                Guardando…
              </>
            ) : (
              'Guardar evaluación'
            )}
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

// ─── Tab: Por evaluar ─────────────────────────────────────────────────────────
const PendientesTab: React.FC = () => {
  useJuradoGuard();
  const juradoNombre = sessionStorage.getItem('jurado_nombre') ?? '';
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalPostulante, setModalPostulante] = useState<Postulante | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [ps, evs] = await Promise.all([
        api.postulantes.listar(),
        api.evaluaciones.listar(),
      ]);
      setPostulantes(ps);
      setEvaluaciones(evs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Determina si este jurado ya evaluó a un postulante
  const yaEvaluado = (postulanteId: number) =>
    evaluaciones.some(
      (ev) =>
        ev.postulanteId === postulanteId &&
        ev.juradoNombre.toLowerCase() === juradoNombre.toLowerCase()
    );

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      )}

      {error && (
        <div style={{ padding: 16 }}>
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        </div>
      )}

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '8px' }}>
          {postulantes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <IonText color="medium">
                <p>No hay postulantes registrados.</p>
              </IonText>
            </div>
          ) : (
            postulantes.map((p) => (
              <IonCard key={p.id} style={{ margin: '8px 0' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1rem' }}>
                    {p.nombres} {p.apellidos}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none" style={{ '--padding-start': 0, '--inner-padding-end': 0 }}>
                    <IonLabel>
                      <p>{p.universidad}</p>
                      <p style={{ color: '#92949c', fontSize: '0.82rem' }}>
                        Celular: {p.celular}
                      </p>
                    </IonLabel>
                    <IonBadge color="primary" slot="end">{p.especialidad}</IonBadge>
                  </IonItem>

                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    {yaEvaluado(p.id) ? (
                      <IonChip color="success" style={{ fontWeight: 600 }}>
                        <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: 4 }} />
                        Ya evaluada
                      </IonChip>
                    ) : (
                      <IonButton
                        size="small"
                        color="primary"
                        onClick={() => setModalPostulante(p)}
                      >
                        Evaluar
                      </IonButton>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </IonList>
      )}

      {/* Modal de evaluación */}
      <IonModal
        isOpen={modalPostulante !== null}
        onDidDismiss={() => setModalPostulante(null)}
      >
        {modalPostulante && (
          <ModalEvaluar
            postulante={modalPostulante}
            juradoNombre={juradoNombre}
            onClose={() => setModalPostulante(null)}
            onGuardado={() => {
              setModalPostulante(null);
              cargarDatos();
            }}
          />
        )}
      </IonModal>
    </IonContent>
  );
};

// ─── Tab: Mis evaluaciones ────────────────────────────────────────────────────
const MisEvaluacionesTab: React.FC = () => {
  useJuradoGuard();
  const juradoNombre = sessionStorage.getItem('jurado_nombre') ?? '';
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.evaluaciones
      .listar()
      .then((evs) => {
        // Filtrar sólo las de este jurado
        const propias = evs.filter(
          (ev) => ev.juradoNombre.toLowerCase() === juradoNombre.toLowerCase()
        );
        setEvaluaciones(propias);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar evaluaciones';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [juradoNombre]);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      )}

      {error && (
        <div style={{ padding: 16 }}>
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        </div>
      )}

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '8px' }}>
          {evaluaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <IonText color="medium">
                <p>Aún no has evaluado a ningún postulante.</p>
              </IonText>
            </div>
          ) : (
            evaluaciones.map((ev) => (
              <IonCard key={ev.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ fontWeight: 600 }}>{ev.postulanteNombre}</h2>
                    {ev.comentario && (
                      <p style={{ fontSize: '0.85rem', color: '#555' }}>{ev.comentario}</p>
                    )}
                    <p style={{ color: '#92949c', fontSize: '0.8rem' }}>
                      {formatFecha(ev.evaluadoEn)}
                    </p>
                  </IonLabel>
                  <div slot="end" style={{ textAlign: 'center', minWidth: 48 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E85520' }}>
                      {ev.puntaje}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#92949c' }}>/10</span>
                  </div>
                </IonItem>
              </IonCard>
            ))
          )}
        </IonList>
      )}
    </IonContent>
  );
};

// ─── JuradoPage principal con Tabs ────────────────────────────────────────────
const JuradoPage: React.FC = () => {
  const history = useHistory();
  const juradoNombre = sessionStorage.getItem('jurado_nombre') ?? 'Jurado';

  const handleLogout = () => {
    sessionStorage.removeItem('jurado_nombre');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Hola, {juradoNombre}</IonTitle>
          <IonButtons slot="end">
            <IonButton color="light" fill="clear" onClick={handleLogout}>
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/jurado/pendientes" render={() => <IonTab tab="pendientes"><PendientesTab /></IonTab>} />
          <Route exact path="/jurado/mis-evaluaciones" render={() => <IonTab tab="mis-evaluaciones"><MisEvaluacionesTab /></IonTab>} />
          <Route exact path="/jurado">
            <Redirect to="/jurado/pendientes" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="pendientes" href="/jurado/pendientes">
            <IonIcon icon={listOutline} />
            <IonLabel>Por evaluar</IonLabel>
          </IonTabButton>
          <IonTabButton tab="mis-evaluaciones" href="/jurado/mis-evaluaciones">
            <IonIcon icon={checkmarkCircleOutline} />
            <IonLabel>Mis evaluaciones</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default JuradoPage;
