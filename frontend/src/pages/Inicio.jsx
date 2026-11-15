function Inicio({ sesion, irA }) {
  return (
    <section className="hero">
      <h1>Logística UTN SRL</h1>
      <p>
        Sistema de gestión de la flota de la empresa: vehículos, conductores y
        viajes realizados.
      </p>

      <div className="tarjetas">
        <article className="tarjeta">
          <h3>Vehículos</h3>
          <p>Alta, modificación y baja de los vehículos de la flota.</p>
        </article>
        <article className="tarjeta">
          <h3>Conductores</h3>
          <p>Datos de los conductores y vigencia de sus licencias.</p>
        </article>
        <article className="tarjeta">
          <h3>Viajes</h3>
          <p>Registro de viajes, historial y total de kilómetros recorridos.</p>
        </article>
      </div>

      {sesion ? (
        <p className="aviso">Sesión iniciada como {sesion.email}.</p>
      ) : (
        <button className="btn" onClick={() => irA('login')}>
          Iniciar sesión
        </button>
      )}
    </section>
  )
}

export default Inicio