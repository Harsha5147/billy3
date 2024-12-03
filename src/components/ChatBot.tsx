import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Shield } from 'lucide-react';
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import LocationPicker from './LocationPicker';

interface ChatBotProps {
  onReportSubmit: (report: any) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onReportSubmit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [reportData, setReportData] = useState({
    name: '',
    age: '',
    location: null,
    bullyingType: '',
    perpetratorInfo: {
      platform: '',
      username: '',
      profileUrl: '',
      realName: '',
      approximateAge: '',
      additionalDetails: ''
    },
    evidenceLinks: '',
    isAnonymous: false,
    severity: 'medium' as const
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        "Hi! I'm Billy, your friendly anti-bullying assistant. I'm here to help you report cyberbullying incidents safely and anonymously. Would you like to remain anonymous?",
        ["Yes, keep me anonymous", "No, I'll provide my name"]
      );
    }
  }, []);

  const addBotMessage = (text: string, options?: string[]) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text,
      sender: 'bot',
      type: options ? 'options' : undefined,
      options
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text,
      sender: 'user'
    }]);
  };

  const handleLocationSelect = (location: any) => {
    setReportData(prev => ({ ...prev, location }));
    setShowLocationPicker(false);
    addUserMessage(`Selected location: ${location.city}, ${location.district}, ${location.state}`);
    addBotMessage(
      "What type of cyberbullying are you experiencing?",
      [
        "Harassment",
        "Cyberstalking",
        "Impersonation",
        "Hate Speech",
        "Threats",
        "Other"
      ]
    );
    setCurrentStep(3);
  };

  const handleNextStep = async (userInput: string) => {
    if (!userInput.trim()) return;
    addUserMessage(userInput);

    switch (currentStep) {
      case 0:
        setReportData(prev => ({ ...prev, isAnonymous: userInput.toLowerCase().includes('yes') }));
        if (userInput.toLowerCase().includes('yes')) {
          addBotMessage("I understand. Your identity will be kept anonymous. What's your age?");
        } else {
          addBotMessage("Thank you for your trust. What's your name?");
        }
        setCurrentStep(1);
        break;

      case 1:
        if (reportData.isAnonymous) {
          setReportData(prev => ({ ...prev, age: userInput }));
        } else {
          setReportData(prev => ({ ...prev, name: userInput }));
          addBotMessage("Thank you. What's your age?");
          setCurrentStep(2);
          break;
        }
        addBotMessage("Please select your location on the map:");
        setShowLocationPicker(true);
        setCurrentStep(2);
        break;

      case 2:
        if (!reportData.isAnonymous) {
          setReportData(prev => ({ ...prev, age: userInput }));
          addBotMessage("Please select your location on the map:");
          setShowLocationPicker(true);
        }
        break;

      case 3:
        setReportData(prev => ({ ...prev, bullyingType: userInput }));
        addBotMessage("On which platform did this occur? (e.g., Instagram, Facebook, WhatsApp)");
        setCurrentStep(4);
        break;

      case 4:
        setReportData(prev => ({
          ...prev,
          perpetratorInfo: { ...prev.perpetratorInfo, platform: userInput }
        }));
        addBotMessage("Do you know the username or profile of the person? If yes, please share it (it's okay if you don't)");
        setCurrentStep(5);
        break;

      case 5:
        setReportData(prev => ({
          ...prev,
          perpetratorInfo: { ...prev.perpetratorInfo, username: userInput }
        }));
        addBotMessage("Do you have any evidence like screenshots or links? Please share them:");
        setCurrentStep(6);
        break;

      case 6:
        const severity = reportData.perpetratorInfo.username && userInput
          ? 'high'
          : reportData.perpetratorInfo.username || userInput
          ? 'medium'
          : 'low';

        onReportSubmit({
          ...reportData,
          evidenceLinks: userInput,
          severity
        });
        
        addBotMessage(
          "Thank you for your report. It has been submitted and will be reviewed by our team. " +
          "Would you like to learn about some safety measures you can take?",
          ["Yes, show me safety tips", "No, thank you"]
        );
        setCurrentStep(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || showLocationPicker) return;
    handleNextStep(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg border">
      <div className="bg-indigo-600 text-white p-4 flex items-center gap-2">
        <Shield size={24} />
        <h2 className="font-semibold">Billy - Your Anti-Bullying Assistant</h2>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border shadow-sm'
              }`}
            >
              {message.type === 'options' ? (
                <div className="space-y-2">
                  <p className="text-gray-800 mb-2">{message.text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {message.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          handleNextStep(option);
                          setInput('');
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        {showLocationPicker && (
          <div className="w-full">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={showLocationPicker}
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={showLocationPicker}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;