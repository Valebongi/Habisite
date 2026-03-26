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
