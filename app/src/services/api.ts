// Servicio API — Habisite Design Challenge
// TODO: reemplazar con autenticación JWT real

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'https://api.habisite.com/api'}/v1`;

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
}

export interface Concurso {
  id: number;
  titulo: string;
  descripcion: string;
  bases: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ACTIVO' | 'CERRADO' | 'PROXIMO';
  creadoEn: string;
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
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  creadoEn: string;
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
