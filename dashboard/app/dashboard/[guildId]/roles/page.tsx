"use client";
import React from 'react';
import { Breadcrumb } from '@/components/layout/Topnav';
import { GlassCard, CardHeader, CardBody } from '@/components/ui';

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-8 pt-8">
        <Breadcrumb items={[{ label: 'Roles' }]} />
      </div>
      <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <CardHeader title="Roles" />
          <CardBody>
            <p className="text-sm text-text-secondary">Roles management placeholder.</p>
          </CardBody>
        </GlassCard>
        <GlassCard>
          <CardHeader title="Create Role" />
          <CardBody>
            <p className="text-sm text-text-secondary">Form area to be wired.</p>
          </CardBody>
        </GlassCard>
      </div>
    </div>
  );
}
