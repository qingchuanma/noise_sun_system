uniform float u_time;
uniform sampler2D u_flowTexture;
uniform sampler2D u_noiseTexture;
varying vec2 v_uv;

void main(){
  vec2 new_Uv = v_uv+vec2(0,0.02)*u_time;

  vec4 noise_Color = texture2D(u_noiseTexture,new_Uv);//texture2d(texture image,texture coord)
  new_Uv.x += noise_Color.r*0.2;
  new_Uv.y += noise_Color.g*0.2;

  gl_FragColor = texture2D(u_flowTexture,new_Uv)*vec4(1.0,0.0,0.0,1.0);//mix texture and color


    // if (pos.x>=0.0){
    //     gl_FragColor = vec4(abs(sin(u_time)),0.0,0.0,1.0);
    // }
    // else{
    //     gl_FragColor = vec4(0.0,abs(cos(u_time)),0.0,1.0);
    // }
    //gl_FragColor = vec4(abs(sin(u_time)), 0.4, 0.0, 1.0);
}