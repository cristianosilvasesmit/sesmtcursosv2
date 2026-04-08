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
import EADSettings from './pages/EADSettings'
import CourseCreator from './pages/CourseCreator'
import CourseEditor from './pages/CourseEditor'
import CoursePlayer from './pages/CoursePlayer'
import Checkout from './pages/Checkout'
import Certificate from './pages/Certificate'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'

import { supabase } from './lib/supabaseClient'

function App() {
  const navigate = useNavigate()

  React.useEffect(() => {
    // 1. Verificar se há erro na URL (ex: link expirado)
    // Com o novo sistema de código (OTP), isso raramente será disparado, 
    // mas mantemos por segurança para erros globais.
    const hash = window.location.hash
    if (hash.includes('error_code=')) {
      const errorMsg = hash.includes('otp_expired') 
        ? "Este código ou link expirou. Por favor, solicite um novo."
        : "Ocorreu um erro na autenticação. Tente novamente.";
      
      alert(errorMsg)
      window.history.replaceState(null, null, window.location.pathname)
    }

    // 2. Ouvir mudanças globais de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Radar de Segurança (App.jsx) - Evento:", event)
      // O fluxo de reset agora é manual via ForgotPassword -> ResetPassword
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
        
        {/* Rotas Logadas (Alunos e Admins) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/certificate/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
        <Route path="/player/:id" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />

        {/* Rotas Restritas (Apenas Admins) */}
        <Route path="/ead-settings" element={<ProtectedRoute requireAdmin={true}><EADSettings /></ProtectedRoute>} />
        <Route path="/create-course" element={<ProtectedRoute requireAdmin={true}><CourseCreator /></ProtectedRoute>} />
        <Route path="/edit-course/:id" element={<ProtectedRoute requireAdmin={true}><CourseEditor /></ProtectedRoute>} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
