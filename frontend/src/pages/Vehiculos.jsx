import { useEffect, useState } from 'react'
import Campo from '../componentes/Campo.jsx'
import { listar, crear, actualizar, eliminar } from '../services/api.js'

const PATENTE = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/
const VACIO = { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' }

function validar(f) {
  const e = {}
  const marca = f.marca.trim()
  const modelo = f.modelo.trim()
  const patente = f.patente.trim().toUpperCase()
  const anioMax = new Date().getFullYear() + 1

  if (!marca) e.marca = 'La marca es obligatoria'
  else if (marca.length > 20) e.marca = 'Máximo 20 caracteres'

  if (!modelo) e.modelo = 'El modelo es obligatorio'
  else if (modelo.length > 20) e.modelo = 'Máximo 20 caracteres'

  if (!patente) e.patente = 'La patente es obligatoria'
  else if (!PATENTE.test(patente)) e.patente = 'Formato inválido (ej: ABC123 o AB123CD)'

  if (!f.anio) e.anio = 'El año es obligatorio'
  else if (!/^\d{4}$/.test(f.anio) || Number(f.anio) < 1900 || Number(f.anio) > anioMax)
    e.anio = `Ingresá un año de 4 dígitos entre 1900 y ${anioMax}`

  if (!f.capacidad_carga) e.capacidad_carga = 'La capacidad de carga es obligatoria'
  else if (
    !/^\d+(\.\d+)?$/.test(f.capacidad_carga) ||
    f.capacidad_carga.length > 6 ||
    Number(f.capacidad_carga) > 150000
  )
    e.capacidad_carga = 'Número entre 0 y 150000 (máximo 6 caracteres)'

  return e
}

function Vehiculos({ sesion }) {
  const [vehiculos, setVehiculos] = useState([])
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
    listar('/vehiculos')
      .then((datos) => activo && setVehiculos(datos))
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

  function editar(v) {
    setEditandoId(v.id)
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: String(v.anio),
      capacidad_carga: String(Number(v.capacidad_carga)),
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
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: form.patente.trim().toUpperCase(),
      anio: Number(form.anio),
      capacidad_carga: Number(form.capacidad_carga),
    }

    setEnviando(true)
    try {
      if (editandoId) {
        await actualizar(`/vehiculos/${editandoId}`, datos)
        setOk('Vehículo actualizado correctamente.')
      } else {
        await crear('/vehiculos', datos)
        setOk('Vehículo creado correctamente.')
      }
      cancelar()
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function borrar(v) {
    if (!window.confirm(`¿Eliminar el vehículo ${v.patente}?`)) return
    setError('')
    setOk('')
    try {
      await eliminar(`/vehiculos/${v.id}`)
      setOk('Vehículo eliminado.')
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(
        err.status === 500
          ? 'No se pudo eliminar. Es probable que el vehículo tenga viajes asociados.'
          : err.message,
      )
    }
  }

  return (
    <section>
      <h2>Vehículos</h2>

      {error && <p className="alerta alerta-error">{error}</p>}
      {ok && <p className="alerta alerta-ok">{ok}</p>}

      {sesion.esAdmin ? (
        <form className="formulario" onSubmit={enviar} noValidate>
          <h3>{editandoId ? 'Modificar vehículo' : 'Nuevo vehículo'}</h3>

          <div className="grilla">
            <Campo label="Marca" error={errores.marca}>
              <input name="marca" value={form.marca} onChange={cambiar} />
            </Campo>
            <Campo label="Modelo" error={errores.modelo}>
              <input name="modelo" value={form.modelo} onChange={cambiar} />
            </Campo>
            <Campo label="Patente" error={errores.patente}>
              <input name="patente" value={form.patente} onChange={cambiar} placeholder="ABC123" />
            </Campo>
            <Campo label="Año" error={errores.anio}>
              <input name="anio" value={form.anio} onChange={cambiar} inputMode="numeric" />
            </Campo>
            <Campo label="Capacidad de carga (kg)" error={errores.capacidad_carga}>
              <input
                name="capacidad_carga"
                value={form.capacidad_carga}
                onChange={cambiar}
                inputMode="decimal"
              />
            </Campo>
          </div>

          <div className="acciones">
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear vehículo'}
            </button>
            {editandoId && (
              <button className="btn btn-secundario" type="button" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="aviso">Solo los administradores pueden crear, modificar o eliminar vehículos.</p>
      )}

      <h3>Listado</h3>
      {cargando ? (
        <p>Cargando...</p>
      ) : vehiculos.length === 0 ? (
        <p className="aviso">No hay vehículos registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Patente</th>
                <th>Año</th>
                <th>Capacidad (kg)</th>
                {sesion.esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>{v.patente}</td>
                  <td>{v.anio}</td>
                  <td>{Number(v.capacidad_carga).toLocaleString('es-AR')}</td>
                  {sesion.esAdmin && (
                    <td className="acciones">
                      <button className="btn btn-secundario" onClick={() => editar(v)}>
                        Editar
                      </button>
                      <button className="btn btn-peligro" onClick={() => borrar(v)}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Vehiculos