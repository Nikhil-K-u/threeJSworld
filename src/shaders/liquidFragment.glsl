uniform float uTime;
uniform float uScrollProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Create gradient based on position
  float mixValue = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
  float mixValue2 = cos(vPosition.x * 2.0 + uScrollProgress) * 0.5 + 0.5;
  
  // Mix three colors for rich gradient
  vec3 color1 = mix(uColor1, uColor2, mixValue);
  vec3 color2 = mix(uColor2, uColor3, mixValue2);
  vec3 finalColor = mix(color1, color2, sin(uTime * 0.3) * 0.5 + 0.5);
  
  // Add fresnel effect for edges
  vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(normal, viewDirection)), 2.0);
  
  finalColor += fresnel * 0.3;
  
  // Add subtle pulsing
  finalColor *= 0.8 + sin(uTime) * 0.2;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
