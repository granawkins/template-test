import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export const app = express();
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');

// Tweet interface
interface Tweet {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

// In-memory storage for tweets
const tweets: Tweet[] = [];

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// Basic route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Twitter Clone API!' });
});

// Get all tweets
app.get('/api/tweets', (req: Request, res: Response) => {
  // Return tweets sorted by newest first (non-mutating sort)
  const sortedTweets = [...tweets].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  res.json(sortedTweets);
});

// Post a new tweet
app.post('/api/tweets', (req: Request, res: Response) => {
  const { content, author } = req.body;

  // Trim values first, then validate
  const contentTrimmed = (content ?? '').trim();
  const authorTrimmed = (author ?? '').trim();

  if (!contentTrimmed || !authorTrimmed) {
    return res.status(400).json({ error: 'Content and author are required' });
  }

  if (contentTrimmed.length > 280) {
    return res
      .status(400)
      .json({ error: 'Tweet content cannot exceed 280 characters' });
  }

  const newTweet: Tweet = {
    id: randomUUID(),
    content: contentTrimmed,
    author: authorTrimmed,
    timestamp: new Date(),
  };

  tweets.push(newTweet);

  res.status(201).json(newTweet);
});

// Serve React app or fallback page
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(CLIENT_DIST_PATH, 'index.html');

  // Check if the built client exists
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Serve a simple fallback page when the client hasn't been built
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mentat Template JS</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>Mentat Template JS</h1>
          <p>Everything is working correctly.</p>
          <p>This route renders the built project from the <code>/dist</code> directory, but there's currently nothing there.</p>
          <p>You can ask Mentat to build the project to see the React app here, or build it yourself with <code>npm run build</code>.</p>
          <p><a href="/api">Go to API endpoint</a></p>
        </body>
      </html>
    `);
  }
});
