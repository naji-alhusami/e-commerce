import { User } from "../payload-types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

export const getServerSideUser = async (
  cookies: NextRequest["cookies"] | ReadonlyRequestCookies
) => {
  const token = cookies.get("payload-token")?.value; // we get this from cookies, we can check it in application in inspect part in cookies

  const meRes = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, // this endpoint created by CMS to get the currently logged in user
    {
      headers: {
        Authorization: `JWT ${token}`, // or Bearer ...
      },
    }
  );

  const { user } = (await meRes.json()) as { user: User | null }; // null if we are not logged in
  return { user };
};
