"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import getUserLocale from "get-user-locale"

export function formatNumber(
  value: number | bigint,
  options?: Intl.NumberFormatOptions | undefined,
) {
  return Intl.NumberFormat(getUserLocale(), {
    ...options,
  }).format(value)
}

export function determineDecimals(
  value: number | bigint | undefined,
  maxDecimals = 6,
) {
  if (value === undefined) return maxDecimals
  // Convert the value to a string using the user's locale
  const valueString = value.toLocaleString()

  // Find the position of the decimal point
  const decimalPosition = valueString.indexOf(
    value.toLocaleString(undefined, { minimumFractionDigits: 1 }),
  )

  // If there is no decimal point or the decimals are less than the max, return maxDecimals
  if (
    decimalPosition === -1 ||
    valueString.length - decimalPosition - 1 <= maxDecimals
  ) {
    return maxDecimals
  }

  // Find the last non-zero digit position after the decimal point
  let lastNonZeroDigit = decimalPosition + maxDecimals + 1
  while (
    lastNonZeroDigit > decimalPosition &&
    valueString[lastNonZeroDigit] === "0"
  ) {
    lastNonZeroDigit--
  }

  // Calculate the number of decimals to show
  const decimalsToShow = Math.min(
    lastNonZeroDigit - decimalPosition,
    maxDecimals,
  )

  return decimalsToShow
}

export function determinePriceDecimalsFromTokenName(
  value: number | bigint | undefined,
  tokenName?: string,
) {
  const decimals = tokenName ? Mangrove.getDisplayedPriceDecimals(tokenName) : 2
  return determineDecimals(value, decimals)
}
