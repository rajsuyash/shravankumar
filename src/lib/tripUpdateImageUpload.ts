import { supabase } from './supabase';

export const uploadTripUpdatePhoto = async (
  file: File,
  tripId: string,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${tripId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('trip-update-photos')
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('trip-update-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};
