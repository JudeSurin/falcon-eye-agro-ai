import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Built-in knowledgebase for agricultural drone operations
const droneKnowledgebase = {
  "crop monitoring": "HoverFly drones use advanced multispectral imaging to monitor crop health. They can detect early signs of disease, nutrient deficiencies, and pest infestations using NDVI analysis. The drones capture data at different wavelengths to assess plant health indicators.",
  "mission planning": "Mission planning involves setting waypoints, defining flight paths, and configuring sensors. Consider factors like weather conditions, battery life (typically 25-30 minutes), and regulatory requirements. Plan for 20% overlap between flight strips for complete coverage.",
  "weather conditions": "Optimal flying conditions include wind speeds below 15 mph, no precipitation, and visibility over 3 miles. Avoid flying in temperatures below 32°F or above 104°F. Always check NOTAMs and weather forecasts before missions.",
  "threat detection": "HoverFly systems can identify various agricultural threats including pest clusters, disease patterns, irrigation issues, and equipment malfunctions. AI algorithms analyze thermal and visual data to flag anomalies requiring immediate attention.",
  "precision agriculture": "Use variable rate application maps generated from drone data to apply fertilizers, pesticides, and water precisely where needed. This reduces costs by up to 15% while improving crop yields through targeted treatments.",
  "waypoint navigation": "Set waypoints at field boundaries and key monitoring points. Maintain consistent altitude (typically 100-400 feet) and overlap patterns. Use GPS coordinates for precise navigation and ensure proper ground control points for accuracy.",
  "battery management": "Monitor battery levels continuously. Plan missions with 20% battery reserve. Use multiple batteries for extended operations. Cold weather reduces battery life by up to 50%, so plan accordingly.",
  "data analysis": "Drone data includes RGB imagery, thermal maps, and multispectral data. Use specialized software to process NDVI maps, create orthomosaics, and generate actionable insights for crop management decisions.",
  "safety protocols": "Always maintain visual line of sight, check for obstacles, verify airspace clearance, and have emergency landing procedures ready. Keep spare propellers and conduct pre-flight checklists before every mission.",
  "compliance": "Follow FAA Part 107 regulations for commercial drone operations. Maintain proper certifications, respect no-fly zones, and coordinate with air traffic control when required. Keep flight logs for regulatory compliance."
};

const findBestMatch = (query: string): string => {
  const lowercaseQuery = query.toLowerCase();
  
  // Check for direct keyword matches
  for (const [key, value] of Object.entries(droneKnowledgebase)) {
    if (lowercaseQuery.includes(key) || key.includes(lowercaseQuery)) {
      return value;
    }
  }
  
  // Check for related terms
  const relatedTerms: { [key: string]: string[] } = {
    "crop monitoring": ["health", "plant", "ndvi", "disease", "pest", "nutrition"],
    "mission planning": ["flight", "path", "route", "waypoint", "planning"],
    "weather conditions": ["wind", "temperature", "rain", "weather", "conditions"],
    "threat detection": ["pest", "disease", "problem", "issue", "anomaly"],
    "precision agriculture": ["fertilizer", "pesticide", "application", "precision"],
    "battery management": ["battery", "power", "charge", "energy"],
    "data analysis": ["data", "analysis", "imagery", "thermal", "processing"],
    "safety protocols": ["safety", "emergency", "protocol", "procedure"],
    "compliance": ["regulation", "faa", "legal", "compliance", "permit"]
  };
  
  for (const [category, terms] of Object.entries(relatedTerms)) {
    if (terms.some(term => lowercaseQuery.includes(term))) {
      return droneKnowledgebase[category];
    }
  }
  
  return "I'm specialized in agricultural drone operations. I can help with crop monitoring, mission planning, weather considerations, threat detection, precision agriculture techniques, waypoint navigation, battery management, data analysis, safety protocols, and regulatory compliance. What specific aspect would you like to know more about?";
};

const HoverAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Hover AI, your agricultural drone intelligence assistant. I can help you with information about drone operations, crop monitoring, and mission planning. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(!!import.meta.env.VITE_GEMINI_API_KEY);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      let responseText = "";

      if (apiKeyConfigured) {
        // Try Gemini API first if configured
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are Hover AI, an advanced agricultural drone intelligence assistant for HoverFly precision surveillance technology. You specialize in:

- Agricultural monitoring and crop health analysis
- Drone mission planning and execution
- Threat detection in agricultural environments
- Weather conditions impact on farming
- AI-powered field assessments
- Precision agriculture techniques

User question: ${currentInput}

Please provide helpful, accurate information related to agricultural drone operations, crop monitoring, or farming intelligence. Keep responses concise but informative.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
      } else {
        // Fall back to built-in knowledgebase
        responseText = findBestMatch(currentInput);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Fall back to built-in knowledgebase if API fails
      const fallbackResponse = findBestMatch(currentInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse + "\n\n💡 Note: For enhanced AI responses, configure your Gemini API key in the environment variables (VITE_GEMINI_API_KEY).",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-command p-4 rounded-full shadow-command hover:shadow-tactical transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="card-glass w-96 h-[500px] flex flex-col shadow-command">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Hover AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about drone operations, crops, missions..."
                className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[40px] max-h-[80px]"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="btn-command p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverAI;