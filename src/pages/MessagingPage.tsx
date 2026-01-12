import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Icon, Button } from '../components/ui';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
  sender: {
    email: string;
    first_name?: string;
  };
}

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const coordinatorId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    if (user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(email, first_name)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: coordinatorId,
        message: newMessage.trim(),
        read: false,
      });

      if (error) throw error;
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden h-[calc(100vh-120px)] flex flex-col">
          <div className="bg-primary text-white p-6 border-b border-primary-dark">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="support_agent" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Trip Coordinator Support</h1>
                <p className="text-sm text-white/80">We're here to help with your journey</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Icon name="progress_activity" className="text-6xl text-primary animate-spin" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          isOwn
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.sender.first_name || 'Coordinator'}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-2 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                          {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Icon name="chat_bubble_outline" className="text-6xl text-gray-300 mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No messages yet</p>
                <p className="text-gray-500">Start a conversation with your trip coordinator</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={sending}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <Icon name="progress_activity" className="animate-spin" />
                ) : (
                  <>
                    <Icon name="send" className="mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Response time: Usually within 1 hour during business hours (9 AM - 9 PM IST)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
