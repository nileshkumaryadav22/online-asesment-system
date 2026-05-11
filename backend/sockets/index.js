module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific assessment room
    socket.on('join_assessment', ({ quizId, studentName }) => {
      socket.join(quizId);
      io.to(quizId).emit('student_joined', { studentName, time: new Date() });
      console.log(`${studentName} joined assessment ${quizId}`);
    });

    // Sync timer / progress
    socket.on('timer_update', ({ quizId, studentName, timeLeft }) => {
      io.to(quizId).emit('student_timer_update', { studentName, timeLeft });
    });

    socket.on('submit_assessment', ({ quizId, studentName }) => {
      io.to(quizId).emit('student_submitted', { studentName, time: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
