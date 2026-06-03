import { SeatSelectionView } from '@/components/seats/SeatSelectionView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const scheduleId = parseInt(id, 10);

  if (Number.isNaN(scheduleId)) {
    return (
      <p className="text-center text-red-600">ID jadwal tidak valid.</p>
    );
  }

  return <SeatSelectionView scheduleId={scheduleId} />;
}
