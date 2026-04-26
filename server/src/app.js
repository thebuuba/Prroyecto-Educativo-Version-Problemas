const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { env } = require('./config/env');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
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
const { requireAuth } = require('./middleware/auth');

const app = express();

const corsOrigins = env.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen CORS no permitido: ${origin}`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'aulabase-sql-api',
    ok: true,
    docs: '/health',
  });
});

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/state', requireAuth, stateRoutes);
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/schools', requireAuth, schoolRoutes);
app.use('/api/grades', requireAuth, gradeRoutes);
app.use('/api/sections', requireAuth, sectionRoutes);
app.use('/api/students', requireAuth, studentRoutes);
app.use('/api/activities', requireAuth, activityRoutes);
app.use('/api/evaluations', requireAuth, evaluationRoutes);
app.use('/api/attendance', requireAuth, attendanceRoutes);

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
