/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Token } from "@mangrovedao/mangrove.js"
import type { ValidationError } from "@tanstack/react-form"
import { LucideChevronRight } from "lucide-react"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/stateless/custom-radio-group"
import {
  NumericInput,
  type NumericInputProps,
} from "@/components/stateless/numeric-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import { Accordion } from "../components/accordion"
import { TokenBalance } from "../components/token-balance"
import { TradeAction } from "../types"
import { useLimit } from "./use-limit"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

// const sliderValues = [[25], [50], [75], [100]]
// const slippageOptions = ["0.1", "0.5", "1.0"]

export function Limit() {
  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    quote,
    market,
    sendToken,
    receiveToken,
  } = useLimit()

  // const sliderPercentage = Math.min(
  //   Math.trunc(
  //     Big(Number(send))
  //       .mul(100)
  //       .div(sendTokenBalance.formatted ?? 0)
  //       .toNumber(),
  //   ),
  //   100,
  // )

  // const { validate, setValue, pushValue, validateSync } = form.useField({
  //   name: "send",
  // })

  // validateSync("", "submit")

  // console.log(JSON.stringify({ sliderPercentage }))

  return (
    <form.Provider>
      <form onSubmit={handleSubmit} autoComplete="off">
        <form.Field name="tradeAction">
          {(field) => (
            <CustomRadioGroup
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onValueChange={(e: TradeAction) => {
                field.handleChange(e)
                computeReceiveAmount()
              }}
            >
              {Object.values(TradeAction).map((action) => (
                <CustomRadioGroupItem
                  key={action}
                  value={action}
                  id={action}
                  variant={
                    action === TradeAction.SELL ? "secondary" : "primary"
                  }
                  className="capitalize"
                >
                  {action}
                </CustomRadioGroupItem>
              ))}
            </CustomRadioGroup>
          )}
        </form.Field>
        <div className="space-y-4 !mt-6">
          <form.Field name="limitPrice" onChange={isGreaterThanZeroValidator}>
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  computeReceiveAmount()
                }}
                token={quote}
                label="Limit price"
                disabled={!market}
                error={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field
            name="send"
            onChange={sendValidator(Number(sendTokenBalance.formatted ?? 0))}
          >
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={({ target: { value } }) => {
                  field.handleChange(value)
                  computeReceiveAmount()
                }}
                token={sendToken}
                label="Send amount"
                disabled={!market}
                showBalance
                error={field.state.meta.touchedErrors}
              />
            )}
          </form.Field>
          <form.Field name="receive" onChange={isGreaterThanZeroValidator}>
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={({ target: { value } }) => {
                  field.handleChange(value)
                  computeSendAmount()
                }}
                token={receiveToken}
                label="Receive amount"
                disabled={!(market && form.state.isFormValid)}
                showBalance
                error={field.state.meta.touchedErrors}
              />
            )}
          </form.Field>

          {/* TODO: set slider and synchronize it to send field */}
          {/* <CSlider form={form} sliderPercentage={sliderPercentage} /> */}

          <Separator className="!my-6" />

          <Accordion title="Advanced">
            <div className="grid text-md space-y-2">
              <Label>Time in force</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="immediateOrCancel">
                      Immediate or cancel
                    </SelectItem>
                    <SelectItem value="goodTillTime">Good till time</SelectItem>
                    <SelectItem value="fillOrKill">Fill or kill</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between space-x-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="minute">Minute</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </Accordion>

          <Separator className="!my-6" />

          {/* TODO: unmock market details */}
          <Accordion title="Market details" className="!mb-6">
            <MarketDetailsLine title="Taker fee" value="5%" />
            <MarketDetailsLine title="Total fees" value="$0.26" />
            <MarketDetailsLine title="Tick size" value="1234" />
            <MarketDetailsLine title="Current spot price" value="1234" />
            <MarketDetailsLine title="Min. order size" value="12" />
          </Accordion>

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.values.tradeAction,
            ]}
          >
            {([canSubmit, isSubmitting, tradeAction]) => {
              return (
                <Button
                  className="w-full flex items-center justify-center !mb-4 capitalize"
                  size={"lg"}
                  type="submit"
                  disabled={!canSubmit || !market}
                >
                  {isSubmitting ? "Processing..." : tradeAction}
                  <div
                    className={cn(
                      "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
                      {
                        "opacity-10": !market,
                      },
                    )}
                  >
                    <LucideChevronRight className="h-4 text-current" />
                  </div>
                </Button>
              )
            }}
          </form.Subscribe>
        </div>
      </form>
    </form.Provider>
  )
}

type MarketDetailsLineProps = {
  title: string
  value: string
}
function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}

// type CSliderProps = {
//   sliderPercentage: number
//   form: any
// }
// function CSlider({ sliderPercentage, form }: CSliderProps) {
//   const { handleChange, validateSync, setValue } = form.useField({
//     name: "send",
//   })
//   console.log(handleChange)
//   return (
//     <div className="space-y-5 pt-2">
//       <Slider
//         value={[sliderPercentage]}
//         step={5}
//         max={100}
//         onValueChange={([val]) => {
//           setValue(val?.toString(), {
//             notify: true,
//             touch: false,
//           })
//           validateSync(val?.toString(), "submit")
//           // handleChange(val?.toString())
//           // validate()
//         }}
//       />

//       <div className="flex space-x-3">
//         {sliderValues.map((value, i) => (
//           <Button
//             key={`slider-value-${i}`}
//             className="bg-transparent text-primary rounded-full text-xs pt-1 pb-[2px] w-16 border-[1px] border-green-bangladesh"
//             onClick={(e) => {
//               e.preventDefault()
//               // setSlider(value)
//             }}
//           >
//             {value}%
//           </Button>
//         ))}
//       </div>
//     </div>
//   )
// }

type TradeInputProps = {
  token?: Token
  disabled?: boolean
  label: string
  showBalance?: boolean
  error?: ValidationError[]
} & NumericInputProps

const TradeInput = React.forwardRef<HTMLInputElement, TradeInputProps>(
  ({ label, token, showBalance = false, error, ...inputProps }, ref) => {
    return (
      <div className="flex-col flex">
        <Label>{label}</Label>
        <NumericInput
          {...inputProps}
          ref={ref}
          icon={token?.symbol}
          symbol={token?.symbol}
          aria-invalid={!!error?.length}
        />
        {error && (
          <p role="aria-live" className="text-red-100 text-xs leading-4 mt-1">
            {error}
          </p>
        )}
        {!error?.length && showBalance && <TokenBalance token={token} />}
      </div>
    )
  },
)

TradeInput.displayName = "TradeInput"
