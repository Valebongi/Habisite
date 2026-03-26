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
} from '@ionic/react';
import {
  gridOutline,
  peopleOutline,
  starOutline,
  addOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, AdminStats, Postulante, Evaluacion } from '../../services/api';

// ─── Guard de sesión ──────────────────────────────────────────────────────────
const useAdminGuard = () => {
  const history = useHistory();
  useEffect(() => {
    if (!sessionStorage.getItem('admin_ok')) {
      history.replace('/login');
    }
  }, [history]);
};

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
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent style={{ '--background': '#f4f5f7' }}>
        <div style={{ padding: 24 }}>
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        </div>
      </IonContent>
    );
  }

  const especialidades = stats ? Object.keys(stats.porEspecialidad).length : 0;
  const universidades = stats ? Object.keys(stats.porUniversidad).length : 0;

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      <IonGrid style={{ padding: 16 }}>
        {/* Tarjetas de estadísticas */}
        <IonRow>
          <IonCol size="6" sizeMd="3">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E85520' }}>
                  {stats?.totalPostulantes ?? 0}
                </div>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Postulantes</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E85520' }}>
                  {stats?.totalEvaluaciones ?? 0}
                </div>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Evaluaciones</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E85520' }}>
                  {universidades}
                </div>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Universidades</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6" sizeMd="3">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#E85520' }}>
                  {especialidades}
                </div>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Especialidades</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        {/* Placeholder para gráficos */}
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1rem' }}>Por Especialidad</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9f9f9',
                    borderRadius: 8,
                    color: '#92949c',
                    fontSize: '0.9rem',
                  }}
                >
                  {/* Implementar con Chart.js */}
                  Implementar con Chart.js
                </div>
                {stats && (
                  <IonList style={{ marginTop: 12 }}>
                    {Object.entries(stats.porEspecialidad).map(([esp, count]) => (
                      <IonItem key={esp} lines="none" style={{ '--padding-start': 0 }}>
                        <IonLabel>
                          <p style={{ margin: 0 }}>{esp}</p>
                        </IonLabel>
                        <IonBadge color="primary" slot="end">{count}</IonBadge>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1rem' }}>Por Universidad</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9f9f9',
                    borderRadius: 8,
                    color: '#92949c',
                    fontSize: '0.9rem',
                  }}
                >
                  {/* Implementar con Chart.js */}
                  Implementar con Chart.js
                </div>
                {stats && (
                  <IonList style={{ marginTop: 12 }}>
                    {Object.entries(stats.porUniversidad).map(([univ, count]) => (
                      <IonItem key={univ} lines="none" style={{ '--padding-start': 0 }}>
                        <IonLabel>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>{univ}</p>
                        </IonLabel>
                        <IonBadge color="primary" slot="end">{count}</IonBadge>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

// ─── Tab: Postulantes ─────────────────────────────────────────────────────────
const PostulantesTab: React.FC = () => {
  useAdminGuard();
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
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
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        </div>
      )}

      {!loading && !error && (
        <IonList style={{ background: 'transparent', padding: '0 8px' }}>
          {filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <IonText color="medium">
                <p>No se encontraron postulantes.</p>
              </IonText>
            </div>
          ) : (
            filtrados.map((p) => (
              <IonCard key={p.id} style={{ margin: '8px 0' }}>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ fontWeight: 600 }}>{p.nombres} {p.apellidos}</h2>
                    <p>DNI: {p.dni} &nbsp;|&nbsp; {p.universidad}</p>
                    <p style={{ color: '#92949c', fontSize: '0.8rem' }}>
                      {formatFecha(p.creadoEn)}
                    </p>
                  </IonLabel>
                  <IonBadge color="primary" slot="end" style={{ fontSize: '0.75rem' }}>
                    {p.especialidad}
                  </IonBadge>
                </IonItem>
              </IonCard>
            ))
          )}
        </IonList>
      )}

      {/* FAB para futuro uso (ej. agregar postulante manualmente) */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton color="primary">
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonContent>
  );
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
                <p>No hay evaluaciones registradas.</p>
              </IonText>
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

// ─── AdminPage principal con Tabs ─────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const history = useHistory();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_ok');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Panel Admin</IonTitle>
          <IonButtons slot="end">
            <IonButton color="light" fill="clear" onClick={handleLogout}>
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/admin/dashboard" render={() => <IonTab tab="dashboard"><DashboardTab /></IonTab>} />
          <Route exact path="/admin/postulantes" render={() => <IonTab tab="postulantes"><PostulantesTab /></IonTab>} />
          <Route exact path="/admin/evaluaciones" render={() => <IonTab tab="evaluaciones"><EvaluacionesTab /></IonTab>} />
          <Route exact path="/admin">
            <Redirect to="/admin/dashboard" />
          </Route>
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
            <IonLabel>Evaluaciones</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default AdminPage;
