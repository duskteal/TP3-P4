import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './componentes/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import Vehiculos from './pages/Vehiculos.jsx'
import Conductores from './pages/Conductores.jsx'
import Viajes from './pages/Viajes.jsx'
import Usuarios from './pages/Usuarios.jsx'
import { getSesion, guardarSesion, borrarSesion } from './services/api.js'


const PROTEGIDAS = ['vehiculos', 'conductores', 'viajes', 'usuarios']

function App() {
  const [sesion, setSesion] = useState(getSesion)
  const [pagina, setPagina] = useState('inicio')

  useEffect(() => {
    function sesionExpirada() {
      setSesion(null)
      setPagina('login')
    }
    window.addEventListener('sesion-expirada', sesionExpirada)
    return () => window.removeEventListener('sesion-expirada', sesionExpirada)
  }, [])

  function iniciarSesion(datos) {
    guardarSesion(datos)
    setSesion(datos)
    setPagina('inicio')
  }

  function cerrarSesion() {
    borrarSesion()
    setSesion(null)
    setPagina('inicio')
  }

  let contenido
  if (pagina === 'login' || (PROTEGIDAS.includes(pagina) && !sesion)) {
    contenido = <Login onLogin={iniciarSesion} />
  } else if (pagina === 'vehiculos') {
    contenido = <Vehiculos sesion={sesion} />
  } else if (pagina === 'conductores') {
    contenido = <Conductores sesion={sesion} />
  } else if (pagina === 'viajes') {
    contenido = <Viajes sesion={sesion} />
  } else if (pagina === 'usuarios') {
    contenido = <Usuarios sesion={sesion} />
  } else {
    contenido = <Inicio sesion={sesion} irA={setPagina} />
  }

  return (
    <>
      <Navbar pagina={pagina} sesion={sesion} irA={setPagina} onLogout={cerrarSesion} />
      <main className="contenido">{contenido}</main>
    </>
  )
}

export default App
