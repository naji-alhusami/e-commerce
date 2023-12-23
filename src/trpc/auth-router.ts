import { AuthCredentialsValidator } from "../lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  createPayloadUser: publicProcedure // (any name: createPayloadUser) create user inside CMS, public to use it without signin
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input;
      const payload = await getPayloadClient();

      // check if user exists:
      const { docs: users } = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: email,
          },
        },
      });

      if (users.length !== 0) throw new TRPCError({ code: "CONFLICT" });

      await payload.create({
        collection: "users",
        data: {
          email,
          password,
          role: "user", // default
        },
      });

      return { success: true, sentToEmail: email };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      // we use query because we are not changing any data (just reading)
      const { token } = input;

      const payload = await getPayloadClient();

      const isVerified = await payload.verifyEmail({
        // verifyEmail is already inside payload (built-in)
        collection: "users",
        token,
      });

      if (!isVerified) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return { success: true }; // our CMS will after that automatically change the _verified in Mongo o true
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      // the below req comes from express in server.ts, we can attach req to our context (method to transfer data from express to next and trpc), you can check req in context in server.ts but TS doesn't recognize it
      // from server you export the type of the context and we use this type in trpc
      const { res } = ctx;

      const payload = await getPayloadClient();

      try {
        await payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
          // we send email and pass to server to login and the server gives us back token stored as cookies
          // until here, we are not setting the cookie, by using the (res) we are set it
          res,
        });

        return { success: true };
      } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
