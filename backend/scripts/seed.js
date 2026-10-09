const { sequelize, Department, User } = require('../models');
const { hashPassword } = require('../utils/password');

const defaultDepartments = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Telecommunication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering'
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database.');

    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized.');

    // Seed Departments
    for (const deptName of defaultDepartments) {
      await Department.findOrCreate({
        where: { name: deptName },
        defaults: { name: deptName }
      });
    }
    console.log('Default departments seeded.');

    // Seed Default TPO Admin
    const tpoEmail = 'tpo@rcpit.ac.in';
    const existingTpo = await User.findOne({ where: { email: tpoEmail } });
    if (!existingTpo) {
      const passwordHash = await hashPassword('Admin@123');
      await User.create({
        name: 'T&P Officer (RCPIT)',
        email: tpoEmail,
        prn: 'TPO001',
        role: 'tpo',
        passwordHash,
        mustResetPassword: false
      });
      console.log('Default TPO Admin created:');
      console.log('  Email:    tpo@rcpit.ac.in');
      console.log('  Password: Admin@123');
    } else {
      console.log('TPO Admin already exists.');
    }

    // Seed Super Admin (Tejas Patil)
    const superAdmins = [
      { email: 'tejaspatil@rcpit.ac', prn: 'SUPER_TEJAS_AC' },
      { email: 'tejaspatil@rcpit.ac.in', prn: 'SUPER_TEJAS_IN' }
    ];

    const superAdminPasswordHash = await hashPassword('tp8788244416');
    for (const sa of superAdmins) {
      const existing = await User.findOne({ where: { email: sa.email } });
      if (existing) {
        existing.passwordHash = superAdminPasswordHash;
        existing.role = 'tpo';
        existing.mustResetPassword = false;
        await existing.save();
      } else {
        await User.create({
          name: 'Tejas Patil (Super Admin)',
          email: sa.email,
          prn: sa.prn,
          role: 'tpo',
          passwordHash: superAdminPasswordHash,
          mustResetPassword: false
        });
      }
      console.log(`Super Admin ${sa.email} verified/configured.`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
