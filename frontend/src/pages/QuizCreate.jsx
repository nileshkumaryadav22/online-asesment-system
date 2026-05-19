import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  const addQuestion = (type) => {
    if (type === 'mcq') {
      setQuestions([...questions, { type: 'mcq', text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }]);
    } else if (type === 'descriptive') {
      setQuestions([...questions, { type: 'descriptive', text: '', keywords: [''], marks: 5 }]);
    } else if (type === 'coding') {
      setQuestions([...questions, { type: 'coding', text: '', language: 'javascript', initialCode: '', marks: 10 }]);
    }
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

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex] = value;
    setQuestions(newQs);
  };

  const handleKeywordChange = (qIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setQuestions(newQs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes', { title, description, duration, questions });
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Error creating quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Assessment</h1>
        <p className="text-gray-400 mt-1">Design a new quiz with AI evaluation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={duration} onChange={e => setDuration(e.target.value)} required min="1" />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button type="button" onClick={() => addQuestion('mcq')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={18} /> Add MCQ
          </button>
          <button type="button" onClick={() => addQuestion('descriptive')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={18} /> Add Descriptive (AI Checked)
          </button>
          <button type="button" onClick={() => addQuestion('coding')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={18} /> Add Coding
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={qIndex} className="glass p-6 rounded-2xl relative">
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
                  <Trash2 size={20} />
                </button>
                
                <h3 className="text-lg font-semibold text-white mb-4">Question {qIndex + 1} <span className="text-sm font-normal text-gray-400 ml-2 capitalize">({q.type})</span></h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Question Text</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} required />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Marks</label>
                    <input type="number" className="w-full max-w-[150px] bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" value={q.marks} onChange={e => handleQuestionChange(qIndex, 'marks', Number(e.target.value))} required min="1" />
                  </div>

                  {q.type === 'mcq' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input type="radio" name={`correct-${qIndex}`} checked={q.correctOption === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)} className="w-4 h-4 text-primary bg-white/5 border-white/10 focus:ring-primary" />
                          <input type="text" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'descriptive' && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-300 mb-1">AI Evaluation Keywords (comma separated)</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" placeholder="e.g. inheritance, polymorphism, encapsulation" value={q.keywords.join(', ')} onChange={e => handleKeywordChange(qIndex, e.target.value)} required />
                      <p className="text-xs text-gray-400 mt-1">These keywords will be used to automatically grade the student's answer.</p>
                    </div>
                  )}

                  {q.type === 'coding' && (
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
                        <textarea className="w-full font-mono bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary" rows="4" placeholder="function solution() {\n  \n}" value={q.initialCode} onChange={e => handleQuestionChange(qIndex, 'initialCode', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {questions.length > 0 && (
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
            <Save size={20} />
            Save Assessment
          </button>
        )}
      </form>
    </div>
  );
};

export default QuizCreate;
