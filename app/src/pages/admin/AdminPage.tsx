import React, { useCallback, useEffect, useState } from 'react';
import { IonPage, IonContent, IonSpinner, IonIcon, useIonToast } from '@ionic/react';
import { AdminMainTour, AdminSectionTour, onboardingPending, sectionTourPending } from './AdminOnboarding';
import {
  gridOutline, peopleOutline, starOutline, clipboardOutline,
  barChartOutline, documentTextOutline, helpCircleOutline,
  ribbonOutline, settingsOutline, mailOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import {
  api, AdminStats, Postulante, Evaluacion,
  SoporteTicket, Resolucion, CampanaInfoRequest,
  Concurso, UsuarioInfo, PublicacionInfo, RecursoInfo,
} from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  orange:  '#E85520',
  dark:    '#111827',
  gray:    '#6b7280',
  border:  '#e5e7eb',
  bg:      '#f4f5f7',
  white:   '#ffffff',
} as const;

const CHART_COLORS = ['#E85520', '#3dc2ff', '#2dd36f', '#ffc409', '#eb445a', '#92949c', '#6a64f1', '#f97316'];

// ─── Tipos internos ───────────────────────────────────────────────────────────
interface AreaItem {
  id: string;
  seccion: string;
  tipo: string;
  responsable: string;
  ultimaMod: string;
  estado: 'publicado' | 'revision' | 'pendiente';
}

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  sub?: { id: string; label: string }[];
}

// ─── Mock de áreas del sitio (conectar con API cuando esté disponible) ────────
const AREAS: AreaItem[] = [
  { id: '1',  seccion: 'Hero / Banner principal',    tipo: 'Imagen + texto',  responsable: 'Admin',        ultimaMod: '2026-03-20', estado: 'publicado' },
  { id: '2',  seccion: 'Objetivo del concurso',      tipo: 'Texto',           responsable: 'Admin',        ultimaMod: '2026-03-18', estado: 'publicado' },
  { id: '3',  seccion: 'Fases del concurso',         tipo: 'Contenido',       responsable: 'Sin asignar',  ultimaMod: '—',          estado: 'pendiente' },
  { id: '4',  seccion: 'Cronograma de fechas',       tipo: 'Imagen / Tabla',  responsable: 'Sin asignar',  ultimaMod: '—',          estado: 'pendiente' },
  { id: '5',  seccion: 'Bases y Condiciones',        tipo: 'Documento PDF',   responsable: 'Admin',        ultimaMod: '2026-03-22', estado: 'revision'  },
  { id: '6',  seccion: 'Premios',                    tipo: 'Contenido',       responsable: 'Sin asignar',  ultimaMod: '—',          estado: 'pendiente' },
  { id: '7',  seccion: 'Formulario de inscripción',  tipo: 'Formulario',      responsable: 'Admin',        ultimaMod: '2026-03-25', estado: 'publicado' },
  { id: '8',  seccion: 'Jurado',                     tipo: 'Perfiles',        responsable: 'Sin asignar',  ultimaMod: '—',          estado: 'pendiente' },
  { id: '9',  seccion: 'Galería / Participantes',    tipo: 'Galería',         responsable: 'Sin asignar',  ultimaMod: '—',          estado: 'pendiente' },
  { id: '10', seccion: 'Footer y contacto',          tipo: 'Contenido',       responsable: 'Admin',        ultimaMod: '2026-03-15', estado: 'publicado' },
];

// ─── Menú lateral ─────────────────────────────────────────────────────────────
const MENU: MenuItem[] = [
  { id: 'dashboard',    icon: gridOutline,         label: 'Dashboard' },
  { id: 'postulantes',  icon: peopleOutline,        label: 'Postulantes' },
  { id: 'campanas',     icon: mailOutline,           label: 'Campanas' },
  { id: 'evaluaciones', icon: starOutline,           label: 'Evaluaciones' },
  {
    id: 'areas', icon: clipboardOutline, label: 'Relevamiento de Áreas',
    sub: [
      { id: 'areas-sitio',         label: 'Secciones del sitio' },
      { id: 'areas-publicaciones', label: 'Publicaciones' },
      { id: 'areas-recursos',      label: 'Imágenes y recursos' },
    ],
  },
  { id: 'estadisticas',  icon: barChartOutline,      label: 'Estadísticas' },
  { id: 'entregas',      icon: documentTextOutline,  label: 'Entregas' },
  { id: 'soporte',       icon: helpCircleOutline,    label: 'Soporte' },
  { id: 'jurado',        icon: ribbonOutline,        label: 'Jurado' },
  { id: 'configuracion', icon: settingsOutline,      label: 'Configuración' },
];

// ─── Helpers de UI ────────────────────────────────────────────────────────────
const OrangeBar: React.FC<{ label: string; action?: React.ReactNode }> = ({ label, action }) => (
  <div style={{ background: C.orange, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderRadius: 14 }}>
    <span style={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>
      {label}
    </span>
    {action}
  </div>
);

const StatCard: React.FC<{ value: string | number; label: string; sub?: string }> = ({ value, label, sub }) => (
  <div style={{ background: C.white, borderRadius: 10, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.07)', borderLeft: `4px solid ${C.orange}`, flex: 1, minWidth: 160 }}>
    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: C.dark, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
  </div>
);

const ChartBox: React.FC<{ label: string; height?: number }> = ({ label, height = 180 }) => (
  <div style={{ height, background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem', border: `2px dashed ${C.border}`, letterSpacing: '0.5px' }}>
    {label}
  </div>
);

const Badge: React.FC<{ estado: AreaItem['estado'] }> = ({ estado }) => {
  const map = {
    publicado: { bg: '#f0fdf4', color: '#16a34a', label: 'Publicado' },
    revision:  { bg: '#fff7ed', color: C.orange,  label: 'En revisión' },
    pendiente: { bg: '#f3f4f6', color: C.gray,    label: 'Pendiente' },
  };
  const s = map[estado];
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

// ─── Secciones de contenido ───────────────────────────────────────────────────

const SecDashboard: React.FC<{ stats: AdminStats | null; postulantes: Postulante[]; evaluaciones: Evaluacion[] }> = ({ stats, postulantes, evaluaciones }) => {
  const publicadas  = AREAS.filter(a => a.estado === 'publicado').length;
  const pendientes  = AREAS.filter(a => a.estado === 'pendiente').length;
  const sinAsignar  = AREAS.filter(a => a.responsable === 'Sin asignar').length;
  const promPuntaje = evaluaciones.length
    ? (evaluaciones.reduce((s, e) => s + e.puntaje, 0) / evaluaciones.length).toFixed(1)
    : '—';

  return (
    <div>
      <OrangeBar label="Dashboard" />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={stats?.totalPostulantes ?? '—'} label="Total postulantes" sub="inscriptos al concurso" />
        <StatCard value={stats?.totalEvaluaciones ?? '—'} label="Evaluaciones" sub="realizadas por el jurado" />
        <StatCard value={promPuntaje} label="Puntaje promedio" sub="sobre 10 puntos" />
        <StatCard value={Object.keys(stats?.porUniversidad ?? {}).length || '—'} label="Universidades" sub="representadas" />
      </div>

      <OrangeBar label="Campanas de comunicacion" />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={stats?.totalInfoEnviada ?? '—'} label="Info enviada" sub="postulantes notificados" />
        <StatCard value={stats?.totalConfirmados ?? '—'} label="Confirmados" sub="inscripcion oficial" />
        <StatCard value={stats?.porcentajeConfirmacion != null ? `${stats.porcentajeConfirmacion.toFixed(1)}%` : '—'} label="Tasa confirmacion" sub="interes real" />
      </div>

      <OrangeBar label="Estado del sitio" />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={publicadas}  label="Secciones publicadas"   sub={`de ${AREAS.length} totales`} />
        <StatCard value={pendientes}  label="Secciones pendientes"   sub="sin contenido aún" />
        <StatCard value={sinAsignar}  label="Sin responsable"        sub="requieren asignación" />
      </div>

      <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Áreas sin responsable asignado</div>
        {AREAS.filter(a => a.responsable === 'Sin asignar').map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.seccion}</div>
              <div style={{ fontSize: '0.75rem', color: C.gray }}>{a.tipo}</div>
            </div>
            <Badge estado={a.estado} />
          </div>
        ))}
      </div>

      <OrangeBar label="Últimos registros" />
      <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        {postulantes.length === 0
          ? <div style={{ padding: 32, textAlign: 'center', color: C.gray, fontSize: '0.875rem' }}>Sin postulantes registrados aún</div>
          : postulantes.slice(-5).reverse().map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid #f3f4f6` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.nombres} {p.apellidos}</div>
                  <div style={{ fontSize: '0.75rem', color: C.gray }}>{p.universidad}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#fff3ee', color: C.orange, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>{p.especialidad}</span>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>{new Date(p.creadoEn).toLocaleDateString('es-AR')}</div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
};

const SecPostulantes: React.FC<{ postulantes: Postulante[]; loading: boolean; reload: () => void }> = ({ postulantes, loading, reload }) => {
  const [q, setQ] = useState('');
  const [filtroEsp, setFiltroEsp] = useState('');
  const [regenerando, setRegenerando] = useState<number | null>(null);
  const especialidades = [...new Set(postulantes.map(p => p.especialidad))].sort();
  const filtrados = postulantes.filter(p => {
    const s = q.toLowerCase();
    const matchQ = !s || p.nombres.toLowerCase().includes(s) || p.apellidos.toLowerCase().includes(s) || p.dni.includes(s) || p.universidad.toLowerCase().includes(s);
    const matchE = !filtroEsp || p.especialidad === filtroEsp;
    return matchQ && matchE;
  });

  const exportCSV = () => {
    const header = 'ID,Nombres,Apellidos,DNI,Celular,Universidad,Especialidad,Correo,Fecha';
    const rows = filtrados.map(p => `${p.id},${p.nombres},${p.apellidos},${p.dni},${p.celular},${p.universidad},${p.especialidad},${p.correoElectronico},${p.creadoEn}`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'postulantes.csv'; a.click();
  };

  const handleRegenerarClave = async (id: number) => {
    setRegenerando(id);
    try { await api.postulantes.regenerarClave(id); }
    catch { /* silencioso */ }
    finally { setRegenerando(null); }
  };

  return (
    <div>
      <OrangeBar
        label={`Postulantes (${filtrados.length})`}
        action={
          <div id="tour-postulantes-actions" style={{ display: 'flex', gap: 8 }}>
            <button onClick={reload}    style={btnOutlineWhite}>↻ Actualizar</button>
            <button onClick={exportCSV} style={btnOutlineWhite}>↓ CSV</button>
          </div>
        }
      />

      <div id="tour-postulantes-filter" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Buscar nombre, DNI, universidad…"
          style={{ flex: 1, minWidth: 220, padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 999, fontSize: '0.875rem', outline: 'none' }}
        />
        <select value={filtroEsp} onChange={e => setFiltroEsp(e.target.value)}
          style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 999, fontSize: '0.875rem', color: C.dark, background: '#fff', cursor: 'pointer' }}>
          <option value="">Todas las especialidades</option>
          {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div>
        : (
          <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Nombre', 'DNI', 'Universidad', 'Especialidad', 'Correo', 'Registrado', 'Acciones'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: C.gray }}>Sin resultados</td></tr>
                    : filtrados.map(p => (
                        <tr key={p.id} style={{ borderBottom: `1px solid #f3f4f6` }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}>
                          <td style={{ padding: '12px 16px', color: C.gray }}>{p.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.nombres} {p.apellidos}</td>
                          <td style={{ padding: '12px 16px' }}>{p.dni}</td>
                          <td style={{ padding: '12px 16px' }}>{p.universidad}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: '#fff3ee', color: C.orange, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.especialidad}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: C.gray }}>{p.correoElectronico}</td>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: C.gray }}>{new Date(p.creadoEn).toLocaleDateString('es-AR')}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleRegenerarClave(p.id)}
                              disabled={regenerando === p.id}
                              style={{ ...btnSm, whiteSpace: 'nowrap', opacity: regenerando === p.id ? 0.5 : 1 }}
                            >
                              {regenerando === p.id ? '…' : '🔑 Clave'}
                            </button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
};

const SecEvaluaciones: React.FC<{ evaluaciones: Evaluacion[]; loading: boolean; reload: () => void }> = ({ evaluaciones, loading, reload }) => {
  const promedio = evaluaciones.length
    ? (evaluaciones.reduce((s, e) => s + e.puntaje, 0) / evaluaciones.length).toFixed(1)
    : null;
  const porJurado: Record<string, { count: number; total: number }> = {};
  evaluaciones.forEach(e => {
    if (!porJurado[e.juradoNombre]) porJurado[e.juradoNombre] = { count: 0, total: 0 };
    porJurado[e.juradoNombre].count++;
    porJurado[e.juradoNombre].total += e.puntaje;
  });

  return (
    <div>
      <OrangeBar label={`Evaluaciones (${evaluaciones.length})`} action={<button onClick={reload} style={btnOutlineWhite}>↻ Actualizar</button>} />

      {promedio && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard value={promedio} label="Puntaje promedio" sub="del jurado" />
          <StatCard value={evaluaciones.length} label="Evaluaciones totales" />
          <StatCard value={Object.keys(porJurado).length} label="Jurados activos" />
          <StatCard value={Math.max(...evaluaciones.map(e => e.puntaje))} label="Puntaje más alto" sub="/ 10 puntos" />
        </div>
      )}

      {Object.keys(porJurado).length > 0 && (
        <>
          <OrangeBar label="Actividad por jurado" />
          <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 24 }}>
            {Object.entries(porJurado).map(([nombre, d]) => (
              <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid #f3f4f6` }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{nombre}</div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: C.gray }}>{d.count} evaluación{d.count !== 1 ? 'es' : ''}</span>
                  <span style={{ fontWeight: 700, color: C.orange, fontSize: '1rem' }}>{(d.total / d.count).toFixed(1)}<span style={{ fontSize: '0.7rem', color: C.gray }}>/10</span></span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <OrangeBar label="Detalle de evaluaciones" />
      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div>
        : (
          <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['#', 'Postulante', 'Jurado', 'Puntaje', 'Comentario', 'Fecha'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: C.gray }}>Sin evaluaciones aún</td></tr>
                    : evaluaciones.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', color: C.gray }}>{e.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{e.postulanteNombre}</td>
                          <td style={{ padding: '12px 16px' }}>{e.juradoNombre}</td>
                          <td style={{ padding: '12px 16px' }}><strong style={{ color: C.orange, fontSize: '1.1rem' }}>{e.puntaje}</strong><span style={{ color: C.gray, fontSize: '0.75rem' }}>/10</span></td>
                          <td style={{ padding: '12px 16px', color: C.gray, maxWidth: 240 }}>{e.comentario || '—'}</td>
                          <td style={{ padding: '12px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{new Date(e.evaluadoEn).toLocaleDateString('es-AR')}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
};

const SecAreasSitio: React.FC = () => {
  const [areas, setAreas] = useState<AreaItem[]>(AREAS);

  const asignar = (id: string) => {
    const nombre = prompt('Nombre del responsable:');
    if (!nombre) return;
    setAreas(prev => prev.map(a => a.id === id ? { ...a, responsable: nombre, ultimaMod: new Date().toISOString().slice(0, 10) } : a));
  };

  const cambiarEstado = (id: string, estado: AreaItem['estado']) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, estado, ultimaMod: new Date().toISOString().slice(0, 10) } : a));
  };

  const pub  = areas.filter(a => a.estado === 'publicado').length;
  const rev  = areas.filter(a => a.estado === 'revision').length;
  const pend = areas.filter(a => a.estado === 'pendiente').length;

  return (
    <div>
      <OrangeBar label="Relevamiento — Secciones del sitio" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <StatCard value={pub}  label="Publicadas"  sub="en el sitio" />
        <StatCard value={rev}  label="En revisión" sub="requieren aprobación" />
        <StatCard value={pend} label="Pendientes"  sub="sin contenido" />
      </div>

      <div id="tour-areas-table" style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Sección', 'Tipo de contenido', 'Responsable', 'Última modif.', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 600 }}>{a.seccion}</td>
                  <td style={{ padding: '13px 16px', color: C.gray }}>{a.tipo}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ color: a.responsable === 'Sin asignar' ? '#dc2626' : C.dark, fontWeight: a.responsable === 'Sin asignar' ? 600 : 400 }}>
                      {a.responsable}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{a.ultimaMod}</td>
                  <td style={{ padding: '13px 16px' }}><Badge estado={a.estado} /></td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => asignar(a.id)} style={btnSm}>Asignar</button>
                      <select
                        value={a.estado}
                        onChange={e => cambiarEstado(a.id, e.target.value as AreaItem['estado'])}
                        style={{ padding: '4px 12px', border: `1px solid ${C.border}`, borderRadius: 999, fontSize: '0.75rem', cursor: 'pointer', background: '#fff' }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="revision">En revisión</option>
                        <option value="publicado">Publicado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: '0.75rem', color: C.gray }}>
        * Los cambios de responsable y estado son locales hasta integrar la API de gestión de contenido.
      </div>
    </div>
  );
};

const SecEstadisticas: React.FC<{ stats: AdminStats | null; postulantes: Postulante[]; evaluaciones: Evaluacion[] }> = ({ stats }) => {
  const espData = stats
    ? Object.entries(stats.porEspecialidad).map(([name, value]) => ({ name, value: Number(value) }))
    : [];
  const univData = stats
    ? Object.entries(stats.porUniversidad).map(([name, value]) => ({ name, value: Number(value) }))
    : [];
  const resolucionesPie = stats
    ? [
        { name: 'Pendientes', value: Number(stats.resolucionesPendientes) },
        { name: 'Aprobadas',  value: Number(stats.resolucionesAprobadas)  },
        { name: 'Rechazadas', value: Number(stats.resolucionesRechazadas) },
      ].filter(d => d.value > 0)
    : [];
  const PIE_COLORS = ['#ffc409', '#2dd36f', '#eb445a'];

  return (
    <div>
      <OrangeBar label="Estadísticas del concurso" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard value={stats?.totalPostulantes ?? '—'}  label="Total postulantes" />
        <StatCard value={stats?.totalEvaluaciones ?? '—'} label="Evaluaciones" />
        <StatCard value={stats?.totalResoluciones ?? '—'} label="Entregas" />
        <StatCard value={Object.keys(stats?.porUniversidad ?? {}).length || '—'} label="Universidades" />
      </div>

      {resolucionesPie.length > 0 && (
        <>
          <OrangeBar label="Entregas por estado" />
          <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={resolucionesPie} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80}
                  label={({ percent }: { percent?: number }) => percent != null ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {resolucionesPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '0.8rem' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16 }}>Postulantes por especialidad</div>
          {espData.length === 0
            ? <ChartBox label="Sin datos aún" />
            : (
              <ResponsiveContainer width="100%" height={Math.max(160, espData.length * 36)}>
                <BarChart data={espData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v} />
                  <Tooltip />
                  <Bar dataKey="value" name="Postulantes" radius={[0, 4, 4, 0]}>
                    {espData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16 }}>Ranking de universidades</div>
          {univData.length === 0
            ? <ChartBox label="Sin datos aún" />
            : (
              <ResponsiveContainer width="100%" height={Math.max(160, univData.length * 36)}>
                <BarChart data={univData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 15) + '…' : v} />
                  <Tooltip />
                  <Bar dataKey="value" name="Postulantes" radius={[0, 4, 4, 0]}>
                    {univData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>
    </div>
  );
};

// ─── Sección Entregas ─────────────────────────────────────────────────────────
const estadoEntregaColor: Record<string, string> = {
  PENDIENTE: '#ffc409',
  APROBADA:  '#2dd36f',
  RECHAZADA: '#eb445a',
};

const SecEntregas: React.FC = () => {
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [saving, setSaving] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setResoluciones(await api.resoluciones.listarTodas()); }
    catch { /* silencioso */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id: number, estado: string) => {
    setSaving(id);
    try {
      await api.resoluciones.cambiarEstado(id, estado);
      setResoluciones(prev => prev.map(r => r.id === id ? { ...r, estado: estado as Resolucion['estado'] } : r));
    } catch { /* silencioso */ }
    finally { setSaving(null); }
  };

  const filtradas = filtroEstado ? resoluciones.filter(r => r.estado === filtroEstado) : resoluciones;
  const pendientes = resoluciones.filter(r => r.estado === 'PENDIENTE').length;

  return (
    <div>
      <OrangeBar
        label={`Entregas (${filtradas.length})`}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              id="tour-entregas-filter"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              style={{ padding: '6px 14px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, fontSize: '0.75rem', color: '#fff', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
            <button onClick={cargar} style={btnOutlineWhite}>↻ Actualizar</button>
          </div>
        }
      />

      {pendientes > 0 && (
        <div style={{ background: '#fff7ed', borderLeft: `4px solid ${C.orange}`, padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
            <strong>{pendientes}</strong> entrega{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de revisión
          </span>
        </div>
      )}

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div>
        : filtradas.length === 0
          ? <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', color: C.gray, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
              No hay entregas{filtroEstado ? ` con estado "${filtroEstado}"` : ''}
            </div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtradas.map(r => (
                <div key={r.id} style={{ background: C.white, borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.titulo}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                        background: `${estadoEntregaColor[r.estado]}22`,
                        color: estadoEntregaColor[r.estado],
                      }}>
                        {r.estado}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: C.gray, whiteSpace: 'nowrap' }}>
                      {new Date(r.creadoEn).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: C.gray, marginBottom: 6 }}>
                    <strong style={{ color: C.dark }}>{r.postulanteNombre}</strong> · {r.concursoTitulo}
                  </div>
                  {r.descripcion && (
                    <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: 8, lineHeight: 1.4 }}>{r.descripcion}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {r.tieneArchivo && (
                      <a href={`/api/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: C.orange, textDecoration: 'none' }}>
                        ↓ Descargar archivo
                      </a>
                    )}
                    {r.urlExterno && (
                      <a href={r.urlExterno} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#3dc2ff', textDecoration: 'none' }}>
                        Ver enlace externo
                      </a>
                    )}
                    {r.estado === 'PENDIENTE' && (
                      <>
                        <button onClick={() => cambiarEstado(r.id, 'APROBADA')} disabled={saving === r.id}
                          style={{ ...btnSm, color: '#16a34a', borderColor: '#bbf7d0' }}>
                          {saving === r.id ? '…' : '✓ Aprobar'}
                        </button>
                        <button onClick={() => cambiarEstado(r.id, 'RECHAZADA')} disabled={saving === r.id}
                          style={{ ...btnSm, color: '#dc2626', borderColor: '#fecaca' }}>
                          ✗ Rechazar
                        </button>
                      </>
                    )}
                    {r.estado !== 'PENDIENTE' && (
                      <button onClick={() => cambiarEstado(r.id, 'PENDIENTE')}
                        style={{ ...btnSm, marginLeft: 'auto' }}>
                        Restablecer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      }
    </div>
  );
};

// ─── Sección Soporte ──────────────────────────────────────────────────────────
const SecSoporte: React.FC = () => {
  const [tickets, setTickets] = useState<SoporteTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setTickets(await api.soporte.listarTickets()); }
    catch { /* silencioso */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (id: number) => {
    try { await api.soporte.resolverTicket(id); cargar(); }
    catch { /* silencioso */ }
  };

  const pendientes = tickets.filter(t => !t.resuelto).length;

  return (
    <div>
      <OrangeBar
        label={`Soporte (${tickets.length})`}
        action={<button onClick={cargar} style={btnOutlineWhite}>↻ Actualizar</button>}
      />

      {pendientes > 0 && (
        <div id="tour-soporte-alert" style={{ background: '#fff7ed', borderLeft: `4px solid ${C.orange}`, padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
            <strong>{pendientes}</strong> ticket{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de resolución
          </span>
        </div>
      )}

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div>
        : tickets.length === 0
          ? <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', color: C.gray, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
              No hay tickets de soporte
            </div>
          : (
            <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
              {tickets.map(t => (
                <div key={t.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, opacity: t.resuelto ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.nombre}</span>
                      {t.dni && <span style={{ fontSize: '0.75rem', color: C.gray }}>DNI: {t.dni}</span>}
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                        background: t.resuelto ? '#f0fdf4' : '#fff7ed',
                        color: t.resuelto ? '#16a34a' : '#92400e',
                      }}>
                        {t.resuelto ? 'Resuelto' : 'Pendiente'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: C.gray, whiteSpace: 'nowrap' }}>
                      {new Date(t.creadoEn).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 8px', lineHeight: 1.5 }}>{t.mensaje}</p>
                  {!t.resuelto && (
                    <button onClick={() => resolver(t.id)} style={{ ...btnSm, color: '#16a34a', borderColor: '#bbf7d0' }}>
                      ✓ Marcar como resuelto
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
      }
    </div>
  );
};

const SecJurado: React.FC<{ evaluaciones: Evaluacion[] }> = ({ evaluaciones }) => {
  const porJurado: Record<string, { count: number; total: number; max: number; min: number }> = {};
  evaluaciones.forEach(e => {
    if (!porJurado[e.juradoNombre]) porJurado[e.juradoNombre] = { count: 0, total: 0, max: 0, min: 11 };
    const j = porJurado[e.juradoNombre];
    j.count++; j.total += e.puntaje;
    if (e.puntaje > j.max) j.max = e.puntaje;
    if (e.puntaje < j.min) j.min = e.puntaje;
  });

  return (
    <div>
      <OrangeBar label={`Jurado (${Object.keys(porJurado).length} activos)`} />

      {Object.keys(porJurado).length === 0
        ? (
          <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', color: C.gray, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            Ningún miembro del jurado ha realizado evaluaciones aún
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Object.entries(porJurado).map(([nombre, d]) => (
              <div key={nombre} style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)', borderTop: `4px solid ${C.orange}` }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>{nombre}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8rem' }}>
                  <div style={{ background: C.bg, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: C.gray, fontSize: '0.7rem' }}>Evaluaciones</div>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: C.dark }}>{d.count}</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: C.gray, fontSize: '0.7rem' }}>Promedio</div>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: C.orange }}>{(d.total / d.count).toFixed(1)}</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: C.gray, fontSize: '0.7rem' }}>Puntaje máx.</div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>{d.max}/10</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: C.gray, fontSize: '0.7rem' }}>Puntaje mín.</div>
                    <div style={{ fontWeight: 700, color: C.gray }}>{d.min === 11 ? '—' : d.min}/10</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

// ─── Sección Campañas ─────────────────────────────────────────────────────────
const SecCampanas: React.FC<{ stats: AdminStats | null; postulantes: Postulante[]; reload: () => void; reloadStats: () => void }> = ({ stats, postulantes, reload, reloadStats }) => {
  const [webinarUrl, setWebinarUrl] = useState('');
  const [webinarFecha, setWebinarFecha] = useState('');
  const [canalUrl, setCanalUrl] = useState('');
  const [canalNombre, setCanalNombre] = useState('WhatsApp');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const formValido = webinarUrl.trim() && webinarFecha && canalUrl.trim();

  const enviarInfo = async () => {
    if (!formValido) return;
    const pendientes = postulantes.filter(p => !p.infoEnviadaEn).length;
    if (!confirm(`Se enviaran emails a ${pendientes} postulante${pendientes !== 1 ? 's' : ''}. ¿Continuar?`)) return;
    setEnviando(true);
    setResultado(null);
    try {
      const data: CampanaInfoRequest = {
        webinarUrl: webinarUrl.trim(),
        webinarFecha: new Date(webinarFecha).toISOString(),
        canalUrl: canalUrl.trim(),
        canalNombre,
      };
      const res = await api.campanas.enviarInfoConcurso(data);
      setResultado({ msg: `${res.emailsEnviados} emails enviados, ${res.emailsOmitidos} omitidos.`, tipo: 'ok' });
      reload();
      reloadStats();
    } catch {
      setResultado({ msg: 'Error al enviar la campaña.', tipo: 'err' });
    } finally {
      setEnviando(false);
    }
  };

  const enviar2da = async () => {
    const noConf = postulantes.filter(p => p.infoEnviadaEn && !p.confirmadoEn).length;
    if (!confirm(`Se enviaran ${noConf} recordatorio${noConf !== 1 ? 's' : ''}. ¿Continuar?`)) return;
    setEnviando(true);
    setResultado(null);
    try {
      const res = await api.campanas.enviarSegundaConvocatoria();
      setResultado({ msg: `${res.emailsEnviados} recordatorios enviados.`, tipo: 'ok' });
      reload();
      reloadStats();
    } catch {
      setResultado({ msg: 'Error al enviar recordatorios.', tipo: 'err' });
    } finally {
      setEnviando(false);
    }
  };

  const badgeEstado = (p: Postulante) => {
    if (p.confirmadoEn) return { label: 'Confirmado', bg: '#f0fdf4', color: '#16a34a' };
    if (p.recordatorioEnviadoEn) return { label: 'Recordatorio enviado', bg: '#fff7ed', color: '#92400e' };
    if (p.infoEnviadaEn) return { label: 'Info enviada', bg: '#eff6ff', color: '#1e40af' };
    return { label: 'Pendiente', bg: '#f3f4f6', color: C.gray };
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <OrangeBar label="Campanas de comunicacion" />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={stats?.totalInfoEnviada ?? '—'} label="Info enviada" sub="postulantes notificados" />
        <StatCard value={stats?.totalConfirmados ?? '—'} label="Confirmados" sub="inscripcion oficial" />
        <StatCard value={stats?.porcentajeConfirmacion != null ? `${stats.porcentajeConfirmacion.toFixed(1)}%` : '—'} label="Tasa confirmacion" sub="interes real" />
        <StatCard value={stats?.totalRecordatorioEnviado ?? '—'} label="Recordatorios" sub="2da convocatoria" />
      </div>

      {/* Resultado */}
      {resultado && (
        <div style={{
          background: resultado.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
          borderLeft: `4px solid ${resultado.tipo === 'ok' ? '#16a34a' : '#dc2626'}`,
          padding: '10px 16px', borderRadius: 8, marginBottom: 16,
        }}>
          <span style={{ fontSize: '0.875rem', color: resultado.tipo === 'ok' ? '#166534' : '#991b1b' }}>
            {resultado.msg}
          </span>
        </div>
      )}

      {/* Formulario Paso 2 */}
      <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>Paso 2 — Enviar informacion del concurso</div>
        <p style={{ fontSize: '0.8rem', color: C.gray, margin: '0 0 16px' }}>
          Envia un email con info detallada + link de confirmacion a todos los postulantes que aun no lo recibieron.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600, display: 'block', marginBottom: 4 }}>URL del Webinar</label>
            <input value={webinarUrl} onChange={e => setWebinarUrl(e.target.value)} placeholder="https://meet.google.com/..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600, display: 'block', marginBottom: 4 }}>Fecha del Webinar</label>
            <input type="datetime-local" value={webinarFecha} onChange={e => setWebinarFecha(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600, display: 'block', marginBottom: 4 }}>URL del Canal</label>
            <input value={canalUrl} onChange={e => setCanalUrl(e.target.value)} placeholder="https://chat.whatsapp.com/..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600, display: 'block', marginBottom: 4 }}>Canal</label>
            <select value={canalNombre} onChange={e => setCanalNombre(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="Discord">Discord</option>
              <option value="Slack">Slack</option>
            </select>
          </div>
        </div>

        <button onClick={enviarInfo} disabled={enviando || !formValido}
          style={{ ...btnAction, opacity: (enviando || !formValido) ? 0.5 : 1 }}>
          {enviando ? 'Enviando...' : `Enviar info del concurso (${postulantes.filter(p => !p.infoEnviadaEn).length} pendientes)`}
        </button>
      </div>

      {/* Paso 3 */}
      <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>Paso 3 — Segunda convocatoria</div>
        <p style={{ fontSize: '0.8rem', color: C.gray, margin: '0 0 16px' }}>
          Envia un recordatorio de ultima oportunidad a quienes recibieron la info pero no confirmaron su participacion.
        </p>
        <button onClick={enviar2da} disabled={enviando}
          style={{ ...btnAction, background: '#92400e', opacity: enviando ? 0.5 : 1 }}>
          {enviando ? 'Enviando...' : `Enviar 2da convocatoria (${postulantes.filter(p => p.infoEnviadaEn && !p.confirmadoEn).length} no confirmados)`}
        </button>
      </div>

      {/* Tabla de status */}
      <OrangeBar label="Estado por postulante" />
      <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Nombre', 'Email', 'Info enviada', 'Confirmado', 'Recordatorio', 'Estado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {postulantes.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: C.gray }}>Sin postulantes</td></tr>
                : postulantes.map(p => {
                    const b = badgeEstado(p);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.nombres} {p.apellidos}</td>
                        <td style={{ padding: '12px 16px', color: C.gray }}>{p.correoElectronico}</td>
                        <td style={{ padding: '12px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{p.infoEnviadaEn ? new Date(p.infoEnviadaEn).toLocaleDateString('es-AR') : '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{p.confirmadoEn ? new Date(p.confirmadoEn).toLocaleDateString('es-AR') : '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{p.recordatorioEnviadoEn ? new Date(p.recordatorioEnviadoEn).toLocaleDateString('es-AR') : '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: b.bg, color: b.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{b.label}</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Sección Configuración ────────────────────────────────────────────────────
const SecConfiguracion: React.FC = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editConcurso, setEditConcurso] = useState<Concurso | null>(null);
  const [nuevoUser, setNuevoUser] = useState({ nombre: '', username: '', password: '', rol: 'JURADO' });
  const [showNewUser, setShowNewUser] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [cs, us] = await Promise.all([api.concursos.listar(), api.usuarios.listar()]);
      setConcursos(cs);
      setUsuarios(us);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarConcurso = async () => {
    if (!editConcurso) return;
    try {
      await fetch(`${(import.meta.env.VITE_API_URL || 'https://api.habisite.com/api')}/v1/concursos/${editConcurso.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editConcurso),
      });
      setMsg({ text: 'Concurso actualizado.', ok: true });
      setEditConcurso(null);
      cargar();
    } catch { setMsg({ text: 'Error al guardar.', ok: false }); }
  };

  const crearUsuario = async () => {
    if (!nuevoUser.nombre || !nuevoUser.username || !nuevoUser.password) return;
    try {
      await api.usuarios.crear(nuevoUser);
      setMsg({ text: 'Usuario creado.', ok: true });
      setNuevoUser({ nombre: '', username: '', password: '', rol: 'JURADO' });
      setShowNewUser(false);
      cargar();
    } catch (e: unknown) {
      setMsg({ text: e instanceof Error ? e.message : 'Error al crear.', ok: false });
    }
  };

  const eliminarUsuario = async (id: number, nombre: string) => {
    if (!confirm(`Eliminar usuario "${nombre}"?`)) return;
    try { await api.usuarios.eliminar(id); cargar(); }
    catch { setMsg({ text: 'Error al eliminar.', ok: false }); }
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div>;

  return (
    <div>
      {msg && (
        <div style={{ background: msg.ok ? '#f0fdf4' : '#fef2f2', borderLeft: `4px solid ${msg.ok ? '#16a34a' : '#dc2626'}`, padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontSize: '0.875rem', color: msg.ok ? '#166534' : '#991b1b' }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>x</button>
        </div>
      )}

      {/* Concurso activo */}
      <OrangeBar label="Concurso activo" />
      {concursos.map(c => (
        <div key={c.id} style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 16 }}>
          {editConcurso?.id === c.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Titulo</label>
                <input value={editConcurso.titulo} onChange={e => setEditConcurso({ ...editConcurso, titulo: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Descripcion</label>
                <textarea value={editConcurso.descripcion} onChange={e => setEditConcurso({ ...editConcurso, descripcion: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Bases y condiciones</label>
                <textarea value={editConcurso.bases ?? ''} onChange={e => setEditConcurso({ ...editConcurso, bases: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Inicio</label>
                  <input type="datetime-local" value={editConcurso.fechaInicio?.slice(0, 16)} onChange={e => setEditConcurso({ ...editConcurso, fechaInicio: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Fin</label>
                  <input type="datetime-local" value={editConcurso.fechaFin?.slice(0, 16)} onChange={e => setEditConcurso({ ...editConcurso, fechaFin: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Estado</label>
                  <select value={editConcurso.estado} onChange={e => setEditConcurso({ ...editConcurso, estado: e.target.value as Concurso['estado'] })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="PROXIMO">PROXIMO</option>
                    <option value="CERRADO">CERRADO</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={guardarConcurso} style={btnAction}>Guardar</button>
                <button onClick={() => setEditConcurso(null)} style={btnSm}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: C.gray, marginTop: 2 }}>
                    {new Date(c.fechaInicio).toLocaleDateString('es-AR')} — {new Date(c.fechaFin).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <span style={{
                  padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  background: c.estado === 'ACTIVO' ? '#f0fdf4' : c.estado === 'PROXIMO' ? '#fff7ed' : '#f3f4f6',
                  color: c.estado === 'ACTIVO' ? '#16a34a' : c.estado === 'PROXIMO' ? '#92400e' : C.gray,
                }}>{c.estado}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 12px' }}>{c.descripcion}</p>
              <button onClick={() => setEditConcurso(c)} style={btnSm}>Editar concurso</button>
            </>
          )}
        </div>
      ))}

      {/* Usuarios */}
      <OrangeBar label={`Usuarios del sistema (${usuarios.length})`} action={
        <button onClick={() => setShowNewUser(!showNewUser)} style={btnOutlineWhite}>{showNewUser ? 'Cancelar' : '+ Nuevo'}</button>
      } />

      {showNewUser && (
        <div style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Nombre</label>
              <input value={nuevoUser.nombre} onChange={e => setNuevoUser({ ...nuevoUser, nombre: e.target.value })} placeholder="Juan Perez" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Username</label>
              <input value={nuevoUser.username} onChange={e => setNuevoUser({ ...nuevoUser, username: e.target.value })} placeholder="juanperez" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Contrasena</label>
              <input type="password" value={nuevoUser.password} onChange={e => setNuevoUser({ ...nuevoUser, password: e.target.value })} placeholder="********" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Rol</label>
              <select value={nuevoUser.rol} onChange={e => setNuevoUser({ ...nuevoUser, rol: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="JURADO">Jurado</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button onClick={crearUsuario} style={btnAction}>Crear usuario</button>
        </div>
      )}

      <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Nombre', 'Username', 'Rol', 'Creado', 'Acciones'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.nombre}</td>
                <td style={{ padding: '12px 16px', color: C.gray }}>{u.username}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: u.rol === 'ADMIN' ? '#fff3ee' : '#eff6ff', color: u.rol === 'ADMIN' ? C.orange : '#1e40af' }}>{u.rol}</span>
                </td>
                <td style={{ padding: '12px 16px', color: C.gray, whiteSpace: 'nowrap' }}>{new Date(u.creadoEn).toLocaleDateString('es-AR')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => eliminarUsuario(u.id, u.nombre)} style={{ ...btnSm, color: '#dc2626', borderColor: '#fecaca' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Sección Publicaciones ───────────────────────────────────────────────────
const SecPublicaciones: React.FC = () => {
  const [pubs, setPubs] = useState<PublicacionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ titulo: '', contenido: '', autor: 'Admin', publicado: false });

  const cargar = useCallback(() => {
    setLoading(true);
    return api.publicaciones.listar().then(setPubs).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resetForm = () => { setForm({ titulo: '', contenido: '', autor: 'Admin', publicado: false }); setEditId(null); setShowForm(false); };

  const guardar = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) return;
    try {
      if (editId) await api.publicaciones.actualizar(editId, form);
      else await api.publicaciones.crear(form);
      resetForm();
      cargar();
    } catch { /* silent */ }
  };

  const editar = (p: PublicacionInfo) => {
    setForm({ titulo: p.titulo, contenido: p.contenido, autor: p.autor, publicado: p.publicado });
    setEditId(p.id);
    setShowForm(true);
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar esta publicacion?')) return;
    await api.publicaciones.eliminar(id);
    cargar();
  };

  const togglePublicado = async (p: PublicacionInfo) => {
    await api.publicaciones.actualizar(p.id, { publicado: !p.publicado });
    cargar();
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <OrangeBar label={`Publicaciones (${pubs.length})`} action={
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={btnOutlineWhite}>
          {showForm ? 'Cancelar' : '+ Nueva'}
        </button>
      } />

      {showForm && (
        <div style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Titulo</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Titulo de la publicacion" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Contenido</label>
              <textarea value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })}
                style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Escribe el contenido..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Autor</label>
                <input value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'end', gap: 8, paddingBottom: 4 }}>
                <label style={{ fontSize: '0.85rem', color: C.gray, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} />
                  Publicar ahora
                </label>
              </div>
            </div>
            <button onClick={guardar} style={btnAction}>{editId ? 'Actualizar' : 'Crear publicacion'}</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pubs.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', color: C.gray, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
              No hay publicaciones. Crea la primera con el boton "+ Nueva".
            </div>
          ) : pubs.map(p => (
            <div key={p.id} style={{ background: C.white, borderRadius: 10, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.titulo}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                    background: p.publicado ? '#f0fdf4' : '#f3f4f6',
                    color: p.publicado ? '#16a34a' : C.gray,
                    cursor: 'pointer',
                  }} onClick={() => togglePublicado(p)}>
                    {p.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: C.gray }}>{new Date(p.creadoEn).toLocaleDateString('es-AR')}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, margin: '0 0 8px', whiteSpace: 'pre-line' }}>{p.contenido.length > 200 ? p.contenido.slice(0, 200) + '...' : p.contenido}</p>
              <div style={{ fontSize: '0.75rem', color: C.gray, marginBottom: 8 }}>Por {p.autor}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => editar(p)} style={btnSm}>Editar</button>
                <button onClick={() => eliminar(p.id)} style={{ ...btnSm, color: '#dc2626', borderColor: '#fecaca' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sección Imágenes y Recursos ─────────────────────────────────────────────
const SecRecursos: React.FC = () => {
  const [recursos, setRecursos] = useState<RecursoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const cargar = useCallback(() => {
    setLoading(true);
    return api.recursos.listar().then(setRecursos).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const subir = async () => {
    if (!archivo) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      if (nombre.trim()) fd.append('nombre', nombre.trim());
      if (descripcion.trim()) fd.append('descripcion', descripcion.trim());
      fd.append('tipo', archivo.type.startsWith('image/') ? 'imagen' : 'documento');
      await api.recursos.subir(fd);
      setArchivo(null); setNombre(''); setDescripcion('');
      cargar();
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('Eliminar este recurso?')) return;
    await api.recursos.eliminar(id);
    cargar();
  };

  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div>
      <OrangeBar label={`Imagenes y Recursos (${recursos.length})`} />

      {/* Upload */}
      <div style={{ background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Subir archivo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Nombre (opcional)</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del recurso"
              style={{ padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: C.gray, fontWeight: 600 }}>Descripcion (opcional)</label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Breve descripcion"
              style={{ padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{
          border: `2px dashed ${archivo ? C.orange : C.border}`, borderRadius: 10, padding: '20px 16px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: archivo ? '#fff8f5' : '#f9fafb',
          transition: 'all 0.15s',
        }}
          onClick={() => document.getElementById('recurso-file')?.click()}
        >
          <input id="recurso-file" type="file" accept="image/*,.pdf,.zip,.dwg,.doc,.docx" style={{ display: 'none' }}
            onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
          {archivo ? (
            <div style={{ fontSize: '0.85rem', color: C.orange, fontWeight: 600 }}>{archivo.name} ({formatSize(archivo.size)})</div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: C.gray }}>Click para seleccionar un archivo (imagen, PDF, ZIP, DWG...)</div>
          )}
        </div>
        <button onClick={subir} disabled={!archivo || uploading} style={{ ...btnAction, opacity: (!archivo || uploading) ? 0.5 : 1 }}>
          {uploading ? 'Subiendo...' : 'Subir recurso'}
        </button>
      </div>

      {/* Lista */}
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><IonSpinner color="primary" /></div> : (
        recursos.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', color: C.gray, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            No hay recursos subidos aun.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {recursos.map(r => (
              <div key={r.id} style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                {r.contentType?.startsWith('image/') ? (
                  <div style={{ height: 140, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={api.recursos.archivoUrl(r.id)} alt={r.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: 140, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem', color: C.gray }}>📄</span>
                  </div>
                )}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</div>
                  {r.descripcion && <div style={{ fontSize: '0.75rem', color: C.gray, marginBottom: 4 }}>{r.descripcion}</div>}
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 8 }}>
                    {formatSize(r.tamanio)} · {new Date(r.creadoEn).toLocaleDateString('es-AR')}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={api.recursos.archivoUrl(r.id)} target="_blank" rel="noreferrer" style={{ ...btnSm, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Ver</a>
                    <button onClick={() => eliminar(r.id)} style={{ ...btnSm, color: '#dc2626', borderColor: '#fecaca' }}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

const SecPlaceholder: React.FC<{ titulo: string; desc: string }> = ({ titulo, desc }) => (
  <div>
    <OrangeBar label={titulo} />
    <div style={{ background: C.white, borderRadius: 10, padding: 40, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
      <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: '3rem 2rem', color: C.gray, fontSize: '0.875rem' }}>
        {desc}
      </div>
    </div>
  </div>
);

// ─── Estilos de botones reutilizables ─────────────────────────────────────────
const btnOutlineWhite: React.CSSProperties = {
  border: '2px solid #fff', color: '#fff', background: 'transparent',
  padding: '6px 22px', fontWeight: 700, textTransform: 'uppercase' as const,
  fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '1px', borderRadius: 999,
};

const btnSm: React.CSSProperties = {
  padding: '5px 16px', background: 'transparent', border: `1px solid ${C.border}`,
  borderRadius: 999, fontSize: '0.75rem', cursor: 'pointer', color: C.dark,
};

const btnAction: React.CSSProperties = {
  padding: '10px 28px', background: C.orange, border: 'none', borderRadius: 999,
  fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: 'pointer',
  letterSpacing: '0.03em',
};

// ─── AdminPage principal ───────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const history  = useHistory();
  const [presentToast] = useIonToast();

  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expanded, setExpanded]           = useState<Set<string>>(new Set(['areas']));
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sectionTour, setSectionTour] = useState<string | null>(null);

  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [postulantes, setPostulantes]   = useState<Postulante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingE, setLoadingE] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('admin_ok')) { history.replace('/login'); return; }
    if (onboardingPending()) setShowOnboarding(true);
    loadStats();
    loadPostulantes();
    loadEvaluaciones();
  }, []);

  const loadStats = async () => {
    try { setStats(await api.admin.stats()); }
    catch { presentToast({ message: 'Error cargando estadísticas', color: 'danger', duration: 3000 }); }
  };

  const loadPostulantes = useCallback(async () => {
    setLoadingP(true);
    try { setPostulantes(await api.postulantes.listar()); }
    catch { presentToast({ message: 'Error cargando postulantes', color: 'danger', duration: 3000 }); }
    finally { setLoadingP(false); }
  }, []);

  const loadEvaluaciones = useCallback(async () => {
    setLoadingE(true);
    try { setEvaluaciones(await api.evaluaciones.listar()); }
    catch { presentToast({ message: 'Error cargando evaluaciones', color: 'danger', duration: 3000 }); }
    finally { setLoadingE(false); }
  }, []);

  const navigate = (id: string) => {
    setActiveSection(id);
    if (sectionTourPending(id)) setSectionTour(id);
  };

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const logout = () => { sessionStorage.removeItem('admin_ok'); history.replace('/login'); };

  const allItems = MENU.flatMap(m => m.sub ? [m, ...m.sub] : [m]);
  const pageTitle = allItems.find(m => m.id === activeSection)?.label ?? 'Dashboard';

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':           return <SecDashboard stats={stats} postulantes={postulantes} evaluaciones={evaluaciones} />;
      case 'postulantes':         return <SecPostulantes postulantes={postulantes} loading={loadingP} reload={loadPostulantes} />;
      case 'campanas':            return <SecCampanas stats={stats} postulantes={postulantes} reload={loadPostulantes} reloadStats={loadStats} />;
      case 'evaluaciones':        return <SecEvaluaciones evaluaciones={evaluaciones} loading={loadingE} reload={loadEvaluaciones} />;
      case 'areas-sitio':         return <SecAreasSitio />;
      case 'areas-publicaciones': return <SecPublicaciones />;
      case 'areas-recursos':      return <SecRecursos />;
      case 'estadisticas':        return <SecEstadisticas stats={stats} postulantes={postulantes} evaluaciones={evaluaciones} />;
      case 'entregas':            return <SecEntregas />;
      case 'soporte':             return <SecSoporte />;
      case 'jurado':              return <SecJurado evaluaciones={evaluaciones} />;
      case 'configuracion':       return <SecConfiguracion />;
      default:                    return null;
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} style={{ '--overflow': 'hidden' }}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.dark }}>

          {/* ─── Sidebar ──────────────────────────────────────────────────── */}
          <aside id="admin-sidebar" style={{
            width: sidebarOpen ? 260 : 52,
            minWidth: sidebarOpen ? 260 : 52,
            background: C.dark,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease, min-width 0.25s ease',
            flexShrink: 0,
          }}>
            <div style={{
              padding: sidebarOpen ? '1.25rem 1rem 1.25rem 1.25rem' : '1rem 0',
              borderBottom: '1px solid #1f2937',
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              flexShrink: 0,
            }}>
              {sidebarOpen && (
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Habisite</div>
                  <div style={{ fontSize: '0.62rem', color: C.orange, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>Panel de Administración</div>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(o => !o)}
                title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                style={{
                  background: '#1f2937', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', width: 32, height: 32, borderRadius: 999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', flexShrink: 0, transition: 'background 0.15s',
                }}
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>

            {sidebarOpen && (
              <nav id="admin-nav" className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                {MENU.map(item => {
                  const isActive = activeSection === item.id || (item.sub?.some(s => s.id === activeSection));
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => item.sub ? toggleExpand(item.id) : navigate(item.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '0.7rem 1.25rem',
                          background: isActive ? '#1f2937' : 'transparent',
                          color: isActive ? C.orange : '#9ca3af',
                          border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left',
                          borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <IonIcon icon={item.icon} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                          {item.label}
                        </span>
                        {item.sub && (
                          <span style={{ fontSize: '0.6rem', transition: 'transform 0.2s', display: 'inline-block', transform: expanded.has(item.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        )}
                      </button>
                      {item.sub && expanded.has(item.id) && (
                        <div style={{ background: '#0d1420' }}>
                          {item.sub.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => navigate(sub.id)}
                              style={{
                                display: 'block', width: '100%', padding: '0.6rem 1.25rem 0.6rem 3.2rem',
                                background: activeSection === sub.id ? '#1f2937' : 'transparent',
                                color: activeSection === sub.id ? C.orange : '#6b7280',
                                border: 'none', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left',
                                borderLeft: activeSection === sub.id ? `3px solid ${C.orange}` : '3px solid transparent',
                                transition: 'all 0.12s',
                              }}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}

            {sidebarOpen && (
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
                <button onClick={logout} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid #374151', color: '#9ca3af', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer' }}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </aside>

          {/* ─── Contenido principal ──────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
            <div id="admin-topbar" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pageTitle}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={loadStats} style={{ ...btnSm, fontSize: '0.75rem', color: C.gray }}>↻ Sync</button>
                <span style={{ fontSize: '0.8rem', color: C.gray }}>Administrador</span>
                <div style={{ width: 32, height: 32, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>A</div>
              </div>
            </div>

            <div id="admin-content" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {renderContent()}
            </div>
          </div>

        </div>
        {showOnboarding && (
          <AdminMainTour
            onNavigate={(section) => setActiveSection(section)}
            onFinish={() => setShowOnboarding(false)}
          />
        )}
        {sectionTour && (
          <AdminSectionTour
            section={sectionTour}
            onFinish={() => setSectionTour(null)}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
