import type { Token } from "@mangrovedao/mgv"
import React, { useEffect } from "react"

import type { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import { ApproveStep } from "@/app/trade/_components/forms/components/approve-step"
import Dialog from "@/components/dialogs/dialog"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { erc20Abi, parseAbi, parseUnits, type Address } from "viem"
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { Steps } from "../components/steps"

type Props = {
  vault?: Vault
  baseAmount: string
  quoteAmount: string
  mintAmount: bigint
  baseToken: Token
  quoteToken: Token
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  rightIcon: true,
  className: "w-full",
  size: "lg",
}

const mintABI = parseAbi([
  "function mint(uint256 mintAmount,uint256[2] calldata maxAmountsIn) external returns (uint256 amount0, uint256 amount1)",
])

export default function AddToVaultDialog({
  isOpen,
  onClose,
  baseAmount: baseAmountRaw,
  quoteAmount: quoteAmountRaw,
  vault,
  quoteToken,
  baseToken,
  mintAmount,
}: Props) {
  const { address } = useAccount()

  const baseAmount = parseUnits(baseAmountRaw, baseToken.decimals)
  const quoteAmount = parseUnits(quoteAmountRaw, quoteToken.decimals)

  const {
    data,
    isFetched,
    refetch,
    isLoading: isLoadingAllowance,
  } = useReadContracts({
    contracts: [
      {
        address: baseToken.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, vault?.address as Address],
      },
      {
        address: quoteToken.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, vault?.address as Address],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address && !!vault,
    },
  })

  const missingBaseAllowance =
    (data?.[0] || 0n) > baseAmount ? 0n : baseAmount - (data?.[0] || 0n)
  const missingQuoteAllowance =
    (data?.[1] || 0n) > quoteAmount ? 0n : quoteAmount - (data?.[1] || 0n)

  const { data: hash, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const [started, setStarted] = React.useState(false)

  const steps = [
    "Summary",
    `Approve ${baseToken?.symbol}`,
    `Approve ${quoteToken?.symbol}`,
    "Mint",
  ].filter(Boolean)

  const currentStep = started
    ? isFetched
      ? missingBaseAllowance === 0n
        ? missingQuoteAllowance === 0n
          ? 4
          : 3
        : 2
      : 2
    : 1

  useEffect(() => {
    if (isConfirmed) {
      if (currentStep === 4) {
        setStarted(false)
        onClose()
      } else {
        refetch()
      }
    }
  }, [isConfirmed, currentStep, refetch, onClose])

  const stepInfos = [
    {
      body: (
        <Summary
          baseAmount={baseAmountRaw}
          quoteAmount={quoteAmountRaw}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button {...btnProps} onClick={() => setStarted(true)}>
          Proceed
        </Button>
      ),
    },
    {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={baseToken?.symbol || ""} />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isPending || isConfirming || isLoadingAllowance}
          loading={isPending || isConfirming || isLoadingAllowance}
          onClick={() => {
            if (!vault) return
            writeContract({
              address: baseToken.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [vault.address, baseAmount],
            })
          }}
        >
          Approve {baseToken?.symbol}
        </Button>
      ),
    },
    {
      body: (
        <div className="text-center">
          <ApproveStep tokenSymbol={quoteToken?.symbol || ""} />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isPending || isConfirming || isLoadingAllowance}
          loading={isPending || isConfirming || isLoadingAllowance}
          onClick={() => {
            if (!vault) return
            writeContract({
              address: quoteToken.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [vault.address, quoteAmount],
            })
          }}
        >
          Approve {quoteToken?.symbol}
        </Button>
      ),
    },
    {
      body: (
        <Summary
          baseAmount={baseAmountRaw}
          quoteAmount={quoteAmountRaw}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button
          {...btnProps}
          loading={false}
          disabled={false}
          onClick={() => {
            if (!vault) return
            writeContract({
              address: vault.address,
              abi: mintABI,
              functionName: "mint",
              args: [mintAmount, [baseAmount, quoteAmount]],
            })
          }}
        >
          Mint
        </Button>
      ),
    },
  ]
    .filter(Boolean)
    .map((stepInfo, i) => {
      return {
        ...stepInfo,
        title: steps[i],
      }
    })

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!isOpen

    return () => {
      isDialogOpenRef.current = false
    }
  }, [isOpen])

  return (
    <Dialog
      open={!!isOpen}
      onClose={() => {
        setStarted(false)
        onClose()
      }}
      showCloseButton={false}
    >
      <Dialog.Title className="text-xl text-left" close>
        Add to vault
      </Dialog.Title>
      <Steps steps={steps} currentStep={currentStep} />
      <Dialog.Description>
        <ScrollArea className="h-full" scrollHideDelay={200}>
          <ScrollBar orientation="vertical" className="z-50" />

          {stepInfos[currentStep - 1]?.body ?? undefined}
        </ScrollArea>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}

const SummaryLine = ({
  title,
  value,
}: {
  title?: string
  value?: React.ReactNode
}) => {
  return (
    <div className="flex justify-between text-primary mt-4">
      <Text className="text-muted-foreground">{title}</Text>
      {value}
    </div>
  )
}

const Summary = ({
  baseToken,
  quoteToken,
  nativeBalance,
  quoteAmount,
  baseAmount,
}: {
  baseAmount: string
  quoteAmount: string
  baseToken?: Token
  quoteToken?: Token
  nativeBalance?: string
}) => {
  return (
    <div className="space-y-2">
      <div className="bg-[#041010] rounded-lg px-4 pt-0.5 pb-3">
        <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        />

        <Separator className="mt-4" />

        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseAmount).toFixed(baseToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">{baseToken?.symbol}</Text>
            </div>
          }
        />

        <SummaryLine
          title={`${quoteToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(quoteAmount).toFixed(quoteToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>
    </div>
  )
}