import { useEffect, useState } from 'react'
import Campo from '../componentes/Campo.jsx'
import { listar, crear, actualizar, eliminar } from '../services/api.js'
import { soloFecha } from '../utiles/fechas.js'

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/
const OCHO_DIGITOS = /^\d{8}$/
const VACIO = {
  nombre: '',
  apellido: '',
  numero_documento: '',
  numero_licencia: '',
  fecha_alta_licencia: '',
  fecha_vencimiento_licencia: '',
}

function validar(f) {
  const e = {}
  const nombre = f.nombre.trim()
  const apellido = f.apellido.trim()

  if (!nombre) e.nombre = 'El nombre es obligatorio'
  else if (!SOLO_LETRAS.test(nombre)) e.nombre = 'Solo se permiten letras (sin espacios)'
  else if (nombre.length > 20) e.nombre = 'Máximo 20 caracteres'

  if (!apellido) e.apellido = 'El apellido es obligatorio'
  else if (!SOLO_LETRAS.test(apellido)) e.apellido = 'Solo se permiten letras (sin espacios)'
  else if (apellido.length > 20) e.apellido = 'Máximo 20 caracteres'

  if (!f.numero_documento) e.numero_documento = 'El documento es obligatorio'
  else if (!OCHO_DIGITOS.test(f.numero_documento)) e.numero_documento = 'Deben ser 8 dígitos'

  if (!f.numero_licencia) e.numero_licencia = 'La licencia es obligatoria'
  else if (!OCHO_DIGITOS.test(f.numero_licencia)) e.numero_licencia = 'Deben ser 8 dígitos'

  if (!f.fecha_alta_licencia) e.fecha_alta_licencia = 'La fecha de alta es obligatoria'

  if (!f.fecha_vencimiento_licencia)
    e.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria'
  else if (f.fecha_alta_licencia && f.fecha_vencimiento_licencia <= f.fecha_alta_licencia)
    e.fecha_vencimiento_licencia = 'Debe ser posterior a la fecha de alta'

  return e
}

function Conductores({ sesion }) {
  const [conductores, setConductores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [recarga, setRecarga] = useState(0)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let activo = true
    listar('/conductores')
      .then((datos) => activo && setConductores(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [recarga])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(VACIO)
    setErrores({})
  }

  function editar(c) {
    setEditandoId(c.id)
    setForm({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: String(c.numero_documento),
      numero_licencia: String(c.numero_licencia),
      fecha_alta_licencia: soloFecha(c.fecha_alta_licencia),
      fecha_vencimiento_licencia: soloFecha(c.fecha_vencimiento_licencia),
    })
    setErrores({})
    setError('')
    setOk('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setOk('')

    const nuevos = validar(form)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const datos = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      numero_documento: form.numero_documento,
      numero_licencia: form.numero_licencia,
      fecha_alta_licencia: form.fecha_alta_licencia,
      fecha_vencimiento_licencia: form.fecha_vencimiento_licencia,
    }

    setEnviando(true)
    try {
      if (editandoId) {
        await actualizar(`/conductores/${editandoId}`, datos)
        setOk('Conductor actualizado correctamente.')
      } else {
        await crear('/conductores', datos)
        setOk('Conductor creado correctamente.')
      }
      cancelar()
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function borrar(c) {
    if (!window.confirm(`¿Eliminar al conductor ${c.apellido}, ${c.nombre}?`)) return
    setError('')
    setOk('')
    try {
      await eliminar(`/conductores/${c.id}`)
      setOk('Conductor eliminado.')
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(
        err.status === 409 || err.status === 500
          ? 'No se pudo eliminar. Es probable que el conductor tenga viajes asociados.'
          : err.message,
      )
    }
  }

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <section>
      <h2>Conductores</h2>

      {error && <p className="alerta alerta-error">{error}</p>}
      {ok && <p className="alerta alerta-ok">{ok}</p>}

      {sesion.esAdmin ? (
        <form className="formulario" onSubmit={enviar} noValidate>
          <h3>{editandoId ? 'Modificar conductor' : 'Nuevo conductor'}</h3>

          <div className="grilla">
            <Campo label="Nombre" error={errores.nombre}>
              <input name="nombre" value={form.nombre} onChange={cambiar} />
            </Campo>
            <Campo label="Apellido" error={errores.apellido}>
              <input name="apellido" value={form.apellido} onChange={cambiar} />
            </Campo>
            <Campo label="Número de documento" error={errores.numero_documento}>
              <input
                name="numero_documento"
                value={form.numero_documento}
                onChange={cambiar}
                inputMode="numeric"
              />
            </Campo>
            <Campo label="Número de licencia" error={errores.numero_licencia}>
              <input
                name="numero_licencia"
                value={form.numero_licencia}
                onChange={cambiar}
                inputMode="numeric"
              />
            </Campo>
            <Campo label="Alta de licencia" error={errores.fecha_alta_licencia}>
              <input
                type="date"
                name="fecha_alta_licencia"
                value={form.fecha_alta_licencia}
                onChange={cambiar}
              />
            </Campo>
            <Campo label="Vencimiento de licencia" error={errores.fecha_vencimiento_licencia}>
              <input
                type="date"
                name="fecha_vencimiento_licencia"
                value={form.fecha_vencimiento_licencia}
                onChange={cambiar}
              />
            </Campo>
          </div>

          <div className="acciones">
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear conductor'}
            </button>
            {editandoId && (
              <button className="btn btn-secundario" type="button" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="aviso">Solo los administradores pueden crear, modificar o eliminar conductores.</p>
      )}

      <h3>Listado</h3>
      {cargando ? (
        <p>Cargando...</p>
      ) : conductores.length === 0 ? (
        <p className="aviso">No hay conductores registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Apellido y nombre</th>
                <th>Documento</th>
                <th>Licencia</th>
                <th>Alta</th>
                <th>Vencimiento</th>
                {sesion.esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {conductores.map((c) => {
                const vencimiento = soloFecha(c.fecha_vencimiento_licencia)
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      {c.apellido}, {c.nombre}
                    </td>
                    <td>{c.numero_documento}</td>
                    <td>{c.numero_licencia}</td>
                    <td>{soloFecha(c.fecha_alta_licencia)}</td>
                    <td className={vencimiento < hoy ? 'vencida' : ''}>
                      {vencimiento}
                      {vencimiento < hoy && ' (vencida)'}
                    </td>
                    {sesion.esAdmin && (
                      <td className="acciones">
                        <button className="btn btn-secundario" onClick={() => editar(c)}>
                          Editar
                        </button>
                        <button className="btn btn-peligro" onClick={() => borrar(c)}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Conductores