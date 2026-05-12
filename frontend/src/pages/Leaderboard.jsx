import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${id}/leaderboard`);
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await api.put(`/quizzes/${id}/publish-leaderboard`);
      setData({ ...data, isPublished: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish leaderboard');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading leaderboard...</div>;
  
  if (error) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p className="text-gray-400 mb-6">{error}</p>
      <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
          className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-1">{data?.quizTitle}</p>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mb-8 glass p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Visibility Status</h3>
            <p className="text-sm text-gray-400">
              {data?.isPublished 
                ? 'Students can currently view this leaderboard.'
                : 'This leaderboard is hidden from students.'}
            </p>
          </div>
          {!data?.isPublished ? (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Leaderboard'}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
              <CheckCircle size={20} />
              <span className="font-medium">Published</span>
            </div>
          )}
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-semibold text-gray-300">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Student</div>
          <div className="col-span-4 text-right pr-4">Score</div>
        </div>
        
        {data?.leaderboard?.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No attempts have been submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.leaderboard?.map((entry, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={entry.id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    index === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-300/20 text-gray-300' :
                    index === 2 ? 'bg-amber-600/20 text-amber-600' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-6">
                  <div className="font-medium text-white">{entry.studentName}</div>
                  <div className="text-xs text-gray-500">{entry.studentEmail}</div>
                </div>
                <div className="col-span-4 text-right pr-4">
                  <span className="text-lg font-bold text-accent">{entry.score}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
