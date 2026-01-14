
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CrossingStatus, TideLevel, HistoryEntry, TideEvent, InterruptionType, DailyTideForecast } from './types';
import Header from './components/Header';
import StatusDisplay from './components/StatusDisplay';
import ConditionCard from './components/ConditionCard';
import HistoryLog from './components/HistoryLog';
import { TideIcon } from './components/Icons';
import Controls from './components/Controls';
import TideForecast from './components/TideForecast';
import Chat from './components/Chat';
import AuthScreen from './components/AuthScreen';
import QuayMap from './components/QuayMap';

const USER_DATA_KEY = 'alerta_travessia_user';

// --- Tide Prediction API Simulation ---
const fetchTideForecastApi = async (): Promise<{ date: Date; events: Omit<TideEvent, 'time'>[] }[]> => {
    const forecastDays = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const daySeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        const customRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const events: Omit<TideEvent, 'time'>[] = [];
        let startHour = 3 + customRandom(daySeed) * 4;
        let startType: 'Alta' | 'Baixa' = customRandom(daySeed + 1) > 0.5 ? 'Alta' : 'Baixa';

        for (let j = 0; j < 4; j++) {
            const eventDate = new Date(date);
            const timeOffset = startHour + j * 6.2;
            const hour = Math.floor(timeOffset) % 24;
            const minute = Math.floor((timeOffset - Math.floor(timeOffset)) * 60);
            eventDate.setHours(hour, minute);

            const type = (j % 2 === 0) ? startType : (startType === 'Alta' ? 'Baixa' : 'Alta');
            const height = type === 'Alta' ? 1.0 + customRandom(daySeed + j + 2) * 0.5 : 0.1 + customRandom(daySeed + j + 3) * 0.4;

            events.push({
                type,
                dateTime: eventDate,
                height: parseFloat(height.toFixed(2)),
            });
        }
        forecastDays.push({ date, events });
    }
    return Promise.resolve(forecastDays);
};

// Limiares atualizados conforme pedido do usuário
const HIGH_TIDE_THRESHOLD = 1.15;
const LOW_TIDE_THRESHOLD = 0.46;

const calculateCurrentTideLevel = (todaysForecast: TideEvent[]): TideLevel => {
    if (!todaysForecast || todaysForecast.length === 0) return TideLevel.INTERMEDIARIA;
    const now = new Date();
    let prevEvent: TideEvent | null = null;
    let nextEvent: TideEvent | null = null;

    for (const event of todaysForecast) {
        if (event.dateTime <= now) prevEvent = event;
        if (event.dateTime > now && !nextEvent) nextEvent = event;
    }

    if (!prevEvent) prevEvent = todaysForecast[todaysForecast.length - 1];
    if (!nextEvent) nextEvent = todaysForecast[0];

    const timeSincePrev = now.getTime() - prevEvent.dateTime.getTime();
    const timeBetweenEvents = nextEvent.dateTime.getTime() - prevEvent.dateTime.getTime();

    if (timeBetweenEvents <= 0) {
        return prevEvent.height >= HIGH_TIDE_THRESHOLD ? TideLevel.ALTA : (prevEvent.height <= LOW_TIDE_THRESHOLD ? TideLevel.BAIXA : TideLevel.INTERMEDIARIA);
    }

    const progress = timeSincePrev / timeBetweenEvents;
    const heightDifference = nextEvent.height - prevEvent.height;
    const interpolatedHeight = prevEvent.height + heightDifference * (1 - Math.cos(progress * Math.PI)) / 2;

    if (interpolatedHeight >= HIGH_TIDE_THRESHOLD) return TideLevel.ALTA;
    if (interpolatedHeight <= LOW_TIDE_THRESHOLD) return TideLevel.BAIXA;
    return TideLevel.INTERMEDIARIA;
};

const App: React.FC = () => {
    const [user, setUser] = useState<{name: string, email: string} | null>(() => {
        const saved = localStorage.getItem(USER_DATA_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    const [crossingStatus, setCrossingStatus] = useState<CrossingStatus>(CrossingStatus.LIBERADA);
    const [tideLevel, setTideLevel] = useState<TideLevel>(TideLevel.INTERMEDIARIA);

    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [tideForecast, setTideForecast] = useState<DailyTideForecast[]>([]);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(Notification.permission === 'granted');
    const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
    const [tideStatusPreview, setTideStatusPreview] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.theme) return localStorage.theme;
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    const alertAudioRef = useRef<HTMLAudioElement | null>(null);
    const tideLevelRef = useRef(tideLevel);

    useEffect(() => {
        tideLevelRef.current = tideLevel;
    }, [tideLevel]);

    useEffect(() => {
        const root = window.document.documentElement;
        theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const handleLogin = (name: string, email: string) => {
        const userData = { name, email };
        setUser(userData);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        localStorage.setItem('chat-user', JSON.stringify({ id: `user_${Date.now()}`, username: name }));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem('chat-user');
    };

    const updateStatus = useCallback((currentTide: TideLevel) => {
        let newStatus: CrossingStatus;
        let reason = '';
        let type: InterruptionType | null = null;

        if (currentTide === TideLevel.ALTA) {
            newStatus = CrossingStatus.ATENCAO;
            reason = 'Maré Alta (≥ 1.15m): Desembarque na Escadaria do Cais.';
            type = 'MARÉ ALTA';
        } else if (currentTide === TideLevel.BAIXA) {
            newStatus = CrossingStatus.ATENCAO;
            reason = 'Maré Baixa (≤ 0.46m): Desembarque na Escadaria do Cais.';
            type = 'MARÉ BAIXA';
        } else {
            newStatus = CrossingStatus.LIBERADA;
            reason = 'Operação Normal: Desembarque na Bacia do Mercado.';
        }

        setCrossingStatus(prev => {
            if (newStatus !== prev) {
                if (newStatus !== CrossingStatus.LIBERADA && type) {
                    const newEntry: HistoryEntry = { timestamp: new Date(), reason, type };
                    setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 20));
                    
                    if (notificationsEnabled) {
                        new Notification('Alerta de Travessia', { body: reason, icon: '/favicon.ico' });
                    }
                    if (soundEnabled && alertAudioRef.current) {
                        alertAudioRef.current.play().catch(e => console.error(e));
                    }
                }
                return newStatus;
            }
            return prev;
        });
    }, [notificationsEnabled, soundEnabled]);
    
    useEffect(() => {
        try {
            const lastState = JSON.stringify({
                crossingStatus, tideLevel,
                history: history.length > 0 ? [history[0]] : []
            });
            localStorage.setItem('crossing-status', lastState);
        } catch (error) {}
    }, [crossingStatus, tideLevel, history]);
    
    useEffect(() => {
        const loadAppData = async () => {
            try {
                const savedState = localStorage.getItem('crossing-status');
                if (savedState) {
                    const data = JSON.parse(savedState);
                    setCrossingStatus(data.crossingStatus);
                    setTideLevel(data.tideLevel);
                    if(data.history?.[0]) setHistory([{...data.history[0], timestamp: new Date(data.history[0].timestamp)}]);
                }
            } catch(e) {}

            const apiForecast = await fetchTideForecastApi();
            setTideForecast(apiForecast.map(day => ({
                date: day.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                dayOfWeek: day.date.toLocaleDateString('pt-BR', { weekday: 'long' }),
                forecast: day.events.map(event => ({
                    ...event,
                    time: event.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                })).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()),
            })));
        };
        loadAppData();
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        alertAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (tideForecast.length === 0) return;
        const updateTideState = () => {
            const today = tideForecast[0].forecast;
            const level = calculateCurrentTideLevel(today);
            setTideLevel(level);
            const now = new Date();
            let next = today.find(e => e.dateTime > now) || today[0];
            let last = [...today].reverse().find(e => e.dateTime <= now) || today[today.length-1];
            setTideStatusPreview(`${last.type === 'Alta' ? 'Vazante' : 'Enchente'} - Próxima ${next.type.toLowerCase()} às ${next.time}`);
            updateStatus(level);
        };
        updateTideState();
        const tideInterval = setInterval(updateTideState, 60000);
        return () => clearInterval(tideInterval);
    }, [tideForecast, updateStatus]);

    const getReason = () => {
        if (tideLevel === TideLevel.ALTA) return 'Maré Alta (≥ 1.15m): Desembarque na Escadaria do Cais.';
        if (tideLevel === TideLevel.BAIXA) return 'Maré Baixa (≤ 0.46m): Desembarque na Escadaria do Cais.';
        return 'Operação Normal: Desembarque na Bacia do Mercado.';
    };

    const getTideColor = () => {
        if (tideLevel === TideLevel.ALTA) return 'text-orange-500';
        if (tideLevel === TideLevel.BAIXA) return 'text-yellow-500';
        return 'text-blue-500';
    };

    if (!user) {
        return <AuthScreen onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-500">
            <Header 
                isOnline={isOnline} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                user={user} 
                onLogout={handleLogout} 
            />
            <main className="container mx-auto p-4 md:p-6 max-w-4xl">
                <StatusDisplay status={crossingStatus} reason={getReason()} />
                
                <div className="my-6">
                    <ConditionCard title="Situação da Maré" icon={<TideIcon className={`w-8 h-8 ${getTideColor()}`} />} value={`Maré ${tideLevel === TideLevel.ALTA ? 'Alta' : tideLevel === TideLevel.BAIXA ? 'Baixa' : 'Intermediária'}`} valueColor={getTideColor()} details={tideStatusPreview} />
                </div>

                <QuayMap tideLevel={tideLevel} />
                
                <TideForecast dailyForecasts={tideForecast} />
                <Controls notificationsEnabled={notificationsEnabled} soundEnabled={soundEnabled} onRequestNotifications={async () => {
                    if (!('Notification' in window)) return;
                    const permission = await Notification.requestPermission();
                    setNotificationsEnabled(permission === 'granted');
                }} onToggleSound={() => setSoundEnabled(!soundEnabled)} />
                <Chat />
                <HistoryLog history={history} />
            </main>
        </div>
    );
};

export default App;
