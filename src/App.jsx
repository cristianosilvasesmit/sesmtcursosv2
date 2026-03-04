import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import Cursos from './pages/Cursos'
import Sesmt from './pages/Sesmt'
import Contato from './pages/Contato'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import LeadsManagement from './pages/LeadsManagement'
import EADSettings from './pages/EADSettings'
import CourseCreator from './pages/CourseCreator'
import CourseEditor from './pages/CourseEditor'
import CoursePlayer from './pages/CoursePlayer'
import Checkout from './pages/Checkout'
import Certificate from './pages/Certificate'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import { supabase } from './lib/supabaseClient'

function App() {
  const navigate = useNavigate()

  React.useEffect(() => {
    // Verificar se há erro na URL (ex: link expirado)
    const hash = window.location.hash
    if (hash.includes('error_code=otp_expired')) {
      alert("Este link de recuperação expirou ou já foi usado. Por favor, solicite um novo e-mail.")
      // Limpa o hash para não repetir o alerta
      window.history.replaceState(null, null, window.location.pathname)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento Auth em App.jsx:", event, session ? "Sessão Ativa" : "Sem Sessão")

      // Removemos o navigate automático daqui para evitar conflito com bots
      // A página /reset-password deve ser a única a lidar com isso
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="app">
      <Navbar />
      <WhatsAppButton />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/sesmt" element={<Sesmt />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<LeadsManagement />} />
        <Route path="/ead-settings" element={<EADSettings />} />
        <Route path="/create-course" element={<CourseCreator />} />
        <Route path="/edit-course/:id" element={<CourseEditor />} />
        <Route path="/player/:id" element={<CoursePlayer />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/certificate/:id" element={<Certificate />} />
      </Routes>

      <Footer />

      {/* FAB WhatsApp */}
      <a href="#" style={{ position: 'fixed', bottom: '2rem', left: '2rem', background: '#25d366', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', zIndex: 1000 }}>
        <svg fill="white" width="30" height="30" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
      </a>
    </div>
  )
}

export default App
