import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { action, type, data } = req.body;

        // O Mercado Pago manda eventos do tipo "payment" quando há atualização
        if (action === 'payment.created' || type === 'payment') {
            const paymentId = data?.id;

            if (!paymentId) {
                return res.status(400).json({ error: 'ID do pagamento não fornecido.' });
            }

            // 1. Pegar a chave do DB para verificar o status real na API do Mercado Pago
            const { data: secretsData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'mercadopago_secret')
                .single();

            if (!secretsData?.value?.token) {
                return res.status(500).json({ error: 'Token MP não configurado.' });
            }

            const mpClient = new MercadoPagoConfig({ accessToken: secretsData.value.token });
            const paymentAPI = new Payment(mpClient);

            // 2. Busca o pagamento na API oficial para evitar fraudes
            const paymentInfo = await paymentAPI.get({ id: paymentId });

            if (paymentInfo.status === 'approved') {
                // A referência externa contém "userId_courseId"
                const externalReference = paymentInfo.external_reference;
                
                if (externalReference && externalReference.includes('_')) {
                    const [userId, courseId] = externalReference.split('_');

                    // 3. Verificar se já existe matrícula para evitar duplicidade
                    const { data: existingEnrollment } = await supabase
                        .from('enrollments')
                        .select('user_id')
                        .eq('user_id', userId)
                        .eq('course_id', courseId)
                        .maybeSingle();

                    if (!existingEnrollment) {
                        const { error: enrollError } = await supabase
                            .from('enrollments')
                            .insert([
                                { user_id: userId, course_id: courseId }
                            ]);

                        if (enrollError) {
                            console.error('Erro ao matricular usuário:', enrollError);
                        } else {
                            console.log(`Matrícula confirmada! User: ${userId}, Course: ${courseId}`);
                        }
                    } else {
                        console.log(`Usuário já matriculado: User: ${userId}, Course: ${courseId}`);
                    }
                } else {
                    console.error('External Reference inválido ou ausente:', externalReference);
                }
            }
        }

        // SEMPRE responda 200 pro Mercado Pago parar de enviar o webhook
        res.status(200).send('Webhook Processed');

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Erro ao processar Webhook.' });
    }
}
