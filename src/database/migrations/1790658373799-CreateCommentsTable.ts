import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1790658373799 implements MigrationInterface {
  name = 'CreateCommentsTable1790658373799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" text NOT NULL, "articleId" uuid NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_articleId" ON "comments" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_authorId" ON "comments" ("authorId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_article" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_comments_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_article"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_comments_authorId"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_articleId"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
