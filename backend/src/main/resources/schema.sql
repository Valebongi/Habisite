CREATE TABLE IF NOT EXISTS postulante (
    id                  BIGSERIAL       PRIMARY KEY,
    nombres             VARCHAR(100)    NOT NULL,
    apellidos           VARCHAR(100)    NOT NULL,
    dni                 VARCHAR(8)      UNIQUE,
    celular             VARCHAR(15),
    universidad         VARCHAR(150)    NOT NULL,
    correo_electronico  VARCHAR(150)    NOT NULL UNIQUE,
    especialidad        VARCHAR(100),
    password_hash       VARCHAR(255),
    creado_en           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
-- Migración segura: agrega la columna si la tabla ya existe sin ella
ALTER TABLE postulante ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE TABLE IF NOT EXISTS usuario (
    id              BIGSERIAL       PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    rol             VARCHAR(20)     NOT NULL CHECK (rol IN ('ADMIN', 'JURADO')),
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concurso (
    id              BIGSERIAL       PRIMARY KEY,
    titulo          VARCHAR(200)    NOT NULL,
    descripcion     TEXT            NOT NULL,
    bases           TEXT,
    fecha_inicio    TIMESTAMPTZ     NOT NULL,
    fecha_fin       TIMESTAMPTZ     NOT NULL,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','CERRADO','PROXIMO')),
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resolucion (
    id              BIGSERIAL       PRIMARY KEY,
    postulante_id   BIGINT          NOT NULL REFERENCES postulante(id) ON DELETE CASCADE,
    concurso_id     BIGINT          NOT NULL REFERENCES concurso(id) ON DELETE CASCADE,
    titulo          VARCHAR(200)    NOT NULL,
    descripcion     TEXT,
    archivo_nombre  VARCHAR(255),
    archivo_datos   BYTEA,
    url_externo     VARCHAR(500),
    estado          VARCHAR(20)     NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA')),
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (postulante_id, concurso_id)
);

CREATE TABLE IF NOT EXISTS soporte_ticket (
    id          BIGSERIAL       PRIMARY KEY,
    nombre      VARCHAR(150)    NOT NULL,
    dni         VARCHAR(20),
    mensaje     TEXT            NOT NULL,
    resuelto    BOOLEAN         NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluacion (
    id              BIGSERIAL       PRIMARY KEY,
    postulante_id   BIGINT          NOT NULL REFERENCES postulante(id) ON DELETE CASCADE,
    jurado_nombre   VARCHAR(100)    NOT NULL,
    puntaje         INTEGER         NOT NULL CHECK (puntaje BETWEEN 1 AND 10),
    comentario      TEXT,
    evaluado_en     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (postulante_id, jurado_nombre)
);

-- ── Campañas de comunicación ─────────────────────────────────────────────────
ALTER TABLE postulante ADD COLUMN IF NOT EXISTS token_confirmacion       VARCHAR(36) UNIQUE;
ALTER TABLE postulante ADD COLUMN IF NOT EXISTS info_enviada_en          TIMESTAMPTZ;
ALTER TABLE postulante ADD COLUMN IF NOT EXISTS confirmado_en            TIMESTAMPTZ;
ALTER TABLE postulante ADD COLUMN IF NOT EXISTS recordatorio_enviado_en  TIMESTAMPTZ;

ALTER TABLE concurso ADD COLUMN IF NOT EXISTS webinar_url    VARCHAR(500);
ALTER TABLE concurso ADD COLUMN IF NOT EXISTS webinar_fecha  TIMESTAMPTZ;
ALTER TABLE concurso ADD COLUMN IF NOT EXISTS canal_url      VARCHAR(500);
ALTER TABLE concurso ADD COLUMN IF NOT EXISTS canal_nombre   VARCHAR(50);

-- ── Publicaciones ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS publicacion (
    id          BIGSERIAL       PRIMARY KEY,
    titulo      VARCHAR(200)    NOT NULL,
    contenido   TEXT            NOT NULL,
    autor       VARCHAR(100)    NOT NULL DEFAULT 'Admin',
    publicado   BOOLEAN         NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── Recursos / Imágenes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurso (
    id              BIGSERIAL       PRIMARY KEY,
    nombre          VARCHAR(200)    NOT NULL,
    descripcion     VARCHAR(500),
    tipo            VARCHAR(50)     NOT NULL DEFAULT 'imagen',
    archivo_nombre  VARCHAR(255)    NOT NULL,
    archivo_datos   BYTEA           NOT NULL,
    content_type    VARCHAR(100),
    tamanio         BIGINT,
    creado_en       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── Migración: permitir pre-registro sin DNI/celular/especialidad ────────────
ALTER TABLE postulante ALTER COLUMN dni DROP NOT NULL;
ALTER TABLE postulante ALTER COLUMN celular DROP NOT NULL;
ALTER TABLE postulante ALTER COLUMN especialidad DROP NOT NULL;
