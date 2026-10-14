import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function getStudioUser() {
  const user = await getChatGPTUser();
  const allowedEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  return user && allowedEmail && user.email.trim().toLowerCase() === allowedEmail ? user : null;
}

export async function studioAccess() {
  const user = await getChatGPTUser();
  const allowedEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  return { user, allowed: Boolean(user && allowedEmail && user.email.trim().toLowerCase() === allowedEmail) };
}
