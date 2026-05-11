import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Award } from 'lucide-react';

const Result = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/attempts/${id}/result`);
        setAttempt(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading || !attempt) return <div className="text-center py-20">Loading result...</div>;

  const quiz = attempt.quizId;
  const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
  const percentage = Math.round((attempt.totalMarksObtained / totalMarks) * 100);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 rounded-2xl text-center mb-8">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award size={48} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Assessment Complete</h1>
        <p className="text-gray-400 mb-6">{quiz.title}</p>
        
        <div className="inline-block bg-white/5 border border-white/10 rounded-xl px-8 py-6">
          <div className="text-5xl font-bold text-primary mb-2">{percentage}%</div>
          <div className="text-gray-300">
            Score: {attempt.totalMarksObtained} / {totalMarks}
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Detailed Analysis</h2>
        {quiz.questions.map((q, idx) => {
          const ans = attempt.answers.find(a => a.questionId === q._id);
          const isCorrect = ans?.marksObtained === q.marks;
          const isPartial = ans?.marksObtained > 0 && ans?.marksObtained < q.marks;

          return (
            <div key={q._id} className="glass p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-white max-w-[80%]">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.text}
                </h3>
                <div className={`flex items-center gap-2 font-medium ${isCorrect ? 'text-green-400' : isPartial ? 'text-yellow-400' : 'text-red-400'}`}>
                  {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <span>{ans?.marksObtained || 0} / {q.marks}</span>
                </div>
              </div>

              {q.type === 'mcq' && (
                <div className="space-y-2 mt-4">
                  {q.options.map((opt, oIdx) => {
                    let style = "bg-white/5 border-white/10 text-gray-400";
                    if (q.correctOption === oIdx) style = "bg-green-400/20 border-green-400/50 text-green-200";
                    else if (ans?.selectedOption === oIdx) style = "bg-red-400/20 border-red-400/50 text-red-200";
                    
                    return (
                      <div key={oIdx} className={`p-3 rounded-lg border ${style}`}>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'descriptive' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your Answer:</div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-white">
                      {ans?.textResponse || <span className="italic text-gray-500">No answer provided</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">AI Evaluation Keywords matched against:</div>
                    <div className="flex flex-wrap gap-2">
                      {q.keywords.map((kw, kIdx) => (
                        <span key={kIdx} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link to="/student/dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Result;
