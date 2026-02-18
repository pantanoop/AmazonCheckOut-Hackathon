import { DataSource } from 'typeorm';
import { User } from './entities/create-user.entity';
export declare class CreateUserService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    create(createUserDto: {
        name: string;
        email: string;
    }): Promise<User>;
}
