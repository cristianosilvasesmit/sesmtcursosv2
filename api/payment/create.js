import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { user, course } = req.body

    if (!user || !course) {
        return res.status(400).json({ error: 'Dados insuficientes (user/course)' })
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
            .eq('key', 'mercadopago_secret')
            .single()

        if (settingsError || !settings?.value?.token) {
            return res.status(500).json({ error: "Configuração MP não encontrada no banco" })
        }

        const accessToken = settings.value.token

        // 3. Preparar requisição de pagamento PIX para o Mercado Pago
        // Documentação: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
        const paymentPayload = {
            transaction_amount: parseFloat(course.price.replace('.', '').replace(',', '.')),
            description: `Curso: ${course.title}`,
            payment_method_id: 'pix',
            payer: {
                email: user.email,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' ') || 'Aluno'
            },
            external_reference: `${user.id}_${course.id}`,
            notification_url: `https://${req.headers.host}/api/webhook/mp`, // Reutiliza o webhook existente
            installments: 1
        }

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pay_${user.id}_${course.id}_${Date.now()}` // Chave de idempotência
            },
            body: JSON.stringify(paymentPayload)
        })

        const paymentData = await mpResponse.json()

        if (paymentData.status === 'rejected') {
            return res.status(400).json({
                error: 'Pagamento Rejeitado',
                detail: paymentData.status_detail
            })
        }

        // 4. Extrair dados do Pix para o frontend
        // Eles ficam dentro de point_of_interaction.transaction_data
        const pixData = paymentData.point_of_interaction?.transaction_data

        if (!pixData) {
            console.error("Erro MP Response:", paymentData)
            throw new Error("Não foi possível gerar os dados do Pix")
        }

        return res.status(200).json({
            payment_id: paymentData.id,
            status: paymentData.status,
            qr_code: pixData.qr_code, // Chave "Copia e Cola"
            qr_code_base64: pixData.qr_code_base64, // Imagem do QR Code
            ticket_url: pixData.ticket_url // Link da página de ticket do MP (backup)
        })

    } catch (error) {
        console.error("Erro no processamento Pix:", error)
        return res.status(500).json({ error: error.message })
    }
}
