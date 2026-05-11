import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { socket } from '../services/socket';
import { Activity, ArrowLeft } from 'lucide-react';

const LiveMonitor = () => {
  const { id } = useParams();
  const [students, setStudents] = useState({});

  useEffect(() => {
    socket.connect();
    socket.emit('join_assessment', { quizId: id, studentName: 'Admin_Monitor' });

    socket.on('student_joined', ({ studentName, time }) => {
      setStudents(prev => ({
        ...prev,
        [studentName]: { status: 'active', timeJoined: time, timeLeft: '...' }
      }));
    });

    socket.on('student_timer_update', ({ studentName, timeLeft }) => {
      setStudents(prev => ({
        ...prev,
        [studentName]: { ...prev[studentName], timeLeft }
      }));
    });

    socket.on('student_submitted', ({ studentName, time }) => {
      setStudents(prev => ({
        ...prev,
        [studentName]: { ...prev[studentName], status: 'submitted' }
      }));
    });

    return () => {
      socket.off('student_joined');
      socket.off('student_timer_update');
      socket.off('student_submitted');
      socket.disconnect();
    };
  }, [id]);

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return seconds;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Live Monitoring <Activity className="text-green-400" />
          </h1>
          <p className="text-gray-400 mt-1">Real-time view of students taking the assessment</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-gray-300 font-medium">Student Name</th>
              <th className="p-4 text-gray-300 font-medium">Status</th>
              <th className="p-4 text-gray-300 font-medium">Time Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {Object.keys(students).length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-400">
                  Waiting for students to join...
                </td>
              </tr>
            ) : (
              Object.entries(students).map(([name, data]) => (
                <tr key={name} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      data.status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-blue-400/20 text-blue-400'
                    }`}>
                      {data.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 font-mono">
                    {data.status === 'submitted' ? '-' : formatTime(data.timeLeft)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveMonitor;
