import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await prisma.leaveRequest.create({
      data: {
        userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    
    if (!id) {
      return res.status(400).json({ message: 'Leave ID is required' });
    }

    const { status } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: status as any }
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTodayLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const leaves = await prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        startDate: { lte: tomorrow },
        endDate: { gte: today }
      }
    });
    
    res.json({ count: leaves });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};