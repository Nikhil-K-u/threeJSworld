uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uParticleMode;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

const float TWO_PI = 6.28318530718;

// Simple noise function for film grain effect
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // Create gradient based on position
  float mixValue = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
  float mixValue2 = cos(vPosition.x * 2.0 + uScrollProgress) * 0.5 + 0.5;
  
  // Mix three colors for rich gradient
  vec3 color1 = mix(uColor1, uColor2, mixValue);
  vec3 color2 = mix(uColor2, uColor3, mixValue2);
  vec3 finalColor = mix(color1, color2, sin(uTime * 0.3) * 0.5 + 0.5);
  
  // Calculate view direction for proper Fresnel
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  
  // High-end Fresnel equation with power of 4.0 for sharper rim light
  float fresnel = pow(1.0 - dot(normalize(vNormal), viewDirection), 4.0);
  
  // Create bright cyan/white rim light color for Active Theory polish
  vec3 rimLightColor = vec3(0.5, 1.0, 1.0); // Cyan
  vec3 whiteGlow = vec3(1.0, 1.0, 1.0); // White
  vec3 rimColor = mix(rimLightColor, whiteGlow, fresnel * 0.5);
  
  // Apply bright rim light to edges
  finalColor = mix(finalColor, rimColor, fresnel * 0.8);
  
  // Add strong edge glow for bloom effect
  finalColor += fresnel * rimColor * 0.6;
  
  // Boost brightness for bloom effect on bright areas (branchless)
  float brightness = dot(finalColor, vec3(0.299, 0.587, 0.114));
  float bloomBoost = max(0.0, brightness - 1.0) * 0.5;
  finalColor += bloomBoost;
  
  // Add subtle pulsing
  finalColor *= 0.8 + sin(uTime) * 0.2;
  
  // Add subtle noise for film grain effect (0.05 opacity)
  float noise = random(vUv + uTime * 0.1) * 2.0 - 1.0;
  finalColor += noise * 0.05;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
