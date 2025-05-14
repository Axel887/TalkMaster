import express from 'express';
import { PrismaClient } from '../generated/prisma';
import usersRoutes from './routes/user';
import talksRoutes from './routes/talk';
import slotsRoutes from './routes/slot';
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/users', usersRoutes(prisma));
app.use('/talks', talksRoutes(prisma));
app.use('/slots', slotsRoutes(prisma));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});


