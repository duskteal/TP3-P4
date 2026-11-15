export function soloFecha(valor) {
  return valor ? String(valor).slice(0, 10) : ''
}

// Para convertir las fechas como "2026-06-15T03:00:00.000Z" a YYYY-MM-DD