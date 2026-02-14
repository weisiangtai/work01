import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin_session";

export function createAdminSession() {
  cookies().set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function destroyAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}

export function isAdminAuthenticated() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}
