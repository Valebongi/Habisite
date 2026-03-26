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

CREATE TABLE IF NOT EXISTS evaluacion (
    id              BIGSERIAL       PRIMARY KEY,
    postulante_id   BIGINT          NOT NULL REFERENCES postulante(id) ON DELETE CASCADE,
    jurado_nombre   VARCHAR(100)    NOT NULL,
    puntaje         INTEGER         NOT NULL CHECK (puntaje BETWEEN 1 AND 10),
    comentario      TEXT,
    evaluado_en     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (postulante_id, jurado_nombre)
);
