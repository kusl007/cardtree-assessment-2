"use client"

import type React from "react"
import { useState, useEffect } from "react"

type ItemSize = "small" | "medium" | "large" | "wide" | "tall"

interface GridItem {
  id: string
  isStatic: boolean
  size: ItemSize
}

const generateItems = (count: number): GridItem[] => {
  const sizes: ItemSize[] = ["small", "medium", "large", "wide", "tall"]
  return Array.from({ length: count }, (_, i) => ({
    id: i.toString(),
    isStatic: i % 5 === 0,
    size: sizes[i % sizes.length],
  }))
}

export function SynchronizedGridLayout() {
  const [items, setItems] = useState<GridItem[]>(() => generateItems(25))
  const [itemOrder, setItemOrder] = useState<string[]>(() => items.map((item) => item.id))
  const [isMobile, setIsMobile] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const savedOrder = localStorage.getItem("grid-item-order")
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        setItemOrder(order)
      } catch (e) {
        console.error("[v0] Failed to load saved order:", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("grid-item-order", JSON.stringify(itemOrder))
  }, [itemOrder])

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item?.isStatic) {
      e.preventDefault()
      return
    }
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2)
    }
  }

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (draggedItem !== itemId) setDragOverItem(itemId)
  }

  const handleDragLeave = () => setDragOverItem(null)

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }
    const newOrder = [...itemOrder]
    const draggedIndex = newOrder.indexOf(draggedItem)
    const targetIndex = newOrder.indexOf(targetId)
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedItem)
    setItemOrder(newOrder)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const generateNewLayout = () => {
    const newOrder = [...itemOrder].sort(() => Math.random() - 0.5)
    setItemOrder(newOrder)
  }

  const resetLayout = () => {
    const defaultOrder = items.map((item) => item.id)
    setItemOrder(defaultOrder)
  }

  // Modified: Accept index to force first item to always span full width on mobile
  const getSizeClasses = (size: ItemSize, isMobile: boolean, index: number) => {
    if (isMobile) {
      if (index === 0) {
        return "min-h-[100px] col-span-2"
      }
      switch (size) {
        case "small":
          return "min-h-[100px] col-span-1"
        case "medium":
          return "min-h-[140px] col-span-1"
        case "large":
          return "min-h-[180px] col-span-2"
        case "wide":
          return "min-h-[120px] col-span-2"
        case "tall":
          return "min-h-[200px] col-span-1"
      }
    } else {
      switch (size) {
        case "small":
          return "min-h-[100px] col-span-1"
        case "medium":
          return "min-h-[140px] col-span-1"
        case "large":
          return "min-h-[180px] col-span-2"
        case "wide":
          return "min-h-[120px] col-span-2"
        case "tall":
          return "min-h-[220px] col-span-1 row-span-2"
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">Current View:</span>{" "}
              {isMobile ? "Mobile (2-Column Grid)" : "Desktop (Multi-Column Grid)"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">Item Order:</span>{" "}
              <span className="font-mono">[{itemOrder.join(", ")}]</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generateNewLayout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Shuffle Layout
            </button>
            <button
              onClick={resetLayout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset to Default
            </button>
          </div>
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">How it works:</span> Drag items to reorder them. The order is synchronized
              between desktop and mobile grid views. Changes are saved to localStorage and persist across sessions.
              Static items (0, 5, 10, 15, 20) cannot be moved. Boxes have different sizes that span multiple columns!
            </p>
          </div>
        </div>
      </div>
      <div
        className={`gap-4 ${
          isMobile
            ? "grid grid-cols-2 auto-rows-min grid-flow-row"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 auto-rows-min grid-flow-dense"
        }`}
      >
        {itemOrder.map((itemId, idx) => {
          const item = items.find((i) => i.id === itemId)
          if (!item) return null
          const isDragging = draggedItem === item.id
          const isDragOver = dragOverItem === item.id
          return (
            <div
              key={item.id}
              draggable={!item.isStatic}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`flex items-center justify-center rounded-lg border-2 text-2xl font-bold transition-all ${getSizeClasses(
                item.size,
                isMobile,
                idx
              )} ${
                item.isStatic
                  ? "border-blue-300 bg-blue-50 text-blue-700 cursor-not-allowed"
                  : "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-move active:cursor-grabbing"
              } ${isDragging ? "opacity-40 scale-95 rotate-2" : ""} ${
                isDragOver && !item.isStatic ? "ring-4 ring-blue-400 scale-105 border-blue-500" : ""
              }`}
            >
              <div className="text-center">
                <div>{item.isStatic ? `Static` : item.id}</div>
                <div className="text-xs font-normal text-gray-500 mt-1">{item.size}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}