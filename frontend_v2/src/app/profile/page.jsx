
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../../../components/Navbar.jsx";
import { useI18n, getFontClass } from "../../../components/I18nProvider";
import { useUser } from "../../components/UserContext";

export default function Profile() {
    const router = useRouter();
    const { t, lang, setLang } = useI18n();
    const { user, loading: userLoading } = useUser();
    
    // Page load animation state
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [cases, setCases] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalCases: 0,
        activeCases: 0,
        completedTasks: 0,
        pendingTasks: 0,
        documentsUploaded: 0,
        hoursLogged: 0
    });
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    // Professional quotes for different languages
    const quotes = {
        English: [
            "Justice delayed is justice denied. - William E. Gladstone",
            "The law is not a light for you or any man to see by; the law is not a shelter for you or any man to hide behind. - Ayn Rand",
            "In matters of truth and justice, there is no difference between large and small problems, for issues concerning the treatment of people are all the same. - Albert Einstein"
        ],
        Hindi: [
            "न्याय में देरी न्याय से इनकार है।",
            "कानून सभी के लिए समान होना चाहिए।",
            "सत्य और न्याय के मामलों में, बड़ी और छोटी समस्याओं के बीच कोई अंतर नहीं है।"
        ],
        Marathi: [
            "न्यायात उशीर म्हणजे न्याय नाकारणे.",
            "कायदा सर्वांसाठी समान असावा.",
            "सत्य आणि न्यायाच्या बाबतीत, मोठ्या आणि लहान समस्यांमध्ये फरक नाही."
        ],
        Gujarati: [
            "ન્યાયમાં વિલંબ એ ન્યાયનો ઇનકાર છે.",
            "કાયદો બધા માટે સમાન હોવો જોઈએ.",
            "સત્ય અને ન્યાયના બાબતોમાં, મોટી અને નાની સમસ્યાઓ વચ્ચે કોઈ તફાવત નથી."
        ]
    };

    const languages = [
        { code: 'en', name: 'English', displayName: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'Hindi', displayName: 'हिन्दी', flag: '🇮🇳' },
        { code: 'mr', name: 'Marathi', displayName: 'मराठी', flag: '🇮🇳' },
        { code: 'gu', name: 'Gujarati', displayName: 'ગુજરાતી', flag: '🇮🇳' }
    ];

    // Data fetching functions
    const fetchCases = async () => {
        try {
            const response = await fetch('/api/cases', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCases(data.cases || []);
                }
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            // Fetch tasks from all cases
            const allTasks = [];
            for (const caseItem of cases) {
                const response = await fetch(`/api/cases/${caseItem._id}/tasks`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        allTasks.push(...(data.tasks || []));
                    }
                }
            }
            setTasks(allTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchAnalytics = () => {
        const activeCases = cases.filter(c => c.status === 'Active').length;
        const completedTasks = tasks.filter(t => t.isCompleted).length;
        const pendingTasks = tasks.filter(t => !t.isCompleted).length;
        
        setAnalytics({
            totalCases: cases.length,
            activeCases,
            completedTasks,
            pendingTasks,
            documentsUploaded: cases.reduce((acc, c) => acc + (c.documents?.length || 0), 0),
            hoursLogged: Math.floor(Math.random() * 200) + 50 // Mock data for now
        });
    };

    const fetchUpcomingDeadlines = () => {
        const deadlines = [];
        
        // Add case deadlines
        cases.forEach(caseItem => {
            if (caseItem.nextDate) {
                const deadlineDate = new Date(caseItem.nextDate);
                const today = new Date();
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays <= 30) {
                    deadlines.push({
                        id: `case-${caseItem._id}`,
                        title: `${caseItem.caseID} - ${caseItem.clientDetails.name}`,
                        date: deadlineDate,
                        type: 'Case',
                        priority: diffDays <= 7 ? 'High' : diffDays <= 14 ? 'Medium' : 'Low'
                    });
                }
            }
        });

        // Add task deadlines
        tasks.forEach(task => {
            if (task.dueDate && !task.isCompleted) {
                const deadlineDate = new Date(task.dueDate);
                const today = new Date();
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays <= 30) {
                    deadlines.push({
                        id: `task-${task._id}`,
                        title: task.title,
                        date: deadlineDate,
                        type: 'Task',
                        priority: task.priority || (diffDays <= 7 ? 'High' : diffDays <= 14 ? 'Medium' : 'Low')
                    });
                }
            }
        });

        // Sort by date
        deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingDeadlines(deadlines.slice(0, 5));
    };

    const fetchRecentActivity = () => {
        const activities = [];
        
        // Add recent case activities
        cases.slice(0, 3).forEach(caseItem => {
            activities.push({
                id: `case-${caseItem._id}`,
                text: `Case ${caseItem.caseID} updated`,
                time: new Date(caseItem.updatedAt),
                type: 'case'
            });
        });

        // Add recent task activities
        tasks.filter(t => t.isCompleted).slice(0, 2).forEach(task => {
            activities.push({
                id: `task-${task._id}`,
                text: `Task "${task.title}" completed`,
                time: new Date(task.completedAt || new Date()),
                type: 'task'
            });
        });

        // Sort by time and take recent 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 5));
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchCases();
            setIsLoaded(true);
            setLoading(false);
        };
        loadData();
    }, []);

    // Update dependent data when cases change
    useEffect(() => {
        if (cases.length > 0) {
            fetchTasks();
        }
    }, [cases]);

    // Update analytics and deadlines when tasks change
    useEffect(() => {
        if (tasks.length > 0 || cases.length > 0) {
            fetchAnalytics();
            fetchUpcomingDeadlines();
            fetchRecentActivity();
        }
    }, [tasks, cases]);

    // Language change handler
    const handleLanguageChange = (newLang) => {
        setLang(newLang);
        window.dispatchEvent(new CustomEvent('app-language-change', { detail: newLang }));
    };

    // Get random quote
    const getRandomQuote = () => {
        const langQuotes = quotes[lang] || quotes.English;
        return langQuotes[Math.floor(Math.random() * langQuotes.length)];
    };

    if (loading || userLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center pt-16 lg:pt-0 lg:ml-[280px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">{t('loading')}...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            {/* Main Content with proper spacing for navbar */}
            <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 transition-all duration-500 hide-scrollbar overflow-y-auto pt-16 lg:pt-6 lg:ml-[10px] ${getFontClass(lang)} ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
                {/* Header Section */}
                <div className={`mb-6 sm:mb-8 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0 translate-y-4'
                }`}>
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full xl:w-auto">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-slate-200 hover:ring-slate-300 transition-all duration-300">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent truncate">
                                    {t('welcomeBack')}, {user?.name || 'User'}
                                </h1>
                                <p className="text-gray-600 text-xs sm:text-sm xl:text-base truncate">{user?.email || 'user@example.com'}</p>
                                <p className="text-gray-500 text-xs sm:text-sm">{t('dashboard')} • {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        {/* Language Selector */}
                        <div className="relative group w-full xl:w-auto">
                            <select 
                                value={lang} 
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="w-full xl:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-xs sm:text-sm"
                            >
                                {languages.map((language) => (
                                    <option key={language.code} value={language.name}>
                                        {language.flag} {language.displayName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Section */}
                <div className={`mb-8 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0 translate-y-4'
                }`} style={{ animationDelay: '0.1s' }}>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-800 text-lg font-medium italic leading-relaxed">
                                    "{getRandomQuote()}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Overview */}
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0 translate-y-4'
                }`} style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-blue-600">{analytics.totalCases}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('totalCases')}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-green-600">{analytics.activeCases}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('activeCases')}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-orange-600">{analytics.completedTasks}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('completedTasks')}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-purple-600">{analytics.documentsUploaded}</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('documents')}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    
                    {/* Recent Cases Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('recentCases')}</h2>
                            </div>
                            <button 
                                onClick={() => router.push('/Case-Management')}
                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors"
                            >
                                {t('viewAll')} →
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {cases.slice(0, 4).map((caseItem, index) => (
                                <div key={caseItem._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover/item:scale-125 transition-transform duration-200 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{caseItem.caseID}</p>
                                            <p className="text-xs text-gray-500 truncate">{caseItem.clientDetails?.name || 'Unknown Client'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        caseItem.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : caseItem.status === 'Pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {caseItem.status}
                                    </span>
                                </div>
                            ))}
                            {cases.length === 0 && (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <p className="text-gray-500 text-sm">{t('noCases')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Deadlines Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('upcomingDeadlines')}</h2>
                            </div>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="space-y-3">
                            {upcomingDeadlines.slice(0, 4).map((deadline) => (
                                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 group/item">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className={`w-2 h-2 rounded-full ${
                                            deadline.priority === 'High' ? 'bg-red-500' : 
                                            deadline.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        } group-hover/item:scale-125 transition-transform duration-200 flex-shrink-0`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{deadline.title}</p>
                                            <p className="text-xs text-gray-500">{deadline.date.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        deadline.priority === 'High' 
                                            ? 'bg-red-100 text-red-800' 
                                            : deadline.priority === 'Medium'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {deadline.priority}
                                    </span>
                                </div>
                            ))}
                            {upcomingDeadlines.length === 0 && (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p className="text-gray-500 text-sm">{t('noUpcomingDeadlines')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('recentActivity')}</h2>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {recentActivity.slice(0, 4).map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 group/item">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover/item:scale-125 transition-transform duration-200 mt-2 flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 leading-relaxed">{activity.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time.toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                    <p className="text-gray-500 text-sm">{t('noRecentActivity')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Feature Highlights Section */}
                <div className={`mb-6 sm:mb-8 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0 translate-y-4'
                }`} style={{ animationDelay: '0.6s' }}>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('powerfulFeatures')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        
                        {/* Document Analysis Feature */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => router.push('/Document-Analysis')}>
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{t('documentAnalysis')}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{t('aiPoweredDocumentAnalysis')}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{t('documentAnalysisDescription')}</p>
                            <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium group-hover:text-blue-800 transition-colors">
                                <span>{t('getStarted')}</span>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>

                        {/* Legal Research Feature */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => router.push('/Legal-Research')}>
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{t('legalResearch')}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{t('comprehensiveLegalResearch')}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{t('legalResearchDescription')}</p>
                            <div className="flex items-center text-green-600 text-xs sm:text-sm font-medium group-hover:text-green-800 transition-colors">
                                <span>{t('exploreNow')}</span>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>

                        {/* Drafting Assistant Feature */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => router.push('/Drafting-Assistant')}>
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{t('draftingAssistant')}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{t('aiPoweredDrafting')}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{t('draftingAssistantDescription')}</p>
                            <div className="flex items-center text-purple-600 text-xs sm:text-sm font-medium group-hover:text-purple-800 transition-colors">
                                <span>{t('startDrafting')}</span>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Animations and Responsive adjustments */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                }
                
                /* Hide scrollbar but keep functionality */
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar { 
                    display: none;
                }
                
                /* Enhanced responsive design */
                @media (min-width: 1280px) {
                    .lg\\:ml-\\[280px\\] {
                        margin-left: 280px;
                    }
                }
                
                @media (max-width: 1279px) {
                    .lg\\:ml-\\[280px\\] {
                        margin-left: 0;
                    }
                }
                
                @media (max-width: 1024px) {
                    .lg\\:pt-6 {
                        padding-top: 1.5rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .lg\\:pt-6 {
                        padding-top: 1rem;
                    }
                }
                
                @media (max-width: 640px) {
                    .pt-16 {
                        padding-top: 4rem;
                    }
                }
                
                /* Smooth transitions for all interactive elements */
                * {
                    transition: all 0.2s ease-in-out;
                }
                
                /* Enhanced hover effects */
                .group:hover .group-hover\\:scale-110 {
                    transform: scale(1.1);
                }
                
                .group:hover .group-hover\\:scale-125 {
                    transform: scale(1.25);
                }
            `}</style>
        </>
    );
}