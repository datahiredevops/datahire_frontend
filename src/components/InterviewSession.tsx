import React, { useState, useEffect, useRef } from 'react';

// TypeScript fix for the Web Speech API (it's experimental in some browsers)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface InterviewSessionProps {
  userId: number;
  jobId: number;
  mode: 'Chat' | 'Voice';
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ userId, jobId, mode }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [status, setStatus] = useState('Idle'); // Idle, Listening, Processing, Speaking

  // Refs for speech tools
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // --- 1. INITIALIZE INTERVIEW ---
  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, job_id: jobId, mode: mode }),
      });
      const data = await res.json();
      
      setInterviewId(data.interview_id);
      addMessage('ai', data.message);
      
      if (mode === 'Voice') {
        speakText(data.message);
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
    }
  };

  // --- 2. TEXT TO SPEECH (ROBOT VOICE) ---
  const speakText = (text: string) => {
    if (status === 'Speaking') return; // Don't interrupt yourself
    
    setStatus('Speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Optional: Pick a better voice
    const voices = synthRef.current.getVoices();
    utterance.voice = voices.find(v => v.lang.includes('en')) || null;
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = () => {
      setStatus('Idle');
    };

    synthRef.current.speak(utterance);
  };

  // --- 3. SPEECH TO TEXT (LISTENING) ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser not supported! Use Chrome.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setStatus('Listening...');
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("User said:", transcript);
      handleUserAnswer(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  // --- 4. HANDLE ANSWER LOOP ---
  const handleUserAnswer = async (answerText: string) => {
    addMessage('user', answerText);
    setStatus('Thinking...');

    try {
      const res = await fetch('http://localhost:5000/api/interview/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            interview_id: interviewId, 
            user_answer: answerText 
        }),
      });
      const data = await res.json();
      
      addMessage('ai', data.message);
      
      if (mode === 'Voice') {
        speakText(data.message);
      } else {
        setStatus('Idle');
      }
      
    } catch (error) {
      console.error("Error sending reply:", error);
      setStatus('Error');
    }
  };

  const addMessage = (role: string, content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  // --- UI RENDER ---
  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-400">
            {mode === 'Voice' ? '🎙️ AI Voice Interview' : '💬 AI Chat Interview'}
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-mono ${
            status === 'Listening...' ? 'bg-red-500 animate-pulse' : 
            status === 'Speaking' ? 'bg-green-500' : 'bg-gray-600'
        }`}>
            {status}
        </span>
      </div>

      {/* Chat History Area */}
      <div className="h-96 overflow-y-auto mb-6 p-4 bg-gray-800 rounded-lg space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        {mode === 'Voice' ? (
          <button 
            onClick={startListening}
            disabled={isRecording || status === 'Speaking' || status === 'Thinking...'}
            className={`p-4 rounded-full transition-all ${
                isRecording ? 'bg-red-500 ring-4 ring-red-300' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isRecording ? '🛑 Listening...' : '🎤 Tap to Speak'}
          </button>
        ) : (
          <div className="flex w-full gap-2">
            <input 
              type="text" 
              placeholder="Type your answer..."
              className="flex-1 p-3 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      handleUserAnswer(e.currentTarget.value);
                      e.currentTarget.value = '';
                  }
              }}
            />
            <button className="bg-blue-600 px-6 rounded hover:bg-blue-500">Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;