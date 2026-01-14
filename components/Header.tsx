
import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    isOnline: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    user?: { name: string; email: string } | null;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isOnline, theme, toggleTheme, user, onLogout }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-500 border-b dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-4xl">
                <div className="flex items-center space-x-3">
                     <i className="fas fa-ship text-2xl text-blue-600"></i>
                    <h1 className="text-lg md:text-xl font-extrabold text-gray-800 dark:text-white leading-tight">
                        Alerta Travessia VDC <span className="text-blue-600">⇄</span> Santos
                    </h1>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                    {user && (
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Usuário</span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name.split(' ')[0]}</span>
                        </div>
                    )}
                    
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                    
                    {onLogout && (
                        <button 
                            onClick={onLogout}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Sair da conta"
                        >
                            <i className="fas fa-sign-out-alt text-lg"></i>
                        </button>
                    )}

                    <div className="flex items-center space-x-2 text-sm font-semibold transition-all">
                        <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
