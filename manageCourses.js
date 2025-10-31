// manageCourses.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'arms-8a8b8'
});

const db = admin.firestore();

// New courses to add
const newCourses = [
  {
    code: '24AD2102',
    title: 'DATA SCIENCE AND VISUALIZATION',
    shortName: 'DSV',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'Madhu Oruganti',
    description: ''
  },
  {
    code: '24AD2103A',
    title: 'DATABASE MANAGEMENT SYSTEMS',
    shortName: 'DBMS',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'SUKLA SATAPATHY',
    description: ''
  },
  {
    code: '24CS06HF',
    title: 'ADVANCED DATA STRUCTURES',
    shortName: 'ADS',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'SUKLA SATAPATHY',
    description: ''
  },
  {
    code: '24CS2101',
    title: 'OPERATING SYSTEMS',
    shortName: 'OS',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'Saidireddy Malgireddy',
    description: ''
  },
  {
    code: '24MT2019',
    title: 'PROBABILITY AND STATISTICS',
    shortName: 'P&S',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'Gangamohan Paidi',
    description: ''
  },
  {
    code: '24SC2006A',
    title: 'OBJECT ORIENTED PROGRAMMING',
    shortName: 'OOPS',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'Purushottama Rao K',
    description: ''
  },
  {
    code: '24SDCS01A',
    title: 'FRONT END DEVELOPMENT FRAMEWORKS',
    shortName: 'FEDF',
    year: 2,
    academicYear: '2025-2026',
    semester: 'Odd Sem',
    facultyName: 'Sandeep Reddy Chitreddy',
    description: ''
  }
];

async function manageCourses() {
  try {
    console.log('🔄 Starting course management...\n');
    
    // Courses to keep (second year courses)
    const coursesToKeep = [
      '24AD2102',
      '24AD2103A',
      '24CS06HF',
      '24CS2101',
      '24MT2019',
      '24SC2006A',
      '24SDCS01A'
    ];
    
    // Step 1: Get all existing courses
    const snapshot = await db.collection('courses').get();
    const existingCourses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📚 Found ${existingCourses.length} existing courses\n`);
    
    // Step 2: Delete all courses EXCEPT the ones to keep
    const coursesToDelete = existingCourses.filter(course => 
      !coursesToKeep.includes(course.code)
    );
    
    if (coursesToDelete.length > 0) {
      console.log(`🗑️  Deleting ${coursesToDelete.length} first-year courses...\n`);
      for (const course of coursesToDelete) {
        await db.collection('courses').doc(course.id).delete();
        console.log(`   ✅ Deleted: ${course.code} - ${course.title}`);
      }
    } else {
      console.log('\n✨ No courses to delete!');
    }
    
    // Step 3: Update existing courses with short names and add missing courses
    console.log('\n📝 Updating courses with short names...');
    const existingCoursesMap = {};
    existingCourses.forEach(c => {
      if (coursesToKeep.includes(c.code)) {
        existingCoursesMap[c.code] = c;
      }
    });
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const newCourse of newCourses) {
      const existing = existingCoursesMap[newCourse.code];
      
      if (existing) {
        // Update existing course with short name
        await db.collection('courses').doc(existing.id).update({
          shortName: newCourse.shortName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Updated: ${newCourse.code} → ${newCourse.shortName}`);
        updatedCount++;
      } else {
        // Add new course
        const courseData = {
          ...newCourse,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('courses').add(courseData);
        console.log(`   ✅ Added: ${newCourse.code} - ${newCourse.title}`);
        addedCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COURSE MANAGEMENT COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   • First-year courses removed: ${coursesToDelete.length}`);
    console.log(`   • Courses updated with short names: ${updatedCount}`);
    console.log(`   • New courses added: ${addedCount}`);
    console.log(`   • Total courses now: 7 (second-year only)`);
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error managing courses:', error);
    process.exit(1);
  }
}

// Function to delete all news
async function deleteAllNews() {
  try {
    console.log('🗑️  Deleting all news/announcements...\n');
    
    const newsSnapshot = await db.collection('news').get();
    console.log(`Found ${newsSnapshot.size} news items to delete`);
    
    if (newsSnapshot.size === 0) {
      console.log('✨ No news items found!');
      return;
    }
    
    const deletePromises = newsSnapshot.docs.map(doc => 
      db.collection('news').doc(doc.id).delete()
    );
    
    await Promise.all(deletePromises);
    
    console.log('\n✅ All news items deleted successfully!');
    console.log(`Total deleted: ${newsSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error deleting news:', error);
  }
}

// Run the script - UNCOMMENT THE ONE YOU WANT TO RUN
// manageCourses();
deleteAllNews().then(() => process.exit(0));