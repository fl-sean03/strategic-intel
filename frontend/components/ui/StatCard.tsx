interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

export default function StatCard({ label, value, subtext, color }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1" style={color ? { color } : undefined}>
        {value}
      </div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
}
