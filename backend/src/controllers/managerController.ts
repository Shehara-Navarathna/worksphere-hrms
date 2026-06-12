import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getMyTeam = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const team = await prisma.user.findMany({
      where: { managerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    });

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamStats = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const teamMembers = await prisma.user.findMany({
      where: { managerId },
      include: {
        attendance: {
          where: { date: { gte: today, lt: tomorrow } }
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: tomorrow },
            endDate: { gte: today }
          }
        }
      }
    });

    const teamSize = teamMembers.length;
    const presentToday = teamMembers.filter(m => m.attendance[0]?.checkIn).length;
    const onLeave = teamMembers.filter(m => m.leaveRequests.length > 0).length;
    
    const pendingApprovals = await prisma.leaveRequest.count({
      where: {
        status: 'PENDING',
        user: { managerId }
      }
    });

    const attendanceRate = teamSize > 0 ? (presentToday / teamSize) * 100 : 0;

    res.json({
      teamSize,
      presentToday,
      onLeave,
      pendingApprovals,
      attendanceRate: Math.round(attendanceRate)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamPendingLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        user: { managerId }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pendingLeaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTeamLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    // Fix: Ensure leaveId is a string
    const leaveId = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });
    if (!leaveId) return res.status(400).json({ message: 'Leave ID is required' });

    const { status } = req.body;

    // Check if this leave belongs to manager's team
    const leave = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveId,
        user: { managerId }
      }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or not authorized' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: status as any }
    });

    res.json({ message: `Leave ${status.toLowerCase()} successfully`, leave: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamAttendanceTrend = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const teamMembers = await prisma.user.findMany({
      where: { managerId },
      select: { id: true }
    });

    const teamIds = teamMembers.map(m => m.id);
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const attendanceCount = await prisma.attendance.count({
        where: {
          userId: { in: teamIds },
          date: { gte: date, lt: nextDay },
          checkIn: { not: null }
        }
      });
      
      const rate = teamIds.length > 0 ? (attendanceCount / teamIds.length) * 100 : 0;
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: Math.round(rate),
        fullDate: date.toISOString().split('T')[0]
      });
    }
    
    res.json(last7Days);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamLeaveHistory = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        user: { managerId },
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeamAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const team = await prisma.user.findMany({
      where: { managerId },
      include: {
        attendance: {
          where: {
            date: { gte: today, lt: tomorrow }
          }
        }
      }
    });

    const teamAttendance = team.map(member => {
      const todayRecord = member.attendance[0];
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        checkIn: todayRecord?.checkIn || null,
        checkOut: todayRecord?.checkOut || null,
        status: todayRecord?.checkIn ? (todayRecord.checkOut ? 'Checked Out' : 'Checked In') : 'Not Checked In',
        isLate: todayRecord?.checkIn ? new Date(todayRecord.checkIn).getHours() > 9 : false
      };
    });

    res.json(teamAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};