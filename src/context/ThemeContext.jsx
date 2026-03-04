import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Carrega a cor salva ou usa o vermelho padrão da CSE
    const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('cse_theme_color') || '#ff0000');

    useEffect(() => {
        // Aplica a cor na raiz do CSS
        document.documentElement.style.setProperty('--primary-red', primaryColor);

        // Atualiza também o padrão Hazard para combinar com a nova cor
        // Convertemos hex para rgba aproximado para o padrão
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);

        const hazardPattern = `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(${r}, ${g}, ${b}, 0.1) 10px, rgba(${r}, ${g}, ${b}, 0.1) 20px)`;
        document.documentElement.style.setProperty('--hazard-pattern', hazardPattern);

        localStorage.setItem('cse_theme_color', primaryColor);
    }, [primaryColor]);

    const changeThemeColor = (color) => {
        setPrimaryColor(color);
    };

    return (
        <ThemeContext.Provider value={{ primaryColor, changeThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
