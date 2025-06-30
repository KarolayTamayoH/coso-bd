import 'dotenv/config'
import { faker } from '@faker-js/faker'
import {
  type AlumnoApoderado,
  type Apoderado,
  type AsignaturaDictada,
  type Aula,
  type DatosAlumno,
  type Limpia,
  PrismaClient,
  type Trabajadores
} from '@prisma/client'

import { asignaturas } from './helpers/constants'

const prisma = new PrismaClient()
const BATCH_SIZE = 1_000
const TOTAL = (
  process.env.TOTAL_ALUMNOS ? parseInt(process.env.TOTAL_ALUMNOS) : 1000
) as 1000 | 10_000 | 100_000 | 1_000_000
const ALUMNOS_POR_AULA = 25

// Sets para garantizar unicidad de DNIs y correos globalmente
const dniUsados = new Set<number>()
const correosUsados = new Set<string>()

function generarDNIUnico(): number {
  let dni: number
  do {
    // Generar DNI de 8 cifras (10,000,000 - 99,999,999)
    dni = faker.number.int({ min: 10_000_000, max: 99_999_999 })
  } while (dniUsados.has(dni))

  dniUsados.add(dni)
  return dni
}

function generarCorreoUnico(firstName: string, lastName: string): string {
  let correo: string
  let attempts = 0

  do {
    // Si es el primer intento, usar nombres normales
    if (attempts === 0) {
      correo = faker.internet.email({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        provider: 'utec.edu.pe'
      })
    } else {
      // En intentos posteriores, agregar números para hacer único
      correo = faker.internet.email({
        firstName: `${firstName.toLowerCase()}${attempts}`,
        lastName: lastName.toLowerCase(),
        provider: 'utec.edu.pe'
      })
    }
    attempts++
  } while (correosUsados.has(correo) && attempts < 10)

  // Si después de 10 intentos no pudimos generar uno único, agregar timestamp
  if (correosUsados.has(correo)) {
    correo = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@utec.edu.pe`
  }

  correosUsados.add(correo)
  return correo
}

// Función para generar tripleta única de asignatura dictada
function generarTripletaAsignaturaUnica(
  dniAlumno: number,
  codigoAsignatura: string,
  idProfesor: number,
  tripletasDelBatch: Set<string>,
  totalProfesores: number
): { dni_alumno: number; codigo_asignatura: string; id_profesor: number } {
  let tripletaKey = `${dniAlumno}-${codigoAsignatura}-${idProfesor}`

  // Si la tripleta ya existe, buscar un profesor diferente
  while (tripletasDelBatch.has(tripletaKey)) {
    idProfesor = (idProfesor + 1) % totalProfesores // Rotar entre profesores
    tripletaKey = `${dniAlumno}-${codigoAsignatura}-${idProfesor}`
  }

  tripletasDelBatch.add(tripletaKey)
  return {
    dni_alumno: dniAlumno,
    codigo_asignatura: codigoAsignatura,
    id_profesor: idProfesor
  }
}

// Función para generar clave única de cobro
function generarClaveCobroUnica(
  dniApoderado: number,
  dniAlumno: number,
  idTrabajador: number,
  fechaMatricula: Date,
  fechaPago: Date,
  paresDelBatch: Set<string>
): {
  dni_apoderado: number
  dni_alumno: number
  id_trabajador: number
  fecha_matricula: Date
  fecha_pago: Date
} {
  let claveKey = `${dniApoderado}-${dniAlumno}-${idTrabajador}-${fechaMatricula.toISOString().split('T')[0]}-${fechaPago.toISOString().split('T')[0]}`

  // Si la clave ya existe, ajustar la fecha de pago
  while (paresDelBatch.has(claveKey)) {
    fechaPago = new Date(fechaPago.getTime() + 24 * 60 * 60 * 1000) // Agregar un día
    claveKey = `${dniApoderado}-${dniAlumno}-${idTrabajador}-${fechaMatricula.toISOString().split('T')[0]}-${fechaPago.toISOString().split('T')[0]}`
  }

  paresDelBatch.add(claveKey)
  return {
    dni_apoderado: dniApoderado,
    dni_alumno: dniAlumno,
    id_trabajador: idTrabajador,
    fecha_matricula: fechaMatricula,
    fecha_pago: fechaPago
  }
}

// Función para generar tripleta única de limpieza
function generarTripletaLimpiezaUnica(
  idAula: number,
  idTrabajador: number,
  fecha: Date,
  tripletasDelBatch: Set<string>
): {
  id_aula: number
  id_trabajador: number
  fecha: Date
} {
  let tripletaKey = `${idAula}-${idTrabajador}-${fecha.toISOString().split('T')[0]}`

  // Si la tripleta ya existe, ajustar la fecha
  while (tripletasDelBatch.has(tripletaKey)) {
    fecha = new Date(fecha.getTime() + 24 * 60 * 60 * 1000) // Agregar un día
    tripletaKey = `${idAula}-${idTrabajador}-${fecha.toISOString().split('T')[0]}`
  }

  tripletasDelBatch.add(tripletaKey)
  return { id_aula: idAula, id_trabajador: idTrabajador, fecha: fecha }
}

// Función para generar tripleta única de nota
function generarTripletaNotaUnica(
  tipoEvaluacion: string,
  codigoAsignatura: string,
  dniAlumno: number,
  tripletasDelBatch: Set<string>
): {
  tipo_evaluacion: string
  codigo_asignatura: string
  dni_alumno: number
} | null {
  const tripletaKey = `${tipoEvaluacion}-${codigoAsignatura}-${dniAlumno}`

  // Esta combinación debería ser única por diseño, pero verificamos por seguridad
  if (tripletasDelBatch.has(tripletaKey)) {
    console.warn(`⚠️ Tripleta de nota duplicada detectada: ${tripletaKey}`)
    return null // No crear nota duplicada
  }

  tripletasDelBatch.add(tripletaKey)
  return {
    tipo_evaluacion: tipoEvaluacion,
    codigo_asignatura: codigoAsignatura,
    dni_alumno: dniAlumno
  }
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
  const horaInicio = faker.number.int({ min: 7, max: 16 }) // última clase puede iniciar a las 4pm
  const duracion = faker.helpers.arrayElement([1, 1.5, 2]) // clases de 1, 1.5 o 2 horas
  const horaFin = horaInicio + duracion

  const formato12h = (horaDecimal: number) => {
    const horas = Math.floor(horaDecimal)
    const minutos = horaDecimal % 1 === 0 ? '00' : '30'
    const ampm = horas >= 12 ? 'pm' : 'am'
    const horas12 = ((horas + 11) % 12) + 1
    return `${horas12}:${minutos}${ampm}`
  }

  return {
    hora_inicio: formato12h(horaInicio),
    hora_fin: formato12h(horaFin)
  }
}

function generarHorarioTarde() {
  // Bloques posibles: desde 6:30pm (18.5) hasta 10:00pm (22.0)
  const bloques = [18.5, 19.0, 19.5, 20.0, 20.5, 21.0, 21.5, 22.0]
  const horaDecimal = faker.helpers.arrayElement(bloques)

  const formato12h = (hora: number) => {
    const h = Math.floor(hora)
    const m = hora % 1 === 0 ? '00' : '30'
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = ((h + 11) % 12) + 1
    return `${h12}:${m}${ampm}`
  }

  return formato12h(horaDecimal)
}

async function seedUsuarios() {
  // Crear trabajadores y aulas solo una vez al inicio
  const profesores: Trabajadores[] = []
  const secretarias: Trabajadores[] = []
  const limpieza: Trabajadores[] = []
  const aulasData: Aula[] = []

  console.log('🏗️ Creando trabajadores y aulas (solo una vez)...')

  // Creación de los profesores, secretarias y personal de limpieza
  for (let j = 0; j < trabajadores[TOTAL].profesores; j++) {
    const firstNameProfesor = faker.person.firstName()
    const lastNameProfesor = faker.person.lastName()
    const emailProfesor = faker.internet.email({
      firstName: firstNameProfesor.toLocaleLowerCase(),
      lastName: lastNameProfesor.toLocaleLowerCase(),
      provider: 'utec.edu.pe'
    })

    profesores.push({
      id: j,
      dni: generarDNIUnico(),
      nombre: `${firstNameProfesor} ${lastNameProfesor}`,
      celular: Number(
        faker.string.numeric({ length: 9, allowLeadingZeros: true })
      ),
      correo: emailProfesor,
      direccion: faker.location.streetAddress(),
      sueldo: faker.number.int({ min: 2000, max: 3500 })
    })

    if (j < trabajadores[TOTAL].secretarias) {
      const firstNameSecretaria = faker.person.firstName()
      const lastNameSecretaria = faker.person.lastName()
      const emailSecretaria = faker.internet.email({
        firstName: firstNameSecretaria.toLocaleLowerCase(),
        lastName: lastNameSecretaria.toLocaleLowerCase(),
        provider: 'utec.edu.pe'
      })

      secretarias.push({
        id: j + trabajadores[TOTAL].profesores,
        dni: generarDNIUnico(),
        nombre: `${firstNameSecretaria} ${lastNameSecretaria}`,
        celular: Number(
          faker.string.numeric({ length: 9, allowLeadingZeros: true })
        ),
        correo: emailSecretaria,
        direccion: faker.location.streetAddress(),
        sueldo: faker.number.int({ min: 1500, max: 2500 })
      })
    }

    if (j < trabajadores[TOTAL].limpieza) {
      const firstNameLimpieza = faker.person.firstName()
      const lastNameLimpieza = faker.person.lastName()
      const emailLimpieza = faker.internet.email({
        firstName: firstNameLimpieza.toLocaleLowerCase(),
        lastName: lastNameLimpieza.toLocaleLowerCase(),
        provider: 'utec.edu.pe'
      })

      limpieza.push({
        id:
          j + trabajadores[TOTAL].profesores + trabajadores[TOTAL].secretarias,
        dni: generarDNIUnico(),
        nombre: `${firstNameLimpieza} ${lastNameLimpieza}`,
        celular: Number(
          faker.string.numeric({ length: 9, allowLeadingZeros: true })
        ),
        correo: emailLimpieza,
        direccion: faker.location.streetAddress(),
        sueldo: faker.number.int({ min: 1000, max: 1500 })
      })
    }
  }

  // Creación de aulas
  for (let j = 0; j < aulas[TOTAL]; j++) {
    aulasData.push({
      id: j + 1,
      tipo: faker.helpers.arrayElement(['LABORATORIO', 'TEORÍA', 'PRÁCTICA'])
    })
  }

  // Insertar trabajadores, aulas y asignaturas (solo una vez)
  console.log('💾 Insertando datos base...')
  await prisma.$transaction(async tx => {
    await tx.asignatura.createMany({
      data: asignaturas,
      skipDuplicates: true
    })

    await tx.trabajadores.createMany({
      data: profesores.concat(secretarias, limpieza),
      skipDuplicates: true
    })

    await tx.profesor.createMany({
      data: profesores.map(p => ({ id: p.id })),
      skipDuplicates: true
    })

    await tx.secretaria.createMany({
      data: secretarias.map(s => ({
        id: s.id,
        fecha_ingreso: faker.date.past({ years: 2 })
      })),
      skipDuplicates: true
    })

    await tx.mantenimiento.createMany({
      data: limpieza.map(l => ({
        id: l.id,
        tipo_mantenimiento: faker.helpers.arrayElement([
          'LIMPIEZA GENERAL',
          'LIMPIEZA PROFUNDA',
          'MANTENIMIENTO PREVENTIVO'
        ])
      })),
      skipDuplicates: true
    })

    await tx.aula.createMany({
      data: aulasData,
      skipDuplicates: true
    })
  })

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    console.log(
      `\n🚀 Iniciando batch ${i / BATCH_SIZE + 1}/${Math.ceil(TOTAL / BATCH_SIZE)}`
    )
    console.log(
      `📊 Procesando registros ${i + 1} a ${Math.min(i + BATCH_SIZE, TOTAL)}`
    )

    // Crear Sets locales para este batch (solo para otras entidades)
    const tripletasAsignaturaDictadaBatch = new Set<string>()
    const paresCobroBatch = new Set<string>()
    const tripletasLimpiaBatch = new Set<string>()
    const tripletasNotaBatch = new Set<string>()

    try {
      await prisma.$transaction(
        async tx => {
          const alumnos: DatosAlumno[] = []
          const apoderados: Apoderado[] = []
          const alumnosApoderados: AlumnoApoderado[] = []

          console.log('📝 Generando datos...')

          for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {
            // Creación de un alumno
            const firstNameAlumno = faker.person.firstName()
            const lastNameAlumno = faker.person.lastName()
            const emailAlumno = generarCorreoUnico(
              firstNameAlumno,
              lastNameAlumno
            )

            const dniAlumno = generarDNIUnico()

            // Creación de un apoderado (1:1 con alumno)
            const firstNameApoderado = faker.person.firstName()
            const lastNameApoderado = faker.person.lastName()
            const dniApoderado = generarDNIUnico()
            const generoApoderado = faker.person.sexType().toUpperCase()[0]

            // Crear alumno
            alumnos.push({
              dni_alumno: dniAlumno,
              nombre: `${firstNameAlumno} ${lastNameAlumno}`,
              genero: faker.person.sexType().toUpperCase()[0],
              correo_institucional: emailAlumno,
              fecha_nacimiento: faker.date.birthdate({
                min: 4,
                max: 17,
                mode: 'age'
              })
            })

            // Crear apoderado
            apoderados.push({
              dni_apoderado: dniApoderado,
              nombre: `${firstNameApoderado} ${lastNameApoderado}`,
              genero: generoApoderado,
              direccion: faker.location.streetAddress(),
              telefono: Number(
                faker.string.numeric({ length: 9, allowLeadingZeros: true })
              )
            })

            // Crear relación alumno-apoderado (1:1 por índice)
            alumnosApoderados.push({
              dni_alumno: dniAlumno,
              dni_apoderado: dniApoderado,
              tipo_relacion: generoApoderado === 'F' ? 'MADRE' : 'PADRE'
            })
          }

          // Creación de asignaturas y asignación de profesores
          const asignaturasDictadas: AsignaturaDictada[] = []

          for (let j = 0; j < alumnos.length; j += ALUMNOS_POR_AULA) {
            const asignatura = asignaturas[j % asignaturas.length]
            const profesorIndex = j % profesores.length
            const horario = generarHorarioClase()

            for (
              let k = 0;
              k < ALUMNOS_POR_AULA && j + k < alumnos.length;
              k++
            ) {
              const tripletaUnica = generarTripletaAsignaturaUnica(
                alumnos[j + k].dni_alumno,
                asignatura.codigo,
                profesores[profesorIndex].id,
                tripletasAsignaturaDictadaBatch,
                profesores.length
              )

              asignaturasDictadas.push({
                dni_alumno: tripletaUnica.dni_alumno,
                codigo_asignatura: tripletaUnica.codigo_asignatura,
                id_profesor: tripletaUnica.id_profesor,
                horario_inicio: horario.hora_inicio,
                horario_fin: horario.hora_fin
              })
            }
          }

          // Asignación de personal de limpieza a aulas
          const limpia: Limpia[] = limpieza.map((trabajador, index) => {
            const idAula = (index % aulasData.length) + 1 // Asignar a un aula de forma cíclica
            const fecha = faker.date.future({ years: 1, refDate: new Date() })

            const tripletaUnica = generarTripletaLimpiezaUnica(
              idAula,
              trabajador.id,
              fecha,
              tripletasLimpiaBatch
            )

            return {
              id_aula: tripletaUnica.id_aula,
              id_trabajador: tripletaUnica.id_trabajador,
              fecha: tripletaUnica.fecha,
              hora: generarHorarioTarde(),
              frecuencia: faker.helpers.arrayElement([
                'DIARIA',
                'SEMANAL',
                'MENSUAL'
              ])
            }
          })

          // Generación de matrículas
          const matriculas = []

          for (let j = 0; j < alumnos.length; j++) {
            const grado = faker.number.int({ min: 1, max: 13 })
            const seccion = faker.helpers.arrayElement(['A', 'B', 'C'])
            const aulaId = (j % aulasData.length) + 1 // Asignar aula de forma cíclica

            matriculas.push({
              dni_alumno: alumnos[j].dni_alumno,
              fecha_matricula: faker.date.past({ years: 1 }),
              id_aula: aulaId,
              grado: `${grado}°`,
              seccion: seccion,
              estado_matricula: faker.helpers.arrayElement([
                'activo',
                'retirado',
                'culminado'
              ])
            })
          }

          // Generación de cobros - cada secretaria maneja entre 300-400 cobros
          const cobros = []
          const cobrosPorSecretaria = faker.helpers.arrayElement([
            300, 350, 400
          ])

          for (let j = 0; j < secretarias.length; j++) {
            const secretaria = secretarias[j]

            for (
              let k = 0;
              k < cobrosPorSecretaria &&
              j * cobrosPorSecretaria + k < alumnosApoderados.length;
              k++
            ) {
              const indiceApoderado = j * cobrosPorSecretaria + k
              const apoderado = alumnosApoderados[indiceApoderado]
              const matricula = matriculas[indiceApoderado]

              if (apoderado && matricula) {
                const fechaPago = faker.date.future({
                  years: 1,
                  refDate: matricula.fecha_matricula
                })

                const cobroUnico = generarClaveCobroUnica(
                  apoderado.dni_apoderado,
                  apoderado.dni_alumno,
                  secretaria.id,
                  matricula.fecha_matricula,
                  fechaPago,
                  paresCobroBatch
                )

                cobros.push({
                  dni_apoderado: cobroUnico.dni_apoderado,
                  dni_alumno: cobroUnico.dni_alumno,
                  id_trabajador: cobroUnico.id_trabajador,
                  fecha_matricula: cobroUnico.fecha_matricula,
                  fecha_pago: cobroUnico.fecha_pago,
                  monto: faker.number.int({ min: 500, max: 2000 })
                })
              }
            }
          }

          // Creación de evaluaciones y notas
          const evaluaciones = []
          const notas = []

          // Tipos de evaluaciones comunes
          const tiposEvaluacion = [
            'EXAMEN PARCIAL',
            'EXAMEN FINAL',
            'PRÁCTICA CALIFICADA',
            'TRABAJO GRUPAL',
            'EXPOSICIÓN',
            'LABORATORIO',
            'PROYECTO',
            'TAREA DOMICILIARIA'
          ]

          // Generar evaluaciones para cada asignatura
          for (const asignatura of asignaturas) {
            // Cada asignatura tendrá entre 3 y 6 tipos de evaluación diferentes
            const numEvaluaciones = faker.number.int({ min: 3, max: 6 })
            const tiposSeleccionados = faker.helpers.arrayElements(
              tiposEvaluacion,
              numEvaluaciones
            )

            for (const tipo of tiposSeleccionados) {
              evaluaciones.push({
                codigo_asignatura: asignatura.codigo,
                tipo: tipo,
                fecha_inicio: faker.date.between({
                  from: asignatura.fecha_inicio || new Date('2025-03-01'),
                  to: asignatura.fecha_cierre || new Date('2025-12-15')
                })
              })
            }
          }

          // Generar notas para cada alumno en cada evaluación de las asignaturas que cursa
          for (const asignaturaDictada of asignaturasDictadas) {
            // Obtener todas las evaluaciones de esta asignatura
            const evaluacionesAsignatura = evaluaciones.filter(
              evaluacion =>
                evaluacion.codigo_asignatura ===
                asignaturaDictada.codigo_asignatura
            )

            // Generar nota para cada evaluación
            for (const evaluacion of evaluacionesAsignatura) {
              // Generar nota del 0 al 20 (sistema peruano)
              const nota = faker.number.int({ min: 0, max: 20 })

              const notaUnica = generarTripletaNotaUnica(
                evaluacion.tipo,
                evaluacion.codigo_asignatura,
                asignaturaDictada.dni_alumno,
                tripletasNotaBatch
              )

              if (notaUnica) {
                notas.push({
                  valor: nota,
                  tipo_evaluacion: notaUnica.tipo_evaluacion,
                  codigo_asignatura: notaUnica.codigo_asignatura,
                  dni_alumno: notaUnica.dni_alumno
                })
              }
            }
          }

          console.log('👨‍🎓 Insertando alumnos...')
          await tx.datosAlumno.createMany({
            data: alumnos,
            skipDuplicates: true
          })

          console.log('👨‍👩‍👧‍👦 Insertando apoderados...')
          await tx.apoderado.createMany({
            data: apoderados,
            skipDuplicates: true
          })

          console.log('🔗 Insertando relaciones alumno-apoderado...')
          await tx.alumnoApoderado.createMany({
            data: alumnosApoderados,
            skipDuplicates: true
          })

          console.log('📚 Insertando asignaturas dictadas...')
          await tx.asignaturaDictada.createMany({
            data: asignaturasDictadas,
            skipDuplicates: true
          })

          console.log('🧽 Insertando asignaciones de limpieza...')
          await tx.limpia.createMany({
            data: limpia,
            skipDuplicates: true
          })

          console.log('📋 Insertando matrículas...')
          await tx.matricula.createMany({
            data: matriculas,
            skipDuplicates: true
          })

          console.log('💰 Insertando cobros...')
          await tx.cobra.createMany({
            data: cobros,
            skipDuplicates: true
          })

          console.log('📝 Insertando evaluaciones...')
          await tx.evaluacion.createMany({
            data: evaluaciones,
            skipDuplicates: true
          })

          console.log('📊 Insertando notas...')
          await tx.nota.createMany({
            data: notas,
            skipDuplicates: true
          })
        },
        {
          timeout: 60000 // 60 segundos
        }
      )

      console.log(`✅ Batch ${i / BATCH_SIZE + 1} completado exitosamente`)
      console.log(
        `📈 Progreso: ${Math.min(i + BATCH_SIZE, TOTAL)}/${TOTAL} registros procesados`
      )
    } catch (error) {
      console.error(`❌ Error en batch ${i / BATCH_SIZE + 1}:`)
      console.error(`🔍 Detalles del error:`, error)

      if (error instanceof Error) {
        console.error(`📋 Mensaje: ${error.message}`)
        console.error(`🔗 Stack trace:`, error.stack)
      }

      // Log específico para errores de Prisma
      if (error && typeof error === 'object' && 'code' in error) {
        console.error(
          `🏷️ Código de error Prisma: ${(error as { code: unknown }).code}`
        )
        if ('meta' in error) {
          console.error(`📊 Metadata:`, (error as { meta: unknown }).meta)
        }
      }

      console.error(
        `⚠️ Rollback automático ejecutado para batch ${i / BATCH_SIZE + 1}`
      )
      throw error // Re-throw para detener el proceso
    }
  }

  console.log('🎉 ¡Todos los datos generados exitosamente!')
  console.log(`📊 Total de registros procesados: ${TOTAL}`)
  await prisma.$disconnect()
}

seedUsuarios()
  .catch(error => {
    console.error('💥 Error fatal en el proceso de seeding:')
    console.error('🔍 Detalles:', error)

    if (error instanceof Error) {
      console.error(`📋 Mensaje: ${error.message}`)
      console.error(`🔗 Stack trace:`, error.stack)
    }

    console.error('🛑 Proceso terminado con errores')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
