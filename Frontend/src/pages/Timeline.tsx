import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Heart, Edit3, Trash2, Save, X } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  imageUrl?: string;
  createdBy: string;
  isSpecial: boolean;
}

const Timeline: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    isSpecial: false
  });

  // Mock timeline events
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'First Date',
      description: 'Our magical first date at the cozy café downtown. We talked for hours and knew there was something special between us.',
      date: new Date('2023-02-14'),
      location: 'Café Luna, Downtown',
      imageUrl: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      createdBy: 'Jordan',
      isSpecial: true
    },
    {
      id: '2',
      title: 'Became Official',
      description: 'The day we decided to make it official! Best decision we ever made.',
      date: new Date('2023-03-15'),
      location: 'City Park',
      createdBy: 'Alex',
      isSpecial: true
    },
    {
      id: '3',
      title: 'First Trip Together',
      description: 'Our amazing weekend getaway to the mountains. So many laughs and beautiful memories.',
      date: new Date('2023-06-22'),
      location: 'Mountain View Resort',
      imageUrl: 'https://images.pexels.com/photos/1025000/pexels-photo-1025000.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      createdBy: 'Jordan',
      isSpecial: false
    },
    {
      id: '4',
      title: 'Met Each Other\'s Parents',
      description: 'The nervous but exciting day we met each other\'s families. They loved us both!',
      date: new Date('2023-09-10'),
      location: 'Family Dinner',
      createdBy: 'Alex',
      isSpecial: false
    },
    {
      id: '5',
      title: 'First Anniversary',
      description: 'Celebrating one amazing year together. Here\'s to many more!',
      date: new Date('2024-02-14'),
      location: 'Sunset Beach',
      imageUrl: 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      createdBy: 'Jordan',
      isSpecial: true
    },
    {
      id: '6',
      title: 'Moved In Together',
      description: 'The big step! Our first home together. Every day feels like an adventure.',
      date: new Date('2024-08-01'),
      location: 'Our New Apartment',
      createdBy: 'Alex',
      isSpecial: true
    }
  ]);

  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.description) {
      const event: TimelineEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date || new Date(),
        location: newEvent.location,
        imageUrl: newEvent.imageUrl,
        createdBy: 'You',
        isSpecial: newEvent.isSpecial || false
      };
      setEvents(prev => [...prev, event]);
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        location: '',
        isSpecial: false
      });
      setIsCreating(false);
    }
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
  };

  const handleSaveEdit = () => {
    if (editingEvent && newEvent.title && newEvent.description) {
      setEvents(prev =>
        prev.map(event =>
          event.id === editingEvent.id
            ? { ...event, ...newEvent, date: newEvent.date || event.date }
            : event
        )
      );
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        location: '',
        isSpecial: false
      });
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

    if (diffInMonths === 0) {
      return 'This month';
    } else if (diffInMonths === 1) {
      return '1 month ago';
    } else if (diffInMonths < 12) {
      return `${diffInMonths} months ago`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 p-4 fixed w-full top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Our Timeline</h1>
            <p className="text-sm text-gray-600">{events.length} precious moments</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 max-w-4xl mx-auto pt-24">
        {/* Create/Edit Form */}
        {(isCreating || editingEvent) && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingEvent ? 'Edit Memory' : 'Add New Memory'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="What happened?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24 resize-none"
                  placeholder="Tell the story..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Where did it happen?"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSpecial"
                  checked={newEvent.isSpecial || false}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, isSpecial: e.target.checked }))}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <label htmlFor="isSpecial" className="text-sm text-gray-700">
                  Mark as special milestone
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={editingEvent ? handleSaveEdit : handleCreateEvent}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingEvent ? 'Save Changes' : 'Add Memory'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEvent(null);
                    setNewEvent({
                      title: '',
                      description: '',
                      date: new Date(),
                      location: '',
                      isSpecial: false
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Events */}
        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < sortedEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-pink-200 -z-10"></div>
              )}

              {/* Event */}
              <div className="flex flex-col md:flex-row items-start space-x-0 md:space-x-4 space-y-4 md:space-y-0">
                {/* Timeline dot */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  event.isSpecial ? 'bg-pink-600' : 'bg-pink-300'
                }`}>
                  {event.isSpecial ? (
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  ) : (
                    <Calendar className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm w-full md:w-auto">
                  <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{event.title}</h3>
                      <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span>{getRelativeTime(event.date)}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span>{event.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-gray-400 hover:text-pink-600 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{event.description}</p>

                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Added by {event.createdBy}</span>
                    {event.isSpecial && (
                      <span className="text-xs px-2 py-1 bg-pink-100 text-pink-600 rounded-full mt-2 md:mt-0">
                        Special Milestone
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Timeline</h3>
            <p className="text-gray-600 mb-4">Create your first memory together!</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
            >
              Add First Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;