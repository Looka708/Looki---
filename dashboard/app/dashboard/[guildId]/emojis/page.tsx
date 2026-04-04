"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';

export default function EmojisPage(): JSX.Element {
  const { guildId } = require('next/navigation').useParams();
  const [emojis, setEmojis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/emojis`)
      .then((r) => r.json())
      .then((data) => {
        setEmojis(data?.emojis ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Emojis' }]} />
      </div>
      <div className="px-8 pb-12">
        <GlassCard>
          <CardHeader title="Emojis" />
          <CardBody>
            {loading ? (
              <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            ) : (
              <ul>
                {emojis.map((e) => (
                  <li key={e.id} className="py-1 text-sm">{e.name ?? e.id}</li>
                ))}
              </ul>
            )}
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
