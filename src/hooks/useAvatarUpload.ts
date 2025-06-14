
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload an avatar.",
        variant: "destructive",
      });
      return null;
    }

    // File size validation (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Avatar must be smaller than 5MB. Please choose a smaller file.",
        variant: "destructive",
      });
      return null;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      // Create unique filename with user ID folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
      }

      // Upload new file
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been successfully uploaded.",
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Delete all files in user's folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${user.id}/${file.name}`);
        const { error } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);

        if (error) {
          console.error('Error deleting files:', error);
        }
      }

      // Update profile to remove avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Avatar removed",
        description: "Your avatar has been successfully removed.",
      });

      return true;
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    uploading,
  };
};
