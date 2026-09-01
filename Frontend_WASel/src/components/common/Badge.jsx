import React from 'react';
import { useAuth } from '../../context/AuthContext';

const STATUS_KEYS = {
  // Order Statuses
  PENDING: { key: 'badgePending', class: 'badge-pending', icon: '⏳' },
  ACCEPTED: { key: 'badgeAccepted', class: 'badge-accepted', icon: '✅' },
  PREPARING: { key: 'badgePreparing', class: 'badge-preparing', icon: '🍳' },
  READY: { key: 'badgeReady', class: 'badge-ready', icon: '📦' },
  ASSIGNED: { key: 'badgeAssigned', class: 'badge-assigned', icon: '🛵' },
  PICKED_UP: { key: 'badgePickedUp', class: 'badge-picked_up', icon: '🛵' },
  ON_THE_WAY: { key: 'badgeOnTheWay', class: 'badge-on_the_way', icon: '🚀' },
  DELIVERED: { key: 'badgeDelivered', class: 'badge-delivered', icon: '🎉' },
  CANCELLED: { key: 'badgeCancelled', class: 'badge-cancelled', icon: '❌' },
  REJECTED: { key: 'badgeRejected', class: 'badge-rejected', icon: '🚫' },

  // Driver Statuses
  AVAILABLE: { key: 'badgeAvailable', class: 'badge-delivered', icon: '🟢' },
  BUSY: { key: 'badgeBusy', class: 'badge-pending', icon: '🟡' },
  OFFLINE: { key: 'badgeOffline', class: 'badge-cancelled', icon: '⚪' },

  // Store Statuses
  OPEN: { key: 'badgeOpen', class: 'badge-delivered', icon: '🟢' },
  CLOSED: { key: 'badgeClosed', class: 'badge-cancelled', icon: '🔴' },
};

export default function Badge({ status, text, type }) {
  const { t } = useAuth();
  const info = STATUS_KEYS[status];

  if (!info) {
    return (
      <span className={`badge ${type ? `badge-${type}` : 'badge-pending'}`}>
        <span>•</span>
        <span>{text || status}</span>
      </span>
    );
  }

  return (
    <span className={`badge ${info.class}`}>
      <span>{info.icon}</span>
      <span>{text || t(info.key)}</span>
    </span>
  );
}
