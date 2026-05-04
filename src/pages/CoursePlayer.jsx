import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const CoursePlayer = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { courses } = useCourses();
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [activeTab, setActiveTab] = useState('TÓPICOS DA AULA');
    const [notes, setNotes] = useState({});
    const [completedLessons, setCompletedLessons] = useState([]);
    const notesTimeoutRef = useRef(null);

    // 1. Carregar Progresso e Anotações do Supabase
    useEffect(() => {
        if (!user || !user.id || !id) return;

        const loadUserData = async () => {
            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', id);

            if (!error && data) {
                const newNotes = {};
                const completed = [];
                data.forEach(item => {
                    if (item.notes) newNotes[item.lesson_id] = item.notes;
                    if (item.is_completed) completed.push(item.lesson_id);
                });
                setNotes(newNotes);
                setCompletedLessons(completed);
            }
        };

        loadUserData();
    }, [user, id]);

    useEffect(() => {
        const found = courses.find(c => c.id === id);
        if (found) {
            setCourse(found);
            if (found.lessons?.length > 0 && !activeLesson) {
                setActiveLesson(found.lessons[0]);
            }
        }
    }, [id, courses, activeLesson]);

    const toggleLessonStatus = async (lessonId) => {
        if (!user || !user.id) return;

        const isCompleted = completedLessons.includes(lessonId);
        const newStatus = !isCompleted;

        try {
            // Upsert no Supabase
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    course_id: id,
                    lesson_id: lessonId,
                    is_completed: newStatus
                }, { onConflict: 'user_id, course_id, lesson_id' });

            if (error) throw error;

            setCompletedLessons(prev =>
                newStatus ? [...prev, lessonId] : prev.filter(lid => lid !== lessonId)
            );
        } catch (err) {
            console.error("Erro ao salvar progresso:", err.message);
        }
    };

    if (!course) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>CARREGANDO AMBIENTE...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', flexDirection: 'column' }}>
            {/* Header Player */}
            <div style={{ background: '#111112', borderBottom: '1px solid var(--industrial-border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>← SAIR DO PLAYER</Link>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-red)', fontWeight: 900 }}>ESTUDANDO AGORA</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{course.title}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', flex: 1 }}>
                {/* Area Central do Video */}
                <div style={{ background: 'black', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                        {activeLesson ? (
                            activeLesson.pandaVideoId ? (
                                <div style={{ width: '100%', height: '100%', minHeight: '60vh', position: 'relative' }}>
                                    <iframe
                                        id="panda-player"
                                        src={`https://player-vz-6b6561d3-c32.tv.pandavideo.com.br/embed/?v=${activeLesson.pandaVideoId}`}
                                        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                        allowFullScreen={true}
                                    ></iframe>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
                                    <h2 style={{ color: 'var(--text-muted)' }}>Vídeo em processamento ou não disponível.</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O instrutor está subindo este conteúdo para o Panda Video.</p>
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                                <h2 style={{ color: 'var(--text-muted)' }}>Selecione uma aula ao lado para começar.</h2>
                            </div>
                        )}
                    </div>

                    {/* Info da Aula e Downloads */}
                    <div style={{ background: '#111112', padding: '2rem', borderBottom: '1px solid var(--industrial-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{activeLesson?.title || 'BEM-VINDO AO CURSO'}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Centro de Segurança e Emergências - Treinamento de Elite</p>
                            </div>

                            {activeLesson && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => toggleLessonStatus(activeLesson.id)}
                                        style={{
                                            background: completedLessons.includes(activeLesson.id) ? '#22c55e' : 'transparent',
                                            color: completedLessons.includes(activeLesson.id) ? 'white' : 'var(--text-muted)',
                                            border: '1px solid ' + (completedLessons.includes(activeLesson.id) ? '#22c55e' : 'var(--industrial-border)'),
                                            padding: '1rem 1.5rem',
                                            borderRadius: '4px',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {completedLessons.includes(activeLesson.id) ? '✓ CONCLUÍDA' : 'MARCAR COMO CONCLUÍDA'}
                                    </button>

                                    {activeLesson?.materialUrl && (
                                        <a
                                            href={activeLesson.materialUrl}
                                            download
                                            style={{ background: 'var(--accent-yellow)', color: 'black', padding: '1rem 1.5rem', borderRadius: '4px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                                        >
                                            📥 BAIXAR MATERIAL (PDF)
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Abas de Interação */}
                        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                            {['TÓPICOS DA AULA', 'MEU CADERNO'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '1rem 0',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab ? '2px solid var(--primary-red)' : '2px solid transparent',
                                        color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                        fontWeight: 900,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo da Aba Ativa */}
                        {activeTab === 'TÓPICOS DA AULA' ? (
                            <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                                <p style={{ marginBottom: '1rem' }}>Esta lição aborda os procedimentos operacionais padrão para situações críticas.</p>
                                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <li>Identificação prematura de riscos operacionais.</li>
                                    <li>Uso correto dos equipamentos de proteção individual (EPI).</li>
                                    <li>Protocolos de comunicação em emergências.</li>
                                    <li>Relatório de incidentes e pós-operação.</li>
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    placeholder="Escreva suas anotações pessoais sobre esta aula aqui..."
                                    value={activeLesson?.id ? (notes[activeLesson.id] || '') : ''}
                                    onChange={(e) => {
                                        if (!user || !user.id || !activeLesson?.id) return;
                                        const newValue = e.target.value;
                                        const lessonId = activeLesson.id;

                                        // Update local state immediately
                                        const newNotes = { ...notes, [lessonId]: newValue };
                                        setNotes(newNotes);

                                        // Debounce save to Supabase
                                        if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
                                        notesTimeoutRef.current = setTimeout(async () => {
                                            try {
                                                await supabase.from('user_progress').upsert({
                                                    user_id: user.id,
                                                    course_id: id,
                                                    lesson_id: lessonId,
                                                    notes: newValue
                                                }, { onConflict: 'user_id, course_id, lesson_id' });
                                            } catch (err) {
                                                console.error("Erro ao salvar nota:", err.message);
                                            }
                                        }, 1000);
                                    }}
                                    style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--industrial-border)', borderRadius: '8px', padding: '1.5rem', color: 'white', resize: 'none', fontSize: '0.9rem', outline: 'none' }}
                                />
                                <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 700 }}>✓ SUAS ANOTAÇÕES SÃO SALVAS AUTOMATICAMENTE NA NUVEM</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar de Lições */}
                <div style={{ background: '#111112', borderLeft: '1px solid var(--industrial-border)', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--industrial-border)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>CONTEÚDO DO CURSO</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{course.lessons?.length || 0} aulas disponíveis</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {course.lessons?.map((lesson, index) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    background: activeLesson?.id === lesson.id ? 'rgba(255,0,0,0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    color: 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    borderLeft: activeLesson?.id === lesson.id ? '4px solid var(--primary-red)' : '4px solid transparent'
                                }}
                            >
                                <span style={{ opacity: activeLesson?.id === lesson.id ? 1 : 0.3, fontWeight: 900, color: completedLessons.includes(lesson.id) ? '#22c55e' : 'inherit' }}>
                                    {completedLessons.includes(lesson.id) ? '✓' : String(index + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <div style={{ fontWeight: activeLesson?.id === lesson.id ? 900 : 500 }}>{lesson.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        {lesson.videoUrl ? 'VÍDEO' : 'TEXTO'}
                                        {lesson.materialUrl && ' • PDF'}
                                    </div>
                                </div>
                            </button>
                        ))}

                        {course.lessons?.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Nenhuma aula disponível ainda.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
