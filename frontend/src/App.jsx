import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QuizCreate from './pages/QuizCreate';
import QuizAttempt from './pages/QuizAttempt';
import Result from './pages/Result';
import LiveMonitor from './pages/LiveMonitor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<MainLayout allowedRoles={['admin']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="quiz/create" element={<QuizCreate />} />
            <Route path="quiz/:id/live" element={<LiveMonitor />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<MainLayout allowedRoles={['student']} />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="quiz/:id" element={<QuizAttempt />} />
            <Route path="result/:id" element={<Result />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
