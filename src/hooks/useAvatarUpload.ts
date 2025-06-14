
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload an avatar",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
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
      const fileName = `${user.id}/avatar`;
      
      // List all files starting with the avatar filename
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id, {
          search: 'avatar'
        });

      if (listError) throw listError;

      // Delete all avatar files for this user
      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${user.id}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });

      return true;
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Failed to remove avatar",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadAvatar,
    removeAvatar,
    uploading
  };
};
