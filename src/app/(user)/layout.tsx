import { Suspense } from "react"
import Footer from "@/components/user/layout/Footer"
import Header from "@/components/user/layout/Header"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
