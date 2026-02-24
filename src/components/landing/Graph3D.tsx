"use client"

import { useEffect, useRef } from "react"

interface Node {
  id: number
  lbl: string
  grp: string
  bx: number
  by: number
  bz: number
}

const NODES: Node[] = [
  { id: 0, lbl: "github", grp: "input", bx: -240, by: -90, bz: 50 },
  { id: 1, lbl: "linkedin", grp: "input", bx: -260, by: 30, bz: -30 },
  { id: 2, lbl: "resume", grp: "input", bx: -210, by: 120, bz: 70 },
  { id: 3, lbl: "portfolio", grp: "input", bx: -230, by: -180, bz: -40 },
  { id: 4, lbl: "gap analysis", grp: "core", bx: -50, by: -20, bz: 0 },
  { id: 5, lbl: "roadmap", grp: "core", bx: 20, by: 80, bz: 25 },
  { id: 6, lbl: "daily", grp: "core", bx: -5, by: -110, bz: -15 },
  { id: 7, lbl: "memory", grp: "core", bx: 60, by: 10, bz: 45 },
  { id: 8, lbl: "sys design", grp: "skill", bx: 130, by: -160, bz: -25 },
  { id: 9, lbl: "open source", grp: "skill", bx: 180, by: -80, bz: 60 },
  { id: 10, lbl: "leadership", grp: "skill", bx: 120, by: -45, bz: -60 },
  { id: 11, lbl: "commits", grp: "skill", bx: 160, by: -220, bz: 15 },
  { id: 12, lbl: "li posts", grp: "brand", bx: 210, by: 55, bz: -25 },
  { id: 13, lbl: "resume upd", grp: "brand", bx: 170, by: 140, bz: 45 },
  { id: 14, lbl: "promo case", grp: "brand", bx: 140, by: 225, bz: -15 },
  { id: 15, lbl: "1:1 notes", grp: "ops", bx: 100, by: 290, bz: 55 },
  { id: 16, lbl: "standups", grp: "ops", bx: 40, by: 345, bz: -25 },
  { id: 17, lbl: "calendar", grp: "ops", bx: -10, by: 285, bz: 65 },
  { id: 18, lbl: "readiness", grp: "signal", bx: 270, by: 0, bz: 0 },
  { id: 19, lbl: "promotion", grp: "output", bx: 330, by: -75, bz: -25 },
  { id: 20, lbl: "pivot", grp: "output", bx: 335, by: 20, bz: 45 },
  { id: 21, lbl: "new role", grp: "output", bx: 320, by: 95, bz: -15 },
  { id: 22, lbl: "found", grp: "output", bx: 310, by: 170, bz: 35 },
]

const EDGES = [
  [0, 4], [1, 4], [2, 4], [3, 4],
  [4, 5], [4, 6], [4, 7],
  [5, 8], [5, 9], [5, 10], [5, 11],
  [6, 8], [6, 9], [6, 11], [6, 17],
  [7, 15], [7, 16], [7, 17], [7, 13], [7, 14],
  [8, 18], [9, 18], [10, 18], [10, 12], [11, 13],
  [15, 14], [16, 14], [17, 15],
  [12, 18], [13, 18], [14, 18],
  [18, 19], [18, 20], [18, 21], [18, 22],
]

const GS: Record<string, number> = {
  input: 5.5,
  core: 8,
  skill: 4.5,
  brand: 4.5,
  ops: 4,
  signal: 6.5,
  output: 6,
}

const KF = [
  { t: 0, camZ: 900, rox: 0.07, roy: -0.06 },
  { t: 0.18, camZ: 600, rox: 0.04, roy: 0.1 },
  { t: 0.38, camZ: 580, rox: -0.05, roy: -0.12 },
  { t: 0.58, camZ: 600, rox: 0.08, roy: 0.13 },
  { t: 0.78, camZ: 650, rox: -0.03, roy: -0.07 },
  { t: 1, camZ: 850, rox: 0.04, roy: -0.04 },
]

function bright(node: Node, t: number): number {
  const g = node.grp
  const flicker = 0.06 * Math.sin(Date.now() * 0.0009 + node.id * 1.3)
  if (t < 0.15) return 0.45 + flicker
  if (t < 0.35) {
    if (g === "input" || g === "core")
      return Math.min(0.95, 0.45 + ((t - 0.15) / 0.2) * 0.5 + flicker)
    return 0.18 + flicker * 0.3
  }
  if (t < 0.55) {
    if (g === "skill" || g === "core")
      return Math.min(0.95, 0.5 + ((t - 0.35) / 0.2) * 0.45 + flicker)
    if (g === "input") return 0.55 + flicker * 0.3
    return 0.18 + flicker * 0.3
  }
  if (t < 0.75) {
    if (g === "brand" || g === "ops")
      return Math.min(0.95, 0.5 + ((t - 0.55) / 0.2) * 0.45 + flicker)
    if (g === "skill" || g === "core") return 0.6 + flicker * 0.3
    if (g === "input") return 0.45 + flicker * 0.3
    return 0.18 + flicker * 0.3
  }
  if (g === "signal" || g === "output")
    return Math.min(1, 0.5 + ((t - 0.75) / 0.25) * 0.5 + flicker)
  return 0.45 + flicker * 0.3
}

function ry3(v: number[], a: number): number[] {
  return [
    v[0] * Math.cos(a) + v[2] * Math.sin(a),
    v[1],
    -v[0] * Math.sin(a) + v[2] * Math.cos(a),
  ]
}

function rx3(v: number[], a: number): number[] {
  return [
    v[0],
    v[1] * Math.cos(a) - v[2] * Math.sin(a),
    v[1] * Math.sin(a) + v[2] * Math.cos(a),
  ]
}

function getCam(t: number) {
  let a = KF[0],
    b = KF[KF.length - 1]
  for (let i = 0; i < KF.length - 1; i++) {
    if (t >= KF[i].t && t <= KF[i + 1].t) {
      a = KF[i]
      b = KF[i + 1]
      break
    }
  }
  const span = b.t - a.t
  let f = span === 0 ? 0 : (t - a.t) / span
  f = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2
  return {
    camZ: a.camZ + (b.camZ - a.camZ) * f,
    rox: a.rox + (b.rox - a.rox) * f,
    roy: a.roy + (b.roy - a.roy) * f,
  }
}

interface Graph3DProps {
  scrollProgress: number
}

export function Graph3D({ scrollProgress }: Graph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spRef = useRef(0)
  const autoRYRef = useRef(0)
  const lastTRef = useRef(performance.now())
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasEl = canvas

    const ctx = canvasEl.getContext("2d")
    if (!ctx) return

    const ctx2d = ctx

    function setSize() {
      canvasEl.width = window.innerWidth
      canvasEl.height = window.innerHeight
    }
    setSize()
    window.addEventListener("resize", setSize)

    function draw() {
      const now = performance.now()
      const dt = Math.min((now - lastTRef.current) / 1000, 0.05)
      lastTRef.current = now

      spRef.current += (scrollProgress - spRef.current) * 0.055
      // Increase automatic rotation for a more dynamic hero animation
      autoRYRef.current += dt * 0.12

      const W = canvasEl.width
      const H = canvasEl.height
      ctx2d.clearRect(0, 0, W, H)

      const cam = getCam(spRef.current)
      const ROY = cam.roy + autoRYRef.current
      const ROX = cam.rox + Math.sin(now * 0.00022) * 0.025

      // Larger apparent graph size in the hero section
      const FOV = 1050
      const CX = W * 0.68
      const CY = H * 0.47

      const P = NODES.map((node) => {
        let v = [node.bx, node.by, node.bz]
        v = ry3(v, ROY)
        v = rx3(v, ROX)
        const dz = v[2] + cam.camZ
        if (dz < 1) return null
        const s = FOV / dz
        return {
          sx: CX + v[0] * s,
          sy: CY + v[1] * s,
          sz: dz,
          s,
          br: bright(node, spRef.current),
          node,
        }
      })

      // Draw edges
      ;[...EDGES]
        .sort((a, b) => {
          const za = P[a[0]] ? P[a[0]].sz : 0
          const zb = P[b[0]] ? P[b[0]].sz : 0
          return zb - za
        })
        .forEach(([ai, bi]) => {
          const a = P[ai],
            b = P[bi]
          if (!a || !b) return
          const br = Math.min(a.br, b.br)
          if (br < 0.06) return
          ctx2d.beginPath()
          ctx2d.moveTo(a.sx, a.sy)
          ctx2d.lineTo(b.sx, b.sy)
          ctx2d.strokeStyle = `rgba(16,185,129,${br * 0.38})`
          ctx2d.lineWidth = br > 0.7 ? 1.2 : 0.6
          ctx2d.stroke()
          if (br > 0.78) {
            ctx2d.beginPath()
            ctx2d.moveTo(a.sx, a.sy)
            ctx2d.lineTo(b.sx, b.sy)
            ctx2d.strokeStyle = `rgba(110,231,183,${(br - 0.78) * 0.6})`
            ctx2d.lineWidth = 0.4
            ctx2d.stroke()
          }
        })

      // Draw nodes
      ;[...P]
        .filter(Boolean)
        .sort((a: any, b: any) => b.sz - a.sz)
        .forEach((p: any) => {
          const { sx, sy, s, br, node } = p
          const baseR = GS[node.grp] || 4
          const r = Math.max(2, baseR * s * 0.9) * (0.6 + br * 0.4)

          if (br > 0.3) {
            const grd = ctx2d.createRadialGradient(sx, sy, 0, sx, sy, r * 5)
            grd.addColorStop(0, `rgba(16,185,129,${br * 0.18})`)
            grd.addColorStop(1, "transparent")
            ctx2d.beginPath()
            ctx2d.arc(sx, sy, r * 5, 0, Math.PI * 2)
            ctx2d.fillStyle = grd
            ctx2d.fill()
          }

          ctx2d.beginPath()
          ctx2d.arc(sx, sy, r, 0, Math.PI * 2)
          if (node.grp === "core") {
            ctx2d.fillStyle = `rgba(240,240,240,${0.12 + br * 0.88})`
          } else {
            ctx2d.fillStyle = `rgba(16,185,129,${0.1 + br * 0.8})`
          }
          ctx2d.fill()

          if (
            (node.grp === "core" ||
              node.grp === "output" ||
              node.grp === "signal") &&
            br > 0.3
          ) {
            ctx2d.beginPath()
            ctx2d.arc(sx, sy, r + 3, 0, Math.PI * 2)
            ctx2d.strokeStyle = `rgba(16,185,129,${br * 0.3})`
            ctx2d.lineWidth = 0.8
            ctx2d.stroke()
          }

          if (br > 0.5 && s > 0.35) {
            const la =
              Math.min(1, (br - 0.5) * 4) * Math.min(1, (s - 0.35) * 5)
            if (la > 0.05) {
              const fs = Math.max(9, Math.min(12, s * 13))
              ctx2d.font = `${fs}px "IBM Plex Mono"`
              const isLight = node.grp === "core" || node.grp === "output"
              ctx2d.fillStyle = isLight
                ? `rgba(240,240,240,${la})`
                : `rgba(110,231,183,${la * 0.9})`
              ctx2d.fillText(node.lbl, sx + r + 4, sy + 4)
            }
          }
        })

      if (spRef.current > 0.82) {
        const grd = ctx2d.createRadialGradient(
          CX + 250,
          CY,
          0,
          CX + 250,
          CY,
          220
        )
        grd.addColorStop(0, `rgba(16,185,129,${(spRef.current - 0.82) * 0.12})`)
        grd.addColorStop(1, "transparent")
        ctx2d.fillStyle = grd
        ctx2d.fillRect(0, 0, W, H)
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener("resize", setSize)
    }
  }, [scrollProgress])

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      className="fixed top-0 left-0 w-screen h-screen z-[1] pointer-events-none"
    />
  )
}
