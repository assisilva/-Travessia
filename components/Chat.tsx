
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";

const CHAT_USER_KEY = 'chat-user';
const MAX_MESSAGE_LENGTH = 280;

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem(CHAT_USER_KEY) || 'null');
        if (!user) {
            const userId = `user_${Math.random().toString(36).substring(2, 8)}`;
            const username = `Você`;
            user = { id: userId, username };
            localStorage.setItem(CHAT_USER_KEY, JSON.stringify(user));
        }
        setCurrentUser(user);

        // Welcome message
        setMessages([{
            id: 'welcome',
            userId: 'ai',
            username: 'Assistente da Travessia',
            text: 'Olá! Sou o assistente em tempo real da travessia Santos-VDC. Em que posso ajudar hoje?',
            timestamp: Date.now()
        }]);

        // Initialize Gemini Chat session
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `Você é o Assistente da Travessia de Catraias entre Santos e Vicente de Carvalho (Guarujá).
                Sua função é ajudar usuários com informações sobre horários, marés, navios e terminais.
                Seja prestativo, rápido e use um tom amigável.
                As catraias funcionam 24h, com interrupções apenas para manobras de navios ou marés extremas.
                Em maré alta ou baixa, o embarque é pela escadaria (o flutuante fica inacessível).`
            }
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || isThinking) return;

        const userMsgText = newMessage.trim();
        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            text: userMsgText,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setIsThinking(true);

        const aiMsgId = `ai_${Date.now()}`;
        const aiMsg: ChatMessage = {
            id: aiMsgId,
            userId: 'ai',
            username: 'Assistente da Travessia',
            text: '',
            timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, aiMsg]);

        try {
            const streamResponse = await chatRef.current.sendMessageStream({ message: userMsgText });
            let fullResponse = '';

            for await (const chunk of streamResponse) {
                const textChunk = chunk.text;
                fullResponse += textChunk;
                
                setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, text: fullResponse } : m
                ));
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, text: "Desculpe, tive um pequeno problema técnico ao processar sua resposta. Pode repetir?" } : m
            ));
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="mt-6 md:mt-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md transition-colors duration-500 overflow-hidden border border-blue-100 dark:border-gray-600">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center">
                        <div className="relative mr-3">
                            <i className="fas fa-robot text-blue-600 dark:text-blue-400 text-xl"></i>
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-600"></span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                            Assistente IA em Tempo Real
                        </h3>
                    </div>
                    <i className={`fas ${isOpen ? 'fa-chevron-down' : 'fa-chevron-up'} text-gray-500 dark:text-gray-400 transition-transform`}></i>
                </button>
                
                {isOpen && (
                    <div className="flex flex-col h-[400px]">
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex my-3 ${msg.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                                        msg.userId === currentUser?.id 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-600'
                                    }`}>
                                        <p className={`text-[10px] font-bold mb-1 uppercase tracking-tighter opacity-70 ${msg.userId === currentUser?.id ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {msg.username}
                                        </p>
                                        <div className="text-sm leading-relaxed">
                                            {msg.text || (isThinking && msg.userId === 'ai' ? (
                                                <span className="flex space-x-1 py-1">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                                </span>
                                            ) : '')}
                                        </div>
                                        <p className={`text-[10px] text-right mt-1 opacity-60`}>
                                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center space-x-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Pergunte sobre a travessia..."
                                    maxLength={MAX_MESSAGE_LENGTH}
                                    disabled={isThinking}
                                    className="w-full px-4 py-2.5 border rounded-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                    {MAX_MESSAGE_LENGTH - newMessage.length}
                                </span>
                            </div>
                            <button 
                                type="submit" 
                                className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all active:scale-90"
                                disabled={!newMessage.trim() || isThinking}
                            >
                                {isThinking ? (
                                    <i className="fas fa-circle-notch animate-spin"></i>
                                ) : (
                                    <i className="fas fa-paper-plane"></i>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
