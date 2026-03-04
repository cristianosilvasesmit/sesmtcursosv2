import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [mpConfig, setMpConfig] = useState({
        accessToken: '',
        publicKey: '',
        sandboxMode: true,
    });
    const [transactions, setTransactions] = useState([]);

    // 1. Carregar configurações do Banco (Supabase)
    useEffect(() => {
        const fetchConfig = async () => {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'mercadopago')
                .single();

            if (!error && data) {
                setMpConfig(data.value);
            } else {
                // Fallback para localStorage se o banco falhar ou estiver vazio
                const local = {
                    accessToken: localStorage.getItem('mp_access_token') || '',
                    publicKey: localStorage.getItem('mp_public_key') || '',
                    sandboxMode: localStorage.getItem('mp_sandbox_mode') === 'true' || true,
                };
                setMpConfig(local);
            }
        };
        fetchConfig();
    }, []);

    const updateMpConfig = async (newConfig) => {
        const updated = { ...mpConfig, ...newConfig };
        setMpConfig(updated);

        // Persistir local e no banco
        localStorage.setItem('mp_access_token', updated.accessToken);
        localStorage.setItem('mp_public_key', updated.publicKey);
        localStorage.setItem('mp_sandbox_mode', updated.sandboxMode);

        await supabase
            .from('settings')
            .update({ value: updated })
            .eq('key', 'mercadopago');
    };

    // Simulação de busca de eventos de webhook
    const fetchPaymentEvents = async () => {
        // No futuro, isso buscará de uma tabela 'payment_logs' no Supabase
        const mockEvents = [
            { id: 1, type: 'payment.approved', detail: 'Pagamento #82731 Aprovado', date: '5 min atrás', status: 'success' },
            { id: 2, type: 'payment.pending', detail: 'Aguardando Pix #82730', date: '12 min atrás', status: 'pending' },
        ];
        setTransactions(mockEvents);
    };

    useEffect(() => {
        fetchPaymentEvents();
    }, []);

    const createPreference = async (userId, course) => {
        if (!mpConfig.accessToken) {
            throw new Error("Access Token não configurado. Vá ao Dashboard > Financeiro.");
        }

        try {
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mpConfig.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: [
                        {
                            id: course.id,
                            title: course.title,
                            unit_price: parseFloat(course.price.replace('.', '').replace(',', '.')),
                            quantity: 1,
                            currency_id: 'BRL'
                        }
                    ],
                    external_reference: `${userId}|${course.id}`,
                    back_urls: {
                        success: `${window.location.origin}/dashboard?status=success&courseId=${course.id}`,
                        failure: `${window.location.origin}/checkout/${course.id}?status=failure`,
                        pending: `${window.location.origin}/dashboard?status=pending`
                    },
                    auto_return: 'approved'
                })
            });

            const data = await response.json();
            if (data.id) {
                return data;
            } else {
                throw new Error(data.message || "Erro ao gerar preferência de pagamento");
            }
        } catch (err) {
            console.error("Erro MP:", err);
            throw err;
        }
    };

    return (
        <PaymentContext.Provider value={{
            mpConfig,
            updateMpConfig,
            transactions,
            fetchPaymentEvents,
            createPreference
        }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => useContext(PaymentContext);
