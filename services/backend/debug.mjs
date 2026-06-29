import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { AppModule } from "./src/app.module.js";

const app = await NestFactory.create(AppModule, new FastifyAdapter({ logger: true }));
await app.init();
const res = await app.inject({ method: "GET", url: "/health" });
console.log("Status:", res.statusCode);
console.log("Body:", res.body);
await app.close();
