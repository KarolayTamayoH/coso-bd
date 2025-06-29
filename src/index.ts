import "dotenv/config";
import { faker } from "@faker-js/faker";
import {
  type AlumnoApoderado,
  type Apoderado,
  type AsignaturaDictada,
  type Aula,
  type DatosAlumno,
  type Limpia,
  PrismaClient,
  type Trabajadores
} from "@prisma/client";

import { asignaturas } from './helpers/constants';

const prisma = new PrismaClient();
const BATCH_SIZE = 1_000;
const TOTAL = (process.env.TOTAL_ALUMNOS
  ? parseInt(process.env.TOTAL_ALUMNOS)
  : 1000) as 1000 | 10_000 | 100_000 | 1_000_000;
const ALUMNOS_POR_AULA = 25;

// Set para garantizar unicidad de DNIs
const dniUsados = new Set<number>();

function generarDNIUnico(): number {
  let dni: number;
  do {
    // Generar DNI de 8 cifras (10,000,000 - 99,999,999)
    dni = faker.number.int({ min: 10_000_000, max: 99_999_999 });
  } while (dniUsados.has(dni));
  
  dniUsados.add(dni);
  return dni;
}

const trabajadores = {
  1000: {
    profesores: 56,
    secretarias: 4,
    limpieza: 9
  },
  10000: {
    profesores: 560,
    secretarias: 34,
    limpieza: 84
  },
  100000: {
    profesores: 30588,
    secretarias: 334,
    limpieza: 834
  },
  1000000: {
    profesores: 56000,
    secretarias: 3334,
    limpieza: 8334
  }
}

const aulas = {
  1000: 40,
  10000: 400,
  100000: 4000,
  1000000: 40000
}

function generarHorarioClase() {
  // Horas posibles entre 7am y 6pm (formato 24h)
  const horaInicio = faker.number.int({ min: 7, max: 16 }); // última clase puede iniciar a las 4pm
  const duracion = faker.helpers.arrayElement([1, 1.5, 2]); // clases de 1, 1.5 o 2 horas
  const horaFin = horaInicio + duracion;

  const formato12h = (horaDecimal: number) => {
    const horas = Math.floor(horaDecimal);
    const minutos = horaDecimal % 1 === 0 ? '00' : '30';
    const ampm = horas >= 12 ? 'pm' : 'am';
    const horas12 = ((horas + 11) % 12 + 1);
    return `${horas12}:${minutos}${ampm}`;
  };

  return {
    hora_inicio: formato12h(horaInicio),
    hora_fin: formato12h(horaFin)
  };
}

function generarHorarioTarde() {
  // Bloques posibles: desde 6:30pm (18.5) hasta 10:00pm (22.0)
  const bloques = [18.5, 19.0, 19.5, 20.0, 20.5, 21.0, 21.5, 22.0];
  const horaDecimal = faker.helpers.arrayElement(bloques);

  const formato12h = (hora: number) => {
    const h = Math.floor(hora);
    const m = hora % 1 === 0 ? '00' : '30';
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = ((h + 11) % 12 + 1);
    return `${h12}:${m}${ampm}`;
  };

  return formato12h(horaDecimal);
}

async function seedUsuarios() {
	for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
		const alumnos: DatosAlumno[] = []
    const apoderados: Apoderado[] = []
    const alumnosApoderados: AlumnoApoderado[] = []

    for (let j = 0; j < BATCH_SIZE; j++) {
      // Creación de un alumno
      const firstNameAlumno = faker.person.firstName();
      const lastNameAlumno = faker.person.lastName();
      const emailAlumno = faker.internet.email({
        firstName: firstNameAlumno.toLocaleLowerCase(),
        lastName: lastNameAlumno.toLocaleLowerCase(),
        provider: "utec.edu.pe",
      })

			alumnos.push({
				dni_alumno: generarDNIUnico(),
        nombre: `${firstNameAlumno} ${lastNameAlumno}`,
        genero: faker.person.sexType().toUpperCase()[0],
        correo_institucional: emailAlumno,
        fecha_nacimiento: faker.date.birthdate({
          min: 4,
          max: 17,
          mode: "age",
        }),
			})

      // Creación de un apoderado
      const firstNameApoderado = faker.person.firstName();
      const lastNameApoderado = faker.person.lastName();

      apoderados.push({
        dni_apoderado: generarDNIUnico(),
        nombre: `${firstNameApoderado} ${lastNameApoderado}`,
        genero: faker.person.sexType().toUpperCase()[0],
        direccion: faker.location.streetAddress(),
        telefono: Number(
					// 9xx_xxx_xxx
					faker.string.numeric({ length: 9, allowLeadingZeros: true }),
				),
      });

      // creación de la relación alumno-apoderado
      alumnosApoderados.push({
        dni_alumno: alumnos[j].dni_alumno,
        dni_apoderado: apoderados[j].dni_apoderado,
        tipo_relacion: apoderados[j].genero === "F" ? "MADRE" : "PADRE",
      })
    }

    // Creación de los profesores, secretarias y personal de limpieza
    const profesores: Trabajadores[] = [];
    const secretarias: Trabajadores[] = [];
    const limpieza: Trabajadores[] = [];

    for (let j = 0; j < trabajadores[TOTAL].profesores; j++) {
      const firstNameProfesor = faker.person.firstName();
      const lastNameProfesor = faker.person.lastName();
      const emailProfesor = faker.internet.email({
        firstName: firstNameProfesor.toLocaleLowerCase(),
        lastName: lastNameProfesor.toLocaleLowerCase(),
        provider: "utec.edu.pe",
      });

      profesores.push({
        id: j,
        dni: generarDNIUnico(),
        nombre: `${firstNameProfesor} ${lastNameProfesor}`,
        celular: Number(
					// 9xx_xxx_xxx
					faker.string.numeric({ length: 9, allowLeadingZeros: true }),
				),
        correo: emailProfesor,
        direccion: faker.location.streetAddress(),
        sueldo: faker.number.int({ min: 2000, max: 3500 }),
      });

      if (j < trabajadores[TOTAL].secretarias) {
        const firstNameSecretaria = faker.person.firstName();
        const lastNameSecretaria = faker.person.lastName();
        const emailSecretaria = faker.internet.email({
          firstName: firstNameSecretaria.toLocaleLowerCase(),
          lastName: lastNameSecretaria.toLocaleLowerCase(),
          provider: "utec.edu.pe",
        });

        secretarias.push({
          id: j + trabajadores[TOTAL].profesores,
          dni: generarDNIUnico(),
          nombre: `${firstNameSecretaria} ${lastNameSecretaria}`,
          celular: Number(
            // 9xx_xxx_xxx
            faker.string.numeric({ length: 9, allowLeadingZeros: true }),
          ),
          correo: emailSecretaria,
          direccion: faker.location.streetAddress(),
          sueldo: faker.number.int({ min: 1500, max: 2500 }),
        });
      }

      if (j < trabajadores[TOTAL].limpieza) {
        const firstNameLimpieza = faker.person.firstName();
        const lastNameLimpieza = faker.person.lastName();
        const emailLimpieza = faker.internet.email({
          firstName: firstNameLimpieza.toLocaleLowerCase(),
          lastName: lastNameLimpieza.toLocaleLowerCase(),
          provider: "utec.edu.pe",
        });

        limpieza.push({
          id: j + trabajadores[TOTAL].profesores + trabajadores[TOTAL].secretarias,
          dni: generarDNIUnico(),
          nombre: `${firstNameLimpieza} ${lastNameLimpieza}`,
          celular: Number(
            // 9xx_xxx_xxx
            faker.string.numeric({ length: 9, allowLeadingZeros: true }),
          ),
          correo: emailLimpieza,
          direccion: faker.location.streetAddress(),
          sueldo: faker.number.int({ min: 1000, max: 1500 }),
        });
      }
    }

    // Creación de asignaturas y asignación de profesores
    const asignaturasDictadas: AsignaturaDictada[] = [];

    for (let j = 0; j < alumnos.length; j += ALUMNOS_POR_AULA) {
      const asignatura = asignaturas[j % asignaturas.length];
      const profesorIndex = j % profesores.length;
      const horario = generarHorarioClase();

      for (let k = 0; k < ALUMNOS_POR_AULA && (j + k) < alumnos.length; k++) {
        asignaturasDictadas.push({
          dni_alumno: alumnos[j + k].dni_alumno,
          codigo_asignatura: asignatura.codigo,
          id_profesor: profesores[profesorIndex].id,
          horario_inicio: horario.hora_inicio,
          horario_fin: horario.hora_fin,
        });
      }
    }

    // Creación de aulas
    const aulasData: Aula[] = [];

    for (let j = 0; j < aulas[TOTAL]; j++) {
      aulasData.push({
        id: j + 1, // Aseguramos que el ID comience desde 1
        tipo: faker.helpers.arrayElement(["LABORATORIO", "TEORÍA", "PRÁCTICA"]),
      });
    }

    // Asignación de personal de limpieza a aulas
    const limpia: Limpia[] = limpieza.map((trabajador, index) => ({
      id_aula: (index % aulasData.length) + 1, // Asignar a un aula de forma cíclica
      id_trabajador: trabajador.id,
      fecha: faker.date.future({ years: 1, refDate: new Date() }),
      hora: generarHorarioTarde(),
      frecuencia: faker.helpers.arrayElement(["DIARIA", "SEMANAL", "MENSUAL"]), 
    }));

    // Generación de matrículas
    const matriculas = [];
    
    for (let j = 0; j < alumnos.length; j++) {
      const grado = faker.number.int({ min: 1, max: 13 });
      const seccion = faker.helpers.arrayElement(["A", "B", "C"]);
      const aulaId = (j % aulasData.length) + 1; // Asignar aula de forma cíclica
      
      matriculas.push({
        dni_alumno: alumnos[j].dni_alumno,
        fecha_matricula: faker.date.past({ years: 1 }),
        id_aula: aulaId,
        grado: `${grado}°`,
        seccion: seccion,
        estado_matricula: faker.helpers.arrayElement(["activo", "retirado", "culminado"])
      });
    }

    // Generación de cobros - cada secretaria maneja entre 300-400 cobros
    const cobros = [];
    const cobrosPorSecretaria = faker.helpers.arrayElement([300, 350, 400]);

    for (let j = 0; j < secretarias.length; j++) {
      const secretaria = secretarias[j];

      for (let k = 0; k < cobrosPorSecretaria && (j * cobrosPorSecretaria + k) < alumnosApoderados.length; k++) {
        const indiceApoderado = j * cobrosPorSecretaria + k;
        const apoderado = alumnosApoderados[indiceApoderado];
        const matricula = matriculas[indiceApoderado];

        if (apoderado && matricula) {
          cobros.push({
            dni_apoderado: apoderado.dni_apoderado,
            dni_alumno: apoderado.dni_alumno,
            id_trabajador: secretaria.id,
            fecha_matricula: matricula.fecha_matricula,
            fecha_pago: faker.date.future({ 
              years: 1, 
              refDate: matricula.fecha_matricula 
            }),
            monto: faker.number.int({ min: 500, max: 2000 })
          });
        }
      }
    }

    // Creación de evaluaciones y notas
    const evaluaciones = [];
    const notas = [];

    // Tipos de evaluaciones comunes
    const tiposEvaluacion = [
      "EXAMEN PARCIAL",
      "EXAMEN FINAL", 
      "PRÁCTICA CALIFICADA",
      "TRABAJO GRUPAL",
      "EXPOSICIÓN",
      "LABORATORIO",
      "PROYECTO",
      "TAREA DOMICILIARIA"
    ];

    // Generar evaluaciones para cada asignatura
    for (const asignatura of asignaturas) {
      // Cada asignatura tendrá entre 3 y 6 tipos de evaluación diferentes
      const numEvaluaciones = faker.number.int({ min: 3, max: 6 });
      const tiposSeleccionados = faker.helpers.arrayElements(tiposEvaluacion, numEvaluaciones);

      for (const tipo of tiposSeleccionados) {
        evaluaciones.push({
          codigo_asignatura: asignatura.codigo,
          tipo: tipo,
          fecha_inicio: faker.date.between({
            from: asignatura.fecha_inicio || new Date('2025-03-01'),
            to: asignatura.fecha_cierre || new Date('2025-12-15')
          })
        });
      }
    }

    // Generar notas para cada alumno en cada evaluación de las asignaturas que cursa
    for (const asignaturaDictada of asignaturasDictadas) {
      // Obtener todas las evaluaciones de esta asignatura
      const evaluacionesAsignatura = evaluaciones.filter(
        evaluacion => evaluacion.codigo_asignatura === asignaturaDictada.codigo_asignatura
      );

      // Generar nota para cada evaluación
      for (const evaluacion of evaluacionesAsignatura) {
        // Generar nota del 0 al 20 (sistema peruano)
        const nota = faker.number.int({ min: 0, max: 20 });
        
        notas.push({
          valor: nota,
          tipo_evaluacion: evaluacion.tipo,
          codigo_asignatura: evaluacion.codigo_asignatura,
          dni_alumno: asignaturaDictada.dni_alumno
        });
      }
    }

		await prisma.asignatura.createMany({
			data: asignaturas,
			skipDuplicates: true,
		});

		await prisma.datosAlumno.createMany({
			data: alumnos,
			skipDuplicates: true,
		});

		await prisma.apoderado.createMany({
			data: apoderados,
			skipDuplicates: true,
		});

		await prisma.alumnoApoderado.createMany({
			data: alumnosApoderados,
			skipDuplicates: true,
		});

		await prisma.trabajadores.createMany({
			data: profesores.concat(secretarias, limpieza),
			skipDuplicates: true,
		});

		await prisma.profesor.createMany({
			data: profesores.map(p => ({ id: p.id })),
			skipDuplicates: true,
		});

		await prisma.secretaria.createMany({
			data: secretarias.map(s => ({ 
				id: s.id, 
				fecha_ingreso: faker.date.past({ years: 2 })
			})),
			skipDuplicates: true,
		});

		await prisma.mantenimiento.createMany({
			data: limpieza.map(l => ({ 
				id: l.id, 
				tipo_mantenimiento: faker.helpers.arrayElement([
					"LIMPIEZA GENERAL", 
					"LIMPIEZA PROFUNDA", 
					"MANTENIMIENTO PREVENTIVO"
				])
			})),
			skipDuplicates: true,
		});

		await prisma.aula.createMany({
			data: aulasData,
			skipDuplicates: true,
		});

		await prisma.asignaturaDictada.createMany({
			data: asignaturasDictadas,
			skipDuplicates: true,
		});

		await prisma.limpia.createMany({
			data: limpia,
			skipDuplicates: true,
		});

		await prisma.matricula.createMany({
			data: matriculas,
			skipDuplicates: true,
		});

		await prisma.cobra.createMany({
			data: cobros,
			skipDuplicates: true,
		});

		await prisma.evaluacion.createMany({
			data: evaluaciones,
			skipDuplicates: true,
		});

		await prisma.nota.createMany({
			data: notas,
			skipDuplicates: true,
		});

		console.log(`Insertados: ${i + BATCH_SIZE}`);
	}

	console.log("¡Datos generados!");
	await prisma.$disconnect();
}

seedUsuarios().catch((e) => {
	console.error(e);
	prisma.$disconnect();
});
