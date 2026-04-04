"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import { useParams } from 'next/navigation';

export default function ChannelsPage({}: {}) {
  const { guildId } = useParams();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/channels`)
      .then((r) => r.json())
      .then((data) => {
        setChannels(data?.channels ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Channels' }]} />
      </div>
      <div className="px-8 pb-12">
        <GlassCard>
          <CardHeader title="Channel List" />
          <CardBody>
            {loading ? (
              <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            ) : (
              <ul>
                {channels.map((c) => (
                  <li key={c.id} className="py-1">#{c.name} ({c.type})</li>
                ))}
              </ul>
            )}
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
