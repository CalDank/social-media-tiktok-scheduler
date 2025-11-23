import cron from 'node-cron';
import { dbAll } from '../database/db.js';
import { Post } from '../models/Post.js';
import { postToTikTok } from './tiktokService.js';

// Check for posts that need to be published every minute
export function startScheduler() {
  console.log('Starting post scheduler...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const oneMinuteFromNow = new Date(now.getTime() + 60000);
      
      // Find posts that are scheduled and due to be posted
      const sql = `
        SELECT * FROM posts 
        WHERE status = 'scheduled' 
        AND scheduled_datetime <= ? 
        AND scheduled_datetime > ?
      `;
      
      const rows = await dbAll(sql, [
        oneMinuteFromNow.toISOString(),
        new Date(now.getTime() - 60000).toISOString() // Posts from last minute to now
      ]);

      for (const row of rows) {
        const post = new Post(row);
        console.log(`Processing scheduled post: ${post.id} - ${post.title}`);
        
        try {
          // Attempt to post to TikTok
          const success = await postToTikTok(post);
          
          if (success) {
            await post.markAsPosted();
            console.log(`Post ${post.id} published successfully`);
          } else {
            await post.markAsFailed();
            console.error(`Failed to publish post ${post.id}`);
          }
        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error);
          await post.markAsFailed();
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });
  
  console.log('Scheduler started - checking for posts every minute');
}

