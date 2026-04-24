import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { courses, updateCourse } = useCourses();
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
            // Simulação de upload local
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
                    {/* Lista de Aulas */}
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
                                                    {lesson.videoUrl ? '🎥 VÍDEO PRONTO' : '⚠️ SEM VÍDEO'} | {lesson.materialUrl ? '📑 PDF PRONTO' : '⚠️ SEM PDF'}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 700 }}>EXCLUIR</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--industrial-border)', borderRadius: '8px' }}>
                                Nenhuma aula cadastrada ainda. Comece adicionando o conteúdo acima.
                            </div>
                        )}
                    </div>

                    {/* Basic Info Preview & Capa Editor */}
                    <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>RESUMO & CAPA</h3>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <img src={course.image} alt="Capa" style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--industrial-border)' }} />
                            <label
                                htmlFor="hero-upload"
                                style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary-red)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                            >
                                ALTERAR FOTO
                            </label>
                            <input
                                id="hero-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            updateCourse(course.id, { image: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>OU COLE A URL DA IMAGEM</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={course.image?.startsWith('data:') ? '' : course.image}
                                onChange={(e) => updateCourse(course.id, { image: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                <span style={{ color: '#22c55e', fontWeight: 700 }}>● ATIVO</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Preço:</span>
                                <input
                                    type="text"
                                    value={course.price}
                                    onChange={(e) => updateCourse(course.id, { price: e.target.value })}
                                    style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 700, textAlign: 'right', width: '80px', borderBottom: '1px dashed var(--industrial-border)' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Nova Aula */}
            {showLessonForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>NOVA <span style={{ color: 'var(--primary-red)' }}>AULA</span></h2>
                        <form onSubmit={handleAddLesson}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>TÍTULO DA AULA</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Primeiros Passos no Resgate"
                                    value={newLesson.title}
                                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value.toUpperCase() })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }}
                                />
                            </div>

                             <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>VÍDEO DA AULA (ID PANDA VIDEO)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: panda-vz-xxxxx-xxxxx"
                                        value={newLesson.pandaVideoId}
                                        onChange={(e) => setNewLesson({ ...newLesson, pandaVideoId: e.target.value, videoUrl: '' })}
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-red)', borderRadius: '4px', color: 'white', fontSize: '1.1rem', fontWeight: 900 }}
                                    />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>* Obrigatório para aulas em vídeo. O ID é encontrado no painel do Panda Video.</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>PDF DE APOIO (OPCIONAL)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Link direto para o PDF ou Drive"
                                        value={newLesson.materialUrl}
                                        onChange={(e) => setNewLesson({ ...newLesson, materialUrl: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                                    />
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleFileUpload(e, 'pdf')}
                                        style={{ width: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                                    />
                                </div>
                                {newLesson.materialUrl?.startsWith('blob:') && <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '0.5rem' }}>✓ PDF LOCAL CARREGADO</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowLessonForm(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--industrial-border)', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>CANCELAR</button>
                                <button type="submit" style={{ flex: 2, padding: '1rem', background: 'var(--primary-red)', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer', borderRadius: '4px' }}>SALVAR LIÇÃO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseEditor;
