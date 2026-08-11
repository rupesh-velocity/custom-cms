import type { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prismaClientV3: PrismaClient;
};

const mockPrisma = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === "then") return undefined;

      const mockFunc = () => {};

      return new Proxy(mockFunc, {
        get(t, p) {
          if (p === "then") return undefined;

          return new Proxy(mockFunc, {
            apply() {
              return Promise.resolve([]);
            },
          });
        },
        apply() {
          return Promise.resolve([]);
        },
      });
    },
  },
) as PrismaClient;

let prismaInstance: PrismaClient | undefined =
  globalForPrisma.prismaClientV3;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (prop === "then") return undefined;

    if (!prismaInstance) {
      const url = process.env.DATABASE_URL;

      // Build phase / missing DB URL
      if (
        process.env.npm_lifecycle_event === "build" ||
        process.env.IS_NEXT_BUILD === "true" ||
        !url
      ) {
        return Reflect.get(mockPrisma, prop);
      }

      // Prisma 7 + MySQL adapter
      const { PrismaClient } = require("@prisma/client");
      const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

      const adapter = new PrismaMariaDb(url);

      prismaInstance = new PrismaClient({
        adapter,
      });

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prismaClientV3 = prismaInstance;
      }
    }

    return Reflect.get(prismaInstance, prop);
  },
});