import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture, Float, PresentationControls } from '@react-three/drei';

/**
 * Photobooth Strip 3D Mesh
 * Renders the 2D captured strip onto a tactile, subtly curved photo-paper plane
 */
function StripGeometry({ textureUrl }) {
  const texture = useTexture(textureUrl);

  // Configure texture for maximum crispness
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  // 1000 x 2900 ratio geometry with subtle physical paper curvature
  const { geometry } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(1.5, 4.35, 32, 64);
    const pos = geom.attributes.position;

    // Apply gentle paper curling along the edges
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Slight vertical wave + subtle edge curl
      const curveZ = Math.sin(y * 0.9) * 0.04 + Math.cos(x * 1.8) * 0.02;
      pos.setZ(i, curveZ);
    }

    geom.computeVertexNormals();
    return { geometry: geom };
  }, []);

  return (
    <group>
      {/* Front Textured Photo Paper */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.02}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Back Paper (Off-white textured back with slight offset) */}
      <mesh geometry={geometry} position={[0, 0, -0.002]} rotation={[0, Math.PI, 0]} receiveShadow>
        <meshStandardMaterial
          color="#f4efe6"
          roughness={0.8}
          metalness={0.0}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

export default function StripMesh({ textureUrl }) {
  if (!textureUrl) return null;

  return (
    <PresentationControls
      global
      cursor
      snap={{ mass: 2, tension: 350 }}
      speed={1.5}
      zoom={1.0}
      rotation={[0, 0, 0]}
      polar={[-Math.PI / 5, Math.PI / 5]}
      azimuth={[-Math.PI / 2.5, Math.PI / 2.5]}
      config={{ mass: 1.5, tension: 300 }}
    >
      <Float
        speed={1.8}
        rotationIntensity={0.2}
        floatIntensity={0.4}
        floatingRange={[-0.08, 0.08]}
      >
        <StripGeometry textureUrl={textureUrl} />
      </Float>
    </PresentationControls>
  );
}
