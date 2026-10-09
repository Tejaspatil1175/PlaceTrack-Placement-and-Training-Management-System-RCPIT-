const { sequelize, User, StudentProfile, SemesterRecord, Department } = require('../models');
const { hashPassword } = require('../utils/password');
const { recalculateStudentAcademics } = require('../services/academicEngine');

const studentsData = [
  {
    prn: '2021012345',
    name: 'Rahul Ramesh Sharma',
    email: 'rahul.sharma@rcpit.ac.in',
    phone: '9876543210',
    departmentId: 1,
    branch: 'Computer Engineering',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'Docker'],
    semesters: [
      { num: 1, sgpa: 8.40, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 8.60, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 8.80, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 8.90, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 9.10, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 8.95, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012346',
    name: 'Priya Suresh Patel',
    email: 'priya.patel@rcpit.ac.in',
    phone: '9876543211',
    departmentId: 2,
    branch: 'Information Technology',
    division: 'B',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Python', 'Django', 'React', 'AWS', 'PostgreSQL'],
    semesters: [
      { num: 1, sgpa: 8.90, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 9.10, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 9.25, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 9.00, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 9.35, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 9.20, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012347',
    name: 'Amit Vikram Singh',
    email: 'amit.singh@rcpit.ac.in',
    phone: '9876543212',
    departmentId: 3,
    branch: 'Artificial Intelligence and Data Science',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis', 'NLP'],
    semesters: [
      { num: 1, sgpa: 7.20, credits: 22, newBacklogs: 1, clearedBacklogs: 0 },
      { num: 2, sgpa: 7.40, credits: 22, newBacklogs: 0, clearedBacklogs: 1 },
      { num: 3, sgpa: 7.60, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 7.15, credits: 24, newBacklogs: 1, clearedBacklogs: 0 },
      { num: 5, sgpa: 7.50, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 7.30, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012348',
    name: 'Neha Rajesh Deshmukh',
    email: 'neha.deshmukh@rcpit.ac.in',
    phone: '9876543213',
    departmentId: 1,
    branch: 'Computer Engineering',
    division: 'B',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['C++', 'Data Structures', 'Algorithms', 'JavaScript', 'Node.js'],
    semesters: [
      { num: 1, sgpa: 8.70, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 8.85, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 9.00, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 8.95, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 9.15, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 8.80, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012349',
    name: 'Sanket Vijay Patil',
    email: 'sanket.patil@rcpit.ac.in',
    phone: '9876543214',
    departmentId: 4,
    branch: 'Electronics and Telecommunication Engineering',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Embedded C', 'IoT', 'VLSI', 'MATLAB', 'Microcontrollers'],
    semesters: [
      { num: 1, sgpa: 6.50, credits: 22, newBacklogs: 2, clearedBacklogs: 0 },
      { num: 2, sgpa: 6.80, credits: 22, newBacklogs: 0, clearedBacklogs: 1 },
      { num: 3, sgpa: 6.40, credits: 24, newBacklogs: 1, clearedBacklogs: 0 },
      { num: 4, sgpa: 6.70, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 6.60, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 6.90, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012350',
    name: 'Aniket Sunil Chaudhari',
    email: 'aniket.chaudhari@rcpit.ac.in',
    phone: '9876543215',
    departmentId: 5,
    branch: 'Mechanical Engineering',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'CATIA', 'Thermodynamics'],
    semesters: [
      { num: 1, sgpa: 7.80, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 8.00, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 7.90, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 8.10, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 8.25, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 8.05, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012351',
    name: 'Pooja Manoj Mahajan',
    email: 'pooja.mahajan@rcpit.ac.in',
    phone: '9876543216',
    departmentId: 6,
    branch: 'Civil Engineering',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Revit', 'AutoCAD Civil 3D', 'STAAD Pro', 'GIS', 'Surveying'],
    semesters: [
      { num: 1, sgpa: 7.95, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 8.15, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 8.30, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 8.20, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 8.40, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 8.50, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  },
  {
    prn: '2021012352',
    name: 'Gaurav Dinesh Kulkarni',
    email: 'gaurav.kulkarni@rcpit.ac.in',
    phone: '9876543217',
    departmentId: 1,
    branch: 'Computer Engineering',
    division: 'A',
    admissionYear: 2021,
    currentSemester: 7,
    skills: ['Go', 'Kubernetes', 'Microservices', 'GraphQL', 'MongoDB'],
    semesters: [
      { num: 1, sgpa: 9.10, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 2, sgpa: 9.25, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 3, sgpa: 9.40, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 4, sgpa: 9.35, credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 5, sgpa: 9.50, credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { num: 6, sgpa: 9.45, credits: 22, newBacklogs: 0, clearedBacklogs: 0 }
    ]
  }
];

const seedStudents = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    for (const item of studentsData) {
      const passwordHash = await hashPassword(item.prn);

      let [user] = await User.findOrCreate({
        where: { prn: item.prn },
        defaults: {
          name: item.name,
          email: item.email,
          prn: item.prn,
          phone: item.phone,
          role: 'student',
          departmentId: item.departmentId,
          passwordHash,
          mustResetPassword: true
        }
      });

      // Update fields if existed
      user.name = item.name;
      user.email = item.email;
      user.phone = item.phone;
      user.departmentId = item.departmentId;
      await user.save();

      let [profile] = await StudentProfile.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          branch: item.branch,
          division: item.division,
          admissionYear: item.admissionYear,
          currentSemester: item.currentSemester,
          skills: item.skills,
          address: 'RCPIT Campus, Shirpur'
        }
      });

      profile.branch = item.branch;
      profile.division = item.division;
      profile.admissionYear = item.admissionYear;
      profile.currentSemester = item.currentSemester;
      profile.skills = item.skills;
      await profile.save();

      // Upsert semester records
      for (const sem of item.semesters) {
        let [rec] = await SemesterRecord.findOrCreate({
          where: {
            studentId: profile.id,
            semesterNumber: sem.num
          },
          defaults: {
            studentId: profile.id,
            semesterNumber: sem.num,
            sgpa: sem.sgpa,
            credits: sem.credits,
            newBacklogs: sem.newBacklogs,
            clearedBacklogs: sem.clearedBacklogs
          }
        });

        rec.sgpa = sem.sgpa;
        rec.credits = sem.credits;
        rec.newBacklogs = sem.newBacklogs;
        rec.clearedBacklogs = sem.clearedBacklogs;
        await rec.save();
      }

      // Trigger recalculateStudentAcademics engine
      await recalculateStudentAcademics(profile.id);
      console.log(`Seeded & recalculated: ${item.name} (${item.prn}) - ${item.branch}`);
    }

    console.log('\nAll student records seeded and academic CGPAs computed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();
