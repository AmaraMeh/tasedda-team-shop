
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, Users, Store } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    is_admin: boolean;
  };
  recipient_profile?: {
    full_name: string;
    is_admin: boolean;
  };
}

interface Contact {
  id: string;
  full_name: string;
  email: string;
  type: 'team' | 'seller';
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markAsRead(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      // Fetch team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner(id, full_name, email)
        `)
        .eq('status', 'active');

      // Fetch sellers
      const { data: sellers } = await supabase
        .from('sellers')
        .select(`
          user_id,
          profiles!inner(id, full_name, email)
        `)
        .eq('status', 'active');

      const allContacts: Contact[] = [];

      if (teamMembers) {
        teamMembers.forEach(member => {
          allContacts.push({
            id: member.profiles.id,
            full_name: member.profiles.full_name,
            email: member.profiles.email,
            type: 'team',
            unread_count: 0
          });
        });
      }

      if (sellers) {
        sellers.forEach(seller => {
          allContacts.push({
            id: seller.profiles.id,
            full_name: seller.profiles.full_name,
            email: seller.profiles.email,
            type: 'seller',
            unread_count: 0
          });
        });
      }

      setContacts(allContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id(full_name, is_admin),
          recipient_profile:profiles!recipient_id(full_name, is_admin)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedContact.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedContact.id);
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (contactId: string) => {
    // Implementation for marking messages as read
    // This would typically update a read_at timestamp in the messages table
  };

  const teamContacts = contacts.filter(c => c.type === 'team');
  const sellerContacts = contacts.filter(c => c.type === 'seller');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex border border-gold/20 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gold/20 flex flex-col">
        <div className="p-4 border-b border-gold/20">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Messages
          </h2>
        </div>
        
        <Tabs defaultValue="team" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger value="team" className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Team ({teamContacts.length})
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex items-center">
              <Store className="h-4 w-4 mr-1" />
              Vendeurs ({sellerContacts.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="team" className="h-full p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {teamContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-gold/20 border border-gold/40'
                          : 'hover:bg-gold/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{contact.full_name}</h4>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          Team
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="sellers" className="h-full p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {sellerContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-gold/20 border border-gold/40'
                          : 'hover:bg-gold/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{contact.full_name}</h4>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          Vendeur
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gold/20 bg-black/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{selectedContact.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                </div>
                <Badge className={`${
                  selectedContact.type === 'team' 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                    : 'bg-green-500/20 text-green-400 border-green-500/50'
                }`}>
                  {selectedContact.type === 'team' ? 'Team Member' : 'Vendeur'}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-gold text-black'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-black/70' : 'text-white/70'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gold/20">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="bg-black/50 border-gold/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} className="btn-gold">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground">
                Choisissez un membre de l'équipe ou un vendeur pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
