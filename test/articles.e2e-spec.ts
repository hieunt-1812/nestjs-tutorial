import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app.factory';
import { truncateDatabase } from './utils/database.helper';
import { createUser, createArticle, SeededUser } from './utils/seed.helper';

describe('ArticlesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateDatabase(app);
  });

  describe('POST /api/articles', () => {
    it('tạo bài viết thành công (201) và trả đúng cấu trúc RealWorld', async () => {
      const author = await createUser(app, { username: 'john' });

      const res = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${author.token}`)
        .send({
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          body: 'You have to believe',
          tagList: ['dragons', 'training'],
        })
        .expect(201);

      expect(res.body.article).toBeDefined();
      expect(res.body.article.slug).toContain('how-to-train-your-dragon');
      expect(res.body.article.favorited).toBe(false);
      expect(res.body.article.favoritesCount).toBe(0);
      expect(res.body.article.tagList.sort()).toEqual(['dragons', 'training']);
      expect(res.body.article.author.username).toBe('john');
      expect(res.body.article.author.following).toBe(false);
    });

    it('thiếu token -> 401', async () => {
      await request(app.getHttpServer())
        .post('/api/articles')
        .send({ title: 'x', description: 'y', body: 'z' })
        .expect(401);
    });

    it('thiếu trường bắt buộc (title) -> 400', async () => {
      const author = await createUser(app);

      await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${author.token}`)
        .send({ description: 'y', body: 'z' })
        .expect(400);
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('lấy bài viết tồn tại -> 200', async () => {
      const author = await createUser(app);
      const article = await createArticle(app, author.token);

      const res = await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}`)
        .expect(200);

      expect(res.body.article.slug).toBe(article.slug);
    });

    it('slug không tồn tại -> 404', async () => {
      await request(app.getHttpServer())
        .get('/api/articles/khong-ton-tai')
        .expect(404);
    });
  });

  describe('GET /api/articles', () => {
    it('danh sách + lọc theo tag -> 200', async () => {
      const author = await createUser(app);
      await createArticle(app, author.token, { tagList: ['dragons'] });

      const res = await request(app.getHttpServer())
        .get('/api/articles?tag=dragons')
        .expect(200);

      expect(res.body.articlesCount).toBe(1);
      expect(res.body.articles).toHaveLength(1);
    });
  });

  describe('PUT /api/articles/:slug', () => {
    let author: SeededUser;
    let slug: string;

    beforeEach(async () => {
      author = await createUser(app, { username: 'owner' });
      const article = await createArticle(app, author.token);
      slug = article.slug;
    });

    it('tác giả cập nhật -> 200 và slug đổi theo title mới', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/articles/${slug}`)
        .set('Authorization', `Bearer ${author.token}`)
        .send({ title: 'A brand new title' })
        .expect(200);

      expect(res.body.article.title).toBe('A brand new title');
      expect(res.body.article.slug).toContain('a-brand-new-title');
    });

    it('không phải tác giả -> 403', async () => {
      const other = await createUser(app, { username: 'stranger' });

      await request(app.getHttpServer())
        .put(`/api/articles/${slug}`)
        .set('Authorization', `Bearer ${other.token}`)
        .send({ title: 'Hacked' })
        .expect(403);
    });

    it('thiếu token -> 401', async () => {
      await request(app.getHttpServer())
        .put(`/api/articles/${slug}`)
        .send({ title: 'x' })
        .expect(401);
    });
  });

  describe('DELETE /api/articles/:slug', () => {
    it('tác giả xóa -> 200, sau đó GET -> 404', async () => {
      const author = await createUser(app);
      const article = await createArticle(app, author.token);

      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}`)
        .set('Authorization', `Bearer ${author.token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}`)
        .expect(404);
    });

    it('không phải tác giả -> 403', async () => {
      const author = await createUser(app, { username: 'owner2' });
      const article = await createArticle(app, author.token);
      const other = await createUser(app, { username: 'intruder' });

      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}`)
        .set('Authorization', `Bearer ${other.token}`)
        .expect(403);
    });
  });

  describe('Favorite / Unfavorite', () => {
    it('favorite -> favorited=true, count=1; unfavorite -> false, count=0', async () => {
      const author = await createUser(app);
      const article = await createArticle(app, author.token);

      const favRes = await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/favorite`)
        .set('Authorization', `Bearer ${author.token}`)
        .expect(201);
      expect(favRes.body.article.favorited).toBe(true);
      expect(favRes.body.article.favoritesCount).toBe(1);

      const unfavRes = await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/favorite`)
        .set('Authorization', `Bearer ${author.token}`)
        .expect(200);
      expect(unfavRes.body.article.favorited).toBe(false);
      expect(unfavRes.body.article.favoritesCount).toBe(0);
    });
  });

  describe('GET /api/articles/feed', () => {
    it('trả bài viết của người đang follow -> 200', async () => {
      const author = await createUser(app, { username: 'writer' });
      await createArticle(app, author.token);
      const reader = await createUser(app, { username: 'reader' });

      await request(app.getHttpServer())
        .post(`/api/profiles/${author.username}/follow`)
        .set('Authorization', `Bearer ${reader.token}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/articles/feed')
        .set('Authorization', `Bearer ${reader.token}`)
        .expect(200);

      expect(res.body.articlesCount).toBe(1);
      expect(res.body.articles[0].author.username).toBe('writer');
      expect(res.body.articles[0].author.following).toBe(true);
    });

    it('thiếu token -> 401', async () => {
      await request(app.getHttpServer()).get('/api/articles/feed').expect(401);
    });
  });
});
