export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg = 'bg-[#fee9e6]',
  iconColor = 'text-[#e95345]',
  trendColor = 'text-[#00a862]'
}) {
  return (
    <div className="rounded-[18px] border border-[#eadfdb] bg-white p-6 shadow-[0_3px_10px_rgba(80,60,55,0.08)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6f625f]">{title}</p>
          <h2 className="mt-3 text-2xl font-bold text-[#151211]">{value}</h2>

          {description && (
            <p className={`mt-3 text-sm font-bold ${trendColor}`}>
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}
          >
            <Icon size={21} />
          </div>
        )}
      </div>
    </div>
  );
}