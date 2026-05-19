import { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const QuizAttempt = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initAttempt = async () => {
      try {
        const { data: quizData } = await api.get(`/quizzes/${id}`);
        setQuiz(quizData);
        
        const { data: attemptData } = await api.post('/attempts/start', { quizId: id });
        setAttemptId(attemptData._id);
        
        // Initialize answers array
        if (attemptData.answers.length === 0) {
          const initialAnswers = quizData.questions.map(q => ({
            questionId: q._id,
            type: q.type,
            selectedOption: null,
            textResponse: '',
            codeResponse: q.initialCode || ''
          }));
          setAnswers(initialAnswers);
        } else {
          setAnswers(attemptData.answers);
        }

        // Calculate time left based on attempt start time
        const startTime = new Date(attemptData.startTime).getTime();
        const durationMs = quizData.duration * 60 * 1000;
        const endTime = startTime + durationMs;
        const now = new Date().getTime();
        
        if (now > endTime) {
          submitQuiz(attemptData.answers);
        } else {
          setTimeLeft(Math.floor((endTime - now) / 1000));
        }

        // Setup Socket
        socket.connect();
        socket.emit('join_assessment', { quizId: id, studentName: user.name });

        // Start Webcam
        const startWebcam = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (err) {
            console.error("Error accessing webcam:", err);
          }
        };
        startWebcam();

      } catch (error) {
        console.error(error);
        alert('Failed to load assessment');
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    initAttempt();
    
    return () => {
      socket.disconnect();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz(answers);
          return 0;
        }
        
        // Emit timer update every 5 seconds to reduce socket load
        if (prev % 5 === 0) {
          socket.emit('timer_update', { quizId: id, studentName: user.name, timeLeft: prev - 1 });
          
          // Capture and send webcam frame
          if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
            const context = canvasRef.current.getContext('2d');
            // Ensure canvas dimensions match video
            canvasRef.current.width = videoRef.current.videoWidth || 320;
            canvasRef.current.height = videoRef.current.videoHeight || 240;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const frame = canvasRef.current.toDataURL('image/jpeg', 0.5);
            socket.emit('student_webcam_frame', { quizId: id, studentName: user.name, frame });
          }
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, id, user.name, answers]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          alert(`Warning: You have switched tabs! (${newWarnings}/3 warnings before auto-submit)`);
          socket.emit('student_tab_switch', { quizId: id, studentName: user.name, warnings: newWarnings });
          
          if (newWarnings >= 3) {
            submitQuiz(answers);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, user.name, answers]);

  const handleAnswerChange = (qIndex, field, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex][field] = value;
    setAnswers(newAnswers);
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      await api.post(`/attempts/${attemptId}/submit`, { answers: finalAnswers });
      socket.emit('submit_assessment', { quizId: id, studentName: user.name });
      navigate(`/student/result/${attemptId}`);
    } catch (error) {
      console.error(error);
      alert('Error submitting quiz');
    }
  };

  if (loading || !quiz) return <div className="text-center py-20">Loading assessment...</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="glass sticky top-4 z-50 p-4 rounded-xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
        </div>
        <div className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-primary'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={q._id} className="glass p-6 rounded-2xl">
            <h3 className="text-lg font-medium text-white mb-4">
              <span className="text-gray-400 mr-2">{qIndex + 1}.</span> {q.text}
              <span className="float-right text-sm text-gray-500">[{q.marks} marks]</span>
            </h3>

            {q.type === 'mcq' && (
              <div className="space-y-3">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[qIndex]?.selectedOption === oIndex ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <input type="radio" name={`question-${qIndex}`} checked={answers[qIndex]?.selectedOption === oIndex} onChange={() => handleAnswerChange(qIndex, 'selectedOption', oIndex)} className="w-4 h-4 text-primary bg-transparent border-white/20 focus:ring-primary" />
                    <span className="text-white">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'descriptive' && (
              <div className="mt-4">
                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" rows="4" placeholder="Type your answer here..." value={answers[qIndex]?.textResponse || ''} onChange={(e) => handleAnswerChange(qIndex, 'textResponse', e.target.value)} />
              </div>
            )}

            {q.type === 'coding' && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Language: {q.language}</span>
                </div>
                <textarea 
                  className="w-full font-mono bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-primary" 
                  rows="8" 
                  spellCheck="false"
                  value={answers[qIndex]?.codeResponse || ''} 
                  onChange={(e) => handleAnswerChange(qIndex, 'codeResponse', e.target.value)} 
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={() => submitQuiz(answers)} className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
          Submit Assessment
        </button>
      </div>

      {/* Hidden canvas for webcam frame capture */}
      <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }}></canvas>
      
      {/* Floating Webcam View */}
      <div className="fixed bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border border-white/10 shadow-xl z-50">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Monitoring
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
