import { jwtVerify } from "jose";
import { env } from "./env";

export type UserTokenPayload = {
  user_id: string;
  nome: string;
  perfil: "ADMIN" | "FUNCIONARIO";
};

export async function verifyTokenEdge(token: string): Promise<UserTokenPayload> {
  const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as UserTokenPayload;
}
