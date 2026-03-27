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
  porEspecialidad: Record<string, number>;
  porUniversidad: Record<string, number>;
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
};
