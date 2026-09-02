import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ORDER_STEPS = [
  { key: 'PENDING', labelKey: 'stepPending', icon: '1' },
  { key: 'ACCEPTED', labelKey: 'stepAccepted', icon: '2' },
  { key: 'PREPARING', labelKey: 'stepPreparing', icon: '3' },
  { key: 'READY', labelKey: 'stepReady', icon: '4' },
  { key: 'ASSIGNED', labelKey: 'stepAssigned', icon: '5' },
  { key: 'PICKED_UP', labelKey: 'stepPickedUp', icon: '6' },
  { key: 'ON_THE_WAY', labelKey: 'stepOnWay', icon: '7' },
  { key: 'DELIVERED', labelKey: 'stepDelivered', icon: '8' },
];

export default function StatusTracker({ status }) {
  const { t } = useAuth();

  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div style={{
        background: 'var(--accent-rose-light)',
        color: 'var(--accent-rose)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '1rem 0'
      }}>
        {status === 'CANCELLED' ? t('orderCancelledBanner') : t('orderRejectedBanner')}
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex(s => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = (activeIndex / (ORDER_STEPS.length - 1)) * 100;
  const isDelivered = status === 'DELIVERED';

  return (
    <div className="status-tracker">
      <div className="tracker-bar">
        <div className="tracker-bar-progress" style={{ width: `${progressPercent}%` }}></div>
      </div>
      {ORDER_STEPS.map((step, idx) => {
        const isCompleted = isDelivered ? idx <= activeIndex : idx < activeIndex;
        const isCurrent = !isDelivered && idx === activeIndex;
        return (
          <div key={step.key} className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="tracker-circle">
              {isCompleted ? '✓' : step.icon}
            </div>
            <span className="tracker-label">{t(step.labelKey)}</span>
          </div>
        );
      })}
    </div>
  );
}
