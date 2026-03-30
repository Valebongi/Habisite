import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  IonRouterOutlet, IonButton, IonButtons, IonList, IonCard,
  IonCardContent, IonItem, IonBadge, IonChip, IonText,
  IonSpinner, IonModal, IonTextarea, IonSearchbar, IonToast,
  IonRefresher, IonRefresherContent,
} from '@ionic/react';
import {
  listOutline, checkmarkCircleOutline, checkmarkDoneOutline,
  documentTextOutline, linkOutline, downloadOutline,
  statsChartOutline, trophyOutline, ribbonOutline,
  arrowForwardOutline, arrowBackOutline, closeOutline,
  bulbOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, Postulante, Evaluacion, EvaluacionRequest, Resolucion } from '../../services/api';

const ORANGE = '#E85520';
const DARK   = '#0d0e10';
const BASE   = import.meta.env.VITE_API_URL || 'https://api.habisite.com/api';

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
  new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const scoreColor = (p: number) => p >= 7 ? '#2dd36f' : p >= 5 ? ORANGE : '#eb445a';

// ─── Onboarding Tour ─────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'habisite_jurado_onboarding_v1';

const OnboardingTour: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: bulbOutline,
      title: 'Bienvenido al Panel de Jurado',
      desc: 'Te vamos a mostrar como funciona el sistema de evaluacion en 3 pasos rapidos.',
      color: ORANGE,
    },
    {
      icon: listOutline,
      title: 'Postulantes',
      desc: 'Aca vas a encontrar la lista completa de postulantes. Podes buscar por nombre, universidad o especialidad. Toca una tarjeta para ver sus entregas y asignar un puntaje del 1 al 10.',
      color: '#3dc2ff',
    },
    {
      icon: checkmarkCircleOutline,
      title: 'Mis Evaluaciones',
      desc: 'Resumen de todas tus evaluaciones: puntaje promedio, maximo, minimo y la lista ordenada por calificacion. Aca podes ver tu progreso.',
      color: '#2dd36f',
    },
    {
      icon: statsChartOutline,
      title: 'Estadisticas',
      desc: 'Dashboard con tu progreso de evaluacion, distribucion de puntajes que asignaste y el ranking general de postulantes basado en todas las evaluaciones del jurado.',
      color: '#6a64f1',
    },
  ];

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    onFinish();
  };

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}
      onClick={finish}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, maxWidth: 380, width: '100%',
          overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: step === 0
            ? `linear-gradient(135deg, ${DARK} 0%, #2a1208 100%)`
            : s.color,
          padding: '28px 24px 22px', textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <IonIcon icon={s.icon} style={{ fontSize: '1.5rem', color: '#fff' }} />
          </div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            {step === 0 ? 'Habisite Design Challenge' : `Paso ${step} de ${steps.length - 1}`}
          </div>
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{s.title}</div>
          <button onClick={finish} style={{
            position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '50%', width: 28, height: 28,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IonIcon icon={closeOutline} style={{ fontSize: '1rem', color: '#fff' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 8px' }}>
          <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '14px 0 6px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 999,
              background: i === step ? (s.color ?? ORANGE) : '#e5e7eb',
              transition: 'width 0.2s, background 0.2s',
            }} />
          ))}
        </div>

        {/* Nav */}
        <div style={{ padding: '10px 20px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: '8px 16px', background: 'transparent', border: '1.5px solid #e5e7eb',
              borderRadius: 999, fontSize: '0.8rem', color: '#6b7280', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '0.85rem' }} />
              Atras
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={() => isLast ? finish() : setStep(step + 1)} style={{
            padding: '8px 20px', background: s.color ?? ORANGE, border: 'none',
            borderRadius: 999, fontSize: '0.85rem', fontWeight: 700, color: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {isLast ? 'Entendido!' : 'Siguiente'}
            <IonIcon icon={isLast ? checkmarkDoneOutline : arrowForwardOutline} style={{ fontSize: '0.9rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Header compartido ───────────────────────────────────────────────────────
const JuradoHeader: React.FC<{ titulo?: string }> = ({ titulo }) => (
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>{titulo ?? `Hola, ${juradoNombre()}`}</IonTitle>
      <IonButtons slot="end">
        <IonButton fill="outline" onClick={handleLogout}
          style={{ '--color': '#fff', '--border-color': 'rgba(255,255,255,0.5)', '--border-width': '1.5px', fontSize: '0.82rem', fontWeight: 600 }}>
          Salir
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

// ─── Modal de evaluacion ──────────────────────────────────────────────────────
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
      setToast({ msg: 'Selecciona un puntaje del 1 al 10.', color: 'warning' });
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
      setToast({ msg: 'Evaluacion guardada.', color: 'success' });
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
          <IonTitle style={{ fontSize: '0.95rem' }}>
            #{numero} — {postulante.nombres} {postulante.apellidos}
          </IonTitle>
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
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.9rem', color: DARK }}>Entregas enviadas</p>

          {loadingRes ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><IonSpinner name="crescent" color="primary" /></div>
          ) : resoluciones.length === 0 ? (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <IonText color="medium"><p style={{ margin: 0, fontSize: '0.85rem' }}>Este postulante aun no subio entregas.</p></IonText>
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
                  {r.descripcion && <p style={{ margin: '4px 0 6px', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.4 }}>{r.descripcion}</p>}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {r.tieneArchivo && (
                      <a href={`${BASE}/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>
                        <IonIcon icon={downloadOutline} />{r.archivoNombre}
                      </a>
                    )}
                    {r.urlExterno && (
                      <a href={r.urlExterno} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#3dc2ff', textDecoration: 'none', fontWeight: 600 }}>
                        <IonIcon icon={linkOutline} />Ver enlace
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de evaluacion */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: `2px solid ${yaTieneEval ? '#2dd36f44' : '#e5e7eb'}` }}>
            {yaTieneEval && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 }}>
                <IonIcon icon={checkmarkDoneOutline} style={{ color: '#2dd36f', fontSize: '1.1rem' }} />
                <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>Ya evaluaste a este postulante</span>
              </div>
            )}
            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.9rem', color: DARK }}>
              {yaTieneEval ? 'Tu evaluacion' : 'Asignar puntaje'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} disabled={yaTieneEval} onClick={() => setPuntaje(n)}
                  style={{
                    width: 44, height: 44, borderRadius: 8, border: 'none', cursor: yaTieneEval ? 'default' : 'pointer',
                    background: puntaje === n ? ORANGE : '#f3f4f6', color: puntaje === n ? '#fff' : '#374151',
                    fontWeight: puntaje === n ? 700 : 500, fontSize: '1rem', transition: 'all .15s',
                  }}>{n}</button>
              ))}
            </div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
              Comentario {yaTieneEval ? '' : '(opcional)'}
            </p>
            <IonTextarea value={comentario} onIonInput={e => setComentario(e.detail.value ?? '')}
              placeholder="Observaciones sobre la propuesta..." rows={3} readonly={yaTieneEval}
              style={{ '--background': yaTieneEval ? '#f9fafb' : '#fff', '--border-radius': '8px',
                '--padding-start': '12px', '--padding-end': '12px', '--padding-top': '10px', '--padding-bottom': '10px',
                border: '1px solid #e0e0e0', borderRadius: 8 }} />
            {!yaTieneEval && (
              <IonButton expand="block" onClick={handleGuardar} disabled={loading || puntaje === null}
                style={{ marginTop: 16, '--background': ORANGE, '--border-radius': '8px' }}>
                {loading ? <IonSpinner name="crescent" /> : 'Guardar evaluacion'}
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
      <IonToast isOpen={toast !== null} onDidDismiss={() => setToast(null)} message={toast?.msg} duration={2000} color={toast?.color} position="top" />
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

  const cargar = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [ps, evs] = await Promise.all([api.postulantes.listar(), api.evaluaciones.listar()]);
      setPostulantes(ps); setEvaluaciones(evs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const evalDeJurado = (postulanteId: number) =>
    evaluaciones.find(ev => ev.postulanteId === postulanteId && ev.juradoNombre.toLowerCase() === nombre.toLowerCase());

  const filtrados = postulantes
    .filter(p => {
      const q = filtro.toLowerCase();
      return p.nombres.toLowerCase().includes(q) || p.apellidos.toLowerCase().includes(q) ||
        p.universidad.toLowerCase().includes(q) || p.especialidad.toLowerCase().includes(q);
    })
    .filter(p => !soloSinEvaluar || !evalDeJurado(p.id));

  const totalEvaluados = postulantes.filter(p => evalDeJurado(p.id)).length;
  const pendientes = postulantes.length - totalEvaluados;
  const pct = postulantes.length > 0 ? Math.round((totalEvaluados / postulantes.length) * 100) : 0;

  return (
    <IonPage>
      <JuradoHeader />
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <IonRefresher slot="fixed" onIonRefresh={e => cargar().then(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Progress bar */}
        {!loading && postulantes.length > 0 && (
          <div style={{ padding: '14px 16px 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
                Progreso: {totalEvaluados}/{postulantes.length} evaluados
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: pct === 100 ? '#16a34a' : ORANGE }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : ORANGE, borderRadius: 999, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        <IonSearchbar value={filtro} onIonInput={e => setFiltro(e.detail.value ?? '')} placeholder="Buscar postulante..." style={{ padding: '8px 8px 0' }} />

        <div style={{ display: 'flex', gap: 8, padding: '4px 12px 8px', alignItems: 'center' }}>
          <IonChip color={soloSinEvaluar ? 'warning' : 'medium'} onClick={() => setSoloSinEvaluar(!soloSinEvaluar)}
            style={{ cursor: 'pointer', fontWeight: soloSinEvaluar ? 700 : 400 }}>
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
            ) : filtrados.map(p => {
              const numGlobal = postulantes.findIndex(x => x.id === p.id) + 1;
              const eval_ = evalDeJurado(p.id);
              const evaluado = eval_ != null;
              return (
                <IonCard key={p.id} style={{ margin: '8px 0', opacity: evaluado ? 0.85 : 1 }}
                  onClick={() => setModalPostulante({ p, idx: numGlobal })} button>
                  <IonItem lines="none">
                    <div slot="start" style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: evaluado ? '#2dd36f22' : `${ORANGE}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem', color: evaluado ? '#2dd36f' : ORANGE, flexShrink: 0,
                    }}>#{numGlobal}</div>
                    <IonLabel>
                      <h2 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.nombres} {p.apellidos}</h2>
                      <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '2px 0' }}>{p.universidad}</p>
                      <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{p.especialidad}</p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'center', minWidth: 56 }}>
                      {evaluado ? (
                        <>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2dd36f', lineHeight: 1 }}>{eval_!.puntaje}</div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div>
                        </>
                      ) : <IonBadge color="warning" style={{ fontSize: '0.7rem' }}>Pendiente</IonBadge>}
                    </div>
                  </IonItem>
                </IonCard>
              );
            })}
          </IonList>
        )}

        <IonModal isOpen={modalPostulante !== null} onDidDismiss={() => setModalPostulante(null)}>
          {modalPostulante && (
            <ModalEvaluar postulante={modalPostulante.p} numero={modalPostulante.idx}
              evaluacionPrevia={evalDeJurado(modalPostulante.p.id)}
              onClose={() => setModalPostulante(null)}
              onGuardado={() => { setModalPostulante(null); cargar(); }} />
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

  const cargar = useCallback(() => {
    setLoading(true);
    return api.evaluaciones.listar()
      .then(evs => setEvaluaciones(evs.filter(ev => ev.juradoNombre.toLowerCase() === nombre.toLowerCase())))
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [nombre]);

  useEffect(() => { cargar(); }, [cargar]);

  const promedio = evaluaciones.length ? (evaluaciones.reduce((s, ev) => s + ev.puntaje, 0) / evaluaciones.length).toFixed(1) : null;
  const maximo = evaluaciones.length ? Math.max(...evaluaciones.map(e => e.puntaje)) : null;
  const minimo = evaluaciones.length ? Math.min(...evaluaciones.map(e => e.puntaje)) : null;

  return (
    <IonPage>
      <JuradoHeader titulo="Mis evaluaciones" />
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <IonRefresher slot="fixed" onIonRefresh={e => cargar().then(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>}
        {error && <div style={{ padding: 16 }}><IonText color="danger"><p>{error}</p></IonText></div>}

        {!loading && !error && (
          <>
            {evaluaciones.length > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '12px 12px 4px', flexWrap: 'wrap' }}>
                {[
                  { val: evaluaciones.length, label: 'Evaluaciones', color: ORANGE },
                  { val: promedio, label: 'Promedio', color: '#2dd36f' },
                  { val: maximo, label: 'Maximo', color: '#16a34a' },
                  { val: minimo, label: 'Minimo', color: '#6b7280' },
                ].map((c, i) => (
                  <div key={i} style={{ flex: 1, minWidth: 80, background: '#fff', borderRadius: 12, padding: '14px 14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            )}

            <IonList style={{ background: 'transparent', padding: '8px 8px 80px' }}>
              {evaluaciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${ORANGE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.8rem', color: ORANGE }} />
                  </div>
                  <IonText color="medium">
                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Aun no evaluaste ningun postulante.</p>
                    <p style={{ fontSize: '0.85rem' }}>Anda a "Postulantes" para comenzar.</p>
                  </IonText>
                </div>
              ) : evaluaciones.sort((a, b) => b.puntaje - a.puntaje).map((ev, idx) => (
                <IonCard key={ev.id} style={{ margin: '8px 0' }}>
                  <IonItem lines="none">
                    <div slot="start" style={{
                      width: 32, height: 32, borderRadius: '50%', background: `${ORANGE}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem', color: ORANGE, flexShrink: 0,
                    }}>#{idx + 1}</div>
                    <IonLabel>
                      <h2 style={{ fontWeight: 600 }}>{ev.postulanteNombre}</h2>
                      {ev.comentario && <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.4, margin: '2px 0' }}>{ev.comentario}</p>}
                      <p style={{ color: '#92949c', fontSize: '0.75rem', margin: '2px 0' }}>{formatFecha(ev.evaluadoEn)}</p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'center', minWidth: 52 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: scoreColor(ev.puntaje) }}>{ev.puntaje}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/10</div>
                    </div>
                  </IonItem>
                </IonCard>
              ))}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

// ─── Tab: Estadisticas ────────────────────────────────────────────────────────
const EstadisticasTab: React.FC = () => {
  useJuradoGuard();
  const nombre = juradoNombre();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [misEvals, setMisEvals] = useState<Evaluacion[]>([]);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(() => {
    setLoading(true);
    return Promise.all([api.evaluaciones.listar(), api.postulantes.listar()])
      .then(([evs, ps]) => {
        setEvaluaciones(evs);
        setPostulantes(ps);
        setMisEvals(evs.filter(ev => ev.juradoNombre.toLowerCase() === nombre.toLowerCase()));
      })
      .finally(() => setLoading(false));
  }, [nombre]);

  useEffect(() => { cargar(); }, [cargar]);

  const distribucion = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: misEvals.filter(e => e.puntaje === i + 1).length,
  }));
  const maxCount = Math.max(...distribucion.map(d => d.count), 1);

  const ranking = postulantes.map(p => {
    const evalsDeP = evaluaciones.filter(e => e.postulanteId === p.id);
    const avg = evalsDeP.length > 0 ? evalsDeP.reduce((s, e) => s + e.puntaje, 0) / evalsDeP.length : 0;
    return { postulante: p, promedio: avg, totalEvals: evalsDeP.length };
  }).filter(r => r.totalEvals > 0).sort((a, b) => b.promedio - a.promedio);

  const evaluados = misEvals.length;
  const totalPostulantes = postulantes.length;
  const pendientesMios = totalPostulantes - evaluados;

  return (
    <IonPage>
      <JuradoHeader titulo="Estadisticas" />
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <IonRefresher slot="fixed" onIonRefresh={e => cargar().then(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>
        ) : (
          <div style={{ padding: '12px 12px 80px' }}>

            {/* Mi progreso */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <IonIcon icon={ribbonOutline} style={{ fontSize: '1.2rem', color: ORANGE }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: DARK }}>Mi progreso</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                {[
                  { val: evaluados, label: 'Evaluados', color: '#16a34a' },
                  { val: pendientesMios, label: 'Pendientes', color: ORANGE },
                  { val: totalPostulantes, label: 'Total', color: DARK },
                ].map((c, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', background: '#f9fafb', borderRadius: 10, padding: '12px 8px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 10, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: totalPostulantes > 0 ? `${(evaluados / totalPostulantes) * 100}%` : '0%',
                  background: evaluados === totalPostulantes ? '#16a34a' : ORANGE,
                  borderRadius: 999, transition: 'width 0.4s',
                }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                {evaluados === totalPostulantes ? 'Completaste todas las evaluaciones' : `${totalPostulantes > 0 ? Math.round((evaluados / totalPostulantes) * 100) : 0}% completado`}
              </p>
            </div>

            {/* Distribucion de puntajes */}
            {misEvals.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <IonIcon icon={statsChartOutline} style={{ fontSize: '1.2rem', color: '#6a64f1' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: DARK }}>Distribucion de mis puntajes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                  {distribucion.map(d => (
                    <div key={d.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: d.count > 0 ? DARK : '#d1d5db' }}>
                        {d.count > 0 ? d.count : ''}
                      </span>
                      <div style={{
                        width: '100%', maxWidth: 28,
                        height: d.count > 0 ? `${(d.count / maxCount) * 70 + 10}%` : 4,
                        background: d.count > 0 ? scoreColor(d.score) : '#f3f4f6',
                        borderRadius: 4, transition: 'height 0.3s', minHeight: 4,
                      }} />
                      <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>{d.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking general */}
            {ranking.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <IonIcon icon={trophyOutline} style={{ fontSize: '1.2rem', color: '#ffc409' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: DARK }}>Ranking general</span>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: 'auto' }}>Promedio todos los jurados</span>
                </div>
                {ranking.slice(0, 10).map((r, i) => (
                  <div key={r.postulante.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0', borderBottom: i < Math.min(ranking.length, 10) - 1 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: i === 0 ? '#ffc409' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.78rem', color: i < 3 ? '#fff' : '#6b7280', flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.postulante.nombres} {r.postulante.apellidos}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {r.postulante.especialidad} · {r.totalEvals} eval{r.totalEvals !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: scoreColor(r.promedio), lineHeight: 1 }}>
                        {r.promedio.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>/10</div>
                    </div>
                  </div>
                ))}
                {ranking.length > 10 && (
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', margin: '10px 0 0' }}>
                    Mostrando top 10 de {ranking.length} postulantes evaluados
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

// ─── JuradoPage — IonTabs + Onboarding ───────────────────────────────────────
const JuradoPage: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
  }, []);

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/jurado/postulantes" component={PostulantesTab} />
          <Route exact path="/jurado/mis-evaluaciones" component={MisEvaluacionesTab} />
          <Route exact path="/jurado/estadisticas" component={EstadisticasTab} />
          <Route exact path="/jurado"><Redirect to="/jurado/postulantes" /></Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" style={{ '--background': '#fff', '--border': '1px solid #e5e7eb' }}>
          <IonTabButton tab="postulantes" href="/jurado/postulantes">
            <IonIcon icon={listOutline} />
            <IonLabel>Postulantes</IonLabel>
          </IonTabButton>
          <IonTabButton tab="mis-evaluaciones" href="/jurado/mis-evaluaciones">
            <IonIcon icon={checkmarkCircleOutline} />
            <IonLabel>Evaluaciones</IonLabel>
          </IonTabButton>
          <IonTabButton tab="estadisticas" href="/jurado/estadisticas">
            <IonIcon icon={statsChartOutline} />
            <IonLabel>Estadisticas</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      {showOnboarding && <OnboardingTour onFinish={() => setShowOnboarding(false)} />}
    </>
  );
};

export default JuradoPage;
