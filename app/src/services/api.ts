// Servicio API — Habisite Design Challenge
// TODO: reemplazar con autenticación JWT real

const BASE_URL = `${import.meta.env.VITE_API_URL || 'https://api.habisite.com/api'}/v1`;

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Postulante {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  universidad: string;
  correoElectronico: string;
  especialidad: string;
  creadoEn: string;
  infoEnviadaEn: string | null;
  confirmadoEn: string | null;
  recordatorioEnviadoEn: string | null;
}

export interface PostulanteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  universidad: string;
  correoElectronico: string;
  especialidad: string;
}

export interface Evaluacion {
  id: number;
  postulanteId: number;
  postulanteNombre: string;
  juradoNombre: string;
  puntaje: number;
  comentario: string;
  evaluadoEn: string;
}

export interface EvaluacionRequest {
  postulanteId: number;
  juradoNombre: string;
  puntaje: number;
  comentario: string;
}

export interface AdminStats {
  totalPostulantes: number;
  totalEvaluaciones: number;
  totalResoluciones: number;
  resolucionesPendientes: number;
  resolucionesAprobadas: number;
  resolucionesRechazadas: number;
  porEspecialidad: Record<string, number>;
  porUniversidad: Record<string, number>;
  totalInfoEnviada: number;
  totalConfirmados: number;
  totalNoConfirmados: number;
  totalRecordatorioEnviado: number;
  porcentajeConfirmacion: number;
}

export interface CampanaInfoRequest {
  webinarUrl: string;
  webinarFecha: string;
  canalUrl: string;
  canalNombre: string;
}

export interface CampanaResult {
  emailsEnviados: number;
  emailsOmitidos: number;
  mensaje: string;
}

export interface ConfirmacionResult {
  confirmado: boolean;
  mensaje: string;
}

export interface Concurso {
  id: number;
  titulo: string;
  descripcion: string;
  bases: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVO' | 'CERRADO' | 'PROXIMO' | 'TERMINADO';
  creadoEn: string;
  terminadoEn: string | null;
  limpiezaProgramadaEn: string | null;
}

export interface Resolucion {
  id: number;
  postulanteId: number;
  postulanteNombre: string;
  concursoId: number;
  concursoTitulo: string;
  titulo: string;
  descripcion: string | null;
  archivoNombre: string | null;
  tieneArchivo: boolean;
  urlExterno: string | null;
  estado: 'INDETERMINADO' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  tipoEntrega: string;
  propuesta: string | null;
  creadoEn: string;
}

export interface EquipoMiembro {
  id: number;
  postulanteId: number;
  miembroId: number;
  dni: string;
  email: string;
  celular: string;
  nombres: string;
  apellidos: string;
}

export interface CriterioEvaluacion {
  id: number;
  concursoId: number;
  nombre: string;
  peso: number;
  orden: number;
}

// ─── Helper HTTP ──────────────────────────────────────────────────────────────

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  // Para respuestas 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface LoginResponse {
  rol: 'ADMIN' | 'JURADO' | 'POSTULANTE';
  nombre: string;
  postulante?: Postulante;
}

// ─── API namespaces ───────────────────────────────────────────────────────────

export const api = {
  postulantes: {
    /** Obtiene todos los postulantes */
    listar: () => req<Postulante[]>('/postulantes'),

    /** Busca un postulante por DNI */
    buscarPorDni: (dni: string) => req<Postulante>(`/postulantes/dni/${dni}`),

    /** Busca un postulante por ID */
    buscarPorId: (id: number) => req<Postulante>(`/postulantes/${id}`),

    /** Registra un nuevo postulante */
    registrar: (data: PostulanteRequest) =>
      req<Postulante>('/postulantes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Actualiza los datos de un postulante */
    actualizar: (id: number, data: PostulanteRequest) =>
      req<Postulante>(`/postulantes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /** Genera nueva contraseña y la envía por email al postulante */
    regenerarClave: (id: number) =>
      req<void>(`/postulantes/${id}/regenerar-clave`, { method: 'POST' }),

    /** Recupera contraseña por DNI — siempre devuelve 200 */
    recuperarClave: (dni: string) =>
      req<void>('/postulantes/recuperar-clave', {
        method: 'POST',
        body: JSON.stringify({ dni }),
      }),

    /** Elimina un postulante por ID */
    eliminar: (id: number) =>
      req<void>(`/postulantes/${id}`, { method: 'DELETE' }),
  },

  evaluaciones: {
    /** Obtiene todas las evaluaciones */
    listar: () => req<Evaluacion[]>('/evaluaciones'),

    /** Obtiene las evaluaciones de un postulante específico */
    listarPorPostulante: (postulanteId: number) =>
      req<Evaluacion[]>(`/evaluaciones/postulante/${postulanteId}`),

    /** Crea una nueva evaluación */
    crear: (data: EvaluacionRequest) =>
      req<Evaluacion>('/evaluaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  admin: {
    /** Obtiene estadísticas generales del panel admin */
    stats: () => req<AdminStats>('/admin/stats'),
  },

  auth: {
    /** Login unificado — detecta rol por DB */
    login: (data: LoginRequest) =>
      req<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  concursos: {
    listar: () => req<Concurso[]>('/concursos'),
    obtener: (id: number) => req<Concurso>(`/concursos/${id}`),
  },

  resoluciones: {
    listarPorPostulante: (postulanteId: number) =>
      req<Resolucion[]>(`/resoluciones/postulante/${postulanteId}`),

    listarTodas: () => req<Resolucion[]>('/resoluciones'),

    subir: (formData: FormData) =>
      fetch(`/api/v1/resoluciones`, { method: 'POST', body: formData })
        .then(async r => {
          if (!r.ok) throw new Error(`Error ${r.status}: ${await r.text()}`);
          return r.json() as Promise<Resolucion>;
        }),

    cambiarEstado: (id: number, estado: string) =>
      req<Resolucion>(`/resoluciones/${id}/estado?estado=${estado}`, { method: 'PATCH' }),

    seleccionarPropuesta: (id: number, propuesta: string) =>
      req<Resolucion>(`/resoluciones/${id}/propuesta?propuesta=${encodeURIComponent(propuesta)}`, { method: 'PATCH' }),
  },

  equipo: {
    listar: (postulanteId: number) => req<EquipoMiembro[]>(`/equipo/${postulanteId}`),
    buscarDni: (dni: string) => req<{ encontrado: boolean; id?: number; nombres?: string; apellidos?: string; dni?: string; email?: string; celular?: string }>(`/equipo/buscar-dni?dni=${dni}`),
    agregar: (postulanteId: number, data: { dni: string; email: string; celular: string; nombres: string; apellidos: string }) =>
      req<EquipoMiembro>(`/equipo/${postulanteId}`, { method: 'POST', body: JSON.stringify(data) }),
    eliminar: (equipoId: number) => req<void>(`/equipo/${equipoId}`, { method: 'DELETE' }),
  },

  criterios: {
    listar: (concursoId: number) => req<CriterioEvaluacion[]>(`/criterios/concurso/${concursoId}`),
    crear: (concursoId: number, data: { nombre: string; peso: number; orden: number }) =>
      req<CriterioEvaluacion>(`/criterios/concurso/${concursoId}`, { method: 'POST', body: JSON.stringify(data) }),
    eliminar: (id: number) => req<void>(`/criterios/${id}`, { method: 'DELETE' }),
  },

  campanas: {
    enviarInfoConcurso: (data: CampanaInfoRequest) =>
      req<CampanaResult>('/admin/campanas/info-concurso', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    enviarSegundaConvocatoria: () =>
      req<CampanaResult>('/admin/campanas/segunda-convocatoria', { method: 'POST' }),
    enviarBienvenidaConfirmados: () =>
      req<CampanaResult>('/admin/campanas/bienvenida-confirmados', { method: 'POST' }),
  },

  confirmacion: {
    confirmar: (token: string) =>
      req<ConfirmacionResult>(`/confirmacion?token=${token}`),
    verificar: (token: string) =>
      req<ConfirmacionResult>(`/confirmacion/verificar?token=${token}`),
    confirmarConDatos: (body: { token: string; dni: string; celular: string; especialidad: string }) =>
      req<ConfirmacionResult>('/confirmacion', { method: 'POST', body: JSON.stringify(body) }),
  },

  usuarios: {
    listar: () => req<UsuarioInfo[]>('/admin/usuarios'),
    crear: (data: { nombre: string; username: string; password: string; rol: string }) =>
      req<UsuarioInfo>('/admin/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id: number, data: Record<string, string>) =>
      req<UsuarioInfo>(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id: number) =>
      req<void>(`/admin/usuarios/${id}`, { method: 'DELETE' }),
  },

  publicaciones: {
    listar: () => req<PublicacionInfo[]>('/admin/publicaciones'),
    crear: (data: { titulo: string; contenido: string; autor?: string; publicado?: boolean }) =>
      req<PublicacionInfo>('/admin/publicaciones', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id: number, data: Record<string, unknown>) =>
      req<PublicacionInfo>(`/admin/publicaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id: number) =>
      req<void>(`/admin/publicaciones/${id}`, { method: 'DELETE' }),
  },

  recursos: {
    listar: () => req<RecursoInfo[]>('/admin/recursos'),
    subir: (formData: FormData) =>
      fetch(`${BASE_URL.replace('/v1', '')}/v1/admin/recursos`, { method: 'POST', body: formData })
        .then(async r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<RecursoInfo>; }),
    eliminar: (id: number) =>
      req<void>(`/admin/recursos/${id}`, { method: 'DELETE' }),
    archivoUrl: (id: number) => `${BASE_URL.replace('/v1', '')}/v1/admin/recursos/${id}/archivo`,
  },

  soporte: {
    /** Crea un ticket de soporte desde el login */
    crearTicket: (data: { nombre: string; dni?: string; mensaje: string }) =>
      req<{ id: number }>('/soporte/ticket', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Lista todos los tickets (admin) */
    listarTickets: () => req<SoporteTicket[]>('/soporte/tickets'),

    /** Marca un ticket como resuelto */
    resolverTicket: (id: number) =>
      req<SoporteTicket>(`/soporte/tickets/${id}/resolver`, { method: 'PATCH' }),
  },
};

export interface SoporteTicket {
  id: number;
  nombre: string;
  dni: string | null;
  mensaje: string;
  resuelto: boolean;
  creadoEn: string;
}

export interface UsuarioInfo {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  creadoEn: string;
}

export interface PublicacionInfo {
  id: number;
  titulo: string;
  contenido: string;
  autor: string;
  publicado: boolean;
  creadoEn: string;
}

export interface RecursoInfo {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  archivoNombre: string;
  contentType: string;
  tamanio: number;
  creadoEn: string;
}
