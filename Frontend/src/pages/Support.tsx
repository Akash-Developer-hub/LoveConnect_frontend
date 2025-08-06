import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, User, MessageCircle, Loader2 } from 'lucide-react';

const Support: React.FC = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSent(false);

        // Simple validation
        if (!form.name || !form.email || !form.message) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://loveconnect-backend-kvb9.onrender.com/loveconnect/api/support/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                setSent(true);
                setForm({ name: '', email: '', message: '' });
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to send message. Please try again.');
            }
        } catch {
            setError('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-pink-600 p-3 rounded-full w-fit mx-auto mb-4">
                        <Heart className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Support</h1>
                    <p className="text-gray-600 mt-2">We're here to help you with LoveConnect</p>
                </div>

                {/* Form */}
                {sent ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center mb-6">
                        Thank you for reaching out! We'll get back to you soon.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                <textarea
                                    id="message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="How can we help you?"
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <Link to="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Support;