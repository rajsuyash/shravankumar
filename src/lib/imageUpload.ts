import { supabase } from './supabase';

export const uploadCircuitImage = async (
  file: File,
  circuitId?: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${circuitId || 'temp'}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('circuit-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('circuit-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteCircuitImage = async (imageUrl: string): Promise<void> => {
  const urlParts = imageUrl.split('/circuit-images/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('circuit-images')
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

export const getImagePublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('circuit-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
