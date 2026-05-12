import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Users, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get('/quizzes/admin');
        setQuizzes(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${id}`);
        setQuizzes(quizzes.filter(quiz => quiz._id !== id));
      } catch (error) {
        console.error(error);
        alert('Failed to delete quiz');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your quizzes and assessments</p>
        </div>
        <Link 
          to="/admin/quiz/create" 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={20} />
          Create Quiz
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={quiz._id} 
            className="glass p-6 rounded-2xl flex flex-col h-full"
          >
            <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-300 mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-primary" />
                <span>{quiz.duration} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={16} className="text-accent" />
                <span>{quiz.questions.length} Qs</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Link to={`/admin/quiz/${quiz._id}/live`} className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg transition-colors text-sm">
                Live Monitor
              </Link>
              <button 
                onClick={() => handleDelete(quiz._id)}
                className="p-2 text-red-400 hover:bg-red-400/10 border border-red-400/10 rounded-lg transition-colors"
                title="Delete Quiz"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No quizzes created yet. Click "Create Quiz" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
