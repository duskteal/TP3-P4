import { useState } from 'react'
import Campo from '../componentes/Campo.jsx'
import { login } from '../services/api.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function enviar(e) {
    e.preventDefault()
    setErrorApi('')

    const nuevos = {}
    if (!form.email.trim()) nuevos.email = 'El email es obligatorio'
    else if (!EMAIL.test(form.email.trim())) nuevos.email = 'Ingresá un email válido'
    if (!form.password) nuevos.password = 'La contraseña es obligatoria'

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    try {
      const datos = await login(form.email.trim(), form.password)
      onLogin({ token: datos.token, email: datos.email, esAdmin: datos.esAdmin })
    } catch (err) {
      setErrorApi(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="login">
      <h2>Iniciar sesión</h2>

      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo label="Email" error={errores.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={cambiar}
            autoComplete="username"
          />
        </Campo>

        <Campo label="Contraseña" error={errores.password}>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={cambiar}
            autoComplete="current-password"
          />
        </Campo>

        {errorApi && <p className="alerta alerta-error">{errorApi}</p>}

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </section>
  )
}

export default Login