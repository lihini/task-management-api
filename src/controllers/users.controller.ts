import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/users';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getUsers();
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }
}