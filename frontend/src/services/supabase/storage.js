import { supabase, STORAGE_BUCKET } from '../../supabaseClient';

export const supabaseStorageService = {
  /**
   * Upload a file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} filename - The filename to use in storage
   * @returns {Promise<{url: string, path: string}>}
   */
  uploadFile: async (file, filename) => {
    if (!supabase) throw new Error('Supabase is not configured');

    const filePath = `${Date.now()}-${filename}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  },

  /**
   * Delete a file from Supabase Storage
   * @param {string} filePath - The path of the file to delete
   */
  deleteFile: async (filePath) => {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  },

  /**
   * Get public URL for a file
   * @param {string} filePath - The path of the file
   * @returns {string}
   */
  getPublicUrl: (filePath) => {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
