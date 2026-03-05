import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    // O payload do Mercado Pago Card Brick envia dados específicos:
    // token, installments, issuer_id, payment_method_id, transaction_amount, etc.
    const { user, course, payment_data } = req.body

    if (!user || !course || !payment_data) {
        return res.status(400).json({ error: 'Dados insuficientes para processar o pagamento' })
    }

    try {
        // 1. Inicializar Supabase para pegar as chaves
        const supabaseUrl = process.env.VITE_SUPABASE_URL
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 2. Buscar Access Token do Mercado Pago no Banco
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'mercadopago')
            .single()

        if (settingsError || !settings?.value?.accessToken) {
            return res.status(500).json({ error: "Configuração MP não encontrada no banco" })
        }

        const accessToken = settings.value.accessToken

        // 3. Montar o Payload para a API de Pagamentos do Mercado Pago
        // Documentação: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
        const paymentPayload = {
            transaction_amount: payment_data.transaction_amount,
            token: payment_data.token,
            description: `Curso: ${course.title}`,
            installments: parseInt(payment_data.installments) || 1,
            payment_method_id: payment_data.payment_method_id,
            issuer_id: payment_data.issuer_id,
            payer: {
                email: user.email,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' ') || 'Aluno',
            },
            external_reference: `${user.id}|${course.id}`,
            notification_url: `https://${req.headers.host}/api/webhook/mp`,
        }

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pay_${user.id}_${course.id}_${Date.now()}`
            },
            body: JSON.stringify(paymentPayload)
        })

        const paymentRes = await mpResponse.json()

        // 4. Tratar Resposta
        if (!mpResponse.ok) {
            console.error("Erro MP Response:", paymentRes)
            return res.status(400).json({
                error: paymentRes.message || 'Erro ao processar pagamento',
                detail: paymentRes.status_detail
            })
        }

        // Retornar os dados necessários para o frontend (Pix ou Card Status)
        return res.status(200).json({
            id: paymentRes.id,
            status: paymentRes.status,
            status_detail: paymentRes.status_detail,
            // Se for Pix, envia os dados do QR Code
            point_of_interaction: paymentRes.point_of_interaction
        })

    } catch (error) {
        console.error("Erro Fatal no processamento:", error)
        return res.status(500).json({ error: error.message })
    }
}
