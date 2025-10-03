import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

export const announcementService = {
  // Create a new announcement
  async createAnnouncement(announcementData) {
    try {
      const announcement = {
        ...announcementData,
        createdAt: serverTimestamp(),
        status: 'active',
        views: 0,
        priority: announcementData.priority || 'normal' // low, normal, high, urgent
      };

      const docRef = await addDoc(collection(db, 'announcements'), announcement);
      
      // Create notifications for all course students if specified
      if (announcementData.notifyStudents && announcementData.courseId) {
        await this.notifyCoursStudents(docRef.id, announcementData);
      }

      return {
        id: docRef.id,
        ...announcement
      };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Get announcements for a course
  async getCourseAnnouncements(courseId, limitCount = 50) {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('courseId', '==', courseId),
        where('status', '==', 'active'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting course announcements:', error);
      throw error;
    }
  },

  // Get recent announcements (global)
  async getRecentAnnouncements(limitCount = 10) {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recent announcements:', error);
      throw error;
    }
  },

  // Get urgent announcements
  async getUrgentAnnouncements(courseId = null) {
    try {
      let announcementsQuery = query(
        collection(db, 'announcements'),
        where('priority', '==', 'urgent'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      if (courseId) {
        announcementsQuery = query(
          collection(db, 'announcements'),
          where('courseId', '==', courseId),
          where('priority', '==', 'urgent'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(announcementsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting urgent announcements:', error);
      throw error;
    }
  },

  // Update announcement
  async updateAnnouncement(announcementId, updateData) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete announcement (soft delete)
  async deleteAnnouncement(announcementId) {
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Mark announcement as viewed
  async markAsViewed(announcementId, userId) {
    try {
      // Add to announcement views
      const announcementRef = doc(db, 'announcements', announcementId);
      await updateDoc(announcementRef, {
        views: increment(1)
      });

      // Track user view
      await addDoc(collection(db, 'announcementViews'), {
        announcementId,
        userId,
        viewedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking announcement as viewed:', error);
      throw error;
    }
  },

  // Notify course students about announcement
  async notifyCoursStudents(announcementId, announcementData) {
    try {
      // Get course students (this would depend on your user-course relationship)
      // For now, we'll create a general notification system
      
      const notification = {
        type: 'announcement',
        title: `New Announcement: ${announcementData.title}`,
        message: announcementData.content.substring(0, 100) + '...',
        announcementId,
        courseId: announcementData.courseId,
        priority: announcementData.priority,
        createdAt: serverTimestamp(),
        read: false
      };

      // This would typically query enrolled students and create individual notifications
      // For demonstration, we'll create a broadcast notification
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        targetType: 'course',
        targetId: announcementData.courseId
      });

    } catch (error) {
      console.error('Error notifying course students:', error);
      throw error;
    }
  },

  // Get announcement templates for teachers
  getAnnouncementTemplates() {
    return [
      {
        id: 'exam-announcement',
        title: 'Upcoming Exam',
        template: `Dear Students,

This is to inform you that the {examType} examination for {courseName} is scheduled for:

Date: {examDate}
Time: {examTime}
Venue: {examVenue}
Duration: {examDuration}

Topics to be covered:
- {topic1}
- {topic2}
- {topic3}

Please bring:
- Valid ID card
- Required stationery
- Calculator (if applicable)

Good luck with your preparation!

Best regards,
{teacherName}`,
        priority: 'high',
        type: 'exam'
      },
      {
        id: 'assignment-due',
        title: 'Assignment Due Reminder',
        template: `Dear Students,

This is a reminder that Assignment {assignmentNumber} for {courseName} is due on {dueDate} at {dueTime}.

Assignment Details:
- Title: {assignmentTitle}
- Submission format: {submissionFormat}
- Maximum marks: {maxMarks}

Submission Guidelines:
- {guideline1}
- {guideline2}
- {guideline3}

Late submissions will incur penalties as per course policy.

Best regards,
{teacherName}`,
        priority: 'normal',
        type: 'assignment'
      },
      {
        id: 'class-cancellation',
        title: 'Class Cancellation',
        template: `Dear Students,

Due to {reason}, the {classType} scheduled for {originalDate} at {originalTime} has been cancelled.

Makeup class details:
- Date: {makeupDate}
- Time: {makeupTime}
- Venue: {makeupVenue}

Please make note of this change and plan accordingly.

Best regards,
{teacherName}`,
        priority: 'urgent',
        type: 'schedule'
      },
      {
        id: 'material-upload',
        title: 'New Study Material Available',
        template: `Dear Students,

New study material has been uploaded for {courseName}:

Material Details:
- Title: {materialTitle}
- Type: {materialType}
- Topics covered: {topics}

You can access the material from the course page under the Materials section.

This material will be helpful for your upcoming {examType}.

Best regards,
{teacherName}`,
        priority: 'normal',
        type: 'material'
      },
      {
        id: 'general-notice',
        title: 'General Notice',
        template: `Dear Students,

{noticeContent}

For any queries, please contact me during office hours or via email.

Best regards,
{teacherName}`,
        priority: 'normal',
        type: 'general'
      }
    ];
  },

  // Create announcement from template
  async createFromTemplate(templateId, templateData, courseId, authorId) {
    try {
      const templates = this.getAnnouncementTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Replace placeholders in template
      let content = template.template;
      Object.entries(templateData).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });

      const announcementData = {
        title: templateData.title || template.title,
        content,
        type: template.type,
        priority: template.priority,
        courseId,
        authorId,
        templateId: template.id,
        notifyStudents: true
      };

      return await this.createAnnouncement(announcementData);
    } catch (error) {
      console.error('Error creating announcement from template:', error);
      throw error;
    }
  }
};