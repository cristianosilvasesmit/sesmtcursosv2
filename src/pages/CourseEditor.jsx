import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { courses, updateCourse, deleteCourse } = useCourses();
    const [course, setCourse] = useState(null);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', pandaVideoId: '', materialUrl: '' });
    const [showLessonForm, setShowLessonForm] = useState(false);

    useEffect(() => {
        const found = courses.find(c => c.id === id);
        if (found) {
            setCourse(found);
        }
    }, [id, courses]);

    if (!course) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>CARREGANDO...</div>;

    const handleAddLesson = (e) => {
        e.preventDefault();
        const updatedLessons = [...(course.lessons || []), { ...newLesson, id: Date.now().toString() }];
        updateCourse(course.id, { lessons: updatedLessons });
        setNewLesson({ title: '', videoUrl: '', pandaVideoId: '', materialUrl: '' });
        setShowLessonForm(false);
    };

    const handleDeleteLesson = (lessonId) => {
        const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
        updateCourse(course.id, { lessons: updatedLessons });
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'video') setNewLesson({ ...newLesson, videoUrl: url });
            if (type === 'pdf') setNewLesson({ ...newLesson, materialUrl: url });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '100px' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>← VOLTAR</Link>
                        <h1>EDITANDO: <span style={{ color: 'var(--primary-red)' }}>{course.title}</span></h1>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* COLUNA 1: PLAYLIST */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>PLAYLIST DO CURSO</h2>
                            <button
                                onClick={() => setShowLessonForm(true)}
                                style={{ background: 'var(--accent-yellow)', color: 'black', padding: '0.6rem 1.2rem', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                            >
                                + ADICIONAR AULA
                            </button>
                        </div>

                        {course.lessons?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {course.lessons.map((lesson, index) => (
                                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--industrial-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: 'var(--primary-red)', fontWeight: 900 }}>#{index + 1}</span>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {lesson.videoUrl || lesson.pandaVideoId ? '🎥 VÍDEO PRONTO' : '⚠️ SEM VÍDEO'} | {lesson.materialUrl ? '📑 PDF PRONTO' : '⚠️ SEM PDF'}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 700 }}>EXCLUIR</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--industrial-border)', borderRadius: '8px' }}>
                                Nenhuma aula cadastrada ainda.
                            </div>
                        )}
                    </div>

                    {/* COLUNA 2: DADOS DO CURSO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>CAPA E DADOS</h3>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <img src={course.image} alt="Capa" style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--industrial-border)' }} />
                                <label htmlFor="hero-upload" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary-red)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>ALTERAR FOTO</label>
                                <input id="hero-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => updateCourse(course.id, { image: reader.result });
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.4rem' }}>TÍTULO</label>
                                    <input type="text" value={course.title} onChange={(e) => updateCourse(course.id, { title: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', fontWeight: 700 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.4rem' }}>PREÇO (R$)</label>
                                    <input type="text" value={course.price} onChange={(e) => updateCourse(course.id, { price: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', fontWeight: 700 }} />
                                </div>
                                <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255, 68, 68, 0.3)', marginTop: '1rem' }}>
                                    <button onClick={async () => { if (window.confirm("⚠️ EXCLUIR CURSO?")) { await deleteCourse(course.id); navigate('/dashboard'); } }} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>EXCLUIR CURSO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL NOVA AULA */}
                {showLessonForm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>NOVA AULA</h2>
                            <form onSubmit={handleAddLesson}>
                                <input required type="text" placeholder="TÍTULO" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', marginBottom: '1rem' }} />
                                <input required type="text" placeholder="ID PANDA VIDEO" value={newLesson.pandaVideoId} onChange={(e) => {
                                    const val = e.target.value;
                                    let finalId = val;
                                    if (val.includes('v=')) finalId = val.match(/v=([a-zA-Z0-9-]+)/)?.[1] || val;
                                    else if (val.includes('<iframe')) finalId = val.match(/embed\/\?v=([a-zA-Z0-9-]+)/)?.[1] || val;
                                    setNewLesson({ ...newLesson, pandaVideoId: finalId });
                                }} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-red)', borderRadius: '4px', color: 'white', marginBottom: '1rem' }} />
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
