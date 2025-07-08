
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader, Edit } from 'lucide-react';
import { ChatMessage, ProjectData, DocumentSectionData } from '../types';
import { streamChat, generateDocumentSectionContent } from '../services/geminiService';

// Helper function to find a section ID by its title recursively
const findSectionIdByTitle = (sections: DocumentSectionData[], title: string): string | null => {
    for (const section of sections) {
        // Using includes for more flexible matching, e.g. "1.2 Scope" and "Scope"
        if (section.title.toLowerCase().includes(title.toLowerCase())) {
            return section.id;
        }
        if (section.children?.length > 0) {
            const foundId = findSectionIdByTitle(section.children, title);
            if (foundId) return foundId;
        }
    }
    return null;
};

// Helper to create a concise summary of the project
const getProjectContextSummary = (data: ProjectData): string => {
    const docSummaries = Object.values(data.documents).map(doc => {
        const topLevelSections = doc.content.map(s => s.title).join(', ');
        return `- ${doc.title}: Contains sections like ${topLevelSections}. Some content may already exist.`;
    }).join('\n');

    const reqSummary = `There are ${data.requirements.length} requirements defined. Priorities are: ${[...new Set(data.requirements.map(r => r.priority))].join(', ')}.`;

    return `DOCUMENTATION OVERVIEW:\n${docSummaries}\n\nREQUIREMENTS OVERVIEW:\n${reqSummary}`;
};


const suggestions = [
  { text: "Draft 'Scope' for SDP", docId: 'sdp', docTitle: 'Software Development Plan (SDP)', sectionTitle: '1.2 Scope' },
  { text: "Describe 'CM Tools'", docId: 'cm_plan', docTitle: 'Configuration Management Plan', sectionTitle: '3. CM Tools' },
  { text: "Write 'System Overview'", docId: 'sdp', docTitle: 'Software Development Plan (SDP)', sectionTitle: '1.3 System Overview' },
  { text: "Draft 'Functional Requirements'", docId: 'srs', docTitle: 'Software Requirements Specification (SRS)', sectionTitle: '3.1 Functional Requirements' },
];


interface AiChatProps {
    projectData: ProjectData;
    onDocumentUpdate: (documentId: string, sectionId: string, newDescription: string, actor: 'User' | 'AI') => void;
}

const AiChat: React.FC<AiChatProps> = ({ projectData, onDocumentUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! I'm Ignition AI. Ask me about CMMI or software development. You can also use the guided prompts below to have me draft content for your project documents." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSuggestionClick = useCallback(async (docId: string, docTitle: string, sectionTitle: string) => {
    if (isLoading) return;

    setIsLoading(true);
    const userMessage = `Help me draft the "${sectionTitle}" section of the ${docTitle}.`;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    // Use a timeout to ensure the user message renders before the AI "thinking" message
    setTimeout(async () => {
        try {
            const context = getProjectContextSummary(projectData);
            const generatedContent = await generateDocumentSectionContent(docTitle, sectionTitle, context);

            const targetDoc = projectData.documents[docId];
            if (!targetDoc) {
                throw new Error(`Document with ID '${docId}' not found.`);
            }

            const sectionId = findSectionIdByTitle(targetDoc.content, sectionTitle);
            if (!sectionId) {
                 throw new Error(`Could not find section titled "${sectionTitle}" in ${docTitle}.`);
            }
            
            // Call the handler from App.tsx to update the actual project data, attributing it to the AI
            onDocumentUpdate(docId, sectionId, generatedContent, 'AI');
            
            const aiResponse = `I've drafted content for the "${sectionTitle}" section in your ${docTitle}. You can review and edit it on the Documents page. Let me know if you need help with anything else!`;
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

        } catch (error: any) {
            console.error("Error with AI suggestion:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    }, 100);

  }, [isLoading, projectData, onDocumentUpdate]);


  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const stream = streamChat(currentInput);
        
        let aiResponse = '';
        setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

        for await (const chunk of stream) {
            aiResponse += chunk;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.sender === 'ai') {
                    return [...prev.slice(0, -1), { sender: 'ai', text: aiResponse }];
                }
                return prev;
            });
        }
    } catch (error) {
      console.error("Error with AI chat:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"><Bot size={18} /></div>}
            <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'ai' ? 'bg-gray-800 text-gray-300' : 'bg-blue-600 text-white'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><User size={18} /></div>}
          </div>
        ))}
        {isLoading && messages[messages.length - 1].sender === 'user' && (
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"><Bot size={18} /></div>
                <div className="p-3 rounded-lg bg-gray-800 text-gray-300">
                    <Loader size={18} className="animate-spin" />
                </div>
            </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s, i) => (
                <button 
                    key={i} 
                    onClick={() => handleSuggestionClick(s.docId, s.docTitle, s.sectionTitle)}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Edit size={14} className="text-brand-secondary"/>
                    {s.text}
                </button>
            ))}
        </div>
        <div className="flex items-center gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Or type your question here..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            disabled={isLoading}
            />
            <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-primary text-white rounded-lg p-2 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-brand-secondary transition-colors"
            >
            <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;