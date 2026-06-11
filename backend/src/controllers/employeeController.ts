import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];

    if (!id) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};