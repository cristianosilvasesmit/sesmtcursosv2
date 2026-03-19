import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [mpConfig, setMpConfig] = useState({
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
                .eq('key', 'mercadopago_public')
                .single();

            if (!error && data) {
                setMpConfig(data.value);
            } else {
                // Fallback para localStorage
                const local = {
                    publicKey: localStorage.getItem('mp_public_key') || '',
                    sandboxMode: localStorage.getItem('mp_sandbox_mode') !== 'false',
                };
                setMpConfig(local);
            }

            // Segurança: Garantir que o token antigo seja deletado do navegador do usuário
            localStorage.removeItem('mp_access_token');
        };
        fetchConfig();
    }, []);

    const updateMpConfig = async (newConfig) => {
        // newConfig pode conter accessToken vindo do Dashboard, devemos separá-arlo.
        const { accessToken, ...publicConfig } = newConfig;
        
        const updatedPublic = { ...mpConfig, ...publicConfig };
        setMpConfig(updatedPublic);

        // Persistir local e no banco (APENAS DADOS PÚBLICOS)
        localStorage.setItem('mp_public_key', updatedPublic.publicKey);
        localStorage.setItem('mp_sandbox_mode', updatedPublic.sandboxMode);

        // Salva as chaves públicas
        await supabase
            .from('settings')
            .upsert({ key: 'mercadopago_public', value: updatedPublic });

        // Salva o token privado separadamente APENAS se foi fornecido (não sobrescreve com vazio atoa)
        if (accessToken) {
            await supabase
                .from('settings')
                .upsert({ key: 'mercadopago_secret', value: { token: accessToken } });
        }
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
