import dotenv from "dotenv";
import path from "path";
import payload, { Payload } from "payload";
import { type InitOptions } from "payload/config";
import nodemailer from "nodemailer";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

let cached = (global as any).payload; // Attempts to retrieve the cached data from the global object.

if (!cached) {
  // If the cache doesn't exist (!cached), it creates an empty cache object with client and promise properties and assigns it to the global payload.
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
} // The cached client and promise can be used to store and reuse the Payload client, avoiding the need to initialize it multiple times.

interface Args {
  initOptions?: Partial<InitOptions>;
}

export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("payload secret is missing");
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      email: {
        transport: transporter,
        fromAddress: "najihussami@gmail.com",
        fromName: "e-commerce",
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
};
