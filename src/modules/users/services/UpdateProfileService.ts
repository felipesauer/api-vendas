import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import { Bcryptjs } from "@shared/providers/hash/bcryptjs/Bcryptjs";
import { IUpdateProfile } from "../domain/models/IUpdateProfile";
import { IUser } from "../domain/models/IUser";
import { IUsersRepository } from "../domain/repositories/IUsersRepository";

@injectable()
class UpdateProfileService {
    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository,
    ) {}

    public async execute({
        user_id,
        name,
        email,
        password,
        old_password,
    }: IUpdateProfile): Promise<IUser> {
        const user = await this.usersRepository.findById(user_id);

        if (!user) {
            throw new AppError("User not found.");
        }

        const userUpdateEmail = await this.usersRepository.findByEmail(email);

        if (userUpdateEmail && userUpdateEmail.id !== user_id) {
            throw new AppError("There is already one user with this email.");
        }

        if (password && !old_password) {
            throw new AppError("Old password is required.");
        }

        const checkOldPassword = await new Bcryptjs().compare(
            old_password as string,
            user.password,
        );

        if (!checkOldPassword) {
            throw new AppError("Old password does not match.");
        }

        user.password = await new Bcryptjs().generate(password as string);

        user.name = name;
        user.email = email;

        await this.usersRepository.save(user);

        return user;
    }
}

export default UpdateProfileService;
