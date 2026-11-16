import { RESERVATION_STATUS_HINT, RESERVATION_STATUS_LABEL } from '../lib/labels';
import { roomStateLabel, type RoomStateKind } from '../lib/roomStatus';
import type { ReservationStatus } from '../lib/types';

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`badge badge--res-${status}`} title={RESERVATION_STATUS_HINT[status]}>
      {RESERVATION_STATUS_LABEL[status]}
    </span>
  );
}

export function RoomStateBadge({ kind }: { kind: RoomStateKind }) {
  return <span className={`badge badge--room-${kind}`}>{roomStateLabel(kind)}</span>;
}
