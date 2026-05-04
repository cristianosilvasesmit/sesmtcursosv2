import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { courses, updateCourse, deleteCourse } = useCourses();
    
    const [course, setCourse] = useState(null);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [newLesson, setNewLesson] = useState({ 
        title: '', 
        pandaVideoId: '', 
        materialUrl: '',
        description: '' 
    });

    useEffect(() => {
        const found = courses.find(c => c.id === id);
        if (found) setCourse(found);
    }, [id, courses]);

    if (!course) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>CARREGANDO...</div>;

    const handleAddLesson = (e) => {
        e.preventDefault();
        const updatedLessons = [...(course.lessons || []), { ...newLesson, id: Date.now().toString() }];
        updateCourse(course.id, { lessons: updatedLessons });
        setNewLesson({ title: '', pandaVideoId: '', materialUrl: '', description: '' });
        setShowLessonForm(false);
    };

    const handleDeleteLesson = (lessonId) => {
        const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
        updateCourse(course.id, { lessons: updatedLessons });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setNewLesson({ ...newLesson, materialUrl: url });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '100px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>← VOLTAR</Link>
                        <h1 style={{ fontSize: '1.8rem' }}>EDITANDO: <span style={{ color: 'var(--primary-red)' }}>{course.title}</span></h1>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* COLUNA 1: PLAYLIST */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>PLAYLIST DE AULAS</h2>
                            <button 
                                onClick={() => setShowLessonForm(true)}
                                style={{ background: 'var(--accent-yellow)', color: 'black', padding: '0.6rem 1.2rem', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                            >
                                + NOVA AULA
                            </button>
                        </div>

                        {course.lessons?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {course.lessons.map((lesson, index) => (
                                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: 'var(--primary-red)', fontWeight: 900 }}>#{index + 1}</span>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                                    {lesson.pandaVideoId ? '🎥 VÍDEO OK' : '⚠️ SEM VÍDEO'} | {lesson.materialUrl ? '📑 PDF OK' : '⚠️ SEM PDF'}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 700 }}>EXCLUIR</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '2px dashed var(--industrial-border)', borderRadius: '8px' }}>
                                Nenhuma aula cadastrada.
                            </div>
                        )}
                    </div>

                    {/* COLUNA 2: CONFIGURAÇÕES */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>DADOS DO CURSO</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem' }}>TÍTULO</label>
                                    <input type="text" value={course.title} onChange={(e) => updateCourse(course.id, { title: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem' }}>PREÇO (R$)</label>
                                    <input type="text" value={course.price} onChange={(e) => updateCourse(course.id, { price: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }} />
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--industrial-border)' }}>
                                    <button 
                                        onClick={async () => { if (window.confirm("Deseja mesmo excluir o curso?")) { await deleteCourse(course.id); navigate('/dashboard'); } }} 
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        EXCLUIR CURSO
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL NOVA AULA */}
                {showLessonForm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>NOVA AULA</h2>
                            <form onSubmit={handleAddLesson}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>TÍTULO DA AULA</label>
                                    <input required type="text" placeholder="Ex: Primeiros Passos" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }} />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>ID DO VÍDEO (PANDA OU YT)</label>
                                    <input required type="text" placeholder="Cole o ID ou Iframe" value={newLesson.pandaVideoId} onChange={(e) => {
                                        const val = e.target.value;
                                        let finalId = val;
                                        if (val.includes('v=')) finalId = val.match(/v=([a-zA-Z0-9-]+)/)?.[1] || val;
                                        else if (val.includes('<iframe')) finalId = val.match(/embed\/\?v=([a-zA-Z0-9-]+)/)?.[1] || val;
                                        setNewLesson({ ...newLesson, pandaVideoId: finalId });
                                    }} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-red)', borderRadius: '4px', color: 'white' }} />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>TÓPICOS DA AULA / DESCRIÇÃO</label>
                                    <textarea 
                                        rows="4" 
                                        placeholder="Liste os principais tópicos abordados nesta aula..." 
                                        value={newLesson.description} 
                                        onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })} 
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', resize: 'none' }} 
                                    />
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>* Esse texto aparecerá para o aluno na aba "Tópicos da Aula".</p>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>PDF DE APOIO (OPCIONAL)</label>
                                    <input type="text" placeholder="URL do PDF" value={newLesson.materialUrl} onChange={(e) => setNewLesson({ ...newLesson, materialUrl: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', marginBottom: '0.5rem' }} />
                                    <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowLessonForm(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--industrial-border)', color: 'white', borderRadius: '4px' }}>CANCELAR</button>
                                    <button type="submit" style={{ flex: 1, padding: '1rem', background: 'var(--primary-red)', border: 'none', color: 'white', fontWeight: 900, borderRadius: '4px' }}>SALVAR</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseEditor;
