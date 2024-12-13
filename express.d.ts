// express.d.ts
import { Request } from "express";
import {UserType} from "./src/models/user.model"; 

declare module "express-serve-static-core" {
  interface Request {
    user?: UserType; 
  }
}
