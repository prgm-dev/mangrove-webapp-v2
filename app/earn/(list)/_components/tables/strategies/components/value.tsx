import { Text } from "@/components/typography/text"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckIcon } from "lucide-react"

type Props = {
  value: string
  trusted?: boolean
  symbol?: string
  variant?: "text2" | "text3"
}

export function Value({ value, trusted, symbol }: Props) {
  if (!value) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div className="flex space-x-3 items-center">
      <Text variant={"text3"}>
        {value}{" "}
        {symbol ? (
          <span className=" text-xs text-text-secondary">{symbol}</span>
        ) : undefined}
      </Text>
      {trusted ? (
        <div className="relative h-4 w-4">
          <div className="absolute inset-0 bg-green-700 rounded-full"></div>
          <CheckIcon className="absolute inset-0 h-3 w-3 m-auto text-white" />
        </div>
      ) : undefined}
    </div>
  )
}
