import { createClient } from '@supabase/supabase-js';
import { CustomizedStory } from '../types/story';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const API_BASE_URL = '/api/supabase';

export async function saveStoryToSupabase(story: CustomizedStory, userId: string) {
  try {
    // Generate a unique story ID if one doesn't exist
    const storyId =  uuidv4() ;
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story: {
        user_id: userId,
        story_id: storyId,
        character: story.character,
        pages: story.pages,
        date_created: story.dateCreated,
        title: story.title || 'Untitled Story'
      }}),
    });

    if (!response.ok) {
      throw new Error('Failed to save story');
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
}

export async function getUserStories(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }

    const { data } = await response.json();
    console.log('Raw API response:', data);
    
    const transformedData = data.map((story: any) => {
      const transformed = {
        ...story,
        storyId: story.story_id,
        dateCreated: new Date(story.date_created)
      };
      console.log('Transformed story:', transformed);
      return transformed;
    });
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching user stories:', error);
    throw error;
  }
}

export async function deleteStoryFromSupabase(storyId: string, userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?storyId=${storyId}&userId=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete story');
    }

    const { success } = await response.json();
    return success;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
} 