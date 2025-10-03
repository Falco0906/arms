import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const examPackService = {
  // Generate exam pack with relevant materials
  async generateExamPack(courseId, packType = 'full') {
    try {
      // Define material types for exam revision (excluding assignments/quizzes)
      const examMaterialTypes = [
        'notes',
        'lecture-notes', 
        'past-papers',
        'summaries',
        'study-guides',
        'reference-materials',
        'textbook',
        'slides'
      ];

      // Exclude assignment and quiz types
      const excludeTypes = [
        'assignment',
        'quiz',
        'homework',
        'project',
        'lab-assignment'
      ];

      // Get materials for the course
      const materialsQuery = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        where('type', 'in', examMaterialTypes),
        orderBy('type'),
        orderBy('uploadDate', 'desc')
      );

      const materialsSnapshot = await getDocs(materialsQuery);
      const materials = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (materials.length === 0) {
        throw new Error('No exam materials found for this course');
      }

      // Create ZIP file
      const zip = new JSZip();
      
      // Organize materials by type
      const materialsByType = materials.reduce((acc, material) => {
        const type = material.type || 'general';
        if (!acc[type]) acc[type] = [];
        acc[type].push(material);
        return acc;
      }, {});

      // Download and add files to ZIP
      const downloadPromises = [];
      
      for (const [type, typeMaterials] of Object.entries(materialsByType)) {
        const folder = zip.folder(type.replace('-', ' ').toUpperCase());
        
        for (const material of typeMaterials) {
          downloadPromises.push(
            this.addFileToZip(folder, material)
          );
        }
      }

      // Wait for all downloads to complete
      await Promise.all(downloadPromises);

      // Generate exam pack metadata
      const metadata = {
        courseId,
        packType,
        generatedAt: new Date().toISOString(),
        materialCount: materials.length,
        materialTypes: Object.keys(materialsByType),
        contents: materials.map(m => ({
          title: m.title,
          type: m.type,
          uploadDate: m.uploadDate
        }))
      };

      // Add metadata file
      zip.file('EXAM_PACK_INFO.json', JSON.stringify(metadata, null, 2));
      zip.file('README.txt', this.generateReadmeContent(metadata));

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const filename = `${courseId}_exam_pack_${Date.now()}.zip`;
      
      // Save exam pack generation record
      await this.saveExamPackRecord(courseId, metadata, filename);
      
      saveAs(content, filename);
      
      return {
        success: true,
        filename,
        materialCount: materials.length,
        metadata
      };

    } catch (error) {
      console.error('Error generating exam pack:', error);
      throw error;
    }
  },

  // Add file to ZIP folder
  async addFileToZip(folder, material) {
    try {
      const fileRef = ref(storage, `materials/${material.path}`);
      const downloadURL = await getDownloadURL(fileRef);
      
      // Fetch file content
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      
      // Add to ZIP with safe filename
      const safeFilename = this.getSafeFilename(material.title, material.filename);
      folder.file(safeFilename, blob);
      
    } catch (error) {
      console.warn(`Failed to add file ${material.title} to ZIP:`, error);
      // Continue with other files even if one fails
    }
  },

  // Generate README content for exam pack
  generateReadmeContent(metadata) {
    return `
ARMS Platform - Exam Pack
========================

Course: ${metadata.courseId}
Generated: ${new Date(metadata.generatedAt).toLocaleString()}
Total Materials: ${metadata.materialCount}

Material Types Included:
${metadata.materialTypes.map(type => `- ${type.replace('-', ' ').toUpperCase()}`).join('\n')}

Contents:
${metadata.contents.map(item => `- ${item.title} (${item.type})`).join('\n')}

Note: This exam pack excludes assignments, quizzes, and homework materials.
It contains only study materials relevant for exam preparation.

Good luck with your studies!
ARMS Platform Team
    `.trim();
  },

  // Get safe filename for ZIP
  getSafeFilename(title, originalFilename) {
    const cleanTitle = title.replace(/[^a-zA-Z0-9._-]/g, '_');
    const extension = originalFilename ? originalFilename.split('.').pop() : 'file';
    return `${cleanTitle}.${extension}`;
  },

  // Save exam pack generation record
  async saveExamPackRecord(courseId, metadata, filename) {
    try {
      await addDoc(collection(db, 'examPacks'), {
        courseId,
        filename,
        metadata,
        generatedAt: serverTimestamp(),
        downloadCount: 0
      });
    } catch (error) {
      console.warn('Failed to save exam pack record:', error);
      // Non-critical error, don't throw
    }
  },

  // Get exam pack history for a course
  async getExamPackHistory(courseId, limit = 10) {
    try {
      const historyQuery = query(
        collection(db, 'examPacks'),
        where('courseId', '==', courseId),
        orderBy('generatedAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting exam pack history:', error);
      throw error;
    }
  },

  // Generate custom pack with selected materials
  async generateCustomPack(selectedMaterials, packName = 'Custom Pack') {
    try {
      if (!selectedMaterials || selectedMaterials.length === 0) {
        throw new Error('No materials selected for custom pack');
      }

      const zip = new JSZip();
      
      // Add selected materials to ZIP
      const downloadPromises = selectedMaterials.map(material => 
        this.addFileToZip(zip, material)
      );

      await Promise.all(downloadPromises);

      // Generate custom pack metadata
      const metadata = {
        packName,
        packType: 'custom',
        generatedAt: new Date().toISOString(),
        materialCount: selectedMaterials.length,
        contents: selectedMaterials.map(m => ({
          title: m.title,
          type: m.type,
          courseId: m.courseId
        }))
      };

      zip.file('CUSTOM_PACK_INFO.json', JSON.stringify(metadata, null, 2));

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const filename = `${packName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.zip`;
      
      saveAs(content, filename);
      
      return {
        success: true,
        filename,
        materialCount: selectedMaterials.length,
        metadata
      };

    } catch (error) {
      console.error('Error generating custom pack:', error);
      throw error;
    }
  },

  // Quick exam pack for urgent revision (most recent and highest rated)
  async generateQuickExamPack(courseId) {
    try {
      // Get recent high-quality materials
      const recentQuery = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        where('type', 'in', ['notes', 'past-papers', 'summaries']),
        orderBy('uploadDate', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(recentQuery);
      let materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by rating if available
      materials = materials
        .filter(m => !['assignment', 'quiz', 'homework'].includes(m.type))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10); // Top 10 materials

      return await this.generateCustomPack(materials, 'Quick Exam Pack');

    } catch (error) {
      console.error('Error generating quick exam pack:', error);
      throw error;
    }
  }
};