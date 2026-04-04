"use client";
import React from 'react';
import { Breadcrumb } from '@/components/layout/Topnav';

export default function DashboardHome() {
  const { guildId } = require('next/navigation').useParams();
  return (
    <div className="min-h-screen bg-bg-base p-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <h1 className="text-2xl font-semibold mt-2">Dashboard Home</h1>
      <div className="text-sm text-text-secondary">Guild: {guildId}</div>
    </div>
  );
}
