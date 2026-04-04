"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';
import { useParams } from 'next/navigation';

export default function MembersPage(): JSX.Element {
  const { guildId } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/discord/${guildId}/members`)
      .then((r) => r.json())
      .then((data) => {
        setMembers(data?.members ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Members' }]} />
      </div>
      <div className="px-8 pb-12">
        <GlassCard>
          <CardHeader title="Member List" />
          <CardBody>
            {loading ? (
              <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            ) : (
              <ul>
                {members.map((m) => (
                  <li key={m.id} className="py-1 text-sm">{m.user ?? m.name ?? 'User'}</li>
                ))}
              </ul>
            )}
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
