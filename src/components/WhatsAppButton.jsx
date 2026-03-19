import React from 'react';
import { useTheme } from '../context/ThemeContext';

const WhatsAppButton = () => {
    const { themeConfig } = useTheme();
    // Pega o WhatsApp formatado ou o fallback
    const rawNumber = themeConfig?.contactInfo?.whatsapp || '5541999548422';
    // Remove tudo que não for número (ex: parênteses, traços, espaços)
    const phoneNumber = rawNumber.replace(/\D/g, '');
    
    const message = 'Olá! Gostaria de mais informações sobre os treinamentos da CSE.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Contato via WhatsApp"
        >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.539 2.016 2.043-.536c.92.531 1.954.811 3.242.812 3.18 0 5.766-2.586 5.767-5.766 0-3.18-2.586-5.766-5.764-5.766zm3.375 8.169c-.14.393-.712.721-1.028.766-.316.05-.634.053-1.01-.061-.242-.073-.55-.178-.962-.355-1.756-.754-2.887-2.529-2.974-2.644-.087-.116-.711-.944-.711-1.791s.434-1.265.589-1.44c.155-.175.337-.219.45-.219s.225.002.321.007c.106.005.25-.04.391.299.144.35.495 1.205.538 1.292.043.087.072.188.014.302-.057.114-.087.188-.175.291-.088.102-.184.228-.263.306-.09.088-.184.184-.079.365.105.182.467.771.999 1.246.685.611 1.264.802 1.444.891.18.089.284.075.39-.047.105-.122.456-.531.579-.711.123-.18.245-.152.414-.09s1.071.505 1.258.599c.187.094.312.141.357.219s.045.549-.095.942z" />
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm0-2C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
        </a>
    );
};

export default WhatsAppButton;
