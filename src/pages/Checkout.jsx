import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { usePayment } from '../context/PaymentContext';
import { useNavigate, useParams } from 'react-router-dom';

const Checkout = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { courses } = useCourses();
    const { mpConfig, processPayment } = usePayment();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState('payment'); // 'payment', 'processing', 'success', 'pix_waiting'
    const [pixData, setPixData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' ou 'card'
    const [mp, setMp] = useState(null);

    useEffect(() => {
        const found = courses.find(c => c.id === id);
        if (found) setCourse(found);
    }, [id, courses]);

    // Inicializar Mercado Pago
    useEffect(() => {
        if (mpConfig.publicKey && window.MercadoPago && !mp) {
            const mpInstance = new window.MercadoPago(mpConfig.publicKey, {
                locale: 'pt-BR'
            });
            setMp(mpInstance);
        }
    }, [mpConfig.publicKey, mp]);

    // Inicializar Card Brick quando trocar para 'card'
    useEffect(() => {
        if (paymentMethod === 'card' && mp && course && step === 'payment') {
            renderCardBrick();
        }
    }, [paymentMethod, mp, course, step]);

    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        // Limpeza robusta: "R$ 1.200,50" -> 1200.50
        const clean = price.toString()
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim();
        return parseFloat(clean) || 0;
    };

    const renderCardBrick = async () => {
        const bricksBuilder = mp.bricks();

        // Limpa o container antes de renderizar (evita duplicidade)
        const container = document.getElementById('cardPaymentBrick_container');
        if (container) container.innerHTML = '';

        return await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
            initialization: {
                amount: parsePrice(course.price),
            },
            customization: {
                visual: {
                    style: {
                        theme: 'default', // Pode ser 'dark' se o fundo for escuro
                    },
                },
                paymentMethods: {
                    maxInstallments: 12,
                }
            },
            callbacks: {
                onReady: () => {
                    console.log("Card Brick Pronto");
                },
                onSubmit: async (formData) => {
                    setIsProcessing(true);
                    setStep('processing');
                    try {
                        const result = await processPayment(user, course, formData);
                        if (result.status === 'approved') {
                            setStep('success');
                        } else {
                            alert(`Status do Pagamento: ${result.status_detail || result.status}`);
                            setStep('payment');
                        }
                    } catch (error) {
                        alert(error.message);
                        setStep('payment');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                onError: (error) => {
                    console.error("Erro Crítico no Mercado Pago Brick:", error);
                    alert("Erro ao carregar formulário de cartão. Por favor, verifique se a 'Public Key' nas configurações do painel está correta para o ambiente (Sandbox/Produção) e se começa com 'TEST-' ou 'APP_USR-'.");
                },
            },
        });
    };

    const handlePixPayment = async () => {
        setIsProcessing(true);
        setStep('processing');

        try {
            const result = await processPayment(user, course, {
                payment_method_id: 'pix',
                transaction_amount: parsePrice(course.price)
            });

            if (result.point_of_interaction?.transaction_data?.qr_code) {
                setPixData(result.point_of_interaction.transaction_data);
                setStep('pix_waiting');
            } else {
                throw new Error("Não foi possível gerar os dados do Pix.");
            }
        } catch (err) {
            alert(`Erro no Pix: ${err.message}`);
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
                    <div className="checkout-grid">
                        {/* Lado Esquerdo - Detalhes do Pagamento */}
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#009ee3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>MP</div>
                                <h2 style={{ fontSize: '1.2rem', color: '#009ee3' }}>Finalizar Matrícula <span style={{ color: '#999', fontWeight: 400, fontSize: '0.9rem' }}>| Checkout Seguro</span></h2>
                            </div>

                            {/* Seletor de Método */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    style={{
                                        flex: 1, padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                        background: paymentMethod === 'pix' ? '#f0f9ff' : 'transparent',
                                        borderBottom: paymentMethod === 'pix' ? '3px solid #009ee3' : '3px solid transparent',
                                        fontWeight: 700, color: paymentMethod === 'pix' ? '#009ee3' : '#999',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    💠 PIX
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        flex: 1, padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                        background: paymentMethod === 'card' ? '#f0f9ff' : 'transparent',
                                        borderBottom: paymentMethod === 'card' ? '3px solid #009ee3' : '3px solid transparent',
                                        fontWeight: 700, color: paymentMethod === 'card' ? '#009ee3' : '#999',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    💳 CARTÃO
                                </button>
                            </div>

                            {paymentMethod === 'pix' ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ padding: '2rem', border: '1px dashed #009ee3', borderRadius: '8px', marginBottom: '2rem', background: '#f8fafc' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💠</div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Pix Instantâneo</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>O QR Code será gerado na próxima tela.<br />Acesso liberado na hora!</p>
                                    </div>
                                    <button
                                        onClick={handlePixPayment}
                                        style={{ width: '100%', padding: '1.2rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
                                    >
                                        GERAR QR CODE PIX
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {!mpConfig?.publicKey ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444', border: '1px dashed #ff4444', borderRadius: '8px' }}>
                                            ⚠️ A Chave Pública (Public Key) do Mercado Pago não está configurada no painel. O formulário de cartão não pode ser carregado.
                                        </div>
                                    ) : (
                                        <div id="cardPaymentBrick_container"></div>
                                    )}
                                </div>
                            )}

                            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#999' }}>
                                Pagamento 100% seguro processado pelo Mercado Pago.
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
                        <h2 style={{ marginBottom: '1rem' }}>Gerando seu Pix...</h2>
                        <p style={{ color: '#666' }}>Aguarde um instante enquanto conectamos com o Mercado Pago.</p>
                        <style>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        `}</style>
                    </div>
                )}

                {step === 'pix_waiting' && pixData && (
                    <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ color: '#009ee3', fontSize: '3rem', marginBottom: '1rem' }}>💠</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Quase lá!</h2>
                        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>Escaneie o QR Code ou use o código Copia e Cola abaixo para pagar no seu banco.</p>

                        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'inline-block' }}>
                            <img
                                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                alt="QR Code Pix"
                                style={{ width: '200px', height: '200px', margin: '0 auto' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', display: 'block', marginBottom: '0.5rem' }}>PIX COPIA E COLA</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    readOnly
                                    value={pixData.qr_code}
                                    style={{ flex: 1, padding: '0.8rem', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.qr_code);
                                        alert("Código Pix Copiado!");
                                    }}
                                    style={{ background: '#009ee3', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    COPIAR
                                </button>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Após o pagamento, o seu curso será liberado <strong>automaticamente</strong> em alguns segundos. Você pode fechar esta tela após pagar.</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{ width: '100%', padding: '1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                JÁ PAGUEI, IR PARA O PAINEL
                            </button>
                        </div>
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
