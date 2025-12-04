import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TutorialProvider } from "@/lib/tutorial-context"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TutorialProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </TutorialProvider>
  )
}
