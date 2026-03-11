"use client"

import { useEffect } from "react"

export default function Parallax() {
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Update CSS variable only once per frame to prevent layout thrashing
          document.body.style.setProperty("--scroll-y", `${window.scrollY}px`)
          ticking = false
        })
        ticking = true
      }
    }

    // Add passive: true to improve scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute top-[15%] left-[5%] w-64 h-32 bg-gradient-to-br from-white to-purple-100 rounded-full cloud-shape opacity-40 blur-[1px] parallax-layer"
        style={{ transform: 'translateY(calc(var(--scroll-y, 0) * -0.2px))' }}
      ></div>
      <div
        className="absolute top-[45%] right-[-5%] w-80 h-40 bg-gradient-to-br from-indigo-100 to-white rounded-full cloud-shape opacity-30 blur-[2px] parallax-layer"
        style={{ transform: 'translateY(calc(var(--scroll-y, 0) * -0.15px))' }}
      ></div>
      <div
        className="absolute top-[70%] left-[-10%] w-96 h-48 bg-gradient-to-br from-white to-pink-50 rounded-[100px] cloud-shape opacity-60 parallax-layer"
        style={{ transform: 'translateY(calc(var(--scroll-y, 0) * -0.5px))' }}
      ></div>
      <div
        className="absolute top-[120%] right-[10%] w-72 h-36 bg-gradient-to-tr from-white to-blue-50 rounded-[80px] cloud-shape opacity-50 parallax-layer"
        style={{ transform: 'translateY(calc(var(--scroll-y, 0) * -0.4px))' }}
      ></div>
      <div
        className="absolute top-[180%] left-[20%] w-[500px] h-[200px] bg-white rounded-full cloud-shape opacity-80 parallax-layer"
        style={{ transform: 'translateY(calc(var(--scroll-y, 0) * -0.8px))' }}
      ></div>

      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[300px] bg-white rounded-[100%] blur-[100px] opacity-30 mix-blend-screen"></div>
      <div className="absolute top-[60%] left-[10%] w-[500px] h-[250px] bg-purple-200 rounded-[100%] blur-[100px] opacity-30 mix-blend-screen"></div>
    </div>
  )
}