"use client"

import { SynchronizedGridLayout } from "@/components/synchronized-grid-layout"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-balance text-3xl font-bold text-gray-900">Synchronized Grid Layout</h1>
          <p className="text-pretty mt-2 text-gray-600">
            Try it out! Drag some boxes around, resize them, and resize the window to see the responsive breakpoints.
          </p>
        </div>
        <SynchronizedGridLayout />
      </div>
    </main>
  )
}
