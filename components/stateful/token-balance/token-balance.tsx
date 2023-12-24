import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"

export function TokenBalance({ token }: { token?: Token }) {
  const { formattedWithSymbol, formatted, isLoading } = useTokenBalance(token)
  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">Balance:</span>
      {!token || isLoading ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs float-right" title={formatted?.toString()}>
          {formattedWithSymbol}
        </span>
      )}
    </div>
  )
}