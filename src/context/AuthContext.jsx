import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const mapSessionUser = (sessionUser) => {
        if (!sessionUser) return null;

        const email = sessionUser.email;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

        // Ordem de prioridade para definir o cargo:
        // 1. app_metadata.role (O mais Seguro/Oficial vindo do Banco de Dados)
        // 2. Verificação de e-mail de dono (VITE_ADMIN_EMAIL)
        // 3. user_metadata.role (O que foi definido no cadastro)
        const role = sessionUser.app_metadata?.role || 
                    (adminEmail && email?.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : null) ||
                    sessionUser.user_metadata?.role || 
                    'student';

        return {
            id: sessionUser.id,
            email: email,
            name: sessionUser.user_metadata?.full_name || email.split('@')[0],
            role: role
        };
    };

    useEffect(() => {
        // 1. Checar sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(mapSessionUser(session?.user));
            setLoading(false);
        });

        // 2. Ouvir mudanças (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(mapSessionUser(session?.user));

            // Se for recuperação de senha, podemos marcar um estado ou apenas garantir o loading false
            if (event === 'PASSWORD_RECOVERY') {
                console.log("Recuperação de senha detectada!");
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            if (error.message.includes("Email not confirmed")) {
                throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada!");
            }
            throw error;
        }
        return data;
    };

    const signup = async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.name || userData.email.split('@')[0],
                    role: 'student'
                }
            }
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const sendPasswordReset = async (email) => {
        console.log("Solicitando código de recuperação para:", email);
        // Com o template de OTP (apenas código), o redirectTo vira apenas suporte
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    };

    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    };

    const verifyResetCode = async (email, token) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery'
        });
        if (error) throw error;
        return data;
    };

    const updateProfile = async (updates) => {
        if (!user || !user.id) return;
        
        // 1. Atualizar no Supabase Auth (user_metadata)
        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: updates.full_name,
                avatar_url: updates.avatar_url,
                phone: updates.phone
            }
        });
        if (error) throw error;

        // 2. Sincronizar com a tabela de perfis pública/privada
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: updates.full_name,
                avatar_url: updates.avatar_url,
                phone: updates.phone
            })
            .eq('id', user.id);
        
        if (profileError) console.error("Erro ao sincronizar perfil no banco:", profileError);

        // Atualiza estado local para refletir na UI imediatamente
        setUser(prev => ({ 
            ...prev, 
            name: updates.full_name || prev.name,
            avatar_url: updates.avatar_url || prev.avatar_url
        }));

        return data;
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, sendPasswordReset, updatePassword, verifyResetCode, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
