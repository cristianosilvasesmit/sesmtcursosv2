import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { courses, checkOwnership } = useCourses();
    const { primaryColor, changeThemeColor } = useTheme();
    const navigate = useNavigate();
    const [courseProgress, setCourseProgress] = useState({});
    const [activeTab, setActiveTab] = useState('cursos'); // 'cursos', 'alunos', 'leads', 'interface'

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '12px', height: '40px', background: 'var(--primary-red)' }}></div>
                            <h1 style={{ fontSize: '2rem', letterSpacing: '1px' }}>
                                PAINEL <span style={{ color: 'var(--primary-red)' }}>{user?.role === 'admin' ? 'ESTRATÉGICO' : 'DO ALUNO'}</span>
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '27px' }}>
                            Logado como: <span style={{ color: 'white', fontWeight: 700 }}>{user?.name}</span>
                        </p>
                    </div>
                    <button onClick={handleLogout} style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--industrial-border)', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        ENCERRAR SESSÃO
                    </button>
                </div>

                {user?.role === 'admin' && (
                    <>
                        {/* KPIs - Command Center Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            {[
                                { label: 'TOTAL ALUNOS', value: '1,248', color: '#3b82f6', icon: '👥' },
                                { label: 'VENDAS MÊS', value: 'R$ 15.4k', color: '#22c55e', icon: '💰' },
                                { label: 'LEADS HOJE', value: '12', color: 'var(--accent-yellow)', icon: '🔥' },
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
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--industrial-border)', paddingBottom: '1px' }}>
                            {[
                                { id: 'cursos', label: 'GESTÃO DE CURSOS', icon: '📚' },
                                { id: 'alunos', label: 'ALUNOS & MATRÍCULAS', icon: '👥' },
                                { id: 'leads', label: 'CENTRAL DE LEADS', icon: '🎯' },
                                { id: 'interface', label: 'INTERFACE / PERSONALIZAÇÃO', icon: '🎨' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '30px', height: '2px', background: 'var(--primary-red)' }}></div>
                                {user?.role === 'admin' ? 'CURSOS DISPONÍVEIS NA PLATAFORMA' : 'MEUS TREINAMENTOS'}
                            </h2>
                            {user?.role === 'admin' && (
                                <Link to="/create-course" style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-red)', color: 'white', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}>
                                    + NOVO CURSO
                                </Link>
                            )}
                        </div>

                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
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
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Gestão de Alunos</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Lista de matriculados e progresso individual em desenvolvimento.</p>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Central de Leads</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Contatos interessados vindos da Home aparecerão aqui.</p>
                        <Link to="/leads" style={{ marginTop: '2rem', display: 'inline-block', padding: '1rem 2.5rem', background: 'var(--primary-red)', color: 'white', borderRadius: '4px', fontWeight: 900, textDecoration: 'none' }}>ABRIR GERENCIADOR DE LEADS</Link>
                    </div>
                )}

                {activeTab === 'interface' && (
                    <div style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '2rem' }}>🎨</div>
                            <h2 style={{ color: 'white' }}>Personalização da Plataforma</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>CORES PRINCIPAIS</h4>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {[
                                        { val: '#ff0000', label: 'Vermelho CSE' },
                                        { val: '#3b82f6', label: 'Azul Industrial' },
                                        { val: '#22c55e', label: 'Verde Segurança' },
                                        { val: '#fbbf24', label: 'Amarelo Alerta' },
                                        { val: '#a855f7', label: 'Roxo Elite' }
                                    ].map(color => (
                                        <div
                                            key={color.val}
                                            onClick={() => changeThemeColor(color.val)}
                                            title={color.label}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                background: color.val,
                                                borderRadius: '50%',
                                                border: primaryColor === color.val ? '3px solid white' : '2px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: primaryColor === color.val ? `0 0 15px ${color.val}` : 'none',
                                                transform: primaryColor === color.val ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                                    A cor selecionada será aplicada em todos os botões, ícones e destaques do site.
                                </p>
                            </div>

                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '1.5rem' }}>BANNER PRINCIPAL</h4>
                                <input type="text" placeholder="URL da Imagem de Fundo" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }} />
                                <button style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: 'white', color: 'black', fontWeight: 900, border: 'none', borderRadius: '4px' }}>SALVAR ALTERAÇÕES</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
