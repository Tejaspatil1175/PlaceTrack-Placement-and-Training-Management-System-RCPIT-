const { sequelize, User } = require('../models');
const { hashPassword } = require('../utils/password');

const setSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database.');

    const passwordPlain = 'tp8788244416';
    const passwordHash = await hashPassword(passwordPlain);

    const admins = [
      {
        email: 'tejaspatil@rcpit.ac',
        prn: 'SUPER_TEJAS_AC',
        name: 'Tejas Patil (Super Admin)'
      },
      {
        email: 'tejaspatil@rcpit.ac.in',
        prn: 'SUPER_TEJAS_IN',
        name: 'Tejas Patil (Super Admin)'
      }
    ];

    for (const admin of admins) {
      const existing = await User.findOne({ where: { email: admin.email } });
      if (existing) {
        existing.passwordHash = passwordHash;
        existing.role = 'tpo';
        existing.mustResetPassword = false;
        existing.name = admin.name;
        await existing.save();
        console.log(`Updated existing user ${admin.email} to Super Admin (TPO).`);
      } else {
        await User.create({
          name: admin.name,
          email: admin.email,
          prn: admin.prn,
          role: 'tpo',
          passwordHash,
          mustResetPassword: false
        });
        console.log(`Created new Super Admin (TPO): ${admin.email}`);
      }
    }

    console.log('\n=======================================');
    console.log('SUPER ADMIN CREDENTIALS CONFIGURED:');
    console.log('Email:    tejaspatil@rcpit.ac (or tejaspatil@rcpit.ac.in)');
    console.log('Password: tp8788244416');
    console.log('Role:     tpo (Super Admin)');
    console.log('=======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error.message);
    process.exit(1);
  }
};

setSuperAdmin();
