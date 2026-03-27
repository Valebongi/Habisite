import React, { useCallback, useEffect, useState } from 'react';
import { IonPage, IonContent, IonSpinner, useIonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api, AdminStats, Postulante, Evaluacion } from '../../services/api';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  orange:  '#E85520',
  dark:    '#111827',
  gray:    '#6b7280',
  border:  '#e5e7eb',
  bg:      '#f4f5f7',
  white:   '#ffffff',
} as const;

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
  { id: 'dashboard',    icon: '▣', label: 'Dashboard' },
  { id: 'postulantes',  icon: '👥', label: 'Postulantes' },
  { id: 'evaluaciones', icon: '⭐', label: 'Evaluaciones' },
  {
    id: 'areas', icon: '📋', label: 'Relevamiento de Áreas',
    sub: [
      { id: 'areas-sitio',         label: 'Secciones del sitio' },
      { id: 'areas-publicaciones', label: 'Publicaciones' },
      { id: 'areas-recursos',      label: 'Imágenes y recursos' },
    ],
  },
  { id: 'estadisticas',  icon: '📊', label: 'Estadísticas' },
  { id: 'jurado',        icon: '🏛', label: 'Jurado' },
  { id: 'configuracion', icon: '⚙', label: 'Configuración' },
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

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={stats?.totalPostulantes ?? '—'} label="Total postulantes" sub="inscriptos al concurso" />
        <StatCard value={stats?.totalEvaluaciones ?? '—'} label="Evaluaciones" sub="realizadas por el jurado" />
        <StatCard value={promPuntaje} label="Puntaje promedio" sub="sobre 10 puntos" />
        <StatCard value={Object.keys(stats?.porUniversidad ?? {}).length || '—'} label="Universidades" sub="representadas" />
      </div>

      {/* Estado del sitio */}
      <OrangeBar label="Estado del sitio" />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={publicadas}  label="Secciones publicadas"   sub={`de ${AREAS.length} totales`} />
        <StatCard value={pendientes}  label="Secciones pendientes"   sub="sin contenido aún" />
        <StatCard value={sinAsignar}  label="Sin responsable"        sub="requieren asignación" />
      </div>

      {/* Áreas críticas */}
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

      {/* Últimos postulantes */}
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

  return (
    <div>
      <OrangeBar
        label={`Postulantes (${filtrados.length})`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reload}   style={btnOutlineWhite}>↻ Actualizar</button>
            <button onClick={exportCSV} style={btnOutlineWhite}>↓ CSV</button>
          </div>
        }
      />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
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
                    {['#', 'Nombre', 'DNI', 'Universidad', 'Especialidad', 'Correo', 'Registrado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: C.gray, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: C.gray }}>Sin resultados</td></tr>
                    : filtrados.map(p => (
                        <tr key={p.id} style={{ borderBottom: `1px solid #f3f4f6`, cursor: 'default' }}
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
          <StatCard value={Math.max(...evaluaciones.map(e => e.puntaje))} label="Puntaje más alto" sub={`/ 10 puntos`} />
        </div>
      )}

      {/* Resumen por jurado */}
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

      {/* Lista completa */}
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

      <div style={{ background: C.white, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
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

const SecEstadisticas: React.FC<{ stats: AdminStats | null; postulantes: Postulante[]; evaluaciones: Evaluacion[] }> = ({ stats, postulantes, evaluaciones }) => (
  <div>
    <OrangeBar label="Estadísticas del concurso" />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
      <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16 }}>Postulantes por especialidad</div>
        <ChartBox label="Implementar con Chart.js — datos listos en stats.porEspecialidad" />
        {stats && (
          <div style={{ marginTop: 16 }}>
            {Object.entries(stats.porEspecialidad).sort(([, a], [, b]) => b - a).map(([esp, count]) => (
              <div key={esp} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.8rem' }}>
                <span>{esp}</span>
                <strong style={{ color: C.orange }}>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16 }}>Ranking de universidades</div>
        <ChartBox label="Implementar con Chart.js — datos listos en stats.porUniversidad" />
        {stats && (
          <div style={{ marginTop: 16 }}>
            {Object.entries(stats.porUniversidad).sort(([, a], [, b]) => b - a).slice(0, 8).map(([univ, count]) => (
              <div key={univ} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.8rem' }}>
                <span>{univ}</span>
                <strong style={{ color: C.orange }}>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <div style={{ background: C.white, borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16 }}>Distribución de puntajes del jurado</div>
      <ChartBox label="Implementar con Chart.js — datos en evaluaciones" height={200} />
    </div>
  </div>
);

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

// ─── AdminPage principal ───────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const history  = useHistory();
  const [presentToast] = useIonToast();

  // UI
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expanded, setExpanded]           = useState<Set<string>>(new Set(['areas']));

  // Data
  const [stats, setStats]             = useState<AdminStats | null>(null);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingE, setLoadingE] = useState(false);

  // ── Auth guard
  useEffect(() => {
    if (!sessionStorage.getItem('admin_ok')) { history.replace('/login'); return; }
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

  const navigate = (id: string) => setActiveSection(id);

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const logout = () => { sessionStorage.removeItem('admin_ok'); history.replace('/login'); };

  // Título de la sección activa
  const allItems = MENU.flatMap(m => m.sub ? [m, ...m.sub] : [m]);
  const pageTitle = allItems.find(m => m.id === activeSection)?.label ?? 'Dashboard';

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':          return <SecDashboard stats={stats} postulantes={postulantes} evaluaciones={evaluaciones} />;
      case 'postulantes':        return <SecPostulantes postulantes={postulantes} loading={loadingP} reload={loadPostulantes} />;
      case 'evaluaciones':       return <SecEvaluaciones evaluaciones={evaluaciones} loading={loadingE} reload={loadEvaluaciones} />;
      case 'areas-sitio':        return <SecAreasSitio />;
      case 'areas-publicaciones':return <SecPlaceholder titulo="Publicaciones" desc="Gestión de publicaciones — conectar con API de CMS" />;
      case 'areas-recursos':     return <SecPlaceholder titulo="Imágenes y Recursos" desc="Gestión de archivos e imágenes — conectar con almacenamiento" />;
      case 'estadisticas':       return <SecEstadisticas stats={stats} postulantes={postulantes} evaluaciones={evaluaciones} />;
      case 'jurado':             return <SecJurado evaluaciones={evaluaciones} />;
      case 'configuracion':      return <SecPlaceholder titulo="Configuración" desc="Parámetros del concurso, fechas límite, accesos — por implementar" />;
      default:                   return null;
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} style={{ '--overflow': 'hidden' }}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.dark }}>

          {/* ─── Sidebar ──────────────────────────────────────────────────── */}
          <aside style={{
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
            {/* Encabezado con toggle integrado */}
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

            {/* Navegación */}
            {sidebarOpen && (
              <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
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
                          <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                          {item.label}
                        </span>
                        {item.sub && (
                          <span style={{ fontSize: '0.6rem', transition: 'transform 0.2s', display: 'inline-block', transform: expanded.has(item.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                        )}
                      </button>
                      {/* Submenú */}
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

            {/* Footer */}
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
            {/* Topbar */}
            <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pageTitle}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={loadStats} style={{ ...btnSm, fontSize: '0.75rem', color: C.gray }}>↻ Sync</button>
                <span style={{ fontSize: '0.8rem', color: C.gray }}>Administrador</span>
                <div style={{ width: 32, height: 32, background: C.orange, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>A</div>
              </div>
            </div>

            {/* Scroll area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
