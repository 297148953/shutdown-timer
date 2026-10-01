import { formatTime } from '../utils/format';

interface TimerDisplayProps {
  seconds: number;
  warning?: boolean;
  size?: 'normal' | 'large';
}

export function TimerDisplay({ seconds, warning = false, size = 'large' }: TimerDisplayProps) {
  return (
    <div
      className={`timer-display ${size} ${warning ? 'warning' : ''}`}
      style={{
        fontSize: size === 'large' ? '64px' : '32px',
        fontWeight: 300,
        letterSpacing: '2px',
        fontVariantNumeric: 'tabular-nums',
        color: warning ? '#e74c3c' : 'inherit',
        transition: 'color 0.3s',
      }}
    >
      {formatTime(seconds)}
    </div>
  );
}
