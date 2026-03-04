import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { usePayment } from '../context/PaymentContext';
import { useNavigate, useParams } from 'react-router-dom';

const Checkout = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { courses } = useCourses();
    const { mpConfig, createPreference } = usePayment();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState('payment'); // 'payment', 'processing', 'success'

    useEffect(() => {
        const found = courses.find(c => c.id === id);
        if (found) setCourse(found);
    }, [id, courses]);

    const handlePayment = async () => {
        if (!user) {
            alert("Você precisa estar logado para comprar.");
            return;
        }

        if (!mpConfig.accessToken) {
            alert("Erro de Configuração: O administrador (Fábio) ainda não configurou o Access Token do Mercado Pago no Dashboard.");
            return;
        }

        setIsProcessing(true);
        setStep('processing');

        try {
            // Chamada real para gerar a preferência de pagamento no Mercado Pago
            const preference = await createPreference(user.id, course);

            // Decidir qual URL de checkout usar (Sandbox ou Produção)
            const checkoutUrl = mpConfig.sandboxMode
                ? preference.sandbox_init_point
                : preference.init_point;

            if (checkoutUrl) {
                // Redireciona o usuário para o Mercado Pago
                window.location.href = checkoutUrl;
            } else {
                throw new Error("Link de checkout não gerado pelo Mercado Pago.");
            }
        } catch (err) {
            console.error("Erro no checkout real:", err);
            alert(`Erro no Pagamento: ${err.message}`);
            setStep('payment');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!course) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>CARREGANDO CHECKOUT...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f4f4f4', paddingTop: '100px', paddingBottom: '50px', color: '#333' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                {step === 'payment' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Lado Esquerdo - Detalhes do Pagamento */}
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#009ee3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>MP</div>
                                <h2 style={{ fontSize: '1.2rem', color: '#009ee3' }}>Mercado Pago <span style={{ color: '#999', fontWeight: 400, fontSize: '0.9rem' }}>| Checkout Pro</span></h2>
                            </div>

                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Como você prefere pagar?</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1.5rem', border: `2px solid ${mpConfig.sandboxMode ? '#fbbf24' : '#009ee3'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem', background: mpConfig.sandboxMode ? '#fffbeb' : '#f0f9ff' }}>
                                    <div style={{ fontSize: '1.5rem' }}>{mpConfig.sandboxMode ? '🧪' : '💳'}</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{mpConfig.sandboxMode ? 'Cartão de Teste (Sandbox)' : 'Cartão de Crédito ou Débito'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{mpConfig.sandboxMode ? 'Use os dados do painel de teste do MP' : 'Processado com segurança pelo Mercado Pago'}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', opacity: mpConfig.sandboxMode ? 0.5 : 1, cursor: mpConfig.sandboxMode ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem', background: mpConfig.sandboxMode ? 'transparent' : '#fff' }}>
                                    <div style={{ fontSize: '1.5rem' }}>💠</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>Pix</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{mpConfig.sandboxMode ? 'Desativado no modo simulação' : 'Aprovação em poucos segundos'}</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                style={{ width: '100%', marginTop: '2.5rem', padding: '1.2rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                                FINALIZAR PAGAMENTO
                            </button>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#999' }}>
                                {mpConfig.sandboxMode
                                    ? "Ambiente de testes seguro. Nenhum valor real será cobrado."
                                    : "Pagamento 100% seguro processado pelo Mercado Pago."}
                            </p>
                        </div>

                        {/* Lado Direito - Resumo do Pedido */}
                        <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', border: '1px solid #eee', height: 'fit-content' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Resumo da compra</h3>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
                                <img src={course.image} alt={course.title} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{course.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Acesso vitalício ao conteúdo</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                <span>Produto:</span>
                                <span>R$ {course.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                <span>Taxas:</span>
                                <span style={{ color: '#22c55e' }}>Grátis</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '2px solid #eee', fontWeight: 900, fontSize: '1.2rem' }}>
                                <span>Total:</span>
                                <span style={{ color: '#009ee3' }}>R$ {course.price}</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <div className="loader" style={{ width: '60px', height: '60px', border: '5px solid #f3f3f3', borderTop: '5px solid #009ee3', borderRadius: '50%', margin: '0 auto 2rem', animation: 'spin 1s linear infinite' }}></div>
                        <h2 style={{ marginBottom: '1rem' }}>Processando seu pagamento...</h2>
                        <p style={{ color: '#666' }}>Estamos validando os dados com o emissor do cartão.</p>
                        <style>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        `}</style>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#22c55e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 2rem' }}>✓</div>
                        <h2 style={{ marginBottom: '1rem', color: '#22c55e' }}>Pagamento Aprovado!</h2>
                        <p style={{ color: '#666', marginBottom: '3rem' }}>O acesso ao curso **{course.title}** já foi liberado no seu painel.</p>

                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{ padding: '1.2rem 3rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
                        >
                            IR PARA MEUS CURSOS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
