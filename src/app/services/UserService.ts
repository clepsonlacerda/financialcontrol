"use server";

import { db } from "../_lib/prisma";

export const findUserByLogin = async (login: string) => {
  const user = await db.user.findFirst({
    where: {
      login,
    },
  });

  return user;
}