// lib/supabase.js
// Supabase Client for file storage (images and voice audio)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. File upload will not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an image to Supabase Storage
 * @param {string} base64Data - Base64 encoded image data (without data:image prefix)
 * @param {string} itemId - Unique ID for the item
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadImage(base64Data, itemId) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Convert base64 to blob
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${itemId}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true, // Replace if exists
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

/**
 * Upload a voice audio file to Supabase Storage
 * @param {Blob} audioBlob - Audio blob
 * @param {string} itemId - Unique ID for the item
 * @returns {Promise<string>} - Public URL of uploaded audio
 */
export async function uploadVoiceAudio(audioBlob, itemId) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const fileName = `${itemId}.webm`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('voice-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('voice-audio')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Audio upload failed:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - Public URL of the image
 */
export async function deleteImage(imageUrl) {
  if (!supabase || !imageUrl) return;

  try {
    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();

    await supabase.storage
      .from('images')
      .remove([fileName]);
  } catch (error) {
    console.error('Image deletion failed:', error);
  }
}

/**
 * Delete voice audio from Supabase Storage
 * @param {string} audioUrl - Public URL of the audio
 */
export async function deleteVoiceAudio(audioUrl) {
  if (!supabase || !audioUrl) return;

  try {
    const fileName = audioUrl.split('/').pop();

    await supabase.storage
      .from('voice-audio')
      .remove([fileName]);
  } catch (error) {
    console.error('Audio deletion failed:', error);
  }
}
