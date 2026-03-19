import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Se estiver verificando a sessão do Supabase ainda, mostrar loading
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary-red)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Verificando credenciais...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // Se não houver usuário logado, mandar pro login e salvar de onde ele veio
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se a rota for só para Admins e o usuário não for, mandar pra Home ou Painel de Aluno
    if (requireAdmin && user.role !== 'admin') {
        // Se aluno tentar acessar area admin, joga pro dashboard de aluno
        return <Navigate to="/dashboard" replace />;
    }

    // Tudo certo, renderizar a página solicitada
    return children;
};

export default ProtectedRoute;
