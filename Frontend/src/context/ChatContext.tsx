import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string, type?: 'text' | 'image' | 'audio') => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Jordan',
    content: 'Good morning my love! ❤️',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Alex',
    content: 'Good morning beautiful! How did you sleep?',
    timestamp: new Date(Date.now() - 3000000),
    type: 'text'
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Jordan',
    content: 'Amazing! I had the sweetest dreams about our weekend trip 🌴',
    timestamp: new Date(Date.now() - 2400000),
    type: 'text'
  },
  {
    id: '4',
    senderId: '1',
    senderName: 'Alex',
    content: 'I can\'t wait! Only 3 more days 😍',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text'
  },
  {
    id: '5',
    senderId: '2',
    senderName: 'Jordan',
    content: 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    timestamp: new Date(Date.now() - 1200000),
    type: 'image',
    imageUrl: 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
  },
  {
    id: '6',
    senderId: '1',
    senderName: 'Alex',
    content: 'That beach looks incredible! 🏖️',
    timestamp: new Date(Date.now() - 600000),
    type: 'text'
  }
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((content: string, type: 'text' | 'image' | 'audio' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'Alex',
      content,
      timestamp: new Date(),
      type,
      ...(type === 'image' && { imageUrl: content }),
      ...(type === 'audio' && { audioUrl: content })
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isTyping, setIsTyping }}>
      {children}
    </ChatContext.Provider>
  );
};