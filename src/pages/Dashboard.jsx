import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useTheme } from '../context/ThemeContext';
import { usePayment } from '../context/PaymentContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { courses, checkOwnership, purchaseCourse } = useCourses();
    const { primaryColor, changeThemeColor, themeConfig, updateTheme } = useTheme();
    const { mpConfig, updateMpConfig, transactions } = usePayment();
    const navigate = useNavigate();
    const [courseProgress, setCourseProgress] = useState({});
    const [activeTab, setActiveTab] = useState('cursos'); // 'cursos', 'alunos', 'leads', 'interface', 'financeiro'

    // Efeito para capturar o retorno do Mercado Pago
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const courseId = params.get('courseId');

        if (status === 'success' && courseId && user) {
            const enrollUser = async () => {
                const alreadyOwned = checkOwnership(user.id, courseId);
                if (!alreadyOwned) {
                    const success = await purchaseCourse(user.id, courseId);
                    if (success) {
                        alert("Parabéns! Seu pagamento foi confirmado e o curso já está disponível.");
                        // Limpa os params da URL para não reenviar
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }
            };
            enrollUser();
        }
    }, [user, checkOwnership, purchaseCourse]);

    const [stats, setStats] = useState({
        totalAlunos: 0,
        vendasMes: 0,
        leadsHoje: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const fetchStats = async () => {
            try {
                // 1. Total Alunos & Vendas (Baseado em matriculas reais)
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('user_id, course_id, created_at');

                // 2. Leads Hoje
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: leadsTodayCount } = await supabase
                    .from('leads')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today.toISOString());

                if (!enrollError && enrollments) {
                    const uniqueUsers = new Set(enrollments.map(e => e.user_id));

                    // Filtrar vendas deste mês
                    const now = new Date();
                    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                    let totalVendas = 0;
                    enrollments.forEach(e => {
                        const enrollDate = new Date(e.created_at);
                        if (enrollDate >= firstDayMonth) {
                            const course = courses.find(c => c.id === e.course_id);
                            if (course) {
                                // Limpeza robusta de preço: "R$ 1.200,50" -> "1200.50"
                                const cleanPrice = course.price
                                    .replace('R$', '')
                                    .replace(/\./g, '')
                                    .replace(',', '.')
                                    .trim();
                                const priceNum = parseFloat(cleanPrice);
                                if (!isNaN(priceNum)) totalVendas += priceNum;
                            }
                        }
                    });

                    setStats({
                        totalAlunos: uniqueUsers.size,
                        vendasMes: totalVendas,
                        leadsHoje: leadsTodayCount || 0
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar estatísticas:", err);
            }
        };

        fetchStats();
    }, [user, courses]);

    useEffect(() => {
        if (!user || !user.id) return;

        const fetchAllProgress = async () => {
            const { data, error } = await supabase
                .from('user_progress')
                .select('course_id, lesson_id, is_completed')
                .eq('user_id', user.id)
                .eq('is_completed', true);

            if (!error && data) {
                const progressMap = {};
                data.forEach(item => {
                    if (!progressMap[item.course_id]) progressMap[item.course_id] = 0;
                    progressMap[item.course_id]++;
                });
                setCourseProgress(progressMap);
            }
        };

        fetchAllProgress();
    }, [user]);

    const displayCourses = user?.role === 'admin'
        ? courses
        : courses.filter(c => checkOwnership(user?.id, c.id));

    const calculateProgress = (courseId, totalLessons) => {
        if (!totalLessons || !courseProgress[courseId]) return 0;
        return Math.round((courseProgress[courseId] / totalLessons) * 100);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="container">
                {/* Cabeçalho de Identidade */}
                <div className="dash-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '12px', height: '40px', background: 'var(--primary-red)' }}></div>
                            <h1 style={{ letterSpacing: '1px' }}>
                                PAINEL <span style={{ color: 'var(--primary-red)' }}>{user?.role === 'admin' ? 'ESTRATÉGICO' : 'DO ALUNO'}</span>
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '27px' }}>
                            Logado como: <span style={{ color: 'white', fontWeight: 700 }}>{user?.name}</span>
                        </p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--industrial-border)', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        ENCERRAR SESSÃO
                    </button>
                </div>

                {user?.role === 'admin' && (
                    <>
                        {/* KPIs - Command Center Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            {[
                                { label: 'TOTAL ALUNOS', value: stats.totalAlunos, color: '#3b82f6', icon: '👥' },
                                { label: 'VENDAS MÊS', value: stats.vendasMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#22c55e', icon: '💰' },
                                { label: 'LEADS HOJE', value: stats.leadsHoje, color: 'var(--accent-yellow)', icon: '🔥' },
                                { label: 'CURSOS ATIVOS', value: courses.length, color: 'var(--primary-red)', icon: '📚' }
                            ].map((kpi, idx) => (
                                <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${kpi.color}`, background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{kpi.label}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{kpi.value}</div>
                                        <div style={{ fontSize: '1.2rem' }}>{kpi.icon}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Tabs */}
                        <div className="dash-tabs">
                            {[
                                { id: 'cursos', label: 'GESTÃO DE CURSOS', icon: '📚' },
                                { id: 'alunos', label: 'ALUNOS & MATRÍCULAS', icon: '👥' },
                                { id: 'leads', label: 'CENTRAL DE LEADS', icon: '🎯' },
                                { id: 'interface', label: 'INTERFACE / PERSONALIZAÇÃO', icon: '🎨' },
                                { id: 'financeiro', label: 'FINANCEIRO / MERCADO PAGO', icon: '💰' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className="tab-btn"
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab.id ? '3px solid var(--primary-red)' : '3px solid transparent',
                                        color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                        fontWeight: 900,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span>{tab.icon}</span> {tab.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Conteúdo Dinâmico por Aba */}
                {activeTab === 'cursos' && (
                    <div className="tab-content">
                        <div className="dash-section-header">
                            <h2 className="dash-title">
                                {user?.role === 'admin' ? 'CURSOS DISPONÍVEIS NA PLATAFORMA' : 'MEUS TREINAMENTOS'}
                            </h2>
                            {user?.role === 'admin' && (
                                <Link to="/create-course" style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-red)', color: 'white', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}>
                                    + NOVO CURSO
                                </Link>
                            )}
                        </div>

                        <div className="grid-responsive" style={{ display: 'grid', gap: '2rem' }}>
                            {displayCourses.length > 0 ? (
                                displayCourses.map(course => {
                                    const progress = calculateProgress(course.id, course.lessons?.length);
                                    return (
                                        <div key={course.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--industrial-border)', transition: 'transform 0.3s' }}>
                                            <div style={{ height: '160px', background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url(${course.image})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '1.5rem', display: 'flex', alignItems: 'flex-end' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{course.title}</h3>
                                            </div>
                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 900 }}>
                                                    <span>{course.lessons?.length || 0} AULAS CARREGADAS</span>
                                                    <span style={{ color: progress === 100 ? '#22c55e' : 'var(--primary-red)' }}>{progress}% CONCLUÍDO</span>
                                                </div>
                                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                                                    <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#22c55e' : 'var(--primary-red)', transition: 'width 0.8s ease' }}></div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <Link to={`/player/${course.id}`} style={{ background: 'var(--primary-red)', color: 'white', padding: '0.8rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem', textAlign: 'center', textDecoration: 'none' }}>
                                                        {user?.role === 'admin' ? 'VER COMO ALUNO' : 'CONTINUAR ESTUDO'}
                                                    </Link>
                                                    {user?.role === 'admin' ? (
                                                        <Link to={`/edit-course/${course.id}`} style={{ background: 'white', color: 'black', padding: '0.8rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem', textAlign: 'center', textDecoration: 'none' }}>
                                                            EDITAR CONTEÚDO
                                                        </Link>
                                                    ) : progress === 100 && (
                                                        <Link to={`/certificate/${course.id}`} style={{ background: 'var(--accent-yellow)', color: 'black', padding: '0.8rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem', textAlign: 'center', textDecoration: 'none' }}>
                                                            CERTIFICADO
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '2px dashed var(--industrial-border)' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Nenhum conteúdo disponível nesta seção.</p>
                                    <Link to="/cursos" style={{ padding: '0.8rem 2rem', background: 'var(--primary-red)', color: 'white', borderRadius: '4px', fontWeight: 900 }}>EXPLORAR CATÁLOGO</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'alunos' && (
                    <AlunosTab courses={courses} />
                )}

                {activeTab === 'leads' && (
                    <LeadsTab />
                )}

                {activeTab === 'interface' && (
                    <InterfaceTab 
                        themeConfig={themeConfig} 
                        updateTheme={updateTheme} 
                        changeThemeColor={changeThemeColor} 
                        primaryColor={primaryColor} 
                    />
                )}

                {activeTab === 'financeiro' && (
                    <FinanceiroTab
                        mpConfig={mpConfig}
                        updateMpConfig={updateMpConfig}
                        transactions={transactions}
                    />
                )}
            </div>
        </div>
    );
};

// Sub-componente para limpar o Dashboard.jsx e facilitar a gestão de estado
const FinanceiroTab = ({ mpConfig, updateMpConfig, transactions }) => {
    const [localMp, setLocalMp] = useState({
        accessToken: '', // Fica vazio para não exibir o atual por segurança
        publicKey: mpConfig?.publicKey || '',
        sandboxMode: mpConfig?.sandboxMode ?? true
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Only update publicKey and sandboxMode if mpConfig changes, accessToken is managed separately
        setLocalMp(prev => ({
            ...prev,
            publicKey: mpConfig?.publicKey || '',
            sandboxMode: mpConfig?.sandboxMode ?? true
        }));
    }, [mpConfig]);

    const handleSaveMp = async () => {
        setIsSaving(true);
        try {
            await updateMpConfig(localMp);
            alert("✅ Configurações salvas no Banco de Dados com sucesso!");
            // Limpa visualmente o access token após salvar por segurança
            setLocalMp({...localMp, accessToken: ''});
        } catch (err) {
            alert("❌ Erro ao salvar: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2rem' }}>💰</div>
                <h2 style={{ color: 'white' }}>Configurações de Pagamento</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        API MERCADO PAGO
                        <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', background: localMp.sandboxMode ? '#fbbf24' : '#22c55e', color: 'black', borderRadius: '4px', fontWeight: 900 }}>
                            {localMp.sandboxMode ? 'MODO TESTE (SANDBOX)' : 'MODO PRODUÇÃO'}
                        </span>
                    </h4>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>ACCESS TOKEN (PRODUÇÃO OU SANDBOX)</label>
                        <input
                            type="password"
                            value={localMp.accessToken}
                            onChange={(e) => setLocalMp({ ...localMp, accessToken: e.target.value })}
                            placeholder="****************************************"
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }}
                        />
                        <span style={{ fontSize: '0.65rem', color: 'var(--accent-yellow)', marginTop: '0.3rem', display: 'block' }}>Por segurança, o token salvo não é exibido. Só preencha se for alterar.</span>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>CHAVE PÚBLICA (PUBLIC KEY)</label>
                        <input
                            type="text"
                            value={localMp.publicKey}
                            onChange={(e) => setLocalMp({ ...localMp, publicKey: e.target.value })}
                            placeholder="APP_USR-..."
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1.5rem', border: '1px solid var(--industrial-border)', marginBottom: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>MODO SANDBOX</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ative para realizar testes sem cobrança real.</div>
                        </div>
                        <div
                            onClick={() => setLocalMp({ ...localMp, sandboxMode: !localMp.sandboxMode })}
                            style={{
                                width: '50px',
                                height: '26px',
                                background: localMp.sandboxMode ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                                borderRadius: '13px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: localMp.sandboxMode ? '27px' : '3px',
                                transition: 'all 0.3s'
                            }}></div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveMp}
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--primary-red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
                    </button>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>WEBHOOKS & NOTIFICAÇÕES</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Use esta URL no painel do desenvolvedor do Mercado Pago para automação de matrículas.</p>

                    <div style={{ padding: '1rem', background: 'black', borderRadius: '4px', border: '1px dashed #3b82f6', marginBottom: '1.5rem', position: 'relative' }}>
                        <code style={{ fontSize: '0.7rem', color: '#3b82f6' }}>https://sesmt-cursos.vercel.app/api/webhook/mp</code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText('https://sesmt-cursos.vercel.app/api/webhook/mp');
                                alert('URL Copiada!');
                            }}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#3b82f6', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}
                        >
                            COPIAR
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--industrial-border)', paddingTop: '1.5rem' }}>
                        <h5 style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>LOG DE OPERAÇÕES</h5>
                        <div style={{ fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {transactions.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', color: t.status === 'success' ? '#22c55e' : '#fbbf24' }}>
                                    <span>{t.status === 'success' ? '✅' : '⌛'} {t.detail}</span>
                                    <span>{t.date.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-componente para Gestão de Alunos
const AlunosTab = ({ courses }) => {
    const [data, setData] = useState({ enrollments: [], profiles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Buscar matriculas e perfis em paralelo
            const [enrRes, profRes] = await Promise.all([
                supabase.from('enrollments').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*')
            ]);

            setData({
                enrollments: enrRes.data || [],
                profiles: profRes.data || []
            });
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Carregando dados dos alunos...</div>;

    return (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--industrial-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.5rem' }}>👥</div>
                <h2 style={{ color: 'white' }}>Gestão de Alunos e Matrículas</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--industrial-border)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            <th style={{ padding: '1rem' }}>ALUNO</th>
                            <th style={{ padding: '1rem' }}>CURSO</th>
                            <th style={{ padding: '1rem' }}>DATA MATRÍCULA</th>
                            <th style={{ padding: '1rem' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.enrollments.length > 0 ? data.enrollments.map((enr, idx) => {
                            const course = courses.find(c => c.id === enr.course_id);
                            const profile = data.profiles.find(p => p.id === enr.user_id);
                            return (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ color: 'white', fontWeight: 700, textTransform: 'uppercase' }}>
                                            {profile?.full_name || 'Usuário não identificado'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{profile?.email || `ID: ${enr.user_id.substring(0, 8)}...`}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ color: 'white' }}>{course?.title || 'Curso Removido'}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(enr.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', background: '#22c55e', color: 'black', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>ATIVO</span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum aluno matriculado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LeadsTab = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setLeads(data);
            setLoading(false);
        };
        fetchLeads();
    }, []);

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
        if (!error) setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Carregando leads...</div>;

    return (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--industrial-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🎯</div>
                    <h2 style={{ color: 'white' }}>Gestão de Leads Reais</h2>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total: {leads.length} contatos</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--industrial-border)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            <th style={{ padding: '1rem' }}>NOME</th>
                            <th style={{ padding: '1rem' }}>E-MAIL</th>
                            <th style={{ padding: '1rem' }}>MENSAGEM</th>
                            <th style={{ padding: '1rem' }}>DATA</th>
                            <th style={{ padding: '1rem' }}>STATUS</th>
                            <th style={{ padding: '1rem' }}>AÇÃO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length > 0 ? leads.map((lead, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                <td style={{ padding: '1rem', color: 'white', fontWeight: 700 }}>{lead.name.toUpperCase()}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{lead.email}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.message}>
                                    {lead.message}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        background: lead.status === 'Novo' ? '#ef4444' : lead.status === 'Fechado' ? '#22c55e' : '#fbbf24',
                                        color: 'black',
                                        borderRadius: '4px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900
                                    }}>
                                        {lead.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        defaultValue={lead.status}
                                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--industrial-border)', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem' }}
                                    >
                                        <option value="Novo">Marcar Novo</option>
                                        <option value="Em Contato">Em Contato</option>
                                        <option value="Fechado">Fechado</option>
                                    </select>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum lead capturado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Sub-componente do Editor de Temas
const InterfaceTab = ({ themeConfig, updateTheme, changeThemeColor, primaryColor }) => {
    const [localTheme, setLocalTheme] = useState({
        fontFamily: 'Inter',
        logoUrl: '',
        promoBanner: { active: false, text: '' },
        socials: { whatsapp: '', instagram: '', linkedin: '' },
        contactInfo: { whatsapp: '', email: '', addressLine1: '', addressLine2: '' },
        ...themeConfig
    });

    useEffect(() => {
        if (themeConfig) setLocalTheme(themeConfig);
    }, [themeConfig]);

    const handleSave = () => {
        updateTheme(localTheme);
        alert("✅ Configurações de interface atualizadas e salvas com sucesso!");
    };

    return (
        <div style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2rem' }}>🎨</div>
                <h2 style={{ color: 'white' }}>Editor Visual do Site (Theme Builder)</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* 1. CORES */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>1. COR PRINCIPAL DA MARCA</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { val: '#ff0000', label: 'Vermelho CSE' },
                            { val: '#3b82f6', label: 'Azul Corporate' },
                            { val: '#22c55e', label: 'Verde Segurança' },
                            { val: '#fbbf24', label: 'Amarelo Alerta' },
                            { val: '#a855f7', label: 'Roxo Elite' },
                            { val: '#f97316', label: 'Laranja MKT' }
                        ].map(color => (
                            <div
                                key={color.val}
                                onClick={() => changeThemeColor(color.val)}
                                title={color.label}
                                style={{
                                    width: '45px', height: '45px', background: color.val, borderRadius: '50%',
                                    border: primaryColor === color.val ? '3px solid white' : '2px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: primaryColor === color.val ? `0 0 15px ${color.val}` : 'none',
                                    transform: primaryColor === color.val ? 'scale(1.1)' : 'scale(1)'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* 2. TIPOGRAFIA & LOGO */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>2. IDENTIDADE DA MARCA</h4>
                    
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>URL DO LOGOTIPO (PNG/SVG TRANSPARENTE)</label>
                    <input type="text" value={localTheme.logoUrl || ''} onChange={(e) => setLocalTheme({...localTheme, logoUrl: e.target.value})} placeholder="https://exemplo.com/logo.png" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px', marginBottom: '1.5rem' }} />

                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>TIPOGRAFIA (FONTE)</label>
                    <select value={localTheme.fontFamily || 'Inter'} onChange={(e) => setLocalTheme({...localTheme, fontFamily: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }}>
                        <option value="Inter">Moderno Padrão (Inter)</option>
                        <option value="Oswald">Industrial Pesado (Oswald)</option>
                        <option value="Playfair Display">Elegante/Clássico (Playfair)</option>
                    </select>
                </div>

                {/* 3. FAIXA PROMOCIONAL */}
                <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        3. FAIXA PROMOCIONAL NO TOPO
                        <div onClick={() => setLocalTheme({...localTheme, promoBanner: {...localTheme.promoBanner, active: !localTheme.promoBanner?.active}})} style={{ width: '50px', height: '26px', background: localTheme.promoBanner?.active ? '#22c55e' : 'rgba(255,255,255,0.1)', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: localTheme.promoBanner?.active ? '27px' : '3px', transition: 'all 0.3s' }}></div>
                        </div>
                    </h4>
                    
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>TEXTO DA FAIXA</label>
                    <input type="text" value={localTheme.promoBanner?.text || ''} onChange={(e) => setLocalTheme({...localTheme, promoBanner: {...localTheme.promoBanner, text: e.target.value}})} disabled={!localTheme.promoBanner?.active} placeholder="Ex: 🔥 Black Friday: Use o cupom SESMT20 para 20% OFF" style={{ width: '100%', padding: '0.8rem', background: localTheme.promoBanner?.active ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.5)', border: '1px solid var(--industrial-border)', color: localTheme.promoBanner?.active ? 'white' : 'var(--text-muted)', borderRadius: '4px' }} />
                </div>

                {/* 4. INFORMAÇÕES DE CONTATO */}
                <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>4. INFORMAÇÕES DE CONTATO E ENDEREÇO</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>E-MAIL DE ATENDIMENTO</label>
                            <input type="email" value={localTheme.contactInfo?.email || ''} onChange={(e) => setLocalTheme({...localTheme, contactInfo: {...localTheme.contactInfo, email: e.target.value}})} placeholder="contato@empresa.com.br" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>NÚMERO DO WHATSAPP (EXIBIÇÃO)</label>
                            <input type="text" value={localTheme.contactInfo?.whatsapp || ''} onChange={(e) => setLocalTheme({...localTheme, contactInfo: {...localTheme.contactInfo, whatsapp: e.target.value}})} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>ENDEREÇO (LINHA 1)</label>
                            <input type="text" value={localTheme.contactInfo?.addressLine1 || ''} onChange={(e) => setLocalTheme({...localTheme, contactInfo: {...localTheme.contactInfo, addressLine1: e.target.value}})} placeholder="Av. Principal, 1000 - Sala 4A" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>ENDEREÇO (LINHA 2 / CIDADE)</label>
                            <input type="text" value={localTheme.contactInfo?.addressLine2 || ''} onChange={(e) => setLocalTheme({...localTheme, contactInfo: {...localTheme.contactInfo, addressLine2: e.target.value}})} placeholder="São Paulo - SP" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>

                {/* 5. PANDA VIDEO CONFIG */}
                <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1', border: '1px solid var(--primary-red)' }}>
                    <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>5. INTEGRAÇÕES DE VÍDEO (PANDA VIDEO)</h4>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>SUBDOMÍNIO DA BIBLIOTECA (EX: player-vz-xxxxxx)</label>
                        <input 
                            type="text" 
                            value={localTheme.pandaSubdomain || ''} 
                            onChange={(e) => setLocalTheme({...localTheme, pandaSubdomain: e.target.value})} 
                            placeholder="player-vz-6b6561d3-c32" 
                            style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px', fontSize: '1rem', fontWeight: 700 }} 
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                            ⚠️ Este código é vital para os vídeos rodarem. Se trocar de conta no Panda Video, atualize este campo com o subdomínio que aparece no seu link de embed.
                        </p>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', background: 'var(--primary-red)', color: 'white', fontWeight: 900, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}>APLICAR E SALVAR ALTERAÇÕES</button>
        </div>
    );
};

export default Dashboard;
