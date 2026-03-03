import CameraLoader from '@/components/ui/CameraLoader';

export default function Loading() {
  return (
    <div className="section-wrap flex min-h-[60vh] items-center justify-center">
      <CameraLoader label="Developing frame" />
    </div>
  );
}
