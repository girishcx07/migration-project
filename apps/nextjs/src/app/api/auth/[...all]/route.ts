const handler = () =>
  Response.json(
    { message: "Auth is not enabled in this template." },
    { status: 404 },
  );

export { handler as GET, handler as POST };
