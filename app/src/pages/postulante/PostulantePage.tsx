import React, { useEffect, useRef, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonButton, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonText, IonSpinner, IonToast, IonBadge,
  IonChip, IonTextarea,
} from '@ionic/react';
import {
  personOutline, trophyOutline, cloudUploadOutline,
  documentOutline, linkOutline, gridOutline, menuOutline,
  logOutOutline, chevronBackOutline, chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api, Postulante, PostulanteRequest, Concurso, Resolucion } from '../../services/api';

// ─── Design tokens (mismos que LoginPage) ─────────────────────────────────────
const C = {
  orange: '#E85520',
  dark: '#0d0e10',
  bg: '#f4f5f7',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
};

const ESPECIALIDADES = ['Arquitectura', 'Diseño de Interiores', 'Diseño Industrial', 'Paisajismo', 'Otro'];
const CODIGOS_PAIS = [
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPostulante = (): Postulante | null => {
  const raw = sessionStorage.getItem('postulante_data') ?? localStorage.getItem('postulante_data');
  if (!raw) return null;
  try { return JSON.parse(raw) as Postulante; } catch { return null; }
};

const parseCelular = (celular: string) => {
  for (const cp of CODIGOS_PAIS) {
    if (celular.startsWith(cp.value)) return { codigo: cp.value, numero: celular.slice(cp.value.length) };
  }
  return { codigo: '+51', numero: celular };
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

const estadoBadgeColor = (e: string) =>
  e === 'APROBADA' ? 'success' : e === 'RECHAZADA' ? 'danger' : 'warning';

// ─── Sidebar menu ─────────────────────────────────────────────────────────────

type MenuItem = { id: string; icon: string; label: string };

const MENU: MenuItem[] = [
  { id: 'perfil',    icon: personOutline,        label: 'Mi Perfil' },
  { id: 'concursos', icon: trophyOutline,        label: 'Concursos' },
  { id: 'entregas',  icon: cloudUploadOutline,   label: 'Mis Entregas' },
  { id: 'resumen',   icon: gridOutline,          label: 'Resumen' },
];

// ─── Sección: Perfil ──────────────────────────────────────────────────────────

const PerfilSection: React.FC = () => {
  const [editando, setEditando] = useState(false);
  const postulante = getPostulante();

  const cel = parseCelular(postulante?.celular ?? '');
  const [nombres, setNombres] = useState(postulante?.nombres ?? '');
  const [apellidos, setApellidos] = useState(postulante?.apellidos ?? '');
  const [codigoPais, setCodigoPais] = useState(cel.codigo);
  const [numeroCelular, setNumeroCelular] = useState(cel.numero);
  const [universidad, setUniversidad] = useState(postulante?.universidad ?? '');
  const [correo, setCorreo] = useState(postulante?.correoElectronico ?? '');
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

  if (!postulante) return null;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombres || !apellidos || !numeroCelular || !universidad || !correo || !especialidad) {
      setError('Completá todos los campos.'); return;
    }
    if (especialidad === 'Otro' && !especialidadOtro.trim()) {
      setError('Especificá tu especialidad.'); return;
    }
    setLoading(true);
    try {
      const payload: PostulanteRequest = {
        nombres: nombres.trim(), apellidos: apellidos.trim(), dni: postulante.dni,
        celular: `${codigoPais}${numeroCelular}`,
        universidad: universidad.trim(), correoElectronico: correo.trim(),
        especialidad: especialidad === 'Otro' ? especialidadOtro.trim() : especialidad,
      };
      const actualizado = await api.postulantes.actualizar(postulante.id, payload);
      sessionStorage.setItem('postulante_data', JSON.stringify(actualizado));
      if (localStorage.getItem('postulante_data')) localStorage.setItem('postulante_data', JSON.stringify(actualizado));
      setToastMsg('Datos actualizados.'); setToastColor('success');
      setShowToast(true); setEditando(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally { setLoading(false); }
  };

  const campos = [
    { label: 'Nombres', valor: postulante.nombres },
    { label: 'Apellidos', valor: postulante.apellidos },
    { label: 'DNI', valor: postulante.dni },
    { label: 'Celular', valor: postulante.celular },
    { label: 'Universidad', valor: postulante.universidad },
    { label: 'Correo', valor: postulante.correoElectronico },
    { label: 'Especialidad', valor: postulante.especialidad },
    { label: 'Registrado', valor: formatFecha(postulante.creadoEn) },
  ];

  return (
    <>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.dark} 0%, #2a1208 100%)`,
        padding: '32px 28px', borderRadius: 16, marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, border: `1.5px solid ${C.orange}33`, borderRadius: 8, transform: 'rotate(20deg)' }} />
        <div style={{ position: 'absolute', bottom: -10, right: 80, width: 60, height: 60, border: '1.5px solid #ffffff18', borderRadius: 4, transform: 'rotate(-15deg)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: `${C.orange}33`,
            border: `2px solid ${C.orange}88`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#fff',
          }}>
            {postulante.nombres[0]}{postulante.apellidos[0]}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              {postulante.nombres} {postulante.apellidos}
            </h2>
            <p style={{ margin: '2px 0 0', color: C.orange, fontSize: '0.82rem', fontWeight: 600 }}>
              {postulante.especialidad}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: '1rem' }}>Mis datos</h3>
        {!editando && (
          <button onClick={() => setEditando(true)} style={{
            background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8,
            padding: '6px 16px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: C.muted,
          }}>Editar</button>
        )}
      </div>

      {!editando ? (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {campos.map(({ label, valor }, i) => (
            <div key={label} style={{
              padding: '14px 20px', borderBottom: i < campos.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: '0.9rem', color: C.text, fontWeight: 500 }}>{valor}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <form onSubmit={handleGuardar} noValidate>
            {[
              { label: 'Nombres', value: nombres, setter: setNombres },
              { label: 'Apellidos', value: apellidos, setter: setApellidos },
            ].map(({ label, value, setter }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={sty.label}>{label}</label>
                <div style={sty.inputWrap}>
                  <IonInput value={value} onIonInput={e => setter(e.detail.value ?? '')} type="text" style={sty.input} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>DNI (no modificable)</label>
              <div style={{ ...sty.inputWrap, background: '#f9fafb' }}>
                <IonInput value={postulante.dni} readonly style={{ ...sty.input, '--color': '#9ca3af' } as React.CSSProperties} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Celular</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <IonSelect value={codigoPais} onIonChange={e => setCodigoPais(e.detail.value)} interface="popover"
                  style={{ minWidth: 110, background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '10px' }}>
                  {CODIGOS_PAIS.map(c => <IonSelectOption key={c.value} value={c.value}>{c.label}</IonSelectOption>)}
                </IonSelect>
                <div style={{ ...sty.inputWrap, flex: 1 }}>
                  <IonInput value={numeroCelular} onIonInput={e => setNumeroCelular(e.detail.value ?? '')} type="tel" style={sty.input} />
                </div>
              </div>
            </div>
            {[
              { label: 'Universidad', value: universidad, setter: setUniversidad, type: 'text' },
              { label: 'Correo electrónico', value: correo, setter: setCorreo, type: 'email' },
            ].map(({ label, value, setter, type }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={sty.label}>{label}</label>
                <div style={sty.inputWrap}>
                  <IonInput value={value} onIonInput={e => setter(e.detail.value ?? '')} type={type as any} style={sty.input} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Especialidad</label>
              <IonSelect value={especialidad} onIonChange={e => setEspecialidad(e.detail.value)} interface="action-sheet"
                style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '14px', width: '100%' }}>
                {ESPECIALIDADES.map(esp => <IonSelectOption key={esp} value={esp}>{esp}</IonSelectOption>)}
              </IonSelect>
            </div>
            {especialidad === 'Otro' && (
              <div style={{ marginBottom: 16 }}>
                <label style={sty.label}>¿Cuál especialidad?</label>
                <div style={sty.inputWrap}>
                  <IonInput value={especialidadOtro} onIonInput={e => setEspecialidadOtro(e.detail.value ?? '')} type="text" style={sty.input} />
                </div>
              </div>
            )}
            {error && <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <IonButton expand="block" type="submit" disabled={loading} style={{ flex: 1, '--background': C.orange, '--border-radius': '10px' }}>
                {loading ? <IonSpinner name="crescent" /> : 'Guardar'}
              </IonButton>
              <IonButton expand="block" fill="outline" color="medium" onClick={() => setEditando(false)} style={{ flex: 1, '--border-radius': '10px' }}>
                Cancelar
              </IonButton>
            </div>
          </form>
        </div>
      )}
      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </>
  );
};

// ─── Sección: Concursos ───────────────────────────────────────────────────────

const ConcursosSection: React.FC = () => {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    api.concursos.listar().then(setConcursos).finally(() => setLoading(false));
  }, []);

  const diasRestantes = (fechaFin: string) => {
    const diff = new Date(fechaFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  if (concursos.length === 0) return (
    <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
      <p style={{ fontSize: '1rem' }}>No hay concursos disponibles por el momento.</p>
    </div>
  );

  return (
    <>
      {concursos.map(c => {
        const estadoColor = c.estado === 'ACTIVO' ? 'success' : c.estado === 'PROXIMO' ? 'warning' : 'medium';
        return (
          <div key={c.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.dark} 0%, #2a1208 100%)`,
              padding: '22px 24px 18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, border: `1.5px solid ${C.orange}33`, borderRadius: 4, transform: 'rotate(20deg)' }} />
              <IonChip color={estadoColor} style={{ marginBottom: 10, fontWeight: 600 }}>{c.estado}</IonChip>
              <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>{c.titulo}</h2>
              <p style={{ margin: 0, color: '#ffffff88', fontSize: '0.8rem' }}>
                {formatFecha(c.fechaInicio)} → {formatFecha(c.fechaFin)}
                {c.estado === 'ACTIVO' && <span style={{ color: C.orange, marginLeft: 8, fontWeight: 600 }}>{diasRestantes(c.fechaFin)} días restantes</span>}
              </p>
            </div>
            <div style={{ padding: '18px 24px' }}>
              <p style={{ color: '#374151', lineHeight: 1.6, margin: '0 0 12px', fontSize: '0.9rem' }}>{c.descripcion}</p>
              {c.bases && (
                <>
                  <button onClick={() => setExpandido(expandido === c.id ? null : c.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: '0.82rem', color: C.orange, fontWeight: 600,
                  }}>
                    {expandido === c.id ? 'Ocultar bases' : 'Ver bases del concurso'}
                  </button>
                  {expandido === c.id && (
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginTop: 10 }}>
                      {c.bases.split('\n').map((linea: string, i: number) => (
                        <p key={i} style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{linea}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ─── Sección: Entregas ────────────────────────────────────────────────────────

const EntregasSection: React.FC = () => {
  const postulante = getPostulante();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [concursoId, setConcursoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlExterno, setUrlExterno] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargar = () => {
    if (!postulante) return;
    setLoading(true);
    Promise.all([
      api.resoluciones.listarPorPostulante(postulante.id),
      api.concursos.listar(),
    ]).then(([res, con]) => { setResoluciones(res); setConcursos(con); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const concursosActivos = concursos.filter(c => c.estado === 'ACTIVO');
  const yaEntregados = resoluciones.map(r => r.concursoId);

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!concursoId) { setError('Seleccioná un concurso.'); return; }
    if (!titulo.trim()) { setError('Ingresá un título para tu entrega.'); return; }
    if (!archivo && !urlExterno.trim()) { setError('Adjuntá un archivo o ingresá una URL.'); return; }
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('postulanteId', String(postulante!.id));
      formData.append('concursoId', concursoId);
      formData.append('titulo', titulo.trim());
      if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
      if (urlExterno.trim()) formData.append('urlExterno', urlExterno.trim());
      if (archivo) formData.append('archivo', archivo);
      await api.resoluciones.subir(formData);
      setToastMsg('Entrega enviada exitosamente.'); setToastColor('success'); setShowToast(true);
      setMostrarForm(false);
      setTitulo(''); setDescripcion(''); setUrlExterno(''); setArchivo(null); setConcursoId('');
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally { setSubiendo(false); }
  };

  return (
    <>
      {!mostrarForm && (
        <IonButton expand="block" onClick={() => setMostrarForm(true)}
          style={{ '--background': C.orange, '--border-radius': '10px', marginBottom: 20, fontWeight: 600 }}>
          <IonIcon icon={cloudUploadOutline} slot="start" /> Nueva entrega
        </IonButton>
      )}

      {mostrarForm && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, color: C.orange, fontSize: '1rem' }}>Nueva entrega</h3>
          <form onSubmit={handleSubir} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Concurso *</label>
              <IonSelect value={concursoId} onIonChange={e => setConcursoId(e.detail.value)} placeholder="Seleccioná un concurso" interface="action-sheet"
                style={{ background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, '--padding-start': '14px', width: '100%' }}>
                {concursosActivos.filter(c => !yaEntregados.includes(c.id))
                  .map(c => <IonSelectOption key={c.id} value={String(c.id)}>{c.titulo}</IonSelectOption>)}
              </IonSelect>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Título de tu entrega *</label>
              <div style={sty.inputWrap}><IonInput value={titulo} onIonInput={e => setTitulo(e.detail.value ?? '')} placeholder="Ej. Propuesta Centro Comunitario" style={sty.input} /></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Descripción (opcional)</label>
              <div style={{ ...sty.inputWrap, borderRadius: 10 }}>
                <IonTextarea value={descripcion} onIonInput={e => setDescripcion(e.detail.value ?? '')} placeholder="Contá brevemente tu propuesta…" rows={3}
                  style={{ '--padding-start': '14px', '--padding-end': '14px', '--padding-top': '12px', '--background': 'transparent' } as React.CSSProperties} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>Archivo (PDF, imagen, ZIP — máx. 20 MB)</label>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.zip,.dwg" style={{ display: 'none' }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
              <div onClick={() => fileInputRef.current?.click()} style={{
                border: `2px dashed ${archivo ? C.orange : '#d1d5db'}`, borderRadius: 10, padding: 20,
                textAlign: 'center', cursor: 'pointer', background: archivo ? '#fff7f5' : '#fafafa',
              }}>
                {archivo
                  ? <p style={{ margin: 0, color: C.orange, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <IonIcon icon={documentOutline} />{archivo.name}
                    </p>
                  : <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Tocá para seleccionar un archivo</p>}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={sty.label}>O pegá un enlace (Google Drive, etc.)</label>
              <div style={sty.inputWrap}>
                <IonInput value={urlExterno} onIonInput={e => setUrlExterno(e.detail.value ?? '')} placeholder="https://drive.google.com/..." type="url" style={sty.input} />
              </div>
            </div>
            {error && <p style={{ fontSize: '0.83rem', color: '#dc2626', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <IonButton expand="block" type="submit" disabled={subiendo} style={{ flex: 1, '--background': C.orange, '--border-radius': '10px' }}>
                {subiendo ? <IonSpinner name="crescent" /> : 'Enviar entrega'}
              </IonButton>
              <IonButton expand="block" fill="outline" color="medium" onClick={() => setMostrarForm(false)} style={{ flex: 1, '--border-radius': '10px' }}>
                Cancelar
              </IonButton>
            </div>
          </form>
        </div>
      )}

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>}

      {!loading && resoluciones.length === 0 && !mostrarForm && (
        <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
          <p style={{ fontSize: '1rem' }}>Sin entregas aún</p>
          <p style={{ fontSize: '0.85rem' }}>Usá el botón de arriba para subir tu primera resolución.</p>
        </div>
      )}

      {resoluciones.map(r => (
        <div key={r.id} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: C.text }}>{r.titulo}</span>
            <IonBadge color={estadoBadgeColor(r.estado)}>{r.estado}</IonBadge>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: C.muted }}>{r.concursoTitulo}</p>
          {r.descripcion && <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#374151' }}>{r.descripcion}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {r.tieneArchivo && (
              <a href={`/api/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.78rem', color: C.orange, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IonIcon icon={documentOutline} style={{ fontSize: '0.9rem' }} />{r.archivoNombre}
              </a>
            )}
            {r.urlExterno && (
              <a href={r.urlExterno} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.78rem', color: C.orange, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IonIcon icon={linkOutline} style={{ fontSize: '0.9rem' }} />Ver enlace
              </a>
            )}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{formatFecha(r.creadoEn)}</p>
        </div>
      ))}

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </>
  );
};

// ─── Sección: Resumen / Dashboard ─────────────────────────────────────────────

const ResumenSection: React.FC = () => {
  const postulante = getPostulante();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postulante) return;
    Promise.all([
      api.resoluciones.listarPorPostulante(postulante.id),
      api.concursos.listar(),
    ]).then(([res, con]) => { setResoluciones(res); setConcursos(con); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><IonSpinner name="crescent" color="primary" /></div>;

  const activos = concursos.filter(c => c.estado === 'ACTIVO').length;
  const pendientes = resoluciones.filter(r => r.estado === 'PENDIENTE').length;
  const aprobadas = resoluciones.filter(r => r.estado === 'APROBADA').length;

  const stats = [
    { label: 'Concursos activos', valor: activos, color: '#3b82f6' },
    { label: 'Entregas enviadas', valor: resoluciones.length, color: C.orange },
    { label: 'Pendientes de revisión', valor: pendientes, color: '#f59e0b' },
    { label: 'Aprobadas', valor: aprobadas, color: '#10b981' },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
            padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.valor}</span>
            <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {resoluciones.length > 0 && (
        <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Últimas entregas</h4>
          </div>
          {resoluciones.slice(0, 5).map((r, i) => (
            <div key={r.id} style={{ padding: '12px 20px', borderBottom: i < Math.min(resoluciones.length, 5) - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.text }}>{r.titulo}</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.muted }}>{r.concursoTitulo}</p>
              </div>
              <IonBadge color={estadoBadgeColor(r.estado)}>{r.estado}</IonBadge>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── PostulantePage — Layout con Sidebar ──────────────────────────────────────

const PostulantePage: React.FC = () => {
  const history = useHistory();
  const [activeSection, setActiveSection] = useState('perfil');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem('postulante_data') ?? localStorage.getItem('postulante_data');
    if (!ok) history.replace('/login');
  }, [history]);

  const postulante = getPostulante();

  const handleLogout = () => {
    sessionStorage.setItem('habisite_logout', '1');
    sessionStorage.removeItem('postulante_data');
    localStorage.removeItem('postulante_data');
    window.location.replace('/login');
  };

  const navigate = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const sectionTitle = MENU.find(m => m.id === activeSection)?.label ?? '';

  const renderSection = () => {
    switch (activeSection) {
      case 'perfil': return <PerfilSection />;
      case 'concursos': return <ConcursosSection />;
      case 'entregas': return <EntregasSection />;
      case 'resumen': return <ResumenSection />;
      default: return <PerfilSection />;
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg }}>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside style={{
            width: sidebarOpen ? 250 : 0,
            minWidth: sidebarOpen ? 250 : 0,
            background: C.dark,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease, min-width 0.25s ease',
            flexShrink: 0,
            position: window.innerWidth < 768 ? 'fixed' : 'relative',
            zIndex: window.innerWidth < 768 ? 999 : 1,
            height: '100%',
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Habisite</div>
              <div style={{ fontSize: '0.62rem', color: C.orange, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>
                Panel de Postulante
              </div>
            </div>

            {/* User info */}
            {postulante && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: `${C.orange}33`,
                  border: `1.5px solid ${C.orange}66`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {postulante.nombres[0]}{postulante.apellidos[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {postulante.nombres} {postulante.apellidos}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af' }}>{postulante.especialidad}</p>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
              {MENU.map(item => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => navigate(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.7rem 1.25rem',
                    background: isActive ? '#1f2937' : 'transparent',
                    color: isActive ? C.orange : '#9ca3af',
                    border: 'none', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left',
                    borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    <IonIcon icon={item.icon} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
              <button onClick={handleLogout} style={{
                width: '100%', padding: '0.6rem', background: 'transparent',
                border: '1px solid #374151', color: '#9ca3af', borderRadius: 999,
                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <IonIcon icon={logOutOutline} style={{ fontSize: '0.9rem' }} />
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileMenuOpen && window.innerWidth < 768 && (
            <div onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />
          )}

          {/* ── Main content ─────────────────────────────────────── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top bar */}
            <header style={{
              padding: '14px 24px', background: C.card, borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => {
                  if (window.innerWidth < 768) {
                    setSidebarOpen(o => !o);
                    setMobileMenuOpen(o => !o);
                  } else {
                    setSidebarOpen(o => !o);
                  }
                }} style={{
                  background: '#f3f4f6', border: 'none', cursor: 'pointer',
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IonIcon icon={sidebarOpen ? chevronBackOutline : menuOutline} style={{ fontSize: '1rem', color: C.muted }} />
                </button>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: C.text }}>{sectionTitle}</h2>
              </div>
            </header>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {renderSection()}
              </div>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── Shared input styles ──────────────────────────────────────────────────────
const sty = {
  label: {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase',
  } as React.CSSProperties,
  inputWrap: {
    background: '#fff', border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
  } as React.CSSProperties,
  input: {
    '--padding-start': '14px', '--padding-end': '14px',
    '--padding-top': '12px', '--padding-bottom': '12px',
    '--background': 'transparent', '--color': C.dark, fontSize: '0.95rem',
  } as React.CSSProperties,
};

export default PostulantePage;
