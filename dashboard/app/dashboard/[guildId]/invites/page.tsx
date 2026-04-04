"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import { useParams } from 'next/navigation';

export default function InvitesPage(): JSX.Element {
  const { guildId } = useParams();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/invites`)
      .then((r) => r.json())
      .then((data) => {
        setInvites(data?.invites ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Invites' }]} />
      </div>
      <div className="px-8 pb-12">
        <GlassCard>
          <CardHeader title="Invites" />
          <CardBody>
            {loading ? (
              <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            ) : (
              <ul>
                {invites.map((iv) => (
                  <li key={iv.code} className="py-1 text-sm">{iv.code} - {iv.channel?.name ?? 'Channel'}</li>
                ))}
              </ul>
            )}
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
