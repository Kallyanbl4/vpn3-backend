// src/auth/types/jwt-payload.type.ts
import { Role } from '../../user/enums/role.enum';

export interface JwtPayload {
  /**
   * User ID (subject)
   */
  sub: number;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * User roles
   */
  roles: Role[];
  
  /**
   * JWT issued at timestamp
   */
  iat?: number;
  
  /**
   * JWT expiration timestamp
   */
  exp?: number;
}