import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface SeededUser {
  token: string;
  username: string;
  email: string;
  password: string;
}

const DEFAULT_PASSWORD = 'password123';

export async function createUser(
  app: INestApplication,
  overrides: Partial<{ username: string; email: string; password: string }> = {},
): Promise<SeededUser> {
  const username = overrides.username ?? `user_${Date.now()}`;
  const email = overrides.email ?? `${username}@example.com`;
  const password = overrides.password ?? DEFAULT_PASSWORD;

  await request(app.getHttpServer())
    .post('/api/users')
    .send({ username, email, password })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/api/users/login')
    .send({ email, password })
    .expect(200);

  return { token: loginRes.body.user.token, username, email, password };
}

export async function createArticle(
  app: INestApplication,
  token: string,
  overrides: Partial<{
    title: string;
    description: string;
    body: string;
    tagList: string[];
  }> = {},
): Promise<any> {
  const payload = {
    title: overrides.title ?? 'How to train your dragon',
    description: overrides.description ?? 'Ever wonder how?',
    body: overrides.body ?? 'You have to believe',
    tagList: overrides.tagList ?? ['dragons', 'training'],
  };

  const res = await request(app.getHttpServer())
    .post('/api/articles')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect(201);

  return res.body.article;
}
