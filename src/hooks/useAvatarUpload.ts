
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

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been successfully uploaded.",
      });

      return data.publicUrl;
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
      // Get current avatar URL from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (profile?.avatar_url) {
        // Extract file path from URL
        const url = new URL(profile.avatar_url);
        const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts of path

        // Delete from storage
        const { error } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting file:', error);
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
