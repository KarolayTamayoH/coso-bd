import type { Asignatura } from '@prisma/client'

export const asignaturas: Asignatura[] = [
  // Inicial
  { codigo: "INI-001", nombre: "Psicomotricidad", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-002", nombre: "Comunicación oral", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-003", nombre: "Arte y creatividad", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-004", nombre: "Juegos libres", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-005", nombre: "Música inicial", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-006", nombre: "Exploración del entorno", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-007", nombre: "Matemáticas básicas", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-008", nombre: "Formación personal y social", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-009", nombre: "Inglés básico", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "INI-010", nombre: "Cuentacuentos", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },

  // Primaria
  { codigo: "PRI-001", nombre: "Comunicación", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-002", nombre: "Matemática", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-003", nombre: "Ciencia y Tecnología", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-004", nombre: "Personal Social", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-005", nombre: "Educación Física", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-006", nombre: "Arte y Cultura", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-007", nombre: "Inglés", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-008", nombre: "Computación", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-009", nombre: "Taller de Lectura", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "PRI-010", nombre: "Valores", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },

  // Secundaria
  { codigo: "SEC-001", nombre: "Matemática", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-002", nombre: "Comunicación", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-003", nombre: "Ciencia, Tecnología y Ambiente", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-004", nombre: "Educación Cívica", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-005", nombre: "Educación para el Trabajo", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-006", nombre: "Historia, Geografía y Economía", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-007", nombre: "Arte", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-008", nombre: "Educación Física", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-009", nombre: "Religión", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
  { codigo: "SEC-010", nombre: "Filosofía", fecha_inicio: new Date("2025-03-01"), fecha_cierre: new Date("2025-12-15") },
];
