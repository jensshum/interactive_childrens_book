import { createClient } from '@supabase/supabase-js';
import { CustomizedStory } from '../types/story';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveStoryToSupabase(story: CustomizedStory, userId: string) {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([
        {
          user_id: userId,
          story_id: story.storyId,
          character: story.character,
          pages: story.pages,
          date_created: story.dateCreated,
          title: story.title || 'Untitled Story'
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving story to Supabase:', error);
    throw error;
  }
}

export async function getUserStories(userId: string) {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('date_created', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user stories:', error);
    throw error;
  }
}

export async function deleteStoryFromSupabase(storyId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .match({ story_id: storyId, user_id: userId });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting story from Supabase:', error);
    throw error;
  }
} 