import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, User, Camera, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageContext?: string;
}

interface GeminiChatbotProps {
  droneImages?: Array<{
    id: string;
    url: string;
    location: string;
    timestamp: Date;
    description?: string;
  }>;
}

const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ droneImages = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your HoverFly AI assistant. I can help you analyze drone footage, discuss agricultural insights, and provide information about your monitored locations. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Mock Gemini API response for demo - replace with actual API call
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    const responses = {
      greeting: [
        "Hello! I'm analyzing your agricultural data. How can I assist you today?",
        "Hi there! Ready to discuss your drone monitoring results?",
        "Welcome! I have access to all your drone imagery and field data."
      ],
      images: [
        "I can see your drone has captured excellent aerial footage. The latest images show healthy crop growth in the northern sectors with some areas requiring attention in the southern fields.",
        "Based on the recent drone imagery, your crops are showing 78% average health. I notice some irrigation concerns in sector 3 that might need your attention.",
        "The aerial photographs reveal promising crop development. Would you like me to analyze specific areas for pest detection or growth patterns?"
      ],
      locations: [
        "Your monitored locations include Brickell Farm, Downtown Grove, Bay Orchard, Miami River Crops, and Biscayne Gardens. Which area would you like detailed information about?",
        "I have data from 5 key agricultural zones. Brickell Farm is performing excellently at 85% health, while Biscayne Gardens needs immediate attention at 28% health.",
        "The Miami area locations are showing varied results. Would you like me to prioritize the areas needing immediate intervention?"
      ],
      analysis: [
        "The AI analysis shows optimal growing conditions in 60% of your monitored areas. I recommend increasing irrigation in sectors showing stress indicators.",
        "Crop health analytics indicate strong performance overall. The NDVI readings suggest excellent chlorophyll levels in most regions.",
        "Based on multispectral analysis, your yields are projected to be 15% above average this season. Shall I provide sector-specific recommendations?"
      ],
      weather: [
        "Current weather conditions are optimal for drone operations. Clear skies and minimal wind provide excellent imaging conditions.",
        "The weather forecast shows favorable conditions for the next 3 days. Perfect for planned surveillance missions.",
        "Atmospheric conditions are ideal for aerial monitoring. Humidity levels support accurate thermal imaging."
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    let category = 'greeting';
    
    if (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
      category = 'images';
    } else if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('farm')) {
      category = 'locations';
    } else if (lowerMessage.includes('analysis') || lowerMessage.includes('health') || lowerMessage.includes('crop')) {
      category = 'analysis';
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('condition')) {
      category = 'weather';
    }

    const categoryResponses = responses[category as keyof typeof responses];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    setIsTyping(false);
    return randomResponse;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm currently having trouble processing your request. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
          size="lg"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] z-40"
          >
            <Card className="card-glass h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">HoverFly AI</h3>
                    <p className="text-xs text-muted-foreground">Agricultural Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Online
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        message.isUser
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-variant rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is analyzing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about drone images, locations, or analysis..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("Tell me about the latest drone images")}
                    className="text-xs"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Images
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("Show me location status")}
                    className="text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Locations
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChatbot;