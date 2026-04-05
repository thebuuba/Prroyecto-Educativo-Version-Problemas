const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const gradeRoutes = require('./routes/grades');
const sectionRoutes = require('./routes/sections');
const studentRoutes = require('./routes/students');
const activityRoutes = require('./routes/activities');
const evaluationRoutes = require('./routes/evaluations');
const attendanceRoutes = require('./routes/attendance');
const bootstrapRoutes = require('./routes/bootstrap');
const stateRoutes = require('./routes/state');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'aulabase-sql-api',
    ok: true,
    docs: '/health',
  });
});

app.use('/health', healthRoutes);
app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = Number(error?.statusCode || 500);
  const message = String(error?.message || 'Error interno del servidor.');
  if (statusCode >= 500) {
    console.error('[aulabase-sql-api]', error);
  }
  res.status(statusCode).json({
    ok: false,
    message,
  });
});

app.listen(env.port, () => {
  console.log(`[aulabase-sql-api] escuchando en http://localhost:${env.port}`);
});
