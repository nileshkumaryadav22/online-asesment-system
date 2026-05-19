import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodingCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { type: 'coding', text: '', language: 'javascript', initialCode: '', marks: 10 }]);
  };

  const removeQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes', { title, description, duration, questions });
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Error creating coding assessment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Coding Assessment</h1>
        <p className="text-gray-400 mt-1">Design a standalone coding problem for students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Problem Statement / Description</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" rows="5" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={duration} onChange={e => setDuration(e.target.value)} required min="1" />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={addQuestion} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={18} /> Add Coding Task
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={qIndex} className="glass p-6 rounded-2xl relative">
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
                  <Trash2 size={20} />
                </button>
                
                <h3 className="text-lg font-semibold text-white mb-4">Task {qIndex + 1}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Specific Task Instructions</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} required />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Marks</label>
                    <input type="number" className="w-full max-w-[150px] bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" value={q.marks} onChange={e => handleQuestionChange(qIndex, 'marks', Number(e.target.value))} required min="1" />
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Language</label>
                      <select className="w-full max-w-[200px] bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" value={q.language} onChange={e => handleQuestionChange(qIndex, 'language', e.target.value)}>
                        <option value="javascript" className="bg-gray-800">JavaScript</option>
                        <option value="python" className="bg-gray-800">Python</option>
                        <option value="java" className="bg-gray-800">Java</option>
                        <option value="cpp" className="bg-gray-800">C++</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Initial Code / Boilerplate</label>
                      <textarea className="w-full font-mono bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" rows="8" placeholder="function solution() {\n  \n}" value={q.initialCode} onChange={e => handleQuestionChange(qIndex, 'initialCode', e.target.value)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {questions.length > 0 && (
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
            <Save size={20} />
            Save Coding Assessment
          </button>
        )}
      </form>
    </div>
  );
};

export default CodingCreate;
