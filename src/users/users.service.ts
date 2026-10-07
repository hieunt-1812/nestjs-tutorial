import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AttachmentsService } from '../attachments/attachments.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('Username hoặc Email đã tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = savedUser;

    return { user: userWithoutPassword };
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const { username, email, password, bio, image } = updateUserDto;

    if (username && username !== user.username) {
      await this.ensureUniqueField('username', username, userId);
      user.username = username;
    }

    if (email && email !== user.email) {
      await this.ensureUniqueField('email', email, userId);
      user.email = email;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (avatar) {
      const attachment = await this.attachmentsService.createForEntity(
        'user',
        user.id,
        avatar,
      );
      user.image = attachment.url;
    } else if (image !== undefined) {
      user.image = image;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const savedUser = await this.usersRepository.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;

    return { user: userWithoutPassword };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  private async ensureUniqueField(
    field: 'username' | 'email',
    value: string,
    excludeUserId: string,
  ) {
    const conflict = await this.usersRepository.findOne({
      where: { [field]: value, id: Not(excludeUserId) },
    });
    if (conflict) {
      throw new ConflictException('Username hoặc Email đã tồn tại');
    }
  }
}
