uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

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
    sin(fresnel * 6.28 + uTime * 0.5) * 0.5 + 0.5,
    sin(fresnel * 6.28 + uTime * 0.7 + 2.0) * 0.5 + 0.5,
    sin(fresnel * 6.28 + uTime * 0.3 + 4.0) * 0.5 + 0.5
  );
  
  // Apply iridescent effect at edges
  finalColor = mix(finalColor, iridescent, fresnel * 0.6);
  
  // Add edge glow with Fresnel
  finalColor += fresnel * 0.4;
  
  // Add subtle pulsing
  finalColor *= 0.8 + sin(uTime) * 0.2;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
