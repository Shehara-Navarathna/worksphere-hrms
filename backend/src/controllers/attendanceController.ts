import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT'
      }
    });

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: new Date() }
    });

    res.json({ message: 'Checked out successfully', attendance: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const attendance = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};