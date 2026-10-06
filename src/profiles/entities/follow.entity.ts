import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('follows')
@Unique('UQ_follower_following', ['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  followerId: string;

  @Index()
  @Column('uuid')
  followingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
