import middleware from 'next-auth/middleware';

export const proxy = middleware;

export const config = {
  matcher: ['/dashboard/:path*'],
};
