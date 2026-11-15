const API_URL = 'http://localhost:3000'
const CLAVE_SESION = 'sesion'

export function getSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION)
}


export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function mensajeDeError(status, datos) {
  if (datos && Array.isArray(datos.errores)) {
    return datos.errores.map((e) => `${e.path}: ${e.msg}`).join(' | ')
  }
  if (datos && typeof datos.msg === 'string') return datos.msg
  if (status === 403) return 'No tenés permisos para realizar esta acción.'
  if (status >= 500) return 'Error interno del servidor.'
  if (typeof datos === 'string' && datos && !datos.startsWith('<')) return datos
  return `Error ${status}`
}

// Request generico
async function request(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const sesion = getSesion()
  if (auth && sesion) headers.Authorization = `Bearer ${sesion.token}`

  let res
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  // Token vencido (dura 4 horas) o inválido: se cierra la sesión
  if (res.status === 401 && auth) {
    borrarSesion()
    window.dispatchEvent(new Event('sesion-expirada'))
    throw new ApiError(401, 'La sesión expiró. Iniciá sesión nuevamente.')
  }

  if (res.status === 204) return null

  const texto = await res.text()
  let data = texto
  try {
    data = JSON.parse(texto)
  } catch {
    // texto plano
  }

  if (!res.ok) throw new ApiError(res.status, mensajeDeError(res.status, data))
  return data
}

export const login = (email, password) =>
  request('/login', { method: 'POST', body: { email, password }, auth: false })

// El backend responde 404 cuando no hay registros: para el listado eso es una lista vacía
export async function listar(ruta) {
  try {
    return await request(ruta)
  } catch (e) {
    if (e.status === 404) return []
    throw e
  }
}

export const crear = (ruta, body) => request(ruta, { method: 'POST', body })
export const actualizar = (ruta, body) => request(ruta, { method: 'PUT', body })
export const eliminar = (ruta) => request(ruta, { method: 'DELETE' })