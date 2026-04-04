import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params?: Promise<{ guildId: string }> } = {}) {
  if (params) await params;
  // Simple in-process health data. Uptime comes from process.uptime()
  const uptime = Math.floor(process.uptime());
  const data = {
    online: true,
    uptimeSeconds: uptime,
    status: 'online',
  };
  return NextResponse.json(data);
}
