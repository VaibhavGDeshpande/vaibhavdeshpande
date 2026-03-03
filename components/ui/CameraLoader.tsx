interface CameraLoaderProps {
  label?: string;
  compact?: boolean;
}

export default function CameraLoader({
  label = 'Loading gallery',
  compact = false,
}: CameraLoaderProps) {
  return (
    <div className="camera-loader-wrap" role="status" aria-live="polite">
      <div className={`camera-loader ${compact ? 'camera-loader-compact' : ''}`}>
        <div className="camera-body">
          <div className="camera-flash" />
          <div className="camera-lens">
            <div className="camera-lens-inner" />
          </div>
        </div>
      </div>
      <p className="camera-loader-label">{label}</p>
    </div>
  );
}
