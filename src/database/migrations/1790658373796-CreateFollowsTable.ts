import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowsTable1790658373796 implements MigrationInterface {
  name = 'CreateFollowsTable1790658373796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_follower_following" UNIQUE ("followerId", "followingId"), CONSTRAINT "PK_follows_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follows_followerId" ON "follows" ("followerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follows_followingId" ON "follows" ("followingId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_follows_followingId"`);
    await queryRunner.query(`DROP INDEX "IDX_follows_followerId"`);
    await queryRunner.query(`DROP TABLE "follows"`);
  }
}
