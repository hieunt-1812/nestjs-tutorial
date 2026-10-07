import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTables1790658373798 implements MigrationInterface {
  name = 'CreateArticlesTables1790658373798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_tags_name" UNIQUE ("name"), CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "body" text NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"), CONSTRAINT "PK_articles_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_slug" ON "articles" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_articles_authorId" ON "articles" ("authorId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_articles_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "article_tags" ("articleId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_article_tags" PRIMARY KEY ("articleId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_tags_articleId" ON "article_tags" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_tags_tagId" ON "article_tags" ("tagId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_article" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_tag" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `CREATE TABLE "article_favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "articleId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_article_user_favorite" UNIQUE ("articleId", "userId"), CONSTRAINT "PK_article_favorites_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_favorites_articleId" ON "article_favorites" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_article_favorites_userId" ON "article_favorites" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_article_favorites_article" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_article_favorites_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_article_favorites_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_article_favorites_article"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_article_favorites_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_article_favorites_articleId"`);
    await queryRunner.query(`DROP TABLE "article_favorites"`);

    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_article"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_article_tags_tagId"`);
    await queryRunner.query(`DROP INDEX "IDX_article_tags_articleId"`);
    await queryRunner.query(`DROP TABLE "article_tags"`);

    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_author"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_articles_authorId"`);
    await queryRunner.query(`DROP INDEX "IDX_articles_slug"`);
    await queryRunner.query(`DROP TABLE "articles"`);

    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
