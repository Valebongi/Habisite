import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  IonRouterOutlet, IonButton, IonButtons, IonList, IonCard,
  IonCardContent, IonItem, IonBadge, IonChip, IonText,
  IonSpinner, IonModal, IonTextarea, IonSearchbar, IonToast,
} from '@ionic/react';
import {
  listOutline, checkmarkCircleOutline, checkmarkDoneOutline,
  documentTextOutline, linkOutline, downloadOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, Postulante, Evaluacion, EvaluacionRequest, Resolucion } from '../../services/api';

const ORANGE = '#E85520';
const DARK   = '#0d0e10';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const juradoNombre = () =>
  sessionStorage.getItem('jurado_nombre') ?? localStorage.getItem('jurado_nombre') ?? 'Jurado';

const handleLogout = () => {
  sessionStorage.setItem('habisite_logout', '1');
  sessionStorage.removeItem('jurado_nombre');
  localStorage.removeItem('jurado_nombre');
  window.location.replace('/login');
};

const useJuradoGuard = () => {
  const history = useHistory();
  useEffect(() => {
    const ok = sessionStorage.getItem('jurado_nombre') ?? localStorage.getItem('jurado_nombre');
    if (!ok) history.replace('/login');
  }, [history]);
};

const formatFecha = (f: string) =>
  new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Header compartido ────────────────────────────────────────────────────────
const JuradoHeader: React.FC<{ titulo?: string }> = ({ titulo }) => (
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>{titulo ?? `Hola, ${juradoNombre()}`}</IonTitle>
      <IonButtons slot="end">
        <IonButton color="light" fill="clear" onClick={handleLogout}>Salir</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

// ─── Modal de evaluación ──────────────────────────────────────────────────────
interface ModalEvaluarProps {
  postulante: Postulante;
  numero: number;
  evaluacionPrevia?: Evaluacion;
  onClose: () => void;
  onGuardado: () => void;
}

const ModalEvaluar: React.FC<ModalEvaluarProps> = ({
  postulante, numero, evaluacionPrevia, onClose, onGuardado,
}) => {
  const [puntaje, setPuntaje]   = useState<number | null>(evaluacionPrevia?.puntaje ?? null);
  const [comentario, setComentario] = useState(evaluacionPrevia?.comentario ?? '');
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loadingRes, setLoadingRes]     = useState(true);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState<{ msg: string; color: string } | null>(null);

  useEffect(() => {
    api.resoluciones
      .listarPorPostulante(postulante.id)
      .then(setResoluciones)
      .finally(() => setLoadingRes(false));
  }, [postulante.id]);

  const handleGuardar = async () => {
    if (puntaje === null) {
      setToast({ msg: 'Seleccioná un puntaje del 1 al 10.', color: 'warning' });
      return;
    }
    setLoading(true);
    const payload: EvaluacionRequest = {
      postulanteId: postulante.id,
      juradoNombre: juradoNombre(),
      puntaje,
      comentario: comentario.trim(),
    };
    try {
      await api.evaluaciones.crear(payload);
      setToast({ msg: 'Evaluación guardada.', color: 'success' });
      setTimeout(() => { onGuardado(); }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar.';
      setToast({ msg, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const yaTieneEval = evaluacionPrevia != null;

  return (
    <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>#{numero} — {postulante.nombres} {postulante.apellidos}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" color="light" onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#f4f5f7' }}>
        {/* Info postulante */}
        <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`, padding: '20px 20px 16px' }}>
          <p style={{ margin: 0, color: '#ffffff99', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {postulante.especialidad}
          </p>
          <h2 style={{ margin: '4px 0 2px', color: '#fff', fontWeight: 700 }}>
            {postulante.nombres} {postulante.apellidos}
          </h2>
          <p style={{ margin: 0, color: '#ffffff77', fontSize: '0.85rem' }}>{postulante.universidad}</p>
        </div>

        <div style={{ padding: '16px 12px' }}>

          {/* Entregas del postulante */}
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.9rem', color: DARK }}>
            Entregas enviadas
          </p>

          {loadingRes ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <IonSpinner name="crescent" color="primary" />
            </div>
          ) : resoluciones.length === 0 ? (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <IonText color="medium"><p style={{ margin: 0, fontSize: '0.85rem' }}>Este postulante aún no subió entregas.</p></IonText>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {resoluciones.map(r => (
                <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <IonIcon icon={documentTextOutline} style={{ color: ORANGE, fontSize: '1rem' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: DARK }}>{r.titulo}</span>
                    <IonBadge color={r.estado === 'APROBADA' ? 'success' : r.estado === 'RECHAZADA' ? 'danger' : 'warning'} style={{ marginLeft: 'auto' }}>
                      {r.estado}
                    </IonBadge>
                  </div>
                  {r.descripcion && (
                    <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.4 }}>{r.descripcion}</p>
                  )}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {r.tieneArchivo && (
                      <a href={`/api/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>
                        <IonIcon icon={downloadOutline} />
                        {r.archivoNombre}
                      </a>
                    )}
                    {r.urlExterno && (
                      <a href={r.urlExterno} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#3dc2ff', textDecoration: 'none', fontWeight: 600 }}>
                        <IonIcon icon={linkOutline} />
                        Ver enlace
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de evaluación */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: `2px solid ${yaTieneEval ? '#2dd36f44' : '#e5e7eb'}` }}>
            {yaTieneEval && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 }}>
                <IonIcon icon={checkmarkDoneOutline} style={{ color: '#2dd36f', fontSize: '1.1rem' }} />
                <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>Ya evaluaste a este postulante</span>
              </div>
            )}

            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.9rem', color: DARK }}>
              {yaTieneEval ? 'Tu evaluación' : 'Asignar puntaje'}
            </p>

            {/* Selector 1–10 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  disabled={yaTieneEval}
                  onClick={() => setPuntaje(n)}
                  style={{
                    width: 44, height: 44, borderRadius: 8, border: 'none', cursor: yaTieneEval ? 'default' : 'pointer',
                    background: puntaje === n ? ORANGE : '#f3f4f6',
                    color: puntaje === n ? '#fff' : '#374151',
                    fontWeight: puntaje === n ? 700 : 500,
                    fontSize: '1rem',
                    transition: 'all .15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
              Comentario {yaTieneEval ? '' : '(opcional)'}
            </p>
            <IonTextarea
              value={comentario}
              onIonInput={e => setComentario(e.detail.value ?? '')}
              placeholder="Observaciones sobre la propuesta…"
              rows={3}
              readonly={yaTieneEval}
              style={{
                '--background': yaTieneEval ? '#f9fafb' : '#fff',
                '--border-radius': '8px',
                '--padding-start': '12px', '--padding-end': '12px',
                '--padding-top': '10px', '--padding-bottom': '10px',
                border: '1px solid #e0e0e0', borderRadius: 8,
              }}
            />

            {!yaTieneEval && (
              <IonButton expand="block" onClick={handleGuardar} disabled={loading || puntaje === null}
                style={{ marginTop: 16, '--background': ORANGE, '--border-radius': '8px' }}>
                {loading ? <IonSpinner name="crescent" /> : 'Guardar evaluación'}
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>

      <IonToast
        isOpen={toast !== null}
        onDidDismiss={() => setToast(null)}
        message={toast?.msg}
        duration={2000}
        color={toast?.color}
        position="top"
      />
    </>
  );
};

// ─── Tab: Postulantes ─────────────────────────────────────────────────────────
const PostulantesTab: React.FC = () => {
  useJuradoGuard();
  const nombre = juradoNombre();
  const [postulantes, setPostulantes]   = useState<Postulante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filtro, setFiltro]             = useState('');
  const [soloSinEvaluar, setSoloSinEvaluar] = useState(false);
  const [modalPostulante, setModalPostulante] = useState<{ p: Postulante; idx: number } | null>(null);

  const cargar = async () => {
    setLoading(true); setError('');
    try {
      const [ps, evs] = await Promise.all([api.postulantes.listar(), api.evaluaciones.listar()]);
      setPostulantes(ps); setEvaluaciones(evs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const evalDeJurado = (postulanteId: number) =>
    evaluaciones.find(ev =>
      ev.postulanteId === postulanteId &&
      ev.juradoNombre.toLowerCase() === nombre.toLowerCase()
    );

  const filtrados = postulantes
    .filter(p => {
      const q = filtro.toLowerCase();
      return (
        p.nombres.toLowerCase().includes(q) ||
        p.apellidos.toLowerCase().includes(q) ||
        p.universidad.toLowerCase().includes(q) ||
        p.especialidad.toLowerCase().includes(q)
      );
    })
    .filter(p => !soloSinEvaluar || !evalDeJurado(p.id));

  const pendientes = postulantes.filter(p => !evalDeJurado(p.id)).length;

  return (
    <IonPage>
      <JuradoHeader />
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <IonSearchbar
          value={filtro}
          onIonInput={e => setFiltro(e.detail.value ?? '')}
          placeholder="Buscar postulante…"
          style={{ padding: '8px 8px 0' }}
        />

        {/* Filtro rápido */}
        <div style={{ display: 'flex', gap: 8, padding: '4px 12px 8px', alignItems: 'center' }}>
          <IonChip
            color={soloSinEvaluar ? 'primary' : 'medium'}
            onClick={() => setSoloSinEvaluar(!soloSinEvaluar)}
            style={{ cursor: 'pointer' }}
          >
            Pendientes ({pendientes})
          </IonChip>
          <IonChip color="medium" style={{ cursor: 'pointer' }} onClick={() => setSoloSinEvaluar(false)}>
            Todos ({postulantes.length})
          </IonChip>
        </div>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>}
        {error && <div style={{ padding: 16 }}><IonText color="danger"><p>{error}</p></IonText></div>}

        {!loading && !error && (
          <IonList style={{ background: 'transparent', padding: '0 8px 80px' }}>
            {filtrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <IonText color="medium"><p>No hay postulantes{soloSinEvaluar ? ' pendientes' : ''}.</p></IonText>
              </div>
            ) : (
              filtrados.map((p, idx) => {
                // número en base a posición global (no filtrada)
                const numGlobal = postulantes.findIndex(x => x.id === p.id) + 1;
                const eval_ = evalDeJurado(p.id);
                const evaluado = eval_ != null;
                return (
                  <IonCard
                    key={p.id}
                    style={{ margin: '8px 0', opacity: evaluado ? 0.85 : 1 }}
                    onClick={() => setModalPostulante({ p, idx: numGlobal })}
                    button
                  >
                    <IonItem lines="none">
                      {/* Número */}
                      <div slot="start" style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: evaluado ? '#2dd36f22' : `${ORANGE}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem',
                        color: evaluado ? '#2dd36f' : ORANGE,
                        flexShrink: 0,
                      }}>
                        #{numGlobal}
                      </div>

                      <IonLabel>
                        <h2 style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {p.nombres} {p.apellidos}
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '2px 0' }}>
                          {p.universidad}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{p.especialidad}</p>
                      </IonLabel>

                      <div slot="end" style={{ textAlign: 'center', minWidth: 56 }}>
                        {evaluado ? (
                          <>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2dd36f', lineHeight: 1 }}>
                              {eval_!.puntaje}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div>
                          </>
                        ) : (
                          <IonBadge color="warning" style={{ fontSize: '0.7rem' }}>Pendiente</IonBadge>
                        )}
                      </div>
                    </IonItem>
                  </IonCard>
                );
              })
            )}
          </IonList>
        )}

        {/* Modal de evaluación */}
        <IonModal isOpen={modalPostulante !== null} onDidDismiss={() => setModalPostulante(null)}>
          {modalPostulante && (
            <ModalEvaluar
              postulante={modalPostulante.p}
              numero={modalPostulante.idx}
              evaluacionPrevia={evalDeJurado(modalPostulante.p.id)}
              onClose={() => setModalPostulante(null)}
              onGuardado={() => { setModalPostulante(null); cargar(); }}
            />
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

// ─── Tab: Mis evaluaciones ────────────────────────────────────────────────────
const MisEvaluacionesTab: React.FC = () => {
  useJuradoGuard();
  const nombre = juradoNombre();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.evaluaciones.listar()
      .then(evs => setEvaluaciones(evs.filter(ev => ev.juradoNombre.toLowerCase() === nombre.toLowerCase())))
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [nombre]);

  const promedio = evaluaciones.length
    ? (evaluaciones.reduce((s, ev) => s + ev.puntaje, 0) / evaluaciones.length).toFixed(1)
    : null;

  return (
    <IonPage>
      <JuradoHeader titulo="Mis evaluaciones" />
      <IonContent style={{ '--background': '#f4f5f7' }}>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>}
        {error && <div style={{ padding: 16 }}><IonText color="danger"><p>{error}</p></IonText></div>}

        {!loading && !error && (
          <>
            {/* Resumen */}
            {evaluaciones.length > 0 && (
              <div style={{ display: 'flex', gap: 10, padding: '12px 12px 4px' }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px 16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: ORANGE }}>{evaluaciones.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Evaluaciones</div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px 16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2dd36f' }}>{promedio}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Puntaje promedio</div>
                </div>
              </div>
            )}

            <IonList style={{ background: 'transparent', padding: '8px 8px 80px' }}>
              {evaluaciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <IonText color="medium">
                    <p style={{ fontSize: '1rem' }}>Aún no evaluaste ningún postulante.</p>
                    <p style={{ fontSize: '0.85rem' }}>Andá a "Postulantes" para comenzar.</p>
                  </IonText>
                </div>
              ) : (
                evaluaciones
                  .sort((a, b) => b.puntaje - a.puntaje)
                  .map((ev, idx) => (
                    <IonCard key={ev.id} style={{ margin: '8px 0' }}>
                      <IonItem lines="none">
                        <div slot="start" style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${ORANGE}22`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8rem', color: ORANGE, flexShrink: 0,
                        }}>
                          #{idx + 1}
                        </div>
                        <IonLabel>
                          <h2 style={{ fontWeight: 600 }}>{ev.postulanteNombre}</h2>
                          {ev.comentario && (
                            <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.4, margin: '2px 0' }}>{ev.comentario}</p>
                          )}
                          <p style={{ color: '#92949c', fontSize: '0.75rem', margin: '2px 0' }}>
                            {formatFecha(ev.evaluadoEn)}
                          </p>
                        </IonLabel>
                        <div slot="end" style={{ textAlign: 'center', minWidth: 52 }}>
                          <div style={{
                            fontSize: '1.5rem', fontWeight: 700, lineHeight: 1,
                            color: ev.puntaje >= 7 ? '#2dd36f' : ev.puntaje >= 5 ? ORANGE : '#eb445a',
                          }}>
                            {ev.puntaje}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div>
                        </div>
                      </IonItem>
                    </IonCard>
                  ))
              )}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

// ─── JuradoPage — solo IonTabs ────────────────────────────────────────────────
const JuradoPage: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/jurado/postulantes" component={PostulantesTab} />
      <Route exact path="/jurado/mis-evaluaciones" component={MisEvaluacionesTab} />
      <Route exact path="/jurado"><Redirect to="/jurado/postulantes" /></Route>
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="postulantes" href="/jurado/postulantes">
        <IonIcon icon={listOutline} />
        <IonLabel>Postulantes</IonLabel>
      </IonTabButton>
      <IonTabButton tab="mis-evaluaciones" href="/jurado/mis-evaluaciones">
        <IonIcon icon={checkmarkCircleOutline} />
        <IonLabel>Mis evaluaciones</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default JuradoPage;
