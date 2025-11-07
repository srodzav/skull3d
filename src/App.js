import React, { useRef, useEffect, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Text, OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import gsap from "gsap";
import { RiResetLeftFill } from "react-icons/ri";
import { FaLock, FaUnlock } from "react-icons/fa";

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

const MODELS = {
  skull: {
    id: 'skull',
    name: 'Cat Skull',
    path: '/models/cat_skull/scene.gltf',
    scale: 2,
    position: [0, 0, 0],
    rotate: [0, 0, 0],
    cameraPosition: [300, 0, 0],
    textContent: 'kannssai',
    textColor: '#ff0000',
    textPosition: [0, -50, 0],
    textRotation: [0, Math.PI / 2, 0]
  },
  ar15: {
    id: 'ar15',
    name: 'AR15',
    path: '/models/ar15/scene.gltf',
    scale: 35,
    position: [0, -30, 0],
    rotate: [0, Math.PI / 2.8, 0],
    cameraPosition: [300, 100, 0],
    textContent: 'kannssai',
    textColor: '#ff0000',
    textPosition: [0, -50, 0],
    textRotation: [0, Math.PI / 2, 0]
  },
  toyota_ae86: {
    id: 'toyota_ae86',
    name: 'Toyota AE86',
    path: '/models/toyota_ae86/scene.gltf',
    scale: 0.30,
    position: [0, -20, 0],
    rotate: [0, Math.PI/4, 0],
    cameraPosition: [300, 100, 0],
    textContent: 'kannssai',
    textColor: '#ff0000',
    textPosition: [0, -50, 0],
    textRotation: [0, Math.PI / 2, 0]
  }
}

function DynamicModel({ modelConfig }) {
  const { scene } = useGLTF(modelConfig.path);
  return (
    <primitive 
      object={scene} 
      scale={modelConfig.scale} 
      position={modelConfig.position} 
      rotation={modelConfig.rotate} 
    />
  );
}

function SceneContent({ selectedModelId, isLocked, setIsLocked }) {
  const controls = useRef();
  const { camera } = useThree();
  const modelConfig = MODELS[selectedModelId];

  useEffect(() => {
    gsap.to(camera.position, { 
      x: modelConfig.cameraPosition[0],
      y: modelConfig.cameraPosition[1], 
      z: modelConfig.cameraPosition[2],
      duration: 1.2, 
      ease: "power2.inOut" 
    });
  }, [selectedModelId, camera, modelConfig.cameraPosition]);

  useEffect(() => {
    const reset = () => {
      gsap.to(camera.position, { 
        x: modelConfig.cameraPosition[0],
        y: modelConfig.cameraPosition[1], 
        z: modelConfig.cameraPosition[2],
        duration: 1.2, 
        ease: "power2.inOut" 
      });
      gsap.to(controls.current.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
    };

    window.addEventListener("resetCamera", reset);
    return () => window.removeEventListener("resetCamera", reset);
  }, [camera, modelConfig.cameraPosition]);

  const handleLockToggle = () => {
    gsap.to(camera.position, { 
      x: modelConfig.cameraPosition[0],
      y: modelConfig.cameraPosition[1], 
      z: modelConfig.cameraPosition[2],
      duration: 1.2, 
      ease: "power2.inOut" 
    });
    gsap.to(controls.current.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
    setIsLocked(!isLocked);
  };

  useEffect(() => {
    window.addEventListener("toggleLock", handleLockToggle);
    return () => window.removeEventListener("toggleLock", handleLockToggle);
  }, [isLocked, modelConfig.cameraPosition]);

  return (
    <>
      {/* Luces cinematográficas */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.6} color="#ffbbaa" />
      <spotLight position={[0, 10, 10]} angle={0.4} intensity={0.5} color="#aaccff" />

      {/* Fondo */}
      <Environment preset="studio" />

      {/* Modelo */}
      <Suspense fallback={<Loader />}>
        <DynamicModel modelConfig={modelConfig} />
      </Suspense>

      {/* Texto principal */}
      <Text
        position={modelConfig.textPosition}
        rotation={modelConfig.textRotation}
        fontSize={20}
        font="/fonts/go3v2.ttf"
        anchorX="center"
        anchorY="middle"
      >
        <meshStandardMaterial
          color={modelConfig.textColor}
          emissive={modelConfig.textColor}
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.4}
        />
        {modelConfig.textContent}
      </Text>

      {/* Easter egg */}
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

      {/* Cámara */}
      <OrbitControls 
        ref={controls} 
        enableZoom={true}
        enableRotate={true}
        enablePan={!isLocked}
        maxDistance={isLocked ? 500 : 600}
        minPolarAngle={isLocked ? Math.PI/6 : 0}
        maxPolarAngle={isLocked ? Math.PI*5/6 : Math.PI}
      />
    </>
  );
}

export default function App() {
  const [selectedModel, setSelectedModel] = useState('skull');
  const [isChangingModel, setIsChangingModel] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const handleModelChange = (e) => {
    const newModel = e.target.value;

    if (newModel !== selectedModel) {
      setIsChangingModel(true);
      setIsLocked(true);

      setTimeout(() => {
        setSelectedModel(newModel);
        setIsChangingModel(false);
      }, 1000);
    }
  };

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
      <select
        value={selectedModel}
        onChange={handleModelChange}
        style={{
          position: "absolute",
          top: "50px",
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
          zIndex: 1000,
          pointerEvents: "auto",
          appearance: "auto",
          WebkitAppearance: "auto",
        }}
        onMouseEnter={(e) => (e.target.style.background = "rgba(255,0,0,0.25)")}
        onMouseLeave={(e) => (e.target.style.background = "rgba(255,0,0,0.15)")}
      >
        {Object.values(MODELS).map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>

      <Canvas shadows camera={{ position: [300, 0, 0], fov: 50 }} dpr={[1, 1.5]}>
        <Suspense fallback={<Loader />}>
        {isChangingModel ? (
          <Loader />
        ) : (
          <SceneContent 
            selectedModelId={selectedModel} 
            isLocked={isLocked}
            setIsLocked={setIsLocked}
          />
        )}
      </Suspense>
    </Canvas>

    {/* lock */}
      <button
        onClick={() => window.dispatchEvent(new Event("toggleLock"))}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "calc(50% - 60px)",
          transform: "translateX(-50%)",
          background: isLocked ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 255, 0, 0.15)",
          color: isLocked ? "#ff5555" : "#55ff55",
          border: isLocked ? "1px solid #ff3333" : "1px solid #33ff33",
          borderRadius: "10px",
          padding: "5px 10px",
          fontFamily: "monospace",
          fontSize: "1rem",
          letterSpacing: "1px",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = isLocked ? "rgba(255,0,0,0.25)" : "rgba(0,255,0,0.25)";
          e.target.style.transform = "translateX(-50%) scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = isLocked ? "rgba(255,0,0,0.15)" : "rgba(0,255,0,0.15)";
          e.target.style.transform = "translateX(-50%) scale(1)";
        }}
      >
        {isLocked ? <FaLock /> : <FaUnlock />}
      </button>

      {/* reset */}
      <button
        onClick={() => window.dispatchEvent(new Event("resetCamera"))}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "calc(50% + 60px)",
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

Object.values(MODELS).forEach(model => {
  useGLTF.preload(model.path);
});