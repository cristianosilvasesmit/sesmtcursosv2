import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const defaultTheme = {
        primaryColor: '#ff0000',
        fontFamily: 'Inter',
        logoUrl: '',
        promoBanner: { active: false, text: 'TREINAMENTOS ONLINE E PRESENCIAIS - INSCRIÇÕES ABERTAS' },
        socials: { whatsapp: '5541999548422', instagram: '', linkedin: '' },
        contactInfo: {
            whatsapp: '(11) 9999-9999',
            email: 'cursos@treinamentos.com.br',
            addressLine1: 'Av. Industrial, 1500 - Sala 402',
            addressLine2: 'São Paulo - SP'
        }
    };

    const [themeConfig, setThemeConfig] = useState(() => {
        const saved = localStorage.getItem('cse_theme_config');
        if (saved) {
            try { return { ...defaultTheme, ...JSON.parse(saved) }; } catch(e) {}
        }
        const oldColor = localStorage.getItem('cse_theme_color');
        if (oldColor) return { ...defaultTheme, primaryColor: oldColor };
        return defaultTheme;
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-red', themeConfig.primaryColor);
        document.body.style.fontFamily = `"${themeConfig.fontFamily}", sans-serif`;

        const r = parseInt(themeConfig.primaryColor.slice(1, 3), 16);
        const g = parseInt(themeConfig.primaryColor.slice(3, 5), 16);
        const b = parseInt(themeConfig.primaryColor.slice(5, 7), 16);
        const hazardPattern = `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(${r}, ${g}, ${b}, 0.1) 10px, rgba(${r}, ${g}, ${b}, 0.1) 20px)`;
        document.documentElement.style.setProperty('--hazard-pattern', hazardPattern);

        localStorage.setItem('cse_theme_config', JSON.stringify(themeConfig));
    }, [themeConfig]);

    const updateTheme = (updates) => {
        setThemeConfig(prev => ({ ...prev, ...updates }));
    };

    const primaryColor = themeConfig.primaryColor;
    const changeThemeColor = (color) => updateTheme({ primaryColor: color });

    return (
        <ThemeContext.Provider value={{ primaryColor, changeThemeColor, themeConfig, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
