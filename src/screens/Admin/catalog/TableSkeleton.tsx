interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps): JSX.Element {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[#EDECE6] last:border-0">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded bg-[#EDECE6]"
                style={{ width: columnIndex === 0 ? "75%" : "50%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
