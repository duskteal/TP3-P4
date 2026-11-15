import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './componentes/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import { getSesion, guardarSesion, borrarSesion } from './services/api.js'

const PROTEGIDAS = []
 
 function App() {
  const [count, setCount] = useState(0)
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
  } else {
    contenido = <Inicio sesion={sesion} irA={setPagina} />
  }
 
   return (
     <>
      <main className="contenido">{contenido}</main>
     </>
   )
 }

export default App