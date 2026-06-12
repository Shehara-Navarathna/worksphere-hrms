import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminEmail = 'admin@worksphere.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('✅ Admin user created:', admin.email);
    console.log('   Email: admin@worksphere.com');
    console.log('   Password: admin123');
  } else {
    console.log('⚠️ Admin user already exists');
  }

  // Create a Manager user
  const managerEmail = 'manager@worksphere.com';
  const existingManager = await prisma.user.findUnique({
    where: { email: managerEmail },
  });

  if (!existingManager) {
    const hashedPassword = await bcrypt.hash('manager123', 10);
    
    const manager = await prisma.user.create({
      data: {
        name: 'Demo Manager',
        email: managerEmail,
        password: hashedPassword,
        role: 'MANAGER',
      },
    });
    
    console.log('✅ Manager user created:', manager.email);
    console.log('   Email: manager@worksphere.com');
    console.log('   Password: manager123');
  }

  // Create an Employee user
  const employeeEmail = 'employee@worksphere.com';
  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  });

  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash('employee123', 10);
    
    const employee = await prisma.user.create({
      data: {
        name: 'Demo Employee',
        email: employeeEmail,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });
    
    console.log('✅ Employee user created:', employee.email);
    console.log('   Email: employee@worksphere.com');
    console.log('   Password: employee123');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });