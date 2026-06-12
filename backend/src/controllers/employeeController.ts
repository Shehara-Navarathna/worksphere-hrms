import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        managerId: true,
        phone: true,
        location: true,
        manager: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getManagers = async (req: Request, res: Response) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: { in: ['MANAGER', 'ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role = 'EMPLOYEE', password = 'password123', managerId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: { 
        name, 
        email, 
        role: role as any, 
        password: hashedPassword,
        managerId: managerId || null
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        managerId: true,
        manager: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update the updateEmployee function
export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, email, role, managerId, phone, location } = req.body;

    const employee = await prisma.user.update({
      where: { id },
      data: { 
        name, 
        email, 
        role: role as any,
        managerId: managerId || null,
        phone: phone || null,
        location: location || null
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        managerId: true,
        phone: true,
        location: true,
        manager: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};