import { useState } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { TimerDisplay } from './TimerDisplay';

const QUICK_MINUTES = [10, 30, 60, 90, 120];

export function CountdownPanel() {
  const { status, remainingSeconds, totalSeconds, startCountdown, cancel, pause, resume } =
    useTimerStore();
  const [inputMinutes, setInputMinutes] = useState<string>('60');

  const handleStart = () => {
    const minutes = parseInt(inputMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) return;
    startCountdown(minutes);
  };

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const warning = remainingSeconds <= 60 && remainingSeconds > 0;
  const progress =
    totalSeconds && totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;

  return (
    <div className="panel countdown-panel">
      <div className="panel-header">
        <h2>倒计时关机</h2>
      </div>

      <div className="timer-section">
        <TimerDisplay seconds={remainingSeconds} warning={warning} />
        {totalSeconds && totalSeconds > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      {isIdle && (
        <>
          <div className="input-section">
            <label>设置分钟数</label>
            <div className="input-row">
              <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                min="1"
                placeholder="分钟"
              />
              <button className="btn-primary" onClick={handleStart}>
                开始
              </button>
            </div>
          </div>

          <div className="quick-buttons">
            {QUICK_MINUTES.map((m) => (
              <button
                key={m}
                className="btn-quick"
                onClick={() => {
                  setInputMinutes(String(m));
                  startCountdown(m);
                }}
              >
                {m}分钟
              </button>
            ))}
          </div>
        </>
      )}

      {(isRunning || isPaused) && (
        <div className="control-buttons">
          <button className="btn-secondary" onClick={cancel}>
            取消
          </button>
          {isRunning && (
            <button className="btn-primary" onClick={pause}>
              暂停
            </button>
          )}
          {isPaused && (
            <button className="btn-primary" onClick={resume}>
              继续
            </button>
          )}
        </div>
      )}
    </div>
  );
}
