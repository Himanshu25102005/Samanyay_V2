
'use client'
import { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar.jsx";

export default function Profile() {
    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    
    // Form states
    const [showAddReminder, setShowAddReminder] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: '', date: '', time: '', priority: 'Medium' });
    
    // Page load animation state
    const [isLoaded, setIsLoaded] = useState(false);

    // Sample data for all sections
    const [cases] = useState([
        { id: 1, name: "Smith vs. Corporation", status: "Active", date: "2024-10-15", client: "John Smith" },
        { id: 2, name: "Johnson Estate Planning", status: "Pending", date: "2024-10-20", client: "Mary Johnson" },
        { id: 3, name: "Brown Contract Dispute", status: "Closed", date: "2024-09-30", client: "Robert Brown" },
        { id: 4, name: "Davis Employment Case", status: "Active", date: "2024-10-25", client: "Sarah Davis" }
    ]);

    const [drafts, setDrafts] = useState([
        { id: 1, title: "Motion for Summary Judgment - Smith Case", date: "2024-10-22" },
        { id: 2, title: "Client Consultation Report - Johnson", date: "2024-10-21" },
        { id: 3, title: "Contract Review - Brown Dispute", date: "2024-10-20" },
        { id: 4, title: "Settlement Agreement - Davis Employment", date: "2024-10-19" }
    ]);

    const [analytics] = useState({
        questionsAsked: 47,
        documentsAnalyzed: 23,
        casesReviewed: 12,
        hoursLogged: 156
    });

    const [reminders, setReminders] = useState([
        { id: 1, title: "File Reply Brief", date: "Oct 27, 2024", priority: "High" },
        { id: 2, title: "Client Meeting - Smith", date: "Oct 29, 2024", priority: "Medium" },
        { id: 3, title: "Court Filing Deadline", date: "Nov 2, 2024", priority: "High" }
    ]);

    const [recentActivity] = useState([
        "Document analysis completed for Smith case",
        "New client consultation scheduled",
        "Contract review finished for Brown dispute"
    ]);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
    ];

    // Functions
    const handleDeleteDraft = (id) => {
        setDrafts(drafts.filter(draft => draft.id !== id));
    };

    const handleDeleteReminder = (id) => {
        setReminders(reminders.filter(reminder => reminder.id !== id));
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        const newId = Math.max(...reminders.map(r => r.id)) + 1;
        setReminders([...reminders, { id: newId, ...newReminder }]);
        setNewReminder({ title: '', date: '', time: '', priority: 'Medium' });
        setShowAddReminder(false);
    };

    // Page load animation effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Navbar />
            {/* Main Content with proper spacing for navbar */}
            <div className={`ml-[280px] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 transition-all duration-500 hide-scrollbar overflow-y-auto ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
                {/* Header with Language Selector */}
                <div className={`mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0 translate-y-4'
                }`}>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                                    Dashboard
                                </h1>
                                <p className="text-gray-600 text-base sm:text-lg">Welcome back! Here's what's happening with your cases.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Language Selector */}
                    <div className="relative group w-full sm:w-auto">
                        <select 
                            value={selectedLanguage} 
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm sm:text-base"
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.name}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Cases Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Recent Cases</h2>
                            </div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Name</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cases.map((caseItem) => (
                                        <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors duration-200 group/row">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="bullet-diamond group-hover/row:scale-125 transition-transform duration-200"></div>
                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{caseItem.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-600">{caseItem.client}</td>
                                            <td className="py-3 px-2 text-sm text-gray-600">{caseItem.date}</td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    caseItem.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : caseItem.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {caseItem.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <button className="w-full mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 hover:bg-blue-50 py-2 rounded-lg group/btn">
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">View All Cases →</span>
                        </button>
                    </div>

                    {/* Incomplete Drafts Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Incomplete Drafts</h2>
                            </div>
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-4">
                            {drafts.map((draft) => (
                                <div key={draft.id} className="flex items-start py-3 px-3 rounded-lg hover:bg-orange-50 transition-all duration-200 group/item relative">
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="bullet-triangle group-hover/item:scale-125 transition-transform duration-200 mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700 leading-relaxed">{draft.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{draft.date}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteDraft(draft.id)}
                                        className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 p-1 hover:bg-red-100 rounded-full ml-2 flex-shrink-0"
                                        title="Delete draft"
                                    >
                                        <svg className="w-4 h-4 text-red-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-orange-600 hover:text-orange-800 text-sm font-medium transition-all duration-200 hover:bg-orange-50 py-2 rounded-lg group/btn">
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">Continue Drafting →</span>
                        </button>
                    </div>

                    {/* Analytics Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                            </div>
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200 group/stat">
                                <p className="text-2xl font-bold text-purple-600 group-hover/stat:scale-110 transition-transform duration-200">{analytics.questionsAsked}</p>
                                <p className="text-xs text-gray-600 mt-1">Questions Asked</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 group/stat">
                                <p className="text-2xl font-bold text-blue-600 group-hover/stat:scale-110 transition-transform duration-200">{analytics.documentsAnalyzed}</p>
                                <p className="text-xs text-gray-600 mt-1">Documents Analyzed</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 group/stat">
                                <p className="text-2xl font-bold text-green-600 group-hover/stat:scale-110 transition-transform duration-200">{analytics.casesReviewed}</p>
                                <p className="text-xs text-gray-600 mt-1">Cases Reviewed</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200 group/stat">
                                <p className="text-2xl font-bold text-yellow-600 group-hover/stat:scale-110 transition-transform duration-200">{analytics.hoursLogged}</p>
                                <p className="text-xs text-gray-600 mt-1">Hours Logged</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 text-purple-600 hover:text-purple-800 text-sm font-medium transition-all duration-200 hover:bg-purple-50 py-2 rounded-lg group/btn">
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">View Detailed Analytics →</span>
                        </button>
                    </div>

                    {/* Reminders Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Upcoming Reminders</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => setShowAddReminder(!showAddReminder)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                                    title="Add reminder"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                </button>
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Add Reminder Form */}
                        {showAddReminder && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                <form onSubmit={handleAddReminder} className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Reminder title"
                                            value={newReminder.title}
                                            onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={newReminder.date}
                                            onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            required
                                        />
                                        <input
                                            type="time"
                                            value={newReminder.time}
                                            onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={newReminder.priority}
                                            onChange={(e) => setNewReminder({...newReminder, priority: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        >
                                            <option value="Low">Low Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="High">High Priority</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddReminder(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            {reminders.map((reminder) => (
                                <div key={reminder.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-red-50 transition-all duration-200 group/item relative">
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="w-2 h-2 bg-red-400 rounded-full group-hover/item:scale-125 transition-transform duration-200 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                                            <p className="text-xs text-gray-500">{reminder.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                            reminder.priority === 'High' 
                                                ? 'bg-red-100 text-red-800' 
                                                : reminder.priority === 'Medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {reminder.priority}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 p-1 hover:bg-red-200 rounded-full"
                                            title="Delete reminder"
                                        >
                                            <svg className="w-4 h-4 text-red-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-red-600 hover:text-red-800 text-sm font-medium transition-all duration-200 hover:bg-red-50 py-2 rounded-lg group/btn">
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">Manage Reminders →</span>
                        </button>
                    </div>

                    {/* Recent Activity Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                            </div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start py-3 px-3 rounded-lg hover:bg-indigo-50 transition-all duration-200 group/item">
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="w-3 h-3 bg-indigo-100 rounded-full flex items-center justify-center group-hover/item:scale-125 transition-transform duration-200 mt-1 flex-shrink-0">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-all duration-200 hover:bg-indigo-50 py-2 rounded-lg group/btn">
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">View All Activity →</span>
                        </button>
                    </div>

                    {/* Quick Actions Card */}
                    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 group ${
                        isLoaded ? 'animate-slide-up' : 'opacity-0 translate-y-8'
                    }`} style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all duration-200 hover:scale-105 group/action">
                                <div className="text-blue-600 text-xl mb-2 group-hover/action:scale-110 transition-transform duration-200">📄</div>
                                <p className="text-xs font-medium text-blue-800">New Document</p>
                            </button>
                            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-all duration-200 hover:scale-105 group/action">
                                <div className="text-green-600 text-xl mb-2 group-hover/action:scale-110 transition-transform duration-200">🔍</div>
                                <p className="text-xs font-medium text-green-800">Research</p>
                            </button>
                            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-all duration-200 hover:scale-105 group/action">
                                <div className="text-purple-600 text-xl mb-2 group-hover/action:scale-110 transition-transform duration-200">📝</div>
                                <p className="text-xs font-medium text-purple-800">Draft</p>
                            </button>
                            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-all duration-200 hover:scale-105 group/action">
                                <div className="text-orange-600 text-xl mb-2 group-hover/action:scale-110 transition-transform duration-200">📅</div>
                                <p className="text-xs font-medium text-orange-800">Schedule</p>
                            </button>
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
                
                @keyframes page-load {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes card-stagger {
                    from {
                        opacity: 0;
                        transform: translateY(40px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                }
                
                .animate-page-load {
                    animation: page-load 0.8s ease-out;
                }
                
                .animate-card-stagger {
                    animation: card-stagger 0.6s ease-out forwards;
                }
                
                /* Hide scrollbar but keep functionality */
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* Internet Explorer 10+ */
                    scrollbar-width: none;  /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar { 
                    display: none;  /* Safari and Chrome */
                }
                
                /* Professional bullet styles */
                .bullet-diamond {
                    width: 6px;
                    height: 6px;
                    background: linear-gradient(45deg, #3B82F6, #1D4ED8);
                    transform: rotate(45deg);
                    border-radius: 1px;
                }
                
                .bullet-circle-dot {
                    width: 8px;
                    height: 8px;
                    background: #E5E7EB;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bullet-circle-dot::after {
                    content: '';
                    width: 3px;
                    height: 3px;
                    background: #6B7280;
                    border-radius: 50%;
                }
                
                .bullet-triangle {
                    width: 0;
                    height: 0;
                    border-left: 3px solid transparent;
                    border-right: 3px solid transparent;
                    border-bottom: 6px solid #3B82F6;
                }
                
                /* Enhanced responsive design */
                @media (max-width: 1280px) {
                    .ml-\\[280px\\] {
                        margin-left: 280px;
                    }
                }
                
                @media (max-width: 1024px) {
                    .ml-\\[280px\\] {
                        margin-left: 80px;
                    }
                }
                
                @media (max-width: 768px) {
                    .ml-\\[280px\\] {
                        margin-left: 70px;
                    }
                }
                
                @media (max-width: 640px) {
                    .ml-\\[280px\\] {
                        margin-left: 0;
                        padding: 1rem;
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
                
                /* Loading state improvements */
                .loading-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </>
    );
}