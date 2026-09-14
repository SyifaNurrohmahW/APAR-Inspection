export default function DataTableCard({
  title,
  description,
  columns,
  data,
  renderRow,
  emptyText = 'Belum ada data'
}) {
  return (
    <div className="rounded-[18px] border border-[#eadfdb] bg-white p-6 shadow-[0_3px_10px_rgba(80,60,55,0.08)]">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#151211]">{title}</h2>
        <p className="mt-2 text-sm text-[#6f625f]">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadfdb] text-[#6f625f]">
              {columns.map((column) => (
                <th key={column} className="px-3 py-4 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-[#9b8d89]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}