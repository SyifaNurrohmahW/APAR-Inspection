export default function DashboardCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[22px] border border-[#eadfdb] bg-white p-6 shadow-[0_4px_12px_rgba(80,60,55,0.08)]">
      <h3 className="text-lg font-bold text-[#1f1b1a]">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-[#7f716d]">{subtitle}</p>}

      <div className="mt-6">{children}</div>
    </div>
  );
}