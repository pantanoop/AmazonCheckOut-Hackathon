import { CreateUserService } from './create-user.service';
export declare class CreateUserController {
    private readonly createUserService;
    constructor(createUserService: CreateUserService);
    create(body: {
        name: string;
        email: string;
    }): Promise<import("./entities/create-user.entity").User>;
}
