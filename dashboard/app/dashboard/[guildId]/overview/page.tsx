"use client";
import React from 'react';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';
import { Breadcrumb } from '@/components/layout/Topnav';

export default function OverviewPage({}: {}) {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Overview' }]} />
      </div>
      <div className="px-8 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard>
          <CardHeader title="Server Identity" />
          <CardBody>
            <div className="space-y-2 text-sm text-text-secondary">A concise identity section.</div>
          </CardBody>
        </GlassCard>
        <GlassCard>
          <CardHeader title="Health" />
          <CardBody>
            <div className="space-y-2 text-sm text-text-secondary">All systems nominal</div>
          </CardBody>
        </GlassCard>
        <GlassCard>
          <CardHeader title="Engagement" />
          <CardBody>
            <div className="space-y-2 text-sm text-text-secondary">Active users, boosts, etc.</div>
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
