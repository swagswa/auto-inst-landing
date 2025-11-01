import React, { useRef, useEffect } from 'react';

// WebGL Renderer class for global background
class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private scale: number;
  private shaderSource: string;

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2')!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = globalShaderSource;
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', error);
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.program = gl.createProgram()!;

    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.shaderSource);

    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(this.program!, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  render(time: number) {
    const gl = this.gl;
    gl.useProgram(this.program);

    const timeLocation = gl.getUniformLocation(this.program!, 'time');
    const resolutionLocation = gl.getUniformLocation(this.program!, 'resolution');

    gl.uniform1f(timeLocation, time * 0.001);
    gl.uniform2f(resolutionLocation, this.canvas.width * this.scale, this.canvas.height * this.scale);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  reset() {
    const gl = this.gl;
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.vs) {
      gl.deleteShader(this.vs);
      this.vs = null;
    }
    if (this.fs) {
      gl.deleteShader(this.fs);
      this.fs = null;
    }
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }
}

// Global Shader Background Hook
const useGlobalShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const rendererRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      if (rendererRef.current) {
        rendererRef.current.updateScale(scale);
      }
    };

    const initRenderer = () => {
      try {
        updateCanvasSize();
        const scale = window.devicePixelRatio || 1;
        rendererRef.current = new WebGLRenderer(canvas, scale);
        rendererRef.current.setup();
        rendererRef.current.init();
      } catch (error) {
        console.error('WebGL initialization failed:', error);
      }
    };

    const animate = (time: number) => {
      if (rendererRef.current) {
        try {
          rendererRef.current.render(time);
        } catch (error) {
          console.error('Render error:', error);
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    initRenderer();
    animate(0);

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.reset();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return canvasRef;
};

// Global Shader Background Component
const GlobalShaderBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useGlobalShaderBackground();

  return (
    <div className="relative min-h-screen">
      {/* Fixed background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-10"
        style={{ 
          width: '100vw', 
          height: '100vh',
          pointerEvents: 'none'
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Shader source optimized for global background
const globalShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

// Color palette
#define PRIMARY_COLOR vec3(0.73, 0.27, 0.93)
#define ACCENT_COLOR vec3(0.4, 0.4, 1.0)
#define BACKGROUND_COLOR vec3(0.05, 0.02, 0.1)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}

void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=BACKGROUND_COLOR;
	
	// Slower, more subtle animation for global background
	float bg=clouds(vec2(st.x+T*.2,-st.y));
	
	// Subtle background gradient
	vec3 bgGradient = mix(BACKGROUND_COLOR, PRIMARY_COLOR * 0.08, bg * 0.6);
	col = bgGradient;
	
	// Enhanced intensity for better visibility
	uv*=1.-.3*(sin(T*.15)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.08*cos(i*vec2(.1+.01*i, .8)+i*i+T*.4+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		
		// Much brighter and larger stars
		vec3 starColor = mix(PRIMARY_COLOR, ACCENT_COLOR, sin(i * 0.5) * 0.5 + 0.5);
		col+=.004/d*starColor;

		// Enhanced nebula effect
		float b=noise(i+p+bg*1.731);
		vec3 nebulaColor = mix(PRIMARY_COLOR * 0.35, ACCENT_COLOR * 0.3, b);
		col+=.004*b*nebulaColor/length(max(p,vec2(b*p.x*.02,p.y)));

		// Enhanced color mixing
		vec3 mixColor = mix(PRIMARY_COLOR * 0.12, ACCENT_COLOR * 0.1, bg);
		col=mix(col, mixColor, d * 0.2);
	}

	// Enhanced final color enhancement
	col = mix(col, PRIMARY_COLOR * 0.1, 0.25);
	col += ACCENT_COLOR * 0.04 * sin(T * 0.4);
	
	O=vec4(col,1);
}`;

export default GlobalShaderBackground;