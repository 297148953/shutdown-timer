import { useState, useMemo } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { TimerDisplay } from './TimerDisplay';
import { formatTimeHM } from '../utils/format';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function ScheduledPanel() {
  const { status, remainingSeconds, mode, startScheduled, cancel } = useTimerStore();
  const [hour, setHour] = useState<number>(23);
  const [minute, setMinute] = useState<number>(0);

  const targetDisplay = useMemo(() => {
    if (mode === 'scheduled' && status !== 'idle') {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    return null;
  }, [mode, status, hour, minute]);

  const handleStart = () => {
    startScheduled(hour, minute);
  };

  const isActive = status !== 'idle' && mode === 'scheduled';
  const warning = remainingSeconds <= 60 && remainingSeconds > 0;

  return (
    <div className="panel scheduled-panel">
      <div className="panel-header">
        <h2>定时关机</h2>
      </div>

      {isActive && (
        <div className="timer-section">
          <div className="target-time">关机时间：{targetDisplay}</div>
          <TimerDisplay seconds={remainingSeconds} warning={warning} />
          <div className="remaining-hint">还剩 {formatTimeHM(remainingSeconds)}</div>
        </div>
      )}

      {!isActive && (
        <div className="timer-section">
          <TimerDisplay seconds={0} size="normal" />
          <div className="remaining-hint">请设置关机时间</div>
        </div>
      )}

      {!isActive && (
        <>
          <div className="input-section">
            <label>设置关机时间</label>
            <div className="time-inputs">
              <select
                className="time-select"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value, 10))}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="time-sep">:</span>
              <select
                className="time-select"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value, 10))}
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div className="hint">24小时制，设置过去的时间将在第二天执行</div>
          </div>

          <div className="control-buttons">
            <button className="btn-primary" onClick={handleStart}>
              启动定时
            </button>
          </div>
        </>
      )}

      {isActive && (
        <div className="control-buttons">
          <button className="btn-secondary" onClick={cancel}>
            取消
          </button>
        </div>
      )}
    </div>
  );
}
