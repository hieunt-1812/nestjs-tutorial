import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';

export interface ProfileResponse {
  profile: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(
    username: string,
    currentUserId?: string,
  ): Promise<ProfileResponse> {
    const target = await this.findUserByUsername(username);
    return { profile: await this.buildProfile(target, currentUserId) };
  }

  async follow(
    username: string,
    currentUserId: string,
  ): Promise<ProfileResponse> {
    const target = await this.findUserByUsername(username);

    if (target.id === currentUserId) {
      throw new BadRequestException('Không thể tự theo dõi chính mình');
    }

    const existing = await this.followsRepository.findOne({
      where: { followerId: currentUserId, followingId: target.id },
    });

    if (!existing) {
      await this.followsRepository.save(
        this.followsRepository.create({
          followerId: currentUserId,
          followingId: target.id,
        }),
      );
    }

    return { profile: await this.buildProfile(target, currentUserId) };
  }

  async unfollow(
    username: string,
    currentUserId: string,
  ): Promise<ProfileResponse> {
    const target = await this.findUserByUsername(username);

    await this.followsRepository.delete({
      followerId: currentUserId,
      followingId: target.id,
    });

    return { profile: await this.buildProfile(target, currentUserId) };
  }

  private async findUserByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  private async buildProfile(user: User, currentUserId?: string) {
    let following = false;

    if (currentUserId && currentUserId !== user.id) {
      const relation = await this.followsRepository.findOne({
        where: { followerId: currentUserId, followingId: user.id },
      });
      following = !!relation;
    }

    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    };
  }
}
