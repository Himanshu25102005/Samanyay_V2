'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '../../../components/I18nProvider';
import { useUser } from '../../components/UserContext';
import { API } from '../../lib/api';

export default function CaseManagement() {
  const { t, lang, setLang } = useI18n();
  const { user } = useUser();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskFormData, setEditTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignedToName: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [clickedButton, setClickedButton] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    caseSummary: '',
    nextSteps: '',
    nextDate: '',
    status: 'Active'
  });

  const [editFormData, setEditFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    caseSummary: '',
    nextSteps: '',
    nextDate: '',
    status: 'Active'
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });

  const [docFormData, setDocFormData] = useState({
    fileName: '',
    category: 'Available Internally',
    description: '',
    file: null
  });

  // Fetch cases on mount
  useEffect(() => {
    fetchCases();
  }, []);

  // Fetch tasks when a case is selected
  useEffect(() => {
    if (selectedCase) {
      fetchTasks(selectedCase._id);
      fetchDocuments(selectedCase._id);
    }
  }, [selectedCase]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await API.getCases();
      setCases(data.cases || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to fetch cases. API endpoint may not be configured.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (caseId) => {
    try {
      const data = await API.getTasks(caseId);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchDocuments = async (caseId) => {
    try {
      const data = await API.getDocuments(caseId);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const data = await API.createCase({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        caseSummary: formData.caseSummary,
        nextSteps: formData.nextSteps,
        nextDate: formData.nextDate,
        status: formData.status
      });

      setShowCreateModal(false);
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        caseSummary: '',
        nextSteps: '',
        nextDate: '',
        status: 'Active'
      });
      await fetchCases();
      alert(t('caseCreated'));
    } catch (err) {
      console.error('Error creating case:', err);
      alert('Failed to create case: ' + err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await API.createTask(selectedCase._id, {
        title: taskFormData.title,
        description: taskFormData.description,
        dueDate: taskFormData.dueDate,
        priority: taskFormData.priority,
        status: taskFormData.status
      });

      setShowTaskModal(false);
      setTaskFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending'
      });
      await fetchTasks(selectedCase._id);
      alert(t('taskCreated'));
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task: ' + err.message);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedCase || !docFormData.file) return;

    try {
      const formData = new FormData();
      formData.append('file', docFormData.file);
      formData.append('fileName', docFormData.fileName || docFormData.file.name);
      formData.append('category', docFormData.category);
      formData.append('description', docFormData.description);

      await API.uploadDocument(selectedCase._id, formData);
      
      setShowDocModal(false);
      setDocFormData({
        fileName: '',
        category: 'Available Internally',
        description: '',
        file: null
      });
      await fetchDocuments(selectedCase._id);
      alert(t('uploadSuccess'));
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document: ' + err.message);
    }
  };

  const handleEditCase = (caseItem) => {
    setEditingCase(caseItem);
    setEditFormData({
      clientName: caseItem.clientDetails.name,
      clientPhone: caseItem.clientDetails.phone,
      clientEmail: caseItem.clientDetails.email,
      caseSummary: caseItem.caseSummary,
      nextSteps: caseItem.nextSteps,
      nextDate: caseItem.nextDate ? new Date(caseItem.nextDate).toISOString().split('T')[0] : '',
      status: caseItem.status
    });
    setShowEditModal(true);
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    if (!editingCase) return;

    try {
      await API.updateCase(editingCase._id, editFormData);
      setShowEditModal(false);
      setEditingCase(null);
      await fetchCases();
      alert(t('caseUpdated') || 'Case updated successfully');
    } catch (err) {
      console.error('Error updating case:', err);
      alert('Failed to update case: ' + err.message);
    }
  };

  const handleDeleteCase = async (caseId) => {
    setClickedButton(caseId);
    if (!confirm('Are you sure you want to delete this case?')) {
      setClickedButton(null);
      return;
    }

    try {
      await API.deleteCase(caseId);
      await fetchCases();
      if (selectedCase?._id === caseId) {
        setSelectedCase(null);
      }
      alert(t('caseDeleted'));
    } catch (err) {
      console.error('Error deleting case:', err);
      alert('Failed to delete case: ' + err.message);
    } finally {
      setTimeout(() => setClickedButton(null), 200);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      if (data.success) {
        await fetchTasks(selectedCase._id);
        alert(t('taskDeleted'));
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. API may not be configured.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDocuments(selectedCase._id);
        alert('Document deleted successfully');
      } else {
        alert(data.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. API may not be configured.');
    }
  };

  const downloadDocument = async (docId, fileName) => {
    try {
      console.log('Downloading document:', docId, fileName);
      const response = await fetch(`/api/documents/${docId}/download`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': '*/*'
        }
      });

      console.log('Download response status:', response.status);
      console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // Get the content type from response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        console.log('Content type:', contentType);
        
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'bytes');
        console.log('Blob type:', blob.type);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        }, 100);
        
        console.log('Document downloaded successfully');
      } else {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        alert('Failed to download document: ' + (errorText || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document: ' + err.message);
    }
  };

  const handlePreviewDocument = async (doc) => {
    try {
      console.log('Previewing document:', doc._id, doc.fileName);
      setPreviewDocument(doc);
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error previewing document:', err);
      alert('Failed to preview document: ' + err.message);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF Document';
      case 'doc': case 'docx': return 'Word Document';
      case 'jpg': case 'jpeg': return 'JPEG Image';
      case 'png': return 'PNG Image';
      case 'gif': return 'GIF Image';
      case 'txt': return 'Text File';
      default: return 'File';
    }
  };

  const canPreview = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(extension);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTaskFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      assignedToName: task.assignedToName || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending'
    });
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editTaskFormData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      if (data.success) {
        // Update the task in the local state
        setTasks(tasks.map(task => 
          task._id === editingTask._id ? { ...task, ...editTaskFormData } : task
        ));
        setShowEditTaskModal(false);
        setEditingTask(null);
        alert('Task updated successfully!');
      } else {
        alert('Failed to update task: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Update the task in the local state
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, isCompleted: true, completedAt: new Date(), status: 'Done' } : task
        ));
        alert('Task marked as completed!');
      } else {
        alert('Failed to complete task: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Failed to complete task: ' + err.message);
    }
  };

  const handleIncompleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/incomplete`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Update the task in the local state
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, isCompleted: false, completedAt: null, status: 'Pending' } : task
        ));
        alert('Task marked as incomplete!');
      } else {
        alert('Failed to mark task as incomplete: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error marking task as incomplete:', err);
      alert('Failed to mark task as incomplete: ' + err.message);
    }
  };

  // Filter cases based on search and status
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.clientDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (caseItem.caseSummary && caseItem.caseSummary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || caseItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get case view
  const getCaseView = () => {
    if (!selectedCase) {
      return null;
    }

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{selectedCase.caseID}</h2>
            <button
              onClick={() => setSelectedCase(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Cases
            </button>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{t('clientName')}:</span> {selectedCase.clientDetails.name}
            {selectedCase.clientDetails.phone && ` • ${selectedCase.clientDetails.phone}`}
            {selectedCase.clientDetails.email && ` • ${selectedCase.clientDetails.email}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tasks', label: t('tasksAndWorkflow') },
              { id: 'documents', label: t('documents') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Case Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{t('caseDetails')}</h3>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCase.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                      selectedCase.status === 'Closed' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {selectedCase.status}
                    </span>
                  </div>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <label className="text-sm font-medium text-gray-600 block mb-2">{t('caseSummary')}</label>
                      <p className="text-gray-800 leading-relaxed">
                        {selectedCase.caseSummary || 'No summary provided'}
                      </p>
                    </div>
                    
                  {selectedCase.nextDate && (
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <label className="text-sm font-medium text-gray-600 block mb-2">{t('nextDate')}</label>
                        <p className="text-gray-800 font-medium">
                          {new Date(selectedCase.nextDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                    </div>
                  )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <label className="text-sm font-medium text-gray-600 block mb-2">{t('nextSteps')}</label>
                      <p className="text-gray-800 leading-relaxed">
                        {selectedCase.nextSteps || 'No next steps defined'}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <label className="text-sm font-medium text-gray-600 block mb-2">Case ID</label>
                      <p className="text-gray-800 font-mono text-sm">
                        {selectedCase.caseID || selectedCase._id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {tasks.filter(task => task.status === 'Done').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                <h3 className="text-lg font-semibold text-gray-800">{t('tasksAndWorkflow')}</h3>
                  <p className="text-sm text-gray-500">
                    {tasks.filter(t => !t.isCompleted).length} pending • {tasks.filter(t => t.isCompleted).length} completed
                  </p>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('addTask')}
                </button>
              </div>

              {/* Pending Tasks Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Tasks ({tasks.filter(t => !t.isCompleted).length})
                </h4>
                
                {tasks.filter(t => !t.isCompleted).length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium mb-1">All tasks completed!</p>
                    <p className="text-sm text-gray-400">Great job! No pending tasks at the moment.</p>
                </div>
              ) : (
                  <div className="grid gap-3">
                    {tasks.filter(t => !t.isCompleted).map(task => (
                      <div key={task._id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all hover:border-blue-300">
                        <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                            )}
                        </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition active:scale-95"
                              title="Edit task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCompleteTask(task._id)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition active:scale-95"
                              title="Mark as complete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                              </svg>
                            </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition active:scale-95"
                              title="Delete task"
                        >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                        </button>
                      </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {task.priority}
                        </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Done' ? 'bg-green-100 text-green-700 border border-green-200' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {task.status}
                        </span>
                        {task.dueDate && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* Completed Tasks Section */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed Tasks ({tasks.filter(t => t.isCompleted).length})
                </h4>
                
                {tasks.filter(t => t.isCompleted).length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No completed tasks yet</p>
                    <p className="text-sm text-gray-400">Complete some tasks to see them here.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {tasks.filter(t => t.isCompleted).map(task => (
                      <div key={task._id} className="bg-green-50 rounded-lg border border-green-200 p-5 hover:shadow-md transition-all hover:border-green-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 line-through">{task.title}</h4>
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                            )}
                            <p className="text-xs text-green-600 mt-1">
                              Completed on {new Date(task.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleIncompleteTask(task._id)}
                              className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 p-2 rounded-lg transition active:scale-95"
                              title="Mark as incomplete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition active:scale-95"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Completed
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                <h3 className="text-lg font-semibold text-gray-800">{t('documents')}</h3>
                  <p className="text-sm text-gray-500">{documents.length} {documents.length === 1 ? 'document' : 'documents'} total</p>
                </div>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {t('uploadDocument')}
                </button>
              </div>

              {/* Document Categories */}
              {['Filed in Court', 'Available Internally'].map(category => {
                const categoryDocs = documents.filter(doc => doc.category === category);
                return (
                  <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{category}</h4>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {categoryDocs.length} {categoryDocs.length === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                    </div>
                    {categoryDocs.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      <p className="text-sm text-gray-400">No documents in this category</p>
                      </div>
                    ) : (
                      <div className="p-6 space-y-3">
                        {categoryDocs.map(doc => (
                          <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-blue-300 transition cursor-pointer group">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                                <div className="w-5 h-5 text-blue-600">
                                  {getFileIcon(doc.fileName)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{doc.fileName}</p>
                                <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-500">
                                    {new Date(doc.uploadedAt).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                  {doc.fileSize && (
                                    <span className="text-xs text-gray-400">
                                      {(doc.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewDocument(doc)}
                                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition active:scale-95 flex items-center gap-1"
                                title="Preview document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                              </button>
                              <button
                                onClick={() => downloadDocument(doc._id, doc.fileName)}
                                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition active:scale-95 flex items-center gap-1"
                                title="Download document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t('download')}
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition active:scale-95"
                                title="Delete document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get dashboard view
  const getDashboardView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('myCases')}</h1>
                <p className="text-gray-600 text-sm">⚖️ {t('hereAreYourActiveCases')}</p>
            </div>
              {/* User info */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <span className="text-sm font-medium text-blue-700">👤 {user.name || 'Guest'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Language dropdown */}
              <select
                value={lang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLang(newLang);
                  // Dispatch custom event for useAppLanguage hook
                  window.dispatchEvent(new CustomEvent('app-language-change', { detail: newLang }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी</option>
                <option value="Marathi">मराठी</option>
                <option value="Gujarati">ગુજરાતી</option>
              </select>
            <button
              onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-medium active:scale-95"
            >
              + {t('newCase')}
            </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={t('searchCases')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Closed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('noCases')}</h2>
              <p className="text-gray-600 mb-6">{t('createYourFirstCase')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-95"
              >
                {t('createCase')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map(caseItem => (
                <div
                  key={caseItem._id}
                  onClick={() => setSelectedCase(caseItem)}
                  className="bg-amber-50 rounded-xl shadow-md border border-amber-100 p-5 hover:shadow-xl transition cursor-pointer hover:border-blue-300 active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{caseItem.caseID}</h3>
                      <p className="text-sm text-gray-600 mt-1">{caseItem.clientDetails.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      caseItem.status === 'Active' ? 'bg-green-100 text-green-700' :
                      caseItem.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {caseItem.status}
                    </span>
                  </div>
                  {caseItem.caseSummary && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{caseItem.caseSummary}</p>
                  )}
                  {caseItem.nextSteps && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('nextSteps')}:</p>
                      <p className="text-sm text-blue-600 line-clamp-1">{caseItem.nextSteps}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-amber-200">
                    <span className="text-xs text-gray-500">{new Date(caseItem.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCase(caseItem);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition active:scale-95 font-medium"
                      >
                        ✏️ Edit
                      </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCase(caseItem._id);
                      }}
                        className={`px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium ${
                          clickedButton === caseItem._id ? 'scale-90 ring-2 ring-red-400' : ''
                        }`}
                    >
                        🗑️ Delete
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden relative">
      {selectedCase ? getCaseView() : getDashboardView()}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">📁 {t('createCase')}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientName')}</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter client's full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientPhone')}</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone / Mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientEmail')}</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('caseSummary')}</label>
                <textarea
                  required
                  value={formData.caseSummary}
                  onChange={(e) => setFormData({ ...formData, caseSummary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Briefly describe what this case is about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nextSteps')}</label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are the next steps?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('nextDate')}</label>
                  <input
                    type="date"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {showEditModal && editingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">✏️ Edit Case</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600 active:scale-90"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.clientName}
                  onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.clientPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, clientPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.clientEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Summary</label>
                <textarea
                  required
                  value={editFormData.caseSummary}
                  onChange={(e) => setEditFormData({ ...editFormData, caseSummary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                <textarea
                  value={editFormData.nextSteps}
                  onChange={(e) => setEditFormData({ ...editFormData, nextSteps: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Date</label>
                  <input
                    type="date"
                    value={editFormData.nextDate}
                    onChange={(e) => setEditFormData({ ...editFormData, nextDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('addTask')}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('taskTitle')}</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('taskDescription')}</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('dueDate')}</label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('priority')}</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('uploadDocument')}</h2>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('fileName')}</label>
                <input
                  type="text"
                  value={docFormData.fileName}
                  onChange={(e) => setDocFormData({ ...docFormData, fileName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name for this file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
                <select
                  value={docFormData.category}
                  onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Available Internally</option>
                  <option>Filed in Court</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                <textarea
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFormData({ ...docFormData, file: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t('upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-5/6 flex flex-col">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Document Preview</h2>
                <p className="text-sm text-gray-600 mt-1">{previewDocument.fileName}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadDocument(previewDocument._id, previewDocument.fileName)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Document Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    {getFileIcon(previewDocument.fileName)}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{previewDocument.fileName}</h3>
                      <p className="text-sm text-gray-600">{getFileType(previewDocument.fileName)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Size: {previewDocument.fileSize ? `${(previewDocument.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                      <p>Uploaded: {new Date(previewDocument.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="p-6">
                  {canPreview(previewDocument.fileName) ? (
                    <div className="space-y-4">
                      {/* PDF Preview */}
                      {previewDocument.fileName.toLowerCase().endsWith('.pdf') && (
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                            PDF Preview
                          </div>
                          <div className="h-96 bg-white flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <p className="text-gray-600 mb-4">PDF Preview</p>
                              <p className="text-sm text-gray-500 mb-4">
                                PDF preview is not available in this view. Click download to view the full document.
                              </p>
                              <button
                                onClick={() => downloadDocument(previewDocument._id, previewDocument.fileName)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                Open PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Preview */}
                      {['jpg', 'jpeg', 'png', 'gif'].includes(previewDocument.fileName.split('.').pop().toLowerCase()) && (
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b border-gray-300 flex justify-between items-center">
                            <span>Image Preview</span>
                            <button
                              onClick={() => downloadDocument(previewDocument._id, previewDocument.fileName)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Download
                            </button>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="relative">
                              <img
                                src={`/api/documents/${previewDocument._id}/preview`}
                                alt={previewDocument.fileName}
                                className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'block';
                                }}
                              />
                              <div className="hidden text-center py-8">
                                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <p className="text-gray-600 mb-4">Image Preview Unavailable</p>
                                <p className="text-sm text-gray-500 mb-4">
                                  Unable to load image preview. Click download to view the full image.
                                </p>
                                <button
                                  onClick={() => downloadDocument(previewDocument._id, previewDocument.fileName)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  View Image
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text File Preview */}
                      {previewDocument.fileName.toLowerCase().endsWith('.txt') && (
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                            Text Preview
                          </div>
                          <div className="p-4 bg-white">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <p className="text-gray-600 mb-4">Text File Preview</p>
                              <p className="text-sm text-gray-500 mb-4">
                                Text preview is not available in this view. Click download to view the full text file.
                              </p>
                              <button
                                onClick={() => downloadDocument(previewDocument._id, previewDocument.fileName)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                              >
                                View Text File
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        {getFileIcon(previewDocument.fileName)}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{previewDocument.fileName}</h3>
                      <p className="text-sm text-gray-600 mb-4">{getFileType(previewDocument.fileName)}</p>
                      <p className="text-sm text-gray-500 mb-6">
                        Preview is not available for this file type. Click download to view the full document.
                      </p>
                    </div>
                  )}

                  {/* Document Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Document Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Category:</span>
                        <span className="ml-2 text-gray-900">{previewDocument.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">File Type:</span>
                        <span className="ml-2 text-gray-900">{getFileType(previewDocument.fileName)}</span>
                      </div>
                      {previewDocument.description && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-600">Description:</span>
                          <p className="mt-1 text-gray-900">{previewDocument.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
              <button
                onClick={() => setShowEditTaskModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTaskFormData.title}
                  onChange={(e) => setEditTaskFormData({ ...editTaskFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editTaskFormData.description}
                  onChange={(e) => setEditTaskFormData({ ...editTaskFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={editTaskFormData.assignedToName}
                    onChange={(e) => setEditTaskFormData({ ...editTaskFormData, assignedToName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Person's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editTaskFormData.priority}
                    onChange={(e) => setEditTaskFormData({ ...editTaskFormData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editTaskFormData.dueDate}
                    onChange={(e) => setEditTaskFormData({ ...editTaskFormData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editTaskFormData.status}
                    onChange={(e) => setEditTaskFormData({ ...editTaskFormData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTaskModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



