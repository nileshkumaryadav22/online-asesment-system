import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Play, Clock, FileText, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get('/quizzes');
        setQuizzes(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Available Assessments</h1>
        <p className="text-gray-400 mt-1">Select an assessment to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={quiz._id} 
            className="glass p-6 rounded-2xl flex flex-col h-full relative overflow-hidden group"
          >
            {/* Hover effect gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-300 mt-auto pt-4 border-t border-white/10 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-primary" />
                  <span>{quiz.duration} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={16} className="text-accent" />
                  <span>{quiz.questions.length} Qs</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  to={`/student/quiz/${quiz._id}`} 
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  <Play size={18} />
                  Start
                </Link>
                <Link 
                  to={`/student/quiz/${quiz._id}/leaderboard`} 
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                  title="View Leaderboard"
                >
                  <Trophy size={18} className="text-yellow-400" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No assessments available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
