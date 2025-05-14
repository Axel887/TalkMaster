import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export default function talksRoutes(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', async (_, res) => {
    const talks = await prisma.talk.findMany();
    res.json(talks);
  });

  router.get('/:id', async (req: Request<{ id: string; }>, res: any) => {
    const { id } = req.params;
    const talk = await prisma.talk.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!talk) return res.status(404).json({ error: 'Talk not found' });

    res.json(talk);
  });

  // Talk Creation
  router.post('/', async (req: Request<{ title: string, description: string, status: string, roomId: number, userId: string }>, res: any) => {
    const { title, description, status = 'pending', roomId, userId } = req.body;

    if (!title || !roomId || !userId) return res.status(400).json({ error: 'title, roomId et userId sont obligatoires' });

    await prisma.talk.create({
      data: {
        title,
        description,
        status,
        roomId,
        userId,
      },
    }).then((talk: object) => {
      res.status(201).json(talk);
    })
      .catch((err: object) => {
        console.error(err);
        res.status(400).json({ error: 'Impossible de créer le talk' });
      });

  });

  //Talk Modification
  router.put('/:id', async (req: Request<{ id: string, title: string, description: string, status: string, roomId: number, userId: string }>, res: any) => {
    const { id } = req.params;
    const { title, description, roomId, status, userId, duration } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId est requis pour modifier un talk' });

    const talk = await prisma.talk.findUnique({ where: { id: Number(id) } })
    
    if (!talk) return res.status(404).json({ error: 'Talk introuvable' });

    if (talk.userId !== userId) return res.status(403).json({ error: 'Non autorisé à modifier ce talk' });

    await prisma.talk.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        roomId,
        duration,
        status,
      },
    }).then((updatedTalk: object) => {
      res.status(200).json(updatedTalk);
    })
      .catch((err: object) => {
        console.error(err);
        res.status(400).json({ error: 'Impossible de modifier le talk' });
      });
  });

  // Delete a Talk
  router.delete('/:id', async (req: Request<{ id: string, userId: string }>, res: any) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId est requis pour supprimer un talk' });

    const talk = await prisma.talk.findUnique({ where: { id: Number(id) } });
    
    if (!talk) return res.status(404).json({ error: 'Talk introuvable' });
    if (talk.userId !== userId) return res.status(403).json({ error: 'Non autorisé à supprimer ce talk' });

    await prisma.talk.delete({ where: { id: Number(id) } })
      .then(() => {
        res.status(200).json({ message: 'Talk supprimé avec succès' });
      })
      .catch((err: object) => {
        console.error(err);
        res.status(400).json({ error: 'Impossible de supprimer le talk' });
      });
  });

  return router;
}
