import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { type, data } = req.body

    // 1. Verificar se é uma notificação de pagamento
    if (type !== 'payment') {
        return res.status(200).json({ received: true })
    }

    const paymentId = data.id

    try {
        // 2. Inicializar Supabase (usando variáveis de ambiente)
        const supabaseUrl = process.env.VITE_SUPABASE_URL
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY // No futuro usar Service Role
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 3. Buscar Access Token do Mercado Pago no Banco
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'mercadopago')
            .single()

        if (settingsError || !settings?.value?.accessToken) {
            console.error("Erro ao buscar Access Token:", settingsError)
            return res.status(500).json({ error: "Configuração MP não encontrada" })
        }

        const accessToken = settings.value.accessToken

        // 4. Buscar detalhes do pagamento no Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const paymentData = await mpResponse.json()

        // 5. Verificar se o pagamento foi aprovado
        if (paymentData.status === 'approved') {
            const externalRef = paymentData.external_reference // userId|courseId
            if (externalRef && externalRef.includes('|')) {
                const [userId, courseId] = externalRef.split('|')

                console.log(`✅ Pagamento Aprovado! Liberando curso ${courseId} para usuário ${userId}`)

                // 6. Matricular o aluno no banco de dados
                // Verificamos se já existe para evitar duplicidade
                const { data: existing } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('course_id', courseId)
                    .single()

                if (!existing) {
                    const { error: enrollError } = await supabase
                        .from('enrollments')
                        .insert([{ user_id: userId, course_id: courseId }])

                    if (enrollError) throw enrollError
                }
            }
        }

        return res.status(200).json({ success: true })

    } catch (error) {
        console.error("Erro no Webhook:", error)
        return res.status(500).json({ error: error.message })
    }
}
