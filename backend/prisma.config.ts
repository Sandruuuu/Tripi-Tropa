import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};