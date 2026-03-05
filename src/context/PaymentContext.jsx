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

    const processPayment = async (user, course, paymentData) => {
        try {
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, course, payment_data: paymentData })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Pagamento Processado com Sucesso:", data);
                return data;
            } else {
                throw new Error(data.error || data.message || "Erro ao processar o pagamento");
            }
        } catch (err) {
            console.error("Erro no Fluxo de Pagamento Direct:", err);
            throw err;
        }
    };

    return (
        <PaymentContext.Provider value={{
            mpConfig,
            updateMpConfig,
            transactions,
            fetchPaymentEvents,
            createPreference: processPayment, // Alias para compatibilidade
            processPayment
        }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => useContext(PaymentContext);
