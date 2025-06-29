-- CreateTable
CREATE TABLE "alumnoapoderado" (
    "dni_alumno" INTEGER NOT NULL,
    "dni_apoderado" INTEGER NOT NULL,
    "tipo_relacion" VARCHAR(50) NOT NULL,

    CONSTRAINT "alumnoapoderado_pkey" PRIMARY KEY ("dni_alumno","dni_apoderado")
);

-- CreateTable
CREATE TABLE "apoderado" (
    "dni_apoderado" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "genero" CHAR(1),
    "direccion" VARCHAR(500),
    "telefono" INTEGER,

    CONSTRAINT "apoderado_pkey" PRIMARY KEY ("dni_apoderado")
);

-- CreateTable
CREATE TABLE "asignatura" (
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "fecha_inicio" DATE,
    "fecha_cierre" DATE,

    CONSTRAINT "asignatura_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "asignaturadictada" (
    "dni_alumno" INTEGER NOT NULL,
    "codigo_asignatura" VARCHAR(50) NOT NULL,
    "id_profesor" INTEGER NOT NULL,
    "horario_inicio" VARCHAR(10) NOT NULL,
    "horario_fin" VARCHAR(10) NOT NULL,

    CONSTRAINT "asignaturadictada_pkey" PRIMARY KEY ("dni_alumno","codigo_asignatura","id_profesor")
);

-- CreateTable
CREATE TABLE "aula" (
    "id" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,

    CONSTRAINT "aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobra" (
    "dni_apoderado" INTEGER NOT NULL,
    "dni_alumno" INTEGER NOT NULL,
    "id_trabajador" INTEGER NOT NULL,
    "fecha_matricula" DATE NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "monto" INTEGER NOT NULL,

    CONSTRAINT "cobra_pkey" PRIMARY KEY ("dni_apoderado","dni_alumno","id_trabajador","fecha_matricula","fecha_pago")
);

-- CreateTable
CREATE TABLE "datosalumno" (
    "dni_alumno" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "genero" CHAR(1),
    "fecha_nacimiento" DATE NOT NULL,
    "correo_institucional" VARCHAR(255),

    CONSTRAINT "datosalumno_pkey" PRIMARY KEY ("dni_alumno")
);

-- CreateTable
CREATE TABLE "evaluacion" (
    "codigo_asignatura" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "fecha_inicio" DATE,

    CONSTRAINT "evaluacion_pkey" PRIMARY KEY ("codigo_asignatura","tipo")
);

-- CreateTable
CREATE TABLE "limpia" (
    "id_aula" INTEGER NOT NULL,
    "id_trabajador" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" VARCHAR(10),
    "frecuencia" VARCHAR(50),

    CONSTRAINT "limpia_pkey" PRIMARY KEY ("id_aula","id_trabajador","fecha")
);

-- CreateTable
CREATE TABLE "mantenimiento" (
    "id" INTEGER NOT NULL,
    "tipo_mantenimiento" VARCHAR(100),

    CONSTRAINT "mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matricula" (
    "dni_alumno" INTEGER NOT NULL,
    "fecha_matricula" DATE NOT NULL,
    "id_aula" INTEGER NOT NULL,
    "grado" VARCHAR(50) NOT NULL,
    "seccion" VARCHAR(50) NOT NULL,
    "estado_matricula" VARCHAR(20) NOT NULL,

    CONSTRAINT "matricula_pkey" PRIMARY KEY ("dni_alumno","fecha_matricula")
);

-- CreateTable
CREATE TABLE "nota" (
    "valor" INTEGER NOT NULL,
    "tipo_evaluacion" VARCHAR(100) NOT NULL,
    "codigo_asignatura" VARCHAR(50) NOT NULL,
    "dni_alumno" INTEGER NOT NULL,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("tipo_evaluacion","codigo_asignatura","dni_alumno")
);

-- CreateTable
CREATE TABLE "profesor" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretaria" (
    "id" INTEGER NOT NULL,
    "fecha_ingreso" DATE NOT NULL,

    CONSTRAINT "secretaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trabajadores" (
    "id" INTEGER NOT NULL,
    "dni" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "celular" INTEGER,
    "correo" VARCHAR(255),
    "direccion" VARCHAR(500),
    "sueldo" INTEGER,

    CONSTRAINT "trabajadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "datosalumno_correo_institucional_key" ON "datosalumno"("correo_institucional");

-- CreateIndex
CREATE UNIQUE INDEX "trabajadores_dni_key" ON "trabajadores"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "trabajadores_correo_key" ON "trabajadores"("correo");

-- AddForeignKey
ALTER TABLE "alumnoapoderado" ADD CONSTRAINT "alumnoapoderado_dni_alumno_fkey" FOREIGN KEY ("dni_alumno") REFERENCES "datosalumno"("dni_alumno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alumnoapoderado" ADD CONSTRAINT "alumnoapoderado_dni_apoderado_fkey" FOREIGN KEY ("dni_apoderado") REFERENCES "apoderado"("dni_apoderado") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asignaturadictada" ADD CONSTRAINT "asignaturadictada_codigo_asignatura_fkey" FOREIGN KEY ("codigo_asignatura") REFERENCES "asignatura"("codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asignaturadictada" ADD CONSTRAINT "asignaturadictada_dni_alumno_fkey" FOREIGN KEY ("dni_alumno") REFERENCES "datosalumno"("dni_alumno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asignaturadictada" ADD CONSTRAINT "asignaturadictada_id_profesor_fkey" FOREIGN KEY ("id_profesor") REFERENCES "profesor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cobra" ADD CONSTRAINT "cobra_dni_alumno_fecha_matricula_fkey" FOREIGN KEY ("dni_alumno", "fecha_matricula") REFERENCES "matricula"("dni_alumno", "fecha_matricula") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cobra" ADD CONSTRAINT "cobra_dni_apoderado_dni_alumno_fkey" FOREIGN KEY ("dni_apoderado", "dni_alumno") REFERENCES "alumnoapoderado"("dni_apoderado", "dni_alumno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cobra" ADD CONSTRAINT "cobra_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "secretaria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_codigo_asignatura_fkey" FOREIGN KEY ("codigo_asignatura") REFERENCES "asignatura"("codigo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limpia" ADD CONSTRAINT "limpia_id_aula_fkey" FOREIGN KEY ("id_aula") REFERENCES "aula"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limpia" ADD CONSTRAINT "limpia_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "mantenimiento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mantenimiento" ADD CONSTRAINT "mantenimiento_id_fkey" FOREIGN KEY ("id") REFERENCES "trabajadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_dni_alumno_fkey" FOREIGN KEY ("dni_alumno") REFERENCES "datosalumno"("dni_alumno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_id_aula_fkey" FOREIGN KEY ("id_aula") REFERENCES "aula"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_dni_alumno_fkey" FOREIGN KEY ("dni_alumno") REFERENCES "datosalumno"("dni_alumno") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_tipo_evaluacion_codigo_asignatura_fkey" FOREIGN KEY ("tipo_evaluacion", "codigo_asignatura") REFERENCES "evaluacion"("tipo", "codigo_asignatura") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profesor" ADD CONSTRAINT "profesor_id_fkey" FOREIGN KEY ("id") REFERENCES "trabajadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "secretaria" ADD CONSTRAINT "secretaria_id_fkey" FOREIGN KEY ("id") REFERENCES "trabajadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
