import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const mapSessionUser = (sessionUser) => {
        if (!sessionUser) return null;
        return {
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
            role: sessionUser.user_metadata?.role || 'student'
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
        const resetLink = window.location.origin.replace(/\/$/, '') + '/reset-password';
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: resetLink,
        });
        if (error) throw error;
    };

    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, sendPasswordReset, updatePassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
