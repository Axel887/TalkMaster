import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

export default function usersRoutes(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', authMiddleware, async (_, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  });

  router.post('/signup', async (req: Request<{ email: string, password: string, firstName: string, lastName: string }>, res: any) => {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    }).then((user: { id: string, email: string, firstName: string, lastName: string }) => {
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }).catch((err: object) => {
      console.error(err);
      res.status(400).json({ error: 'Impossible de créer l\'utilisateur' });
    })
  });

  router.post('/login', async (req: Request<{ email: string, password: string }>, res: any) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
    });
  });

  router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  });

  router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    res.clearCookie('token');
    res.json({ message: 'Déconnexion réussie' });
  });

  return router;
}
