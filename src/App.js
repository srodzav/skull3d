import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Text, OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import gsap from "gsap";
import { RiResetLeftFill } from "react-icons/ri";

function Loader() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes counterRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(-360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const radius = 15;
  const centerX = 30;
  const centerY = 30;

  const angles = [0, 120, 240];

  const points = angles.map(angle => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad - Math.PI/2),
      y: centerY + radius * Math.sin(rad - Math.PI/2)
    };
  });
  
  return (
    <Html center>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        position: 'relative'
      }}>
        <div style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          animation: 'rotate 2s linear infinite'
        }}>
          {points.map((point, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${point.x - 6}px`,
                top: `${point.y - 6}px`,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5555',
                animation: `counterRotate 2s linear infinite, pulse 1s ease-in-out infinite ${index * 0.33}s`
              }}
            />
          ))}
        </div>
      </div>
    </Html>
  );
}

function SkullModel() {
  const { scene } = useGLTF("/models/cat_skull/scene.gltf");
  return <primitive object={scene} scale={2} />;
}

function SceneContent() {
  const controls = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const reset = () => {
      gsap.to(camera.position, { x: 300, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
      gsap.to(controls.current.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
    };

    window.addEventListener("resetCamera", reset);
    return () => window.removeEventListener("resetCamera", reset);
  }, [camera]);

  return (
    <>
      {/* 💡 Luces cinematográficas */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.6} color="#ffbbaa" />
      <spotLight position={[0, 10, 10]} angle={0.4} intensity={0.5} color="#aaccff" />

      {/* 🌌 Fondo / ambiente */}
      <Environment preset="studio" />

      {/* 🦴 Modelo */}
      <SkullModel />

      {/* 🧠 Texto principal */}
      <Text
        position={[0, -50, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={20}
        font="/fonts/go3v2.ttf"
        anchorX="center"
        anchorY="middle"
      >
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.4}
        />
        kannssai
      </Text>

      {/* 🥚 Easter egg oculto */}
      <Text
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.2}
        font="/fonts/enchantedland.otf"
        anchorX="center"
        anchorY="middle"
      >
        <meshStandardMaterial
          color="#ff0044"
          emissive="#ff0044"
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.6}
        />
        you weren’t supposed to find this
      </Text>

      {/* 🎮 Controles de cámara */}
      <OrbitControls ref={controls} enableZoom enablePan={false} />
    </>
  );
}

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas shadows camera={{ position: [300, 0, 0], fov: 50 }} dpr={[1, 1.5]}>
        <Suspense fallback={<Loader />}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* 🔘 Botón de reset */}
      <button
        onClick={() => window.dispatchEvent(new Event("resetCamera"))}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 0, 0, 0.15)",
          color: "#ff5555",
          border: "1px solid #ff3333",
          borderRadius: "10px",
          padding: "5px 10px",
          fontFamily: "monospace",
          fontSize: "1rem",
          letterSpacing: "1px",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => (e.target.style.background = "rgba(255,0,0,0.25)")}
        onMouseLeave={(e) => (e.target.style.background = "rgba(255,0,0,0.15)")}
      >
        <RiResetLeftFill />
      </button>
    </div>
  );
}

useGLTF.preload("/models/cat_skull/scene.gltf");