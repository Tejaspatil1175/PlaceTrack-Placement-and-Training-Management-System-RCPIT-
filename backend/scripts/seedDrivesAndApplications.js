const { sequelize, User, StudentProfile, Drive, Application } = require('../models');

const sampleDrives = [
  {
    companyName: 'Tata Consultancy Services (TCS)',
    role: 'Software Engineer (Ninja & Digital)',
    description: 'Annual campus recruitment drive for TCS Ninja and TCS Digital roles. Selected candidates will work on cloud development, enterprise Java, and DevOps solutions across global delivery centers.',
    ctc: 7.50,
    minCgpa: 6.50,
    maxActiveBacklogs: 0,
    allowedBranches: [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence and Data Science',
      'Electronics and Telecommunication Engineering',
      'Mechanical Engineering',
      'Civil Engineering'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    status: 'ONGOING'
  },
  {
    companyName: 'Infosys Limited',
    role: 'Specialist Programmer & Systems Engineer',
    description: 'Infosys national recruitment drive for specialist programmers and systems engineers. Involves high-impact full stack development, Python microservices, and AI workflow automation.',
    ctc: 9.50,
    minCgpa: 7.50,
    maxActiveBacklogs: 0,
    allowedBranches: [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence and Data Science'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    status: 'ONGOING'
  },
  {
    companyName: 'Capgemini Technology Services',
    role: 'Senior Software Analyst',
    description: 'Core technical placement drive for Capgemini. Requires strong analytical problem solving, data structures, Java/C++ programming, and clean code hygiene.',
    ctc: 6.00,
    minCgpa: 6.00,
    maxActiveBacklogs: 1,
    allowedBranches: [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence and Data Science',
      'Electronics and Telecommunication Engineering'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: 'ONGOING'
  },
  {
    companyName: 'LTIMindtree',
    role: 'Cloud & DevOps Engineer',
    description: 'Specialized hiring for cloud infrastructure, Kubernetes orchestration, and enterprise backend engineering.',
    ctc: 8.00,
    minCgpa: 7.00,
    maxActiveBacklogs: 0,
    allowedBranches: [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence and Data Science',
      'Electronics and Telecommunication Engineering'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    status: 'UPCOMING'
  },
  {
    companyName: 'KPIT Technologies',
    role: 'Embedded Software & Automotive AI Engineer',
    description: 'Automotive software development, embedded systems, CAN protocol, and machine vision systems for autonomous mobility.',
    ctc: 8.50,
    minCgpa: 6.50,
    maxActiveBacklogs: 0,
    allowedBranches: [
      'Electronics and Telecommunication Engineering',
      'Computer Engineering',
      'Mechanical Engineering'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: 'UPCOMING'
  },
  {
    companyName: 'Tech Mahindra',
    role: 'Associate Software Engineer',
    description: 'Graduate engineering trainee program focused on digital transformation and telecommunication systems.',
    ctc: 5.50,
    minCgpa: 6.00,
    maxActiveBacklogs: 2,
    allowedBranches: [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence and Data Science',
      'Electronics and Telecommunication Engineering',
      'Mechanical Engineering',
      'Civil Engineering'
    ],
    minSemester: 6,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    status: 'ONGOING'
  }
];

async function seedDrivesAndApplications() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const tpoUser = await User.findOne({ where: { role: 'tpo' } });
    const creatorId = tpoUser ? tpoUser.id : 1;

    const createdDrives = [];
    for (const driveData of sampleDrives) {
      const [drive, created] = await Drive.findOrCreate({
        where: { companyName: driveData.companyName },
        defaults: {
          ...driveData,
          createdBy: creatorId
        }
      });
      createdDrives.push(drive);
      console.log(`Drive [${drive.companyName}]: ${created ? 'CREATED' : 'ALREADY EXISTS'}`);
    }

    // Map profiles
    const profiles = await StudentProfile.findAll({
      include: [{ model: User, as: 'user' }]
    });

    const getProfileByPrn = (prn) => profiles.find((p) => p.user?.prn === prn);
    const getDriveByName = (nameSubstr) => createdDrives.find((d) => d.companyName.toLowerCase().includes(nameSubstr.toLowerCase()));

    const tcsDrive = getDriveByName('TCS');
    const infosysDrive = getDriveByName('Infosys');
    const capgeminiDrive = getDriveByName('Capgemini');
    const ltiDrive = getDriveByName('LTIMindtree');
    const techMDrive = getDriveByName('Tech Mahindra');

    const sampleApplications = [
      { prn: '2021012345', drive: tcsDrive, status: 'SHORTLISTED', notes: 'Shortlisted for technical round 1.' },
      { prn: '2021012345', drive: infosysDrive, status: 'APPLIED', notes: 'Application under review.' },
      { prn: '2021012346', drive: infosysDrive, status: 'ACCEPTED', notes: 'Offer letter released. Package: 9.5 LPA.' },
      { prn: '2021012346', drive: tcsDrive, status: 'SHORTLISTED', notes: 'Cleared coding assessment.' },
      { prn: '2021012347', drive: capgeminiDrive, status: 'APPLIED', notes: 'Screening round pending.' },
      { prn: '2021012347', drive: techMDrive, status: 'APPLIED', notes: 'Assessment scheduled for next week.' },
      { prn: '2021012348', drive: tcsDrive, status: 'ACCEPTED', notes: 'Offer letter released. Package: 7.5 LPA.' },
      { prn: '2021012348', drive: ltiDrive, status: 'SHORTLISTED', notes: 'Selected for managerial interview.' },
      { prn: '2021012349', drive: techMDrive, status: 'APPLIED', notes: 'Resume verified by coordinator.' },
      { prn: '2021012350', drive: tcsDrive, status: 'APPLIED', notes: 'Awaiting online test slot.' },
      { prn: '2021012351', drive: tcsDrive, status: 'APPLIED', notes: 'Awaiting online test slot.' },
      { prn: '2021012352', drive: infosysDrive, status: 'SHORTLISTED', notes: 'Advanced to technical interview.' },
      { prn: '2021012352', drive: tcsDrive, status: 'SHORTLISTED', notes: 'Digital interview scheduled.' }
    ];

    for (const app of sampleApplications) {
      if (!app.drive) continue;
      const profile = getProfileByPrn(app.prn);
      if (!profile) continue;

      const [existing, created] = await Application.findOrCreate({
        where: {
          studentId: profile.id,
          driveId: app.drive.id
        },
        defaults: {
          studentId: profile.id,
          driveId: app.drive.id,
          status: app.status,
          notes: app.notes,
          appliedAt: new Date(Date.now() - Math.floor(Math.random() * 10 + 1) * 24 * 60 * 60 * 1000)
        }
      });
      if (!created && existing.status !== app.status) {
        existing.status = app.status;
        existing.notes = app.notes;
        await existing.save();
      }
      console.log(`Application [${profile.user?.name} -> ${app.drive.companyName}]: ${created ? 'CREATED' : 'UPDATED'}`);
    }

    console.log('Placement drives and applications seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDrivesAndApplications();
