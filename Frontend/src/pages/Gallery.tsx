import React, { useState, useEffect } from 'react';
import { Plus, X, Heart, AlertCircle, CheckCircle} from 'lucide-react';
import { useTheme } from '../components/ThemeContext'; // Adjust the import path as needed

interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: Date;
  liked: boolean;
  likedBy?: string[];
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Gallery: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [editModalItem, setEditModalItem] = useState<GalleryItem | null>(null);
  const [editedCaption, setEditedCaption] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GalleryItem | null>(null);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      import('heic2any').then((heic2any) => {
        heic2any.default({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9
        }).then((convertedBlob) => {
          const convertedFile = new File(
            [convertedBlob as Blob],
            file.name.replace(/\.heic$/i, '.jpg'),
            {
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );
          resolve(convertedFile);
        }).catch(reject);
      }).catch(() => {
        reject(new Error('HEIC conversion library not available'));
      });
    });
  };

  const processImage = async (file: File): Promise<File> => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      return file;
    }

    if (fileType === 'image/heic' || fileName.endsWith('.heic')) {
      setIsConverting(true);
      showToast('Converting HEIC image to JPEG...', 'info');
      try {
        const convertedFile = await convertHeicToJpeg(file);
        showToast('Image converted successfully! 💕', 'success');
        return convertedFile;
      } catch (error) {
        throw new Error('Failed to convert HEIC image. Please use a JPG/JPEG image instead.');
      } finally {
        setIsConverting(false);
      }
    }

    throw new Error('Please select a JPG, JPEG, or HEIC image file.');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processedFile = await processImage(file);
        setSelectedFile(processedFile);
        setPreviewUrl(URL.createObjectURL(processedFile));
        setShowUploadModal(true);
        e.target.value = '';
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Error processing image', 'error');
        e.target.value = '';
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !caption.trim()) {
      showToast('Please select an image and enter a caption', 'error');
      return;
    }
    setIsUploading(true);
    showToast('Uploading your precious memory... 💖', 'info');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption.trim());
      const response = await fetch('http://localhost:8000/loveconnect/api/upload-photo/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        const newItem: GalleryItem = {
          id: Date.now().toString(),
          url: data.url,
          caption: caption.trim(),
          uploadedBy: 'You',
          uploadedAt: new Date(),
          liked: false
        };
        setGalleryItems(prev => [newItem, ...prev]);
        setShowUploadModal(false);
        setSelectedFile(null);
        setCaption('');
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        showToast('Photo uploaded successfully! Your love story grows 💕✨', 'success');
      } else {
        showToast(data.error || 'Upload failed. Please try again', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed. Please check your connection and try again', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openEditModal = (item: GalleryItem) => {
    setEditModalItem(item);
    setEditedCaption(item.caption);
  };

  const submitEditCaption = async () => {
    if (!editModalItem || !editedCaption.trim()) return;
    try {
      const res = await fetch("http://localhost:8000/loveconnect/api/edit-caption/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: editModalItem.id, caption: editedCaption.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setGalleryItems(prev =>
          prev.map(i => i.id === editModalItem.id ? { ...i, caption: editedCaption.trim() } : i)
        );
        showToast("Caption updated successfully 📝", 'success');
        setEditModalItem(null);
      } else {
        showToast(data.error || "Failed to update caption", 'error');
      }
    } catch (err) {
      console.error("Edit caption error:", err);
      showToast("Network error while editing", 'error');
    }
  };

  const openDeleteConfirm = (item: GalleryItem) => {
    setDeleteConfirmItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await fetch("http://localhost:8000/loveconnect/api/delete-photo/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: deleteConfirmItem.id, url: deleteConfirmItem.url })
      });
      const data = await res.json();
      if (res.ok) {
        setGalleryItems(prev => prev.filter(i => i.id !== deleteConfirmItem.id));
        setSelectedImage(null);
        setDeleteConfirmItem(null);
        showToast("Photo deleted 💔", 'success');
      } else {
        showToast(data.error || "Delete failed", 'error');
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Network error while deleting", 'error');
    }
  };

  const handleUploadCancel = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setCaption('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const toggleLike = async (id: string) => {
    const item = galleryItems.find(i => i.id === id);
    if (!item || !currentUserEmail) return;
    try {
      const res = await fetch('http://localhost:8000/loveconnect/api/toggle-like/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        const isNowLiked = data.liked;
        setGalleryItems(prev =>
          prev.map(i =>
            i.id === id
              ? {
                  ...i,
                  liked: isNowLiked,
                  likedBy: isNowLiked
                    ? [...(i.likedBy || []), currentUserEmail]
                    : (i.likedBy || []).filter(email => email !== currentUserEmail)
                }
              : i
          )
        );
      } else {
        showToast('Failed to toggle like', 'error');
      }
    } catch (err) {
      console.error('Toggle like failed:', err);
      showToast('Network error while liking', 'error');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const [userRes, galleryRes] = await Promise.all([
          fetch('http://localhost:8000/loveconnect/api/get-user/', {
            method: 'GET',
            credentials: 'include'
          }),
          fetch('http://localhost:8000/loveconnect/api/gallery/', {
            method: 'GET',
            credentials: 'include'
          })
        ]);
        const userData = await userRes.json();
        const galleryData = await galleryRes.json();
        if (userRes.ok && galleryRes.ok && galleryData.gallery) {
          setCurrentUserEmail(userData.email);
          const items: GalleryItem[] = galleryData.gallery.map((item: any) => ({
            id: item._id,
            url: item.url,
            caption: item.caption,
            uploadedBy: item.uploadedBy,
            uploadedAt: new Date(item.uploadedAt),
            liked: item.likedBy?.includes(userData.email),
            likedBy: item.likedBy ?? []
          }));
          setGalleryItems(items);
        } else {
          console.error('Error fetching gallery:', galleryData.error);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
        showToast('Failed to load gallery. Please refresh the page', 'error');
      }
    };

    const fetchUser = async () => {
      const res = await fetch("http://localhost:8000/loveconnect/api/get-user/", {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUserEmail(data.email);
      }
    };

    fetchUser();
    fetchGallery();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-pink-50 text-gray-800'}`}>
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

      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-pink-700 bg-gray-800' : 'border-pink-200 bg-white'} p-4 fixed w-full top-0 left-0 z-40 shadow-sm`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Our Gallery</h1>
          <button
            onClick={() => setShowOnlyLiked(!showOnlyLiked)}
            className={`px-3 py-1 ml-24 text-sm rounded-full transition ${
              showOnlyLiked ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showOnlyLiked ? 'Liked Only' : 'All Posts'}
          </button>
          <label htmlFor="upload-image" className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 cursor-pointer">
            <Plus size={20} />
          </label>
          <input
            id="upload-image"
            type="file"
            accept="image/jpeg,image/jpg,.heic,.HEIC"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {galleryItems.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {galleryItems.length} precious memories
          </p>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="p-4 py-28">
        {(isUploading || isConverting) && (
          <div className={`bg-white rounded-xl p-4 mb-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-pink-600 rounded-full animate-pulse"></div>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {isConverting ? 'Converting image...' : 'Uploading...'}
              </span>
            </div>
          </div>
        )}
        {galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-4">Start building your gallery together!</p>
            <p className="text-xs text-gray-500 mb-4">Supports JPG, JPEG, and HEIC images</p>
            <label htmlFor="upload-image" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 cursor-pointer">
              Upload First Photo
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(showOnlyLiked ? galleryItems.filter(i => i.liked) : galleryItems).map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border-pink-500 ${isDarkMode ? 'bg-gray-800' : ''}`}
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{item.caption}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.uploadedBy}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                      className={`p-1 rounded-full ${
                        item.liked ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'
                      }`}
                    >
                      <Heart size={16} fill={item.liked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full max-h-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Add Photo</h3>
              <button
                onClick={handleUploadCancel}
                className={`p-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                disabled={isConverting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {selectedFile.type === 'image/jpeg' ? 'JPEG' : selectedFile.type} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="caption-input" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Caption
                </label>
                <textarea
                  id="caption-input"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your photo..."
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                  rows={3}
                  disabled={isConverting}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUploadCancel}
                  className={`flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}
                  disabled={isUploading || isConverting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading || isConverting || !caption.trim()}
                  className="flex-1 py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isConverting ? 'Converting...' : isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className={`max-w-4xl max-h-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedImage.uploadedBy}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(selectedImage.uploadedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleLike(selectedImage.id)} className={`p-2 rounded-full ${selectedImage.liked ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}>
                  <Heart size={20} fill={selectedImage.liked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => openEditModal(selectedImage)} className="p-2 text-pink-500 hover:text-pink-700">
                  ✏️
                </button>
                <button onClick={() => openDeleteConfirm(selectedImage)} className="p-2 text-red-500 hover:text-red-700">
                  🗑
                </button>
                <button onClick={() => setSelectedImage(null)} className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
              <p className={`mt-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedImage.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Caption Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className={`bg-white rounded-xl w-full max-w-md shadow-xl p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Edit Caption</h3>
            <textarea
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-pink-200'}`}
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              rows={3}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button onClick={() => setEditModalItem(null)} className={`px-4 py-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>Cancel</button>
              <button onClick={submitEditCaption} className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className={`bg-white rounded-xl w-full max-w-sm shadow-xl p-6 text-center ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Delete Photo?</h3>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This memory will be removed permanently.</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button onClick={() => setDeleteConfirmItem(null)} className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  );
};

export default Gallery;
