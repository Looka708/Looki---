"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';

export default function WebhooksPage(): JSX.Element {
  const { guildId } = require('next/navigation').useParams();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/webhooks`)
      .then((r) => r.json())
      .then((data) => {
        setWebhooks(data?.webhooks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Webhooks' }]} />
      </div>
      <div className="px-8 pb-12">
        <GlassCard>
          <CardHeader title="Webhooks" />
          <CardBody>
            {loading ? (
              <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            ) : (
              <ul>
                {webhooks.map((w) => (
                  <li key={w.id} className="py-1 text-sm">{w.name ?? w.id}</li>
                ))}
              </ul>
            )}
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
