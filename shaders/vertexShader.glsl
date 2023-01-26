uniform float u_time;
varying vec2 v_uv;

void main(){
    v_uv = uv; //uv is a built-in attribute
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x,position.y,position.z, 1.0 );

}