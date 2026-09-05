import React, { useState } from 'react';

export interface StatusSliceData {
  status: string;
  count: number;
  label?: string;
  color?: string;
}

interface StatusPieChartProps {
  title: string;
  data: StatusSliceData[];
  selectedStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
  size?: number;
  donutThickness?: number;
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981', // Emerald
  VERIFIED: '#10B981', // Emerald
  PENDING: '#F59E0B', // Amber
  NOT_COMPLETED: '#8B5CF6', // Violet
  COMPLETED: '#0EA5E9', // Sky
  SUSPENDED: '#F43F5E', // Rose
  REJECTED: '#E11D48', // Crimson/Rose
  INVITED: '#6366F1', // Indigo
};

export const StatusPieChart: React.FC<StatusPieChartProps> = ({
  title,
  data,
  selectedStatus,
  onSelectStatus,
  size = 200,
  donutThickness = 22,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const getColor = (status: string, overrideColor?: string) => {
    if (overrideColor) return overrideColor;
    const normalized = (status || '').toUpperCase().trim();
    return DEFAULT_STATUS_COLORS[normalized] || '#64748B';
  };

  const center = size / 2;
  const radius = center - donutThickness;
  const circumference = 2 * Math.PI * radius;

  // Calculate angles and strokeDashoffset
  let accumulatedAngle = 0;
  const slices = data
    .filter((d) => d.count > 0)
    .map((d) => {
      const percentage = total > 0 ? d.count / total : 0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percentage;
      return {
        ...d,
        percentage,
        strokeDasharray,
        strokeDashoffset,
        color: getColor(d.status, d.color),
      };
    });

  const activeStatus = hoveredStatus || selectedStatus;
  const activeSlice = slices.find((s) => s.status === activeStatus);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{title}</h3>
        {selectedStatus && (
          <button
            onClick={() => onSelectStatus?.(null)}
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {total === 0 ? (
        <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
          No records to display
        </div>
      ) : (
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={donutThickness}
            />

            {slices.map((slice) => {
              const isSelected = selectedStatus === slice.status;
              const isHovered = hoveredStatus === slice.status;
              const isProminent = isSelected || isHovered;

              return (
                <circle
                  key={slice.status}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isProminent ? donutThickness + 5 : donutThickness}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    cursor: onSelectStatus ? 'pointer' : 'default',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                    opacity: activeStatus && !isProminent ? 0.45 : 1,
                    filter: isProminent ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredStatus(slice.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  onClick={() => {
                    if (onSelectStatus) {
                      onSelectStatus(selectedStatus === slice.status ? null : slice.status);
                    }
                  }}
                />
              );
            })}
          </svg>

          {/* Donut Center Info */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              width: `${(radius - donutThickness) * 2}px`,
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {activeSlice ? activeSlice.count : total}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: activeSlice ? activeSlice.color : '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeSlice ? activeSlice.status.replace(/_/g, ' ') : 'Total'}
            </div>
          </div>
        </div>
      )}

      {/* Legend & Breakdown Chips */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        {data.map((item) => {
          const isSelected = selectedStatus === item.status;
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = getColor(item.status, item.color);

          return (
            <div
              key={item.status}
              onClick={() => onSelectStatus?.(selectedStatus === item.status ? null : item.status)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: isSelected ? '#F8FAFC' : 'transparent',
                border: isSelected ? `2px solid ${color}` : '1px solid #F1F5F9',
                cursor: onSelectStatus ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                setHoveredStatus(item.status);
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                setHoveredStatus(null);
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    color: '#334155',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.label || item.status}
                >
                  {item.label || item.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{item.count}</span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
