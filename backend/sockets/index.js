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

    socket.on('student_webcam_frame', ({ quizId, studentName, frame }) => {
      io.to(quizId).emit('student_webcam_update', { studentName, frame });
    });

    socket.on('student_tab_switch', ({ quizId, studentName, warnings }) => {
      io.to(quizId).emit('student_tab_switch_alert', { studentName, warnings, time: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
