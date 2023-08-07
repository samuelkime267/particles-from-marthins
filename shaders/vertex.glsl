varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCoordinates;

attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;

uniform float move; 
uniform float time; 
uniform vec2 mouse; 
uniform float mousePressed;
uniform float transition;

void main() {
  vec3 pos = position;

  // NOT STABLE
  pos.x += sin(move * aSpeed) * 3.;
  pos.y += sin(move * aSpeed) * 3.;
  pos.z = mod(position.z + move * 1000. * aSpeed + aOffset , 2000.) - 1000.;



  // STABLE
  vec3 stable = position;
  float dist = distance(stable.xy,mouse);
  float area = 1. - smoothstep(0.,300.,dist);

  stable.x += 50. * sin(0.1 * time * aPress) * aDirection * area * mousePressed;
  stable.y += 50. * sin(0.1 * time * aPress) * aDirection * area * mousePressed;
  stable.z += 200. * cos(0.1 * time * aPress) * aDirection * area * mousePressed;


  // TRANSITION
  pos = mix(pos,stable,transition);


  // STABLE
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
  gl_PointSize = 3000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
  vCoordinates = aCoordinates.xy;
  vPos = pos;
}