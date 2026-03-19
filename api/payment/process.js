import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Instância única do Supabase para o backend
// O Vercel injetará essas variáveis automaticamente se configuradas no painel
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // CORS headers para permitir requisições do frontend React
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { user, course, payment_data } = req.body;

        if (!user || (!user.id && !user.email)) {
             return res.status(400).json({ error: 'Usuário não autenticado no Checkout.' });
        }
        if (!course || !course.id) {
            return res.status(400).json({ error: 'Curso inválido.' });
        }

        // 1. Buscar a chave privada do Mercado Pago direto do Supabase via backend (Segurança Máxima)
        const { data: secretsData, error: secretsError } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'mercadopago_secret')
            .single();

        if (secretsError || !secretsData?.value?.token) {
            console.error("Erro ao buscar a chave do Mercado Pago no DB:", secretsError);
            return res.status(500).json({ error: 'Configuração de pagamento incompleta no servidor.' });
        }

        const accessToken = secretsData.value.token;

        // 2. Inicializar SDK do Mercado Pago
        const mpClient = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

        // 3. Processar Pagamento PIX Direto ou Criar Preferência (Checkout Pro/Brick)
        if (payment_data?.payment_method_id === 'pix') {
            const payment = new Payment(mpClient);
            const cpf = "12345678909"; // Na prática, deve vir do formulário de checkout
            
            const pixRequest = {
                transaction_amount: Number(payment_data.transaction_amount) || Number(course.price.replace(',','.')),
                description: `Curso: ${course.title}`,
                payment_method_id: 'pix',
                payer: {
                    email: user.email,
                    first_name: user?.name?.split(' ')[0] || 'Aluno',
                    identification: {
                        type: 'CPF',
                        number: cpf
                    }
                },
                external_reference: `${user.id}_${course.id}`, // Muito importante para o Webhook saber quem pagou o quê
            };

            const response = await payment.create({ body: pixRequest });
            
            return res.status(200).json(response);
        } else {
             // Caso seja Cartão vindo do Card Brick
             const payment = new Payment(mpClient);
             
             // O formData do Brick já traz o token do cartão, parcelas, etc
             const cardRequest = {
                 ...payment_data, // contém token do cartão, installments, payment_method_id, payer
                 transaction_amount: Number(payment_data.transaction_amount) || Number(course.price.replace(',','.')),
                 description: `Curso: ${course.title}`,
                 external_reference: `${user.id}_${course.id}`,
                 payer: {
                     ...payment_data.payer,
                     email: user.email,
                 }
             };

             const response = await payment.create({ body: cardRequest });
             return res.status(200).json(response);
        }

    } catch (error) {
        console.error('Erro geral no processo de pagamento:', error);
        return res.status(500).json({ error: error.message || 'Erro interno no servidor de pagamentos' });
    }
}
