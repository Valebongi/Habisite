-- ============================================================
--  Habisite DB  |  PostgreSQL 17
--  Tabla: postulante
-- ============================================================

CREATE TABLE IF NOT EXISTS postulante (
    id                  BIGSERIAL       PRIMARY KEY,
    nombres             VARCHAR(100)    NOT NULL,
    apellidos           VARCHAR(100)    NOT NULL,
    dni                 VARCHAR(8)      NOT NULL UNIQUE,
    celular             VARCHAR(15)     NOT NULL,
    universidad         VARCHAR(150)    NOT NULL,
    correo_electronico  VARCHAR(150)    NOT NULL UNIQUE,
    especialidad        VARCHAR(100)    NOT NULL,
    creado_en           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  postulante                    IS 'Postulantes registrados en Habisite';
COMMENT ON COLUMN postulante.dni                IS 'DNI sin puntos ni espacios (8 dígitos)';
COMMENT ON COLUMN postulante.correo_electronico IS 'Correo único por postulante';
