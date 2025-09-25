import request from 'supertest';
import { app } from '../app';

describe('API Endpoints', () => {
  it('should return welcome message on GET /api', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Welcome to the Twitter Clone API!');
  });

  it('should serve the React app on GET /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/html');
  });

  it('should return empty array on GET /api/tweets initially', async () => {
    const response = await request(app).get('/api/tweets');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new tweet on POST /api/tweets', async () => {
    const tweetData = {
      content: 'Test tweet content',
      author: 'Test Author',
    };

    const response = await request(app).post('/api/tweets').send(tweetData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('content', tweetData.content);
    expect(response.body).toHaveProperty('author', tweetData.author);
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should validate required fields on POST /api/tweets', async () => {
    const response = await request(app)
      .post('/api/tweets')
      .send({ content: '', author: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Content and author are required');
  });

  it('should validate tweet length on POST /api/tweets', async () => {
    const longContent = 'A'.repeat(281);
    const response = await request(app)
      .post('/api/tweets')
      .send({ content: longContent, author: 'Test Author' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(
      'Tweet content cannot exceed 280 characters'
    );
  });
});
