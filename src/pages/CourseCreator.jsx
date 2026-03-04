import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const CourseCreator = () => {
    const { addCourse } = useCourses();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Norma Regulamentadora',
        duration: '',
        price: '',
        description: '',
        image: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await addCourse(formData);
            navigate('/cursos');
        } catch (err) {
            console.error("Erro ao criar curso:", err);
            alert("Erro ao salvar curso no banco de dados.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>← VOLTAR</Link>
                    <h1 style={{ fontSize: '2.5rem' }}>CRIAR NOVO <span style={{ color: 'var(--primary-red)' }}>CURSO</span></h1>
                </div>

                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>TÍTULO DO CURSO</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: NR10 - SEGURANÇA EM ELÉTRICA"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>CATEGORIA</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }}
                                >
                                    <option value="Normas Regulamentadoras">Norma Regulamentadora (NR)</option>
                                    <option value="Resgate e Emergência">Resgate e Emergência</option>
                                    <option value="Segurança do Trabalho">Segurança do Trabalho</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>PREÇO (R$)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: 450,00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>CARGA HORÁRIA</label>
                            <input
                                placeholder="Ex: 40h"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>CAPA DO CURSO</label>

                            <input
                                type="text"
                                placeholder="Cole a URL da Imagem (Ex: https://...)"
                                value={formData.image?.startsWith('data:') ? '' : formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', marginBottom: '1rem' }}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--industrial-border)' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OU RE-SUBIR ARQUIVO</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--industrial-border)' }}></div>
                            </div>

                            <div style={{
                                border: '2px dashed var(--industrial-border)',
                                padding: '2rem',
                                textAlign: 'center',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.02)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📁</div>
                                            <p style={{ color: 'var(--text-muted)' }}>Clique para selecionar a imagem do curso</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>DESCRIÇÃO BREVE</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--industrial-border)', borderRadius: '4px', color: 'white', resize: 'none' }}
                            ></textarea>
                        </div>

                        <button style={{ width: '100%', padding: '1.2rem', background: 'var(--primary-red)', color: 'white', fontWeight: 900, borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                            PUBLICAR CURSO NO SITE
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CourseCreator;
