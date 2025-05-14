import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export default function slotsRoutes(prisma: PrismaClient): Router {
    const router = Router();

    router.get('/', async (req: Request<{roomId: string, date: string }>, res: any) => {
        const { roomId, date } = req.query;

        if (!roomId || !date) {
            return res.status(400).json({ error: 'roomId and date are required' });
        }

        if (typeof date !== 'string') {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const baseDate = new Date(date);
        baseDate.toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
        });
        baseDate.setHours(0, 0, 0, 0);

        const takenSlots = await prisma.slot.findMany({
            where: {
                roomId: Number(roomId),
                date: {
                    gte: baseDate,
                    lt: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: { date: true },
        });

        const takenIndexes = new Set(
            takenSlots.map((s: any) => {
                const minutes = s.date.getHours() * 60 + s.date.getMinutes();
                return Math.floor(minutes / 15); // index de 0 à 95
            })
        );

        const result = Array.from({ length: 96 }, (_, i) => {
            const time = new Date(baseDate.getTime() + i * 15 * 60 * 1000);
            return {
                index: i,
                time,
                isTaken: takenIndexes.has(i),
            };
        });

        res.json(result);
    });

    router.post('/assign', async (req: Request<{ roomId: number, date: string, userId: string, talkId: number }>, res: any) => {
        const { roomId, date, userId, talkId } = req.body;

        if (!roomId || !date || !userId || !talkId) {
            return res.status(400).json({ error: 'roomId, date, talkId and userId are required' });
        }

        const talk = await prisma.talk.findUnique({
            where: { id: talkId },
            include: {
                Slot: true,
            }
        });

        console.log(talk)

        if (talk.Slot.length > 0) return res.status(400).json({ error: 'Talk already has slots assigned' });

        if (!talk) return res.status(404).json({ error: 'Talk not found' });

        const talkDuration = talk.duration;

        const baseDate = new Date(date);
        // baseDate.toLocaleString('fr-FR', {
        //     timeZone: 'Europe/Paris',
        // });

        // Get index of date 
        const minutes = baseDate.getHours() * 60 + baseDate.getMinutes();
        const index = Math.floor(minutes / 15); // index de 0 à 95
        const slotIndexes = Array.from({ length: talkDuration }, (_, i) => index + i);

        // Check if slots indexes exists
        const existingSlots = await prisma.slot.findMany({
            where: {
                roomId,
                index: { in: slotIndexes },
                date: {
                    gte: baseDate,
                    lt: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
                },
            },
        });

        const isTaken = existingSlots.some((slot: any) => {
            return slot.index >= index && slot.index < index + talkDuration;
        });

        if (isTaken) {
            return res.status(400).json({ error: 'One or more selected slots are already reserved' });
        }

        // Reserve the slots
        await Promise.all(
            slotIndexes.map((i) => {
                return prisma.slot.create({
                    data: {
                        date: baseDate,
                        index: i,
                        roomId,
                        userId,
                        talkId: talkId,
                    },
                }).then((slot: any) => {
                    return {
                        index: i,
                        time: slot.date
                    };
                }).catch((err: any) => {
                    console.error(err);
                    return res.status(400).json({ error: 'Impossible de réserver le slot ' + i });
                });
            })
        ).then((slots: any) => {
            res.status(201).json(slots);
        }).catch((err: any) => {
            console.error(err);
            res.status(400).json({ error: 'Impossible de réserver les slots' });
        });

        await prisma.talk.update({
            where: { id: talkId },
            data: { status: 'plannified' },
        });
    });

    return router;
}