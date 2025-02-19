// file: src/user/types.ts
export interface JwtPayload {
    sub: number;
    email: string;
    roles: string[]; // или Role[]
  }
  