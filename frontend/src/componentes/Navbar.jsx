const ENLACES = [{ id: 'inicio', texto: 'Inicio', publico: true }]

function Navbar({ pagina, sesion, irA, onLogout }) {
  const visibles = ENLACES.filter(
    (e) => e.publico || (sesion && (!e.admin || sesion.esAdmin)),
  )

  return (
    <header className="Navbar">
      <span className="marca">Logística UTN SRL</span>

      <nav>
        {visibles.map((e) => (
          <button
            key={e.id}
            className={pagina === e.id ? 'activo' : ''}
            onClick={() => irA(e.id)}
          >
            {e.texto}
          </button>
        ))}
      </nav>

      <div className="sesion">
        {sesion ? (
          <>
            <span>
              {sesion.email}
              {sesion.esAdmin ? ' (admin)' : ''}
            </span>
            <button onClick={onLogout}>Salir</button>
          </>
        ) : (
          <button
            className={pagina === 'login' ? 'activo' : ''}
            onClick={() => irA('login')}
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar