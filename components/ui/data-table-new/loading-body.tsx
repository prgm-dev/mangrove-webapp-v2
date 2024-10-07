import { Skeleton } from "../skeleton"

type LoadingBodyProps = {
  cells: number
  rows?: number
}

export function LoadingBody({ cells, rows = 5 }: LoadingBodyProps) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cells }).map((_, j) => (
        <td
          key={j}
          className="py-2 px-2 first:pl-0 last:pr-0 border-b hover:bg-muted/50"
        >
          <Skeleton className="h-10" />
        </td>
      ))}
    </tr>
  ))
}
