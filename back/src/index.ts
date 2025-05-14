import express from 'express';
import { PrismaClient } from '../generated/prisma';
import usersRoutes from './routes/user';
import talksRoutes from './routes/talk';
import organizerTalksRoute from './routes/organizerTalks';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth';
const app = express();
import cors from 'cors';

const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  // credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/users', usersRoutes(prisma));
app.use('/talks', authMiddleware, talksRoutes(prisma));
app.use('/organizer/talks', organizerTalksRoute(prisma));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

