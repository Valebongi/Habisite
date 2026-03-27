import React, { useEffect, useRef, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonLabel,
  IonRouterOutlet, IonButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonList, IonItem, IonInput, IonSelect,
  IonSelectOption, IonText, IonSpinner, IonToast, IonBadge, IonChip,
  IonTextarea,
} from '@ionic/react';
import {
  personOutline, trophyOutline, cloudUploadOutline,
} from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { api, Postulante, PostulanteRequest, Concurso, Resolucion } from '../../services/api';

const ORANGE = '#E85520';

const ESPECIALIDADES = ['Arquitectura','Diseño de Interiores','Diseño Industrial','Paisajismo','Otro'];
const CODIGOS_PAIS = [
  { label: '+51 (Perú)', value: '+51' },
  { label: '+1 (EE.UU.)', value: '+1' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+52 (México)', value: '+52' },
  { label: '+34 (España)', value: '+34' },
];

const usePostulanteGuard = () => {
  const history = useHistory();
  useEffect(() => {
    if (!sessionStorage.getItem('postulante_data')) history.replace('/login');
  }, [history]);
};

const getPostulante = (): Postulante | null => {
  const raw = sessionStorage.getItem('postulante_data');
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

// ─── Tab: Perfil ──────────────────────────────────────────────────────────────
const PerfilTab: React.FC = () => {
  usePostulanteGuard();
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
  const [toastColor, setToastColor] = useState<'success'|'danger'>('success');

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
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {/* Header de perfil */}
      <div style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #cc4b1c 100%)`, padding: '28px 24px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff3', border: '2px solid #fff5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.8rem' }}>
          {postulante.nombres[0]}{postulante.apellidos[0]}
        </div>
        <h2 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>{postulante.nombres} {postulante.apellidos}</h2>
        <p style={{ margin: '4px 0 0', color: '#fff', opacity: 0.85, fontSize: '0.85rem' }}>{postulante.especialidad}</p>
      </div>

      <IonCard style={{ maxWidth: 600, margin: '16px auto' }}>
        <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IonCardTitle style={{ fontSize: '1rem' }}>Mis datos</IonCardTitle>
          {!editando && (
            <IonButton fill="outline" size="small" color="primary" onClick={() => setEditando(true)}>
              Editar
            </IonButton>
          )}
        </IonCardHeader>
        <IonCardContent style={{ padding: 0 }}>
          {!editando ? (
            <IonList>
              {campos.map(({ label, valor }) => (
                <IonItem key={label} lines="full">
                  <IonLabel>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{valor}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          ) : (
            <form onSubmit={handleGuardar} noValidate style={{ padding: '0 16px 16px' }}>
              {[
                { label: 'Nombres', value: nombres, setter: setNombres },
                { label: 'Apellidos', value: apellidos, setter: setApellidos },
              ].map(({ label, value, setter }) => (
                <IonItem key={label} lines="full">
                  <IonLabel position="stacked">{label}</IonLabel>
                  <IonInput value={value} onIonInput={e => setter(e.detail.value ?? '')} type="text" />
                </IonItem>
              ))}
              <IonItem lines="full">
                <IonLabel position="stacked">DNI (no modificable)</IonLabel>
                <IonInput value={postulante.dni} readonly style={{ color: '#9ca3af' }} />
              </IonItem>
              <IonItem lines="full">
                <IonLabel position="stacked">Celular</IonLabel>
                <div style={{ display: 'flex', gap: 8, width: '100%', paddingTop: 6 }}>
                  <IonSelect value={codigoPais} onIonChange={e => setCodigoPais(e.detail.value)} interface="popover" style={{ minWidth: 120 }}>
                    {CODIGOS_PAIS.map(c => <IonSelectOption key={c.value} value={c.value}>{c.label}</IonSelectOption>)}
                  </IonSelect>
                  <IonInput value={numeroCelular} onIonInput={e => setNumeroCelular(e.detail.value ?? '')} type="tel" style={{ flex: 1 }} />
                </div>
              </IonItem>
              <IonItem lines="full">
                <IonLabel position="stacked">Universidad</IonLabel>
                <IonInput value={universidad} onIonInput={e => setUniversidad(e.detail.value ?? '')} type="text" />
              </IonItem>
              <IonItem lines="full">
                <IonLabel position="stacked">Correo electrónico</IonLabel>
                <IonInput value={correo} onIonInput={e => setCorreo(e.detail.value ?? '')} type="email" />
              </IonItem>
              <IonItem lines={especialidad === 'Otro' ? 'full' : 'none'}>
                <IonLabel position="stacked">Especialidad</IonLabel>
                <IonSelect value={especialidad} onIonChange={e => setEspecialidad(e.detail.value)} interface="action-sheet">
                  {ESPECIALIDADES.map(esp => <IonSelectOption key={esp} value={esp}>{esp}</IonSelectOption>)}
                </IonSelect>
              </IonItem>
              {especialidad === 'Otro' && (
                <IonItem lines="none">
                  <IonLabel position="stacked">¿Cuál especialidad?</IonLabel>
                  <IonInput value={especialidadOtro} onIonInput={e => setEspecialidadOtro(e.detail.value ?? '')} type="text" />
                </IonItem>
              )}
              {error && <IonText color="danger"><p style={{ fontSize: '0.83rem', margin: '8px 0' }}>{error}</p></IonText>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <IonButton expand="block" type="submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? <IonSpinner name="crescent" /> : 'Guardar'}
                </IonButton>
                <IonButton expand="block" fill="outline" color="medium" onClick={() => setEditando(false)} style={{ flex: 1 }}>
                  Cancelar
                </IonButton>
              </div>
            </form>
          )}
        </IonCardContent>
      </IonCard>
      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </IonContent>
  );
};

// ─── Tab: Concursos ───────────────────────────────────────────────────────────
const ConcursosTab: React.FC = () => {
  usePostulanteGuard();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    api.concursos.listar().then(setConcursos).finally(() => setLoading(false));
  }, []);

  const estadoColor = (e: string) => e === 'ACTIVO' ? 'success' : e === 'PROXIMO' ? 'warning' : 'medium';

  const diasRestantes = (fechaFin: string) => {
    const diff = new Date(fechaFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>}
      {!loading && concursos.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <IonText color="medium"><p>No hay concursos disponibles por el momento.</p></IonText>
        </div>
      )}
      {concursos.map(c => (
        <IonCard key={c.id} style={{ margin: '12px 8px' }}>
          <div style={{ background: `linear-gradient(135deg, #0d0e10 0%, #2a1208 100%)`, padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, border: `1.5px solid ${ORANGE}33`, borderRadius: 4, transform: 'rotate(20deg)' }} />
            <IonChip color={estadoColor(c.estado)} style={{ marginBottom: 10, fontWeight: 600 }}>{c.estado}</IonChip>
            <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{c.titulo}</h2>
            <p style={{ margin: 0, color: '#ffffff88', fontSize: '0.8rem' }}>
              {formatFecha(c.fechaInicio)} → {formatFecha(c.fechaFin)}
              {c.estado === 'ACTIVO' && <span style={{ color: ORANGE, marginLeft: 8, fontWeight: 600 }}>{diasRestantes(c.fechaFin)} días restantes</span>}
            </p>
          </div>
          <IonCardContent>
            <p style={{ color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>{c.descripcion}</p>
            {c.bases && (
              <>
                <IonButton fill="clear" size="small" color="primary" onClick={() => setExpandido(expandido === c.id ? null : c.id)} style={{ margin: 0, padding: 0 }}>
                  {expandido === c.id ? 'Ocultar bases ▲' : 'Ver bases del concurso ▼'}
                </IonButton>
                {expandido === c.id && (
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginTop: 10 }}>
                    {c.bases.split('\n').map((linea, i) => (
                      <p key={i} style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{linea}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </IonCardContent>
        </IonCard>
      ))}
    </IonContent>
  );
};

// ─── Tab: Mis Entregas ────────────────────────────────────────────────────────
const EntregasTab: React.FC = () => {
  usePostulanteGuard();
  const postulante = getPostulante();
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success'|'danger'>('success');

  // Form state
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
      setToastMsg('¡Entrega enviada exitosamente!'); setToastColor('success'); setShowToast(true);
      setMostrarForm(false);
      setTitulo(''); setDescripcion(''); setUrlExterno(''); setArchivo(null); setConcursoId('');
      cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la entrega.';
      setError(msg); setToastMsg(msg); setToastColor('danger'); setShowToast(true);
    } finally { setSubiendo(false); }
  };

  return (
    <IonContent style={{ '--background': '#f4f5f7' }}>
      {/* Botón nueva entrega */}
      {!mostrarForm && (
        <div style={{ padding: '16px 8px 0' }}>
          <IonButton expand="block" onClick={() => setMostrarForm(true)}
            style={{ '--background': ORANGE, '--border-radius': '10px' }}>
            <IonIcon icon={cloudUploadOutline} slot="start" />
            Nueva entrega
          </IonButton>
        </div>
      )}

      {/* Formulario de entrega */}
      {mostrarForm && (
        <IonCard style={{ margin: '12px 8px' }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1rem', color: ORANGE }}>Nueva entrega</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubir} noValidate>
              <IonItem lines="full">
                <IonLabel position="stacked">Concurso *</IonLabel>
                <IonSelect value={concursoId} onIonChange={e => setConcursoId(e.detail.value)} placeholder="Seleccioná un concurso" interface="action-sheet">
                  {concursosActivos
                    .filter(c => !yaEntregados.includes(c.id))
                    .map(c => <IonSelectOption key={c.id} value={String(c.id)}>{c.titulo}</IonSelectOption>)
                  }
                </IonSelect>
              </IonItem>

              <IonItem lines="full">
                <IonLabel position="stacked">Título de tu entrega *</IonLabel>
                <IonInput value={titulo} onIonInput={e => setTitulo(e.detail.value ?? '')} placeholder="Ej. Propuesta Centro Comunitario" type="text" />
              </IonItem>

              <IonItem lines="full">
                <IonLabel position="stacked">Descripción (opcional)</IonLabel>
                <IonTextarea value={descripcion} onIonInput={e => setDescripcion(e.detail.value ?? '')} placeholder="Contá brevemente tu propuesta…" rows={3} />
              </IonItem>

              {/* Archivo */}
              <div style={{ padding: '12px 16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Archivo (PDF, imagen, ZIP — máx. 20 MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.zip,.dwg"
                  style={{ display: 'none' }}
                  onChange={e => setArchivo(e.target.files?.[0] ?? null)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${archivo ? ORANGE : '#d1d5db'}`,
                    borderRadius: 10, padding: '20px', textAlign: 'center',
                    cursor: 'pointer', background: archivo ? '#fff7f5' : '#fafafa',
                    transition: 'all .2s',
                  }}
                >
                  {archivo ? (
                    <p style={{ margin: 0, color: ORANGE, fontWeight: 600, fontSize: '0.9rem' }}>📄 {archivo.name}</p>
                  ) : (
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Tocá para seleccionar un archivo</p>
                  )}
                </div>
              </div>

              {/* URL alternativa */}
              <IonItem lines="none">
                <IonLabel position="stacked">O pegá un enlace (Google Drive, etc.)</IonLabel>
                <IonInput value={urlExterno} onIonInput={e => setUrlExterno(e.detail.value ?? '')} placeholder="https://drive.google.com/..." type="url" />
              </IonItem>

              {error && <IonText color="danger"><p style={{ fontSize: '0.83rem', margin: '8px 16px' }}>{error}</p></IonText>}

              <div style={{ display: 'flex', gap: 10, padding: '12px 0 0' }}>
                <IonButton expand="block" type="submit" disabled={subiendo} style={{ flex: 1, '--background': ORANGE }}>
                  {subiendo ? <IonSpinner name="crescent" /> : 'Enviar entrega'}
                </IonButton>
                <IonButton expand="block" fill="outline" color="medium" onClick={() => setMostrarForm(false)} style={{ flex: 1 }}>
                  Cancelar
                </IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>
      )}

      {/* Historial */}
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><IonSpinner name="crescent" color="primary" /></div>}

      {!loading && resoluciones.length === 0 && !mostrarForm && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <IonText color="medium">
            <p style={{ fontSize: '1rem' }}>Sin entregas aún</p>
            <p style={{ fontSize: '0.85rem' }}>Usá el botón de arriba para subir tu primera resolución.</p>
          </IonText>
        </div>
      )}

      {resoluciones.map(r => (
        <IonCard key={r.id} style={{ margin: '8px 8px' }}>
          <IonItem lines="none">
            <IonLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{r.titulo}</h2>
                <IonBadge color={estadoBadgeColor(r.estado)}>{r.estado}</IonBadge>
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '0.82rem', color: '#6b7280' }}>{r.concursoTitulo}</p>
              {r.descripcion && <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#374151' }}>{r.descripcion}</p>}
              <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                {r.tieneArchivo && (
                  <a href={`/api/v1/resoluciones/${r.id}/archivo`} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>
                    📄 {r.archivoNombre}
                  </a>
                )}
                {r.urlExterno && (
                  <a href={r.urlExterno} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>
                    🔗 Ver enlace
                  </a>
                )}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{formatFecha(r.creadoEn)}</p>
            </IonLabel>
          </IonItem>
        </IonCard>
      ))}

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} color={toastColor} position="top" />
    </IonContent>
  );
};

// ─── PostulantePage ───────────────────────────────────────────────────────────
const PostulantePage: React.FC = () => {
  const history = useHistory();
  const postulante = getPostulante();

  const handleLogout = () => {
    sessionStorage.removeItem('postulante_data');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Hola, {postulante?.nombres ?? 'Postulante'}</IonTitle>
          <IonButtons slot="end">
            <IonButton color="light" fill="clear" onClick={handleLogout}>Salir</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/postulante/perfil" render={() => <IonTab tab="perfil"><PerfilTab /></IonTab>} />
          <Route exact path="/postulante/concursos" render={() => <IonTab tab="concursos"><ConcursosTab /></IonTab>} />
          <Route exact path="/postulante/entregas" render={() => <IonTab tab="entregas"><EntregasTab /></IonTab>} />
          <Route exact path="/postulante"><Redirect to="/postulante/perfil" /></Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="perfil" href="/postulante/perfil">
            <IonIcon icon={personOutline} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
          <IonTabButton tab="concursos" href="/postulante/concursos">
            <IonIcon icon={trophyOutline} />
            <IonLabel>Concursos</IonLabel>
          </IonTabButton>
          <IonTabButton tab="entregas" href="/postulante/entregas">
            <IonIcon icon={cloudUploadOutline} />
            <IonLabel>Mis entregas</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
  );
};

export default PostulantePage;
