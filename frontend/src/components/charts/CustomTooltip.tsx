import { TooltipProps } from 'recharts';
import { formatCurrency } from '@/utils/format';

const tooltipStyle = {
  borderRadius: 12,
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--card-foreground))',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div style={tooltipStyle} className="px-3 py-2">
        {label && <p className="mb-1 font-semibold">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(Number(entry.value))}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function SimpleTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div style={tooltipStyle} className="px-3 py-2">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {formatCurrency(Number(entry.value))}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export const chartTooltipStyle = {
  contentStyle: tooltipStyle,
};

export const chartTooltipProps = {
  contentStyle: tooltipStyle,
  formatter: (value: number) => formatCurrency(value),
};
