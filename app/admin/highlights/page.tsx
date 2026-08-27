'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import HighlightManager from '@/components/admin/HighlightManager';

export default function HighlightsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login');
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500 text-sm">
        Checking authentication…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HighlightManager />
    </div>
  );
}
