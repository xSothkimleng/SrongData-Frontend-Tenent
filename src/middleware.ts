import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const pathname = req.nextUrl.pathname;

  console.log("pathname: ", pathname);

  if (pathname.startsWith("/dashboard") && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // const s_token = req.cookies.get("survey_access_token");
  // if (pathname.startsWith("/survey") && !s_token) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = "/auth/google/login";
  //   return NextResponse.redirect(url);
  // }

  // check if token is valid
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    //"/survey/:path*"
  ],
};
