"use client"
import { BS } from "@mangrovedao/mgv/lib"
import React from "react"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/utils"
import { renderElement } from "@/utils/render"
import { Buy } from "./form-types/buy"
import { Sell } from "./form-types/sell"

const TABS_CONTENT = {
  [BS.sell]: Sell,
  [BS.buy]: Buy,
}

export function Forms({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  return (
    <CustomTabs
      {...props}
      defaultValue={Object.values(BS)[0]}
      className={
        "bg-bg-secondary border border-bg-secondary rounded-2xl overflow-hidden"
      }
    >
      <CustomTabsList className="w-full p-0 space-x-0">
        {Object.values(BS).map((form) => (
          <CustomTabsTrigger
            key={`${form}-tab`}
            value={form}
            className={cn(
              "capitalize w-full data-[state=active]:bg-bg-secondary data-[state=active]:text-text-brand bg-bg-primary rounded-none",
              {
                "data-[state=active]:border-[#FF5555] data-[state=active]:text-[#FF5555]":
                  form === BS.sell,
              },
            )}
          >
            {form}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <ScrollArea className="overflow-hidden">
        <div className="px-4 space-y-4 mt-[24px]">
          {Object.values(BS).map((form) => (
            <CustomTabsContent key={`${form}-content`} value={form}>
              {renderElement(TABS_CONTENT[form])}
            </CustomTabsContent>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </CustomTabs>
  )
}
