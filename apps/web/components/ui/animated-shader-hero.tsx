'use client'

import React, { useRef, useEffect } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HeroProps {
    trustBadge?: {
        text: string
        icon?: React.ReactNode
    }
    headline: {
        line1: string
        line2: string
    }
    subtitle: string
    buttons?: {
        primary?: { text: string; onClick?: () => void; icon?: React.ReactNode }
        secondary?: { text: string; onClick?: () => void; icon?: React.ReactNode }
    }
    className?: string
}

// ─── Shader Source (AVAXVERSE-tuned: deep reds, dark purples) ─────────────────

const SHADER_SOURCE = `#version 300 es
/*
 * Based on work by Matthias Hurrle (@atzedent)
 * Adapted for AVAXVERSE — Avalanche C-Chain deep-space aesthetic.
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p); p*=2.*m; a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1.,t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a); d=a; p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    /* AVAXVERSE palette: crimson #E84142 → deep purple → dark navy */
    col+=.00125/d*(cos(sin(i)*vec3(2.28,0.25,0.26))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.18,bg*.04,bg*.04),d);
  }
  O=vec4(col,1);
}`

// ─── WebGL Renderer ────────────────────────────────────────────────────────────

const VERTEX_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`

const QUAD_VERTS = [-1, 1, -1, -1, 1, 1, 1, -1]

class ShaderRenderer {
    private gl: WebGL2RenderingContext
    private program: WebGLProgram | null = null
    private vs: WebGLShader | null = null
    private fs: WebGLShader | null = null
    private buffer: WebGLBuffer | null = null

    constructor(private canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl2')!
    }

    private compile(shader: WebGLShader, src: string) {
        const { gl } = this
        gl.shaderSource(shader, src)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader))
        }
    }

    init(fragmentSrc: string) {
        const { gl } = this
        const vs = gl.createShader(gl.VERTEX_SHADER)!
        const fs = gl.createShader(gl.FRAGMENT_SHADER)!
        this.compile(vs, VERTEX_SRC)
        this.compile(fs, fragmentSrc)

        const prog = gl.createProgram()!
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(prog))
        }

        this.vs = vs
        this.fs = fs
        this.program = prog

        this.buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTS), gl.STATIC_DRAW)

        const pos = gl.getAttribLocation(prog, 'position')
        gl.enableVertexAttribArray(pos)
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    }

    render(now: number) {
        const { gl, canvas, program } = this
        if (!program) return

        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

        gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height)
        gl.uniform1f(gl.getUniformLocation(program, 'time'), now * 1e-3)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    destroy() {
        const { gl, program, vs, fs } = this
        if (!program) return
        if (vs) { gl.detachShader(program, vs); gl.deleteShader(vs) }
        if (fs) { gl.detachShader(program, fs); gl.deleteShader(fs) }
        gl.deleteProgram(program)
        this.program = null
    }
}

// ─── Hero Component ────────────────────────────────────────────────────────────

export function AnimatedShaderHero({
    trustBadge,
    headline,
    subtitle,
    buttons,
    className = '',
}: HeroProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number | undefined>(undefined)
    const rendererRef = useRef<ShaderRenderer | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const dpr = Math.max(1, 0.5 * window.devicePixelRatio)

        const resize = () => {
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
        }
        resize()

        const renderer = new ShaderRenderer(canvas)
        renderer.init(SHADER_SOURCE)
        rendererRef.current = renderer

        const loop = (now: number) => {
            renderer.render(now)
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
        window.addEventListener('resize', resize)

        return () => {
            window.removeEventListener('resize', resize)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            renderer.destroy()
        }
    }, [])

    return (
        <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
            <style>{`
        @keyframes avax-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes avax-fade-down {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .avax-anim-down  { animation: avax-fade-down 0.7s ease-out forwards; }
        .avax-anim-up    { animation: avax-fade-up  0.7s ease-out forwards; opacity: 0; }
        .avax-delay-1    { animation-delay: 0.15s; }
        .avax-delay-2    { animation-delay: 0.30s; }
        .avax-delay-3    { animation-delay: 0.45s; }
        .avax-delay-4    { animation-delay: 0.60s; }
      `}</style>

            {/* WebGL canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full touch-none"
                style={{ background: 'black' }}
            />

            {/* Overlay gradient to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-4 text-center">
                {/* Brand Presence */}
                <div className="avax-anim-down mb-6 avax-delay-0 flex justify-center w-full">
                    <span
                        className="text-xl md:text-2xl font-black tracking-[0.5em] uppercase text-red-500 pl-[0.5em]"
                        style={{
                            textShadow: '0 0 40px rgba(232,65,66,0.6), 0 0 10px rgba(232,65,66,0.3)',
                            fontFamily: 'var(--font-inter)'
                        }}
                    >
                        AVAXVERSE
                    </span>
                </div>

                {/* Badge */}
                {trustBadge && (
                    <div className="mb-8 avax-anim-down avax-delay-1">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 backdrop-blur-md border border-red-400/25 rounded-full text-sm">
                            {trustBadge.icon && <span className="text-red-400">{trustBadge.icon}</span>}
                            <span className="text-red-100/90">{trustBadge.text}</span>
                        </div>
                    </div>
                )}

                {/* Headline */}
                <div className="text-center space-y-1 max-w-6xl mx-auto">
                    <h1
                        className="avax-anim-up avax-delay-1 text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none"
                        style={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #E84142 40%, #c0392b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {headline.line1}
                    </h1>
                    <h1
                        className="avax-anim-up avax-delay-2 text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none"
                        style={{
                            background: 'linear-gradient(135deg, #fff 0%, #ffd6d6 50%, #ff9999 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {headline.line2}
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="avax-anim-up avax-delay-3 mt-8 max-w-xl text-center text-base md:text-lg text-white/60 font-medium leading-relaxed">
                    {subtitle}
                </p>

                {/* Buttons */}
                {buttons && (
                    <div className="avax-anim-up avax-delay-4 flex flex-col sm:flex-row gap-3 mt-8">
                        {buttons.primary && (
                            <button
                                onClick={buttons.primary.onClick}
                                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, #E84142, #c0392b)',
                                    boxShadow: '0 4px 20px rgba(232,65,66,0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        '0 8px 32px rgba(232,65,66,0.5)'
                                }}
                                onMouseLeave={(e) => {
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                        '0 4px 20px rgba(232,65,66,0.3)'
                                }}
                            >
                                {buttons.primary.icon}
                                {buttons.primary.text}
                            </button>
                        )}
                        {buttons.secondary && (
                            <button
                                onClick={buttons.secondary.onClick}
                                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white/80 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 hover:border-white/20"
                            >
                                {buttons.secondary.icon}
                                {buttons.secondary.text}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
