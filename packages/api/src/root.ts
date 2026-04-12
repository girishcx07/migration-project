import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return {
      ok: true,
      name: "api-template",
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
