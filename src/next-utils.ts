import next from "next";

const PORT = Number(process.env.PORT) || 3000;

export const nextApp = next({
  dev: process.env.NODE_ENV !== "production",
  port: PORT,
}); //This initializes a Next.js application using the next function. It takes an options object as an argument, where dev is set to true if the NODE_ENV environment variable is not set to "production", and port is set to the value of the PORT constant.

export const nextHandler = nextApp.getRequestHandler(); //This creates a request handler using getRequestHandler() method of the nextApp. The request handler is responsible for handling all incoming HTTP requests and serving the appropriate pages or assets based on the Next.js application's configuration.
