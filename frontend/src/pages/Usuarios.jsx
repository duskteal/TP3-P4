import { useEffect, useState } from 'react'
import Campo from '../componentes/Campo.jsx'
import { listar, crear, eliminar } from '../services/api.js'

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VACIO = { nombre: '', email: '', password: '', esAdmin: false }

function validar(f) {
  const e = {}
  const nombre = f.nombre.trim()

  if (!nombre) e.nombre = 'El nombre es obligatorio'
  else if (!SOLO_LETRAS.test(nombre)) e.nombre = 'Solo se permiten letras (sin espacios)'
  else if (nombre.length > 25) e.nombre = 'Máximo 25 caracteres'

  if (!f.email.trim()) e.email = 'El email es obligatorio'
  else if (!EMAIL.test(f.email.trim())) e.email = 'Ingresá un email válido'

  if (!f.password) e.password = 'La contraseña es obligatoria'
  else if (f.password.length < 8 || !/\d/.test(f.password))
    e.password = 'Mínimo 8 caracteres y al menos un número'

  return e
}

function Usuarios({ sesion }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [recarga, setRecarga] = useState(0)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!sesion.esAdmin) return
    let activo = true
    listar('/usuarios')
      .then((datos) => activo && setUsuarios(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [recarga, sesion.esAdmin])

  if (!sesion.esAdmin) {
    return <p className="aviso">Esta sección es solo para administradores.</p>
  }

  function cambiar(e) {
    const { name, type, value, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setOk('')

    const nuevos = validar(form)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    try {
      await crear('/usuarios', {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        esAdmin: form.esAdmin,
      })
      setOk('Usuario registrado correctamente.')
      setForm(VACIO)
      setErrores({})
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function borrar(u) {
    if (!window.confirm(`¿Eliminar al usuario ${u.nombre} (${u.email})?`)) return
    setError('')
    setOk('')
    try {
      await eliminar(`/usuarios/${u.id}`)
      setOk('Usuario eliminado.')
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <h2>Usuarios</h2>

      {error && <p className="alerta alerta-error">{error}</p>}
      {ok && <p className="alerta alerta-ok">{ok}</p>}

      <form className="formulario" onSubmit={enviar} noValidate>
        <h3>Registrar usuario</h3>

        <div className="grilla">
          <Campo label="Nombre" error={errores.nombre}>
            <input name="nombre" value={form.nombre} onChange={cambiar} />
          </Campo>
          <Campo label="Email" error={errores.email}>
            <input type="email" name="email" value={form.email} onChange={cambiar} />
          </Campo>
          <Campo label="Contraseña" error={errores.password}>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={cambiar}
              autoComplete="new-password"
            />
          </Campo>
        </div>

        <label className="casilla">
          <input type="checkbox" name="esAdmin" checked={form.esAdmin} onChange={cambiar} />
          Es administrador
        </label>

        <div className="acciones">
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Registrar usuario'}
          </button>
        </div>
      </form>

      <h3>Listado</h3>
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.esAdmin ? 'Administrador' : 'Usuario'}</td>
                  <td className="acciones">
                    {u.email === sesion.email ? (
                      <span className="aviso">(sesión actual)</span>
                    ) : (
                      <button className="btn btn-peligro" onClick={() => borrar(u)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Usuarios
