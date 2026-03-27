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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonBadge,
  IonSearchbar,
  IonText,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonToast,
} from '@ionic/react';
import {
  gridOutline,
  peopleOutline,
  starOutline,
  addOutline,
  helpCircleOutline,
  checkmarkOutline,
  documentTextOutline,
  closeCircleOutline,
  downloadOutline,
  keyOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  api,
  AdminStats,
  Postulante,
  Evaluacion,
  SoporteTicket,
  Resolucion,
} from '../../services/api';

// ─── Onboarding Tour Admin ────────────────────────────────────────────────────

const ADMIN_ONBOARDING_KEY = 'habisite_admin_onboarding_done';
const ORANGE = '#E85520';

const ADMIN_TOUR_STEPS = [
  {
    path: '/admin/dashboard',
    tabIndex: 0,
    emoji: '📊',
    seccion: 'Dashboard',
    descripcion: 'Vista general del concurso en tiempo real: postulantes registrados, evaluaciones, entregas y su estado. Los gráficos muestran la distribución por especialidad y universidad.',
    detalle: 'Los números se actualizan cada vez que entrás a esta pestaña.',
  },
  {
    path: '/admin/postulantes',
    tabIndex: 1,
    emoji: '👥',
    seccion: 'Postulantes',
    descripcion: 'Listado completo de inscriptos. Buscá por nombre, DNI o universidad. Si un postulante olvidó su contraseña, usá "Regenerar clave" para enviarle una nueva por email.',
    detalle: 'El DNI es el usuario de ingreso del postulante — no se puede cambiar.',
  },
  {
    path: '/admin/evaluaciones',
    tabIndex: 2,
    emoji: '⭐',
    seccion: 'Evaluaciones del Jurado',
    descripcion: 'Acá ves todos los puntajes (1–10) asignados por cada jurado a cada postulante, junto con sus comentarios y la fecha de evaluación.',
    detalle: 'Los jurados evalúan desde su propio panel. Vos solo tenés visibilidad.',
  },
  {
    path: '/admin/entregas',
    tabIndex: 3,
    emoji: '📁',
    seccion: 'Entregas',
    descripcion: 'Revisá las propuestas enviadas por los postulantes. Podés aprobar o rechazar cada entrega, filtrar por estado y descargar los archivos adjuntos.',
    detalle: 'Las entregas "Pendientes" están esperando tu revisión — aparecen resaltadas.',
  },
  {
    path: '/admin/soporte',
    tabIndex: 4,
    emoji: '🎫',
    seccion: 'Soporte',
    descripcion: 'Cuando un postulante tiene un problema y llena el formulario de soporte, el ticket aparece aquí. Revisalo y marcálo como resuelto una vez atendido.',
    detalle: 'También recibís un email en growthimbar@gmail.com por cada ticket nuevo.',
  },
];

const TAB_LEFT_ADMIN = ['10%', '30%', '50%', '70%', '90%'];

const OnboardingAdminTour: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState<number>(-1);
  const [visible, setVisible] = useState(!localStorage.getItem(ADMIN_ONBOARDING_KEY));

  useEffect(() => {
    if (!visible || step < 0) return;
    history.replace(ADMIN_TOUR_STEPS[step].path);
  }, [step, visible, history]);

  const siguiente = () => {
    if (step < ADMIN_TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finalizar();
  };

  const finalizar = () => {
    localStorage.setItem(ADMIN_ONBOARDING_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  // ── Pantalla de bienvenida ────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg, #0d0e10 0%, #2a1208 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px' }}>
        <div style={{ position: 'absolute', top: 40, right: 60, width: 120, height: 120, border: `1.5px solid ${ORANGE}33`, borderRadius: 8, transform: 'rotate(20deg)' }} />
        <div style={{ position: 'absolute', bottom: 80, left: 40, width: 80, height: 80, border: `1.5px solid ${ORANGE}22`, borderRadius: 6, transform: 'rotate(-15deg)' }} />

        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛠️</div>
        <p style={{ margin: '0 0 6px', color: ORANGE, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Panel de Administración
        </p>
        <h1 style={{ margin: '0 0 16px', color: '#fff', fontWeight: 800, fontSize: '1.7rem', textAlign: 'center', lineHeight: 1.2 }}>
          ¡Bienvenido, Admin!
        </h1>
        <p style={{ margin: '0 0 48px', color: '#ffffff88', textAlign: 'center', fontSize: '1rem', lineHeight: 1.65 }}>
          Te mostramos en 5 pasos qué hace cada sección del panel para que puedas gestionar el concurso sin problemas.
        </p>
        <IonButton expand="block" onClick={() => setStep(0)}
          style={{ width: '100%', '--background': ORANGE, '--border-radius': '12px', '--padding-top': '14px', '--padding-bottom': '14px', fontWeight: 700 }}>
          Ver el tour →
        </IonButton>
        <IonButton expand="block" fill="clear" onClick={finalizar}
          style={{ width: '100%', '--color': '#ffffff44', marginTop: 4 }}>
          Saltar
        </IonButton>
      </div>
    );
  }

  // ── Overlay contextual por sección ───────────────────────────────────────
  const current = ADMIN_TOUR_STEPS[step];
  const esUltimo = step === ADMIN_TOUR_STEPS.length - 1;

  return (
    <>
      {/* Dim overlay — no cubre la tab bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 56, zIndex: 9997, background: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />

      {/* Indicador sobre el tab activo */}
      <div style={{ position: 'fixed', bottom: 58, left: TAB_LEFT_ADMIN[current.tabIndex], transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2.5px solid ${ORANGE}`, background: `${ORANGE}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: ORANGE }} />
        </div>
        <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${ORANGE}`, margin: '0 auto' }} />
      </div>

      {/* Card explicativa */}
      <div style={{ position: 'fixed', bottom: 56 + 16, left: 12, right: 12, zIndex: 9998, background: '#fff', borderRadius: 18, padding: '22px 20px 18px', boxShadow: '0 -2px 40px rgba(0,0,0,0.25)' }}>

        {/* Barra de progreso */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 18 }}>
          {ADMIN_TOUR_STEPS.map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, flex: i === step ? 3 : 1, background: i <= step ? ORANGE : '#e5e7eb', transition: 'flex 0.3s ease, background 0.3s ease' }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: '1.6rem' }}>{current.emoji}</span>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sección {step + 1} de {ADMIN_TOUR_STEPS.length}</p>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>{current.seccion}</h3>
          </div>
        </div>

        <p style={{ margin: '0 0 8px', color: '#374151', lineHeight: 1.6, fontSize: '0.93rem' }}>{current.descripcion}</p>
        <p style={{ margin: '0 0 18px', color: '#6b7280', lineHeight: 1.5, fontSize: '0.82rem', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${ORANGE}55` }}>
          💡 {current.detalle}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <IonButton fill="outline" color="medium" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
              ← Atrás
            </IonButton>
          )}
          <IonButton onClick={siguiente} style={{ flex: 2, '--background': ORANGE }}>
            {esUltimo
              ? <><IonIcon icon={checkmarkCircleOutline} slot="start" /> ¡Entendido!</>
              : 'Siguiente →'}
          </IonButton>
        </div>
      </div>
    </>
  );
};

// ─── Logout y guard ───────────────────────────────────────────────────────────
const handleAdminLogout = () => {
  sessionStorage.removeItem('admin_ok');
  window.location.replace('/login');
};

const useAdminGuard = () => {
  const history = useHistory();
  useEffect(() => {
    if (!sessionStorage.getItem('admin_ok')) {
      history.replace('/login');
    }
  }, [history]);
};

// ─── Header compartido admin ──────────────────────────────────────────────────
const AdminHeader: React.FC<{ titulo?: string }> = ({ titulo = 'Panel Admin' }) => (
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>{titulo}</IonTitle>
      <IonButtons slot="end">
        <IonButton color="light" fill="clear" onClick={handleAdminLogout}>Salir</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

// ─── Colores para gráficos ────────────────────────────────────────────────────
const CHART_COLORS = ['#E85520', '#3dc2ff', '#2dd36f', '#ffc409', '#eb445a', '#92949c', '#6a64f1', '#f97316'];

// ─── Tab: Dashboard ───────────────────────────────────────────────────────────
const DashboardTab: React.FC = () => {
  useAdminGuard();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar estadísticas';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <IonPage>
        <AdminHeader />
        <IonContent style={{ '--background': '#f4f5f7' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <AdminHeader />
        <IonContent style={{ '--background': '#f4f5f7' }}>
          <div style={{ padding: 24 }}>
            <IonText color="danger"><p>{error}</p></IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const espData = stats
    ? Object.entries(stats.porEspecialidad).map(([name, value]) => ({ name, value: Number(value) }))
    : [];
  const univData = stats
    ? Object.entries(stats.porUniversidad).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const resolucionesPie = stats
    ? [
        { name: 'Pendientes', value: Number(stats.resolucionesPendientes) },
        { name: 'Aprobadas', value: Number(stats.resolucionesAprobadas) },
        { name: 'Rechazadas', value: Number(stats.resolucionesRechazadas) },
      ].filter(d => d.value > 0)
    : [];

  const PIE_COLORS = ['#ffc409', '#2dd36f', '#eb445a'];

  return (
    <IonPage>
    <AdminHeader />
    <IonContent style={{ '--background': '#f4f5f7' }}>
      <IonGrid style={{ padding: 16 }}>

        {/* KPIs — postulantes y evaluaciones */}
        <IonRow>
          {[
            { label: 'Postulantes', value: stats?.totalPostulantes ?? 0 },
            { label: 'Evaluaciones', value: stats?.totalEvaluaciones ?? 0 },
            { label: 'Universidades', value: stats ? Object.keys(stats.porUniversidad).length : 0 },
            { label: 'Especialidades', value: stats ? Object.keys(stats.porEspecialidad).length : 0 },
          ].map(({ label, value }) => (
            <IonCol key={label} size="6" sizeMd="3">
              <IonCard style={{ margin: 0 }}>
                <IonCardContent style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E85520' }}>{value}</div>
                  <IonText color="medium"><p style={{ margin: 0, fontSize: '0.82rem' }}>{label}</p></IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>

        {/* KPIs — entregas */}
        <IonRow style={{ marginTop: 4 }}>
          {[
            { label: 'Entregas totales', value: stats?.totalResoluciones ?? 0, color: '#E85520' },
            { label: 'Pendientes', value: stats?.resolucionesPendientes ?? 0, color: '#ffc409' },
            { label: 'Aprobadas', value: stats?.resolucionesAprobadas ?? 0, color: '#2dd36f' },
            { label: 'Rechazadas', value: stats?.resolucionesRechazadas ?? 0, color: '#eb445a' },
          ].map(({ label, value, color }) => (
            <IonCol key={label} size="6" sizeMd="3">
              <IonCard style={{ margin: 0 }}>
                <IonCardContent style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
                  <IonText color="medium"><p style={{ margin: 0, fontSize: '0.82rem' }}>{label}</p></IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>

        {/* Gráficos */}
        <IonRow style={{ marginTop: 4 }}>

          {/* Entregas por estado — PieChart */}
          {resolucionesPie.length > 0 && (
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '0.95rem' }}>Estado de entregas</IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: '0 8px 12px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={resolucionesPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ percent }: { percent?: number }) =>
                          percent != null ? `${(percent * 100).toFixed(0)}%` : ''
                        }
                        labelLine={false}
                      >
                        {resolucionesPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconSize={10} wrapperStyle={{ fontSize: '0.8rem' }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </IonCardContent>
              </IonCard>
            </IonCol>
          )}

          {/* Por especialidad — BarChart horizontal */}
          <IonCol size="12" sizeMd={resolucionesPie.length > 0 ? '4' : '6'}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '0.95rem' }}>Por Especialidad</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: '0 4px 12px' }}>
                {espData.length === 0 ? (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonText color="medium"><p>Sin datos</p></IonText>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(160, espData.length * 36)}>
                    <BarChart data={espData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
                      />
                      <Tooltip />
                      <Bar dataKey="value" name="Postulantes" radius={[0, 4, 4, 0]}>
                        {espData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>

          {/* Por universidad — BarChart horizontal */}
          <IonCol size="12" sizeMd={resolucionesPie.length > 0 ? '4' : '6'}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '0.95rem' }}>Por Universidad</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: '0 4px 12px' }}>
                {univData.length === 0 ? (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IonText color="medium"><p>Sin datos</p></IonText>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(160, univData.length * 36)}>
                    <BarChart data={univData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 15) + '…' : v}
                      />
                      <Tooltip />
                      <Bar dataKey="value" name="Postulantes" radius={[0, 4, 4, 0]}>
                        {univData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>

        </IonRow>
      </IonGrid>
    </IonContent>
    </IonPage>
  );
};

// ─── Tab: Postulantes ─────────────────────────────────────────────────────────
const PostulantesTab: React.FC = () => {
  useAdminGuard();
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerando, setRegenerando] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    api.postulantes
      .listar()
      .then(setPostulantes)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar postulantes';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtrados = postulantes.filter((p) => {
    const q = filtro.toLowerCase();
    return (
      p.nombres.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.dni.includes(q) ||
      p.universidad.toLowerCase().includes(q) ||
      p.especialidad.toLowerCase().includes(q)
    );
  });

  const handleRegenerarClave = async (id: number) => {
    setRegenerando(id);
    try {
      await api.postulantes.regenerarClave(id);
      setToastColor('success');
      setToastMsg('Nueva contraseña generada y enviada por email.');
    } catch {
      setToastColor('danger');
      setToastMsg('Error al regenerar la clave.');
    } finally {
      setRegenerando(null);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <IonPage>
    <AdminHeader titulo="Postulantes" />
    <IonContent style={{ '--background': '#f4f5f7' }}>
      <IonSearchbar
        value={filtro}
        onIonInput={(e) => setFiltro(e.detail.value ?? '')}
        placeholder="Buscar por nombre, DNI, universidad…"
        style={{ padding: '8px 8px 0' }}
      />

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

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '0 8px' }}>
          {filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <IonText color="medium"><p>No se encontraron postulantes.</p></IonText>
            </div>
          ) : (
            filtrados.map((p) => (
              <IonCard key={p.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ fontWeight: 600 }}>{p.nombres} {p.apellidos}</h2>
                    <p>DNI: {p.dni} &nbsp;|&nbsp; {p.universidad}</p>
                    <p style={{ color: '#92949c', fontSize: '0.8rem' }}>{formatFecha(p.creadoEn)}</p>
                  </IonLabel>
                  <IonBadge color="primary" slot="end" style={{ fontSize: '0.75rem' }}>
                    {p.especialidad}
                  </IonBadge>
                </IonItem>
                <div style={{ padding: '0 12px 10px' }}>
                  <IonButton
                    fill="outline"
                    size="small"
                    color="warning"
                    disabled={regenerando === p.id}
                    onClick={() => handleRegenerarClave(p.id)}
                  >
                    <IonIcon icon={keyOutline} slot="start" />
                    {regenerando === p.id ? <IonSpinner name="dots" /> : 'Regenerar clave'}
                  </IonButton>
                </div>
              </IonCard>
            ))
          )}
        </IonList>
      )}

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton color="primary">
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>

      <IonToast
        isOpen={!!toastMsg}
        onDidDismiss={() => setToastMsg('')}
        message={toastMsg}
        duration={3000}
        color={toastColor}
        position="top"
      />
    </IonContent>
    </IonPage>  );
};

// ─── Tab: Evaluaciones ────────────────────────────────────────────────────────
const EvaluacionesTab: React.FC = () => {
  useAdminGuard();
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.evaluaciones
      .listar()
      .then(setEvaluaciones)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar evaluaciones';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <IonPage>
    <AdminHeader titulo="Evaluaciones" />
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

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '8px' }}>
          {evaluaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <IonText color="medium"><p>No hay evaluaciones registradas.</p></IonText>
            </div>
          ) : (
            evaluaciones.map((ev) => (
              <IonCard key={ev.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ fontWeight: 600 }}>{ev.postulanteNombre}</h2>
                    <p>Jurado: {ev.juradoNombre}</p>
                    {ev.comentario && (
                      <p style={{ fontSize: '0.85rem', color: '#555' }}>{ev.comentario}</p>
                    )}
                    <p style={{ color: '#92949c', fontSize: '0.8rem' }}>{formatFecha(ev.evaluadoEn)}</p>
                  </IonLabel>
                  <div slot="end" style={{ textAlign: 'center', minWidth: 48 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E85520' }}>{ev.puntaje}</span>
                    <span style={{ fontSize: '0.75rem', color: '#92949c' }}>/10</span>
                  </div>
                </IonItem>
              </IonCard>
            ))
          )}
        </IonList>
      )}
    </IonContent>
    </IonPage>
  );
};

// ─── Tab: Entregas ────────────────────────────────────────────────────────────
const estadoColor: Record<string, string> = {
  PENDIENTE: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'danger',
};

const EntregasTab: React.FC = () => {
  useAdminGuard();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [saving, setSaving] = useState<number | null>(null);

  const cargar = () => {
    setLoading(true);
    api.resoluciones
      .listarTodas()
      .then(setResoluciones)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar entregas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id: number, estado: string) => {
    setSaving(id);
    try {
      await api.resoluciones.cambiarEstado(id, estado);
      setResoluciones(prev =>
        prev.map(r => r.id === id ? { ...r, estado: estado as Resolucion['estado'] } : r)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSaving(null);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const filtradas = filtroEstado
    ? resoluciones.filter(r => r.estado === filtroEstado)
    : resoluciones;

  const pendientes = resoluciones.filter(r => r.estado === 'PENDIENTE').length;

  return (
    <IonPage>
    <AdminHeader titulo="Entregas" />
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {/* Filtro por estado */}
      <div style={{ padding: '8px 12px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <IonSelect
          value={filtroEstado}
          placeholder="Todos los estados"
          onIonChange={e => setFiltroEstado(e.detail.value ?? '')}
          style={{ flex: 1, '--padding-start': '8px', fontSize: '0.9rem' }}
          interface="popover"
        >
          <IonSelectOption value="">Todos</IonSelectOption>
          <IonSelectOption value="PENDIENTE">Pendientes</IonSelectOption>
          <IonSelectOption value="APROBADA">Aprobadas</IonSelectOption>
          <IonSelectOption value="RECHAZADA">Rechazadas</IonSelectOption>
        </IonSelect>
      </div>

      {pendientes > 0 && (
        <div style={{
          background: '#fff7ed', borderLeft: '4px solid #E85520',
          margin: '10px 12px 4px', padding: '8px 12px', borderRadius: 8,
        }}>
          <IonText>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
              <strong>{pendientes}</strong> entrega{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de revisión
            </p>
          </IonText>
        </div>
      )}

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

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '4px 8px 80px' }}>
          {filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <IonText color="medium"><p>No hay entregas{filtroEstado ? ` con estado "${filtroEstado}"` : ''}.</p></IonText>
            </div>
          ) : (
            filtradas.map(r => (
              <IonCard key={r.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                      <h2 style={{ fontWeight: 600, margin: 0 }}>{r.titulo}</h2>
                      <IonBadge color={estadoColor[r.estado] ?? 'medium'}>
                        {r.estado}
                      </IonBadge>
                    </div>
                    <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#374151' }}>
                      <strong>{r.postulanteNombre}</strong>
                      {' · '}
                      <span style={{ color: '#6b7280' }}>{r.concursoTitulo}</span>
                    </p>
                    {r.descripcion && (
                      <p style={{ margin: '4px 0 2px', fontSize: '0.82rem', color: '#555', lineHeight: 1.4 }}>
                        {r.descripcion}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      {r.tieneArchivo && (
                        <a
                          href={`/api/v1/resoluciones/${r.id}/archivo`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.82rem', color: '#E85520', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <IonIcon icon={downloadOutline} style={{ fontSize: '0.9rem' }} />
                          Descargar archivo
                        </a>
                      )}
                      {r.urlExterno && (
                        <a
                          href={r.urlExterno}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.82rem', color: '#3dc2ff' }}
                        >
                          Ver enlace externo
                        </a>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#92949c', marginLeft: 'auto' }}>
                        {formatFecha(r.creadoEn)}
                      </span>
                    </div>
                  </IonLabel>
                </IonItem>

                {/* Acciones de estado */}
                {r.estado === 'PENDIENTE' && (
                  <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
                    <IonButton
                      fill="outline"
                      color="success"
                      size="small"
                      disabled={saving === r.id}
                      onClick={() => cambiarEstado(r.id, 'APROBADA')}
                    >
                      <IonIcon icon={checkmarkOutline} slot="start" />
                      {saving === r.id ? <IonSpinner name="dots" /> : 'Aprobar'}
                    </IonButton>
                    <IonButton
                      fill="outline"
                      color="danger"
                      size="small"
                      disabled={saving === r.id}
                      onClick={() => cambiarEstado(r.id, 'RECHAZADA')}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Rechazar
                    </IonButton>
                  </div>
                )}

                {r.estado !== 'PENDIENTE' && (
                  <div style={{ padding: '0 12px 10px' }}>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="medium"
                      onClick={() => cambiarEstado(r.id, 'PENDIENTE')}
                    >
                      Restablecer a Pendiente
                    </IonButton>
                  </div>
                )}
              </IonCard>
            ))
          )}
        </IonList>
      )}
    </IonContent>
    </IonPage>
  );
};

// ─── Tab: Soporte ─────────────────────────────────────────────────────────────
const SoporteTab: React.FC = () => {
  useAdminGuard();
  const [tickets, setTickets] = useState<SoporteTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    api.soporte
      .listarTickets()
      .then(setTickets)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const resolver = async (id: number) => {
    try {
      await api.soporte.resolverTicket(id);
      cargar();
    } catch {
      // silencioso
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const pendientes = tickets.filter(t => !t.resuelto).length;

  return (
    <IonPage>
    <AdminHeader titulo="Soporte" />
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

      {!loading && !error && (
        <>
          {pendientes > 0 && (
            <div style={{
              background: '#fff7ed', borderLeft: '4px solid #E85520',
              margin: '12px 8px 4px', padding: '10px 14px', borderRadius: 8,
            }}>
              <IonText>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
                  <strong>{pendientes}</strong> ticket{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de resolución
                </p>
              </IonText>
            </div>
          )}

          <IonList style={{ background: 'transparent', padding: '8px' }}>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <IonText color="medium"><p>No hay tickets de soporte.</p></IonText>
              </div>
            ) : (
              tickets.map(t => (
                <IonCard key={t.id} style={{ margin: '8px 0', opacity: t.resuelto ? 0.6 : 1 }}>
                  <IonItem lines="none">
                    <IonLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <h2 style={{ fontWeight: 600, margin: 0 }}>{t.nombre}</h2>
                        {t.resuelto
                          ? <IonBadge color="success">Resuelto</IonBadge>
                          : <IonBadge color="warning">Pendiente</IonBadge>
                        }
                      </div>
                      {t.dni && (
                        <p style={{ margin: '2px 0', fontSize: '0.82rem', color: '#6b7280' }}>DNI: {t.dni}</p>
                      )}
                      <p style={{ margin: '6px 0', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
                        {t.mensaje}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#92949c' }}>{formatFecha(t.creadoEn)}</p>
                    </IonLabel>
                    {!t.resuelto && (
                      <IonButton
                        slot="end" fill="outline" color="success" size="small"
                        onClick={() => resolver(t.id)}
                      >
                        <IonIcon icon={checkmarkOutline} slot="start" />
                        Resolver
                      </IonButton>
                    )}
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

// ─── AdminPage — solo IonTabs, sin IonPage propio ─────────────────────────────
const AdminPage: React.FC = () => (
  <>
  <OnboardingAdminTour />
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/admin/dashboard" component={DashboardTab} />
      <Route exact path="/admin/postulantes" component={PostulantesTab} />
      <Route exact path="/admin/evaluaciones" component={EvaluacionesTab} />
      <Route exact path="/admin/entregas" component={EntregasTab} />
      <Route exact path="/admin/soporte" component={SoporteTab} />
      <Route exact path="/admin"><Redirect to="/admin/dashboard" /></Route>
    </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="dashboard" href="/admin/dashboard">
            <IonIcon icon={gridOutline} />
            <IonLabel>Dashboard</IonLabel>
          </IonTabButton>
          <IonTabButton tab="postulantes" href="/admin/postulantes">
            <IonIcon icon={peopleOutline} />
            <IonLabel>Postulantes</IonLabel>
          </IonTabButton>
          <IonTabButton tab="evaluaciones" href="/admin/evaluaciones">
            <IonIcon icon={starOutline} />
            <IonLabel>Jurado</IonLabel>
          </IonTabButton>
          <IonTabButton tab="entregas" href="/admin/entregas">
            <IonIcon icon={documentTextOutline} />
            <IonLabel>Entregas</IonLabel>
          </IonTabButton>
          <IonTabButton tab="soporte" href="/admin/soporte">
            <IonIcon icon={helpCircleOutline} />
            <IonLabel>Soporte</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
  </>
);

export default AdminPage;
