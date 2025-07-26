import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Heart, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../components/ThemeContext'; // Adjust the import path as needed

interface Note {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  color: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Notes: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const colors = [
    'bg-pink-100', 'bg-purple-100', 'bg-blue-100', 'bg-green-100',
    'bg-yellow-100', 'bg-orange-100', 'bg-red-100', 'bg-indigo-100'
  ];

  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/loveconnect/api/notes/', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.notes) {
          const parsedNotes = data.notes.map((note: any) => ({
            id: note._id,
            title: note.title,
            content: note.content,
            createdBy: note.createdBy,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            isFavorite: note.isFavorite,
            color: note.color,
          }));
          setNotes(parsedNotes);
        }
      })
      .catch(() => {
        showToast('Failed to load notes. Please refresh the page', 'error');
      });
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    const newNoteData = {
      title: 'New Note',
      content: 'Start writing...',
      color: colors[Math.floor(Math.random() * colors.length)],
      isFavorite: false
    };
    showToast('Creating a new note for your thoughts... 💕', 'info');
    const res = await fetch('http://localhost:8000/loveconnect/api/notes/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNoteData),
      credentials: 'include',
    });
    const created = await res.json();
    if (created && created._id) {
      const newNote: Note = {
        id: created._id,
        title: created.title,
        content: created.content,
        createdBy: created.createdBy,
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
        isFavorite: created.isFavorite,
        color: created.color,
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsEditing(true);
      setEditingNote(newNote);
      showToast('Note created successfully! Start writing your heart out 💖✨', 'success');
    } else {
      showToast('Failed to create note. Please try again', 'error');
    }
  };

  const handleSaveNote = async () => {
    if (editingNote.id) {
      showToast('Saving your precious thoughts... 💭', 'info');

      const res = await fetch(`http://localhost:8000/loveconnect/api/notes/${editingNote.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingNote.title,
          content: editingNote.content,
          color: editingNote.color,
        }),
        credentials: 'include',
      });
      if (res.ok) {
        setNotes(prev =>
          prev.map(note =>
            note.id === editingNote.id
              ? { ...note, ...editingNote, updatedAt: new Date() }
              : note
          )
        );
        setSelectedNote({ ...selectedNote!, ...editingNote, updatedAt: new Date() });
        setIsEditing(false);
        setEditingNote({});
        showToast('Note saved successfully! Your memories are safe 💕', 'success');
      } else {
        showToast('Failed to save note. Please try again', 'error');
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    showToast('Removing note...', 'info');

    const res = await fetch(`http://localhost:8000/loveconnect/api/notes/${id}/delete/`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setNotes(prev => prev.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      showToast('Note deleted successfully', 'success');
    } else {
      showToast('Failed to delete note. Please try again', 'error');
    }
  };

  const toggleFavorite = async (id: string) => {
    const res = await fetch(`http://localhost:8000/loveconnect/api/notes/${id}/favorite/`, { method: 'PATCH', credentials: 'include' });
    const data = await res.json();
    if (res.ok && data.isFavorite !== undefined) {
      setNotes(prev =>
        prev.map(note =>
          note.id === id ? { ...note, isFavorite: data.isFavorite } : note
        )
      );
      showToast(data.isFavorite ? 'Added to favorites! 💖' : 'Removed from favorites', data.isFavorite ? 'success' : 'info');
    } else {
      showToast('Failed to update favorite status', 'error');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-pink-50 text-gray-800'}`}>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
              border-l-4 min-w-80 max-w-96 transform transition-all duration-300 ease-in-out
              animate-slide-in
              ${toast.type === 'success'
                ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 text-pink-800'
                : toast.type === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400 text-purple-800'
              }
            `}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-pink-600" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart size={18} className="text-purple-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar - Hidden on mobile when note is selected */}
      <div className={`w-full md:w-1/3 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-pink-200 bg-white'} flex flex-col ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-pink-700 bg-gray-800' : 'border-pink-200 bg-white'} fixed w-full top-0 left-0 z-40 shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Our Notes</h1>
            <button
              onClick={handleCreateNote}
              className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className={` ${isDarkMode ? 'text-gray-50' : 'text-gray-500'}`}>No notes found</p>
              <button
                onClick={handleCreateNote}
                className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-36 p-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${note.color} ${selectedNote?.id === note.id ? 'ring-2 ring-pink-500' : 'hover:shadow-md'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold line-clamp-1 ${isDarkMode ? 'text-gray-800' : 'text-gray-800'}`}>{note.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note.id);
                      }}
                      className={`p-1 rounded ${note.isFavorite ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}
                    >
                      <Heart size={16} fill={note.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>{note.content}</p>
                  <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{note.createdBy}</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor - Show on mobile when note is selected */}
      <div className={`flex-1 flex flex-col ${selectedNote ? 'flex' : 'hidden md:flex'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-pink-200'} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                  >
                    <X size={20} />
                  </button>
                  <div className={`w-4 h-4 rounded-full ${selectedNote.color}`}></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedNote.createdBy} • {formatDate(selectedNote.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveNote}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingNote({});
                        }}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setEditingNote(selectedNote);
                        }}
                        className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingNote.title || ''}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full text-xl md:text-2xl font-bold border-none outline-none bg-transparent ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                    placeholder="Note title..."
                  />
                  <div className="flex items-center gap-4 py-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Color:</span>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((c) => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border-2 ${c} ${editingNote.color === c ? 'border-gray-800' : 'border-transparent'}`}
                          onClick={() => setEditingNote(prev => ({ ...prev, color: c }))}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={editingNote.content || ''}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full h-64 md:h-96 border-none outline-none bg-transparent resize-none text-base leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                    placeholder="Start writing your note..."
                  />
                </div>
              ) : (
                <div>
                  <h1 className={`text-xl md:text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedNote.title}</h1>
                  <div className={`whitespace-pre-wrap leading-relaxed text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedNote.content}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Select a note to view</h3>
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a note from the sidebar to start reading or editing</p>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Notes;
