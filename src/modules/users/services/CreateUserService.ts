import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import { Bcryptjs } from "@shared/providers/hash/bcryptjs/Bcryptjs";
import { ICreateUser } from "../domain/models/ICreateUser";
import { IUser } from "../domain/models/IUser";
import { IUsersRepository } from "../domain/repositories/IUsersRepository";

@injectable()
class CreateUserService {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository,
    ) {}

    public async execute({
        name,
        email,
        password,
    }: ICreateUser): Promise<IUser> {
        const emailExists = await this.usersRepository.findByEmail(email);

        if (emailExists) {
            throw new AppError("Email address already used.");
        }

        const hashedPassword = await new Bcryptjs().generate(password);

        const user = await this.usersRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        return user;
    }
}

export default CreateUserService;
