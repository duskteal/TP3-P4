import { useEffect, useState } from 'react'
import Campo from '../componentes/Campo.jsx'
import { listar, crear, actualizar, eliminar } from '../services/api.js'
import { soloFecha } from '../utiles/fechas.js'

const VACIO = {
  vehiculo_id: '',
  conductor_id: '',
  fecha_salida: '',
  fecha_llegada: '',
  origen: '',
  destino: '',
  kilometros: '',
  observaciones: '',
}

function validar(f) {
  const e = {}
  const origen = f.origen.trim()
  const destino = f.destino.trim()

  if (!f.vehiculo_id) e.vehiculo_id = 'Seleccioná un vehículo'
  if (!f.conductor_id) e.conductor_id = 'Seleccioná un conductor'

  if (!f.fecha_salida) e.fecha_salida = 'La fecha de salida es obligatoria'

  if (!f.fecha_llegada) e.fecha_llegada = 'La fecha de llegada es obligatoria'
  else if (f.fecha_salida && f.fecha_llegada <= f.fecha_salida)
    e.fecha_llegada = 'Debe ser posterior a la fecha de salida'

  if (!origen) e.origen = 'El origen es obligatorio'
  else if (origen.length > 100) e.origen = 'Máximo 100 caracteres'

  if (!destino) e.destino = 'El destino es obligatorio'
  else if (destino.length > 100) e.destino = 'Máximo 100 caracteres'

  if (!f.kilometros) e.kilometros = 'Los kilómetros son obligatorios'
  else if (!/^\d+(\.\d)?$/.test(f.kilometros) || Number(f.kilometros) > 30000)
    e.kilometros = 'Número entre 0 y 30000, con un decimal como máximo (ej: 1425.5)'

  if (f.observaciones.trim().length > 300) e.observaciones = 'Máximo 300 caracteres'

  return e
}

function Viajes({ sesion }) {
  const [vehiculos, setVehiculos] = useState([])
  const [conductores, setConductores] = useState([])
  const [viajes, setViajes] = useState([])
  const [filtros, setFiltros] = useState({ vehiculoId: '', conductorId: '' })
  const [cargando, setCargando] = useState(true)
  const [recarga, setRecarga] = useState(0)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)


  useEffect(() => {
    Promise.all([listar('/vehiculos'), listar('/conductores')])
      .then(([v, c]) => {
        setVehiculos(v)
        setConductores(c)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filtros.vehiculoId) params.set('vehiculoId', filtros.vehiculoId)
    if (filtros.conductorId) params.set('conductorId', filtros.conductorId)
    const consulta = params.toString()
    const ruta = consulta ? `/viajes/filtrarPor?${consulta}` : '/viajes'

    let activo = true
    listar(ruta)
      .then((datos) => activo && setViajes(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [filtros, recarga])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function cambiarFiltro(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(VACIO)
    setErrores({})
  }

  function editar(v) {
    setEditandoId(v.id)
    setForm({
      vehiculo_id: String(v.vehiculo_id),
      conductor_id: String(v.conductor_id),
      fecha_salida: soloFecha(v.fecha_salida),
      fecha_llegada: soloFecha(v.fecha_llegada),
      origen: v.origen,
      destino: v.destino,
      kilometros: String(Number(v.kilometros)),
      observaciones: v.observaciones ?? '',
    })
    setErrores({})
    setError('')
    setOk('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function borrar(v) {
    if (!window.confirm(`¿Eliminar el viaje #${v.id} (${v.origen} → ${v.destino})?`)) return
    setError('')
    setOk('')
    try {
      await eliminar(`/viajes/${v.id}`)
      if (editandoId === v.id) cancelar()
      setOk('Viaje eliminado.')
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setOk('')

    const nuevos = validar(form)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const datos = {
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      fecha_salida: form.fecha_salida,
      fecha_llegada: form.fecha_llegada,
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      kilometros: Number(form.kilometros),
    }
    if (form.observaciones.trim()) datos.observaciones = form.observaciones.trim()

    setEnviando(true)
    try {
      if (editandoId) {
        await actualizar(`/viajes/${editandoId}`, datos)
        setOk('Viaje actualizado correctamente.')
      } else {
        await crear('/viajes', datos)
        setOk('Viaje registrado correctamente.')
      }
      cancelar()
      setRecarga((r) => r + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function nombreVehiculo(id) {
    const v = vehiculos.find((x) => x.id === id)
    return v ? `${v.patente} (${v.marca} ${v.modelo})` : `#${id}`
  }

  function nombreConductor(id) {
    const c = conductores.find((x) => x.id === id)
    return c ? `${c.apellido}, ${c.nombre}` : `#${id}`
  }

  const totalKm = viajes.reduce((suma, v) => suma + Number(v.kilometros), 0)

  let detalleFiltro = 'todos los viajes'
  if (filtros.vehiculoId && filtros.conductorId)
    detalleFiltro = `${nombreVehiculo(Number(filtros.vehiculoId))} con ${nombreConductor(Number(filtros.conductorId))}`
  else if (filtros.vehiculoId) detalleFiltro = `vehículo ${nombreVehiculo(Number(filtros.vehiculoId))}`
  else if (filtros.conductorId) detalleFiltro = `conductor ${nombreConductor(Number(filtros.conductorId))}`

  return (
    <section>
      <h2>Viajes</h2>

      {error && <p className="alerta alerta-error">{error}</p>}
      {ok && <p className="alerta alerta-ok">{ok}</p>}

      <form className="formulario" onSubmit={enviar} noValidate>
        <h3>{editandoId ? `Modificar viaje #${editandoId}` : 'Registrar viaje'}</h3>

        <div className="grilla">
          <Campo label="Vehículo" error={errores.vehiculo_id}>
            <select name="vehiculo_id" value={form.vehiculo_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} - {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Conductor" error={errores.conductor_id}>
            <select name="conductor_id" value={form.conductor_id} onChange={cambiar}>
              <option value="">Seleccionar...</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.apellido}, {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Fecha de salida" error={errores.fecha_salida}>
            <input type="date" name="fecha_salida" value={form.fecha_salida} onChange={cambiar} />
          </Campo>
          <Campo label="Fecha de llegada" error={errores.fecha_llegada}>
            <input type="date" name="fecha_llegada" value={form.fecha_llegada} onChange={cambiar} />
          </Campo>
          <Campo label="Origen" error={errores.origen}>
            <input name="origen" value={form.origen} onChange={cambiar} />
          </Campo>
          <Campo label="Destino" error={errores.destino}>
            <input name="destino" value={form.destino} onChange={cambiar} />
          </Campo>
          <Campo label="Kilómetros" error={errores.kilometros}>
            <input
              name="kilometros"
              value={form.kilometros}
              onChange={cambiar}
              inputMode="decimal"
            />
          </Campo>
        </div>

        <Campo label="Observaciones (opcional)" error={errores.observaciones}>
          <textarea
            name="observaciones"
            rows="2"
            value={form.observaciones}
            onChange={cambiar}
          />
        </Campo>

        <div className="acciones">
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar viaje'}
          </button>
          {editandoId && (
            <button className="btn btn-secundario" type="button" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Historial de viajes</h3>

      <div className="filtros">
        <Campo label="Filtrar por vehículo">
          <select name="vehiculoId" value={filtros.vehiculoId} onChange={cambiarFiltro}>
            <option value="">Todos</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Filtrar por conductor">
          <select name="conductorId" value={filtros.conductorId} onChange={cambiarFiltro}>
            <option value="">Todos</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.apellido}, {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <p className="resumen">
        <strong>{viajes.length}</strong> {viajes.length === 1 ? 'viaje' : 'viajes'} ({detalleFiltro}){' · '}
        Total recorrido:{' '}
        <strong>{totalKm.toLocaleString('es-AR', { maximumFractionDigits: 1 })} km</strong>
      </p>

      {cargando ? (
        <p>Cargando...</p>
      ) : viajes.length === 0 ? (
        <p className="aviso">No hay viajes para mostrar.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Km</th>
                <th>Observaciones</th>
                {sesion.esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {viajes.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{nombreVehiculo(v.vehiculo_id)}</td>
                  <td>{nombreConductor(v.conductor_id)}</td>
                  <td>{soloFecha(v.fecha_salida)}</td>
                  <td>{soloFecha(v.fecha_llegada)}</td>
                  <td>{v.origen}</td>
                  <td>{v.destino}</td>
                  <td>{Number(v.kilometros).toLocaleString('es-AR', { maximumFractionDigits: 1 })}</td>
                  <td className="observaciones">{v.observaciones}</td>
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

export default Viajes
