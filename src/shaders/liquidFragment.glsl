uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
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
  
  // Proper Fresnel equation for iridescent 'oil slick' effect
  float fresnel = pow(1.0 - dot(normalize(vNormal), viewDirection), 3.0);
  
  // Create iridescent colors based on Fresnel at edges
  vec3 iridescent = vec3(
    sin(fresnel * TWO_PI + uTime * 0.5) * 0.5 + 0.5,
    sin(fresnel * TWO_PI + uTime * 0.7 + 2.0) * 0.5 + 0.5,
    sin(fresnel * TWO_PI + uTime * 0.3 + 4.0) * 0.5 + 0.5
  );
  
  // Apply iridescent effect at edges
  finalColor = mix(finalColor, iridescent, fresnel * 0.6);
  
  // Add edge glow with Fresnel (bloom-like effect)
  finalColor += fresnel * 0.4;
  
  // Boost brightness for bloom effect on bright areas
  float brightness = dot(finalColor, vec3(0.299, 0.587, 0.114));
  if (brightness > 1.0) {
    finalColor += (brightness - 1.0) * 0.5;
  }
  
  // Add subtle pulsing
  finalColor *= 0.8 + sin(uTime) * 0.2;
  
  // Add subtle noise for film grain effect (0.05 opacity)
  float noise = random(vUv + uTime * 0.1) * 2.0 - 1.0;
  finalColor += noise * 0.05;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
