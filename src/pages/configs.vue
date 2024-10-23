<script setup lang="ts">
  import { TresCanvas, useRenderLoop } from '@tresjs/core'
  import { OrbitControls, GLTFModel  } from '@tresjs/cientos'

  const mykRef = ref(null)

  const { resume, onLoop } = useRenderLoop();
  onLoop(({ delta }) => {
  // I will run at every frame ~ 60FPS (depending of your monitor)
  if (mykRef.value) {
    //@ts-ignore
    mykRef.value.rotation.y += delta;
  }
});
</script>

<template>

  <div class="w-full flex justify-center">
    <TresCanvas
      class="w-[80vw] h-screen overflow-hidden overscroll-none"
      clear-color="#82DBC5"
      shadows
      alpha
    >
      <TresPerspectiveCamera 
        :position="[0, 0, 3]" 
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"
      />
      <Suspense>
        <TresMesh ref=mykRef >
          <GLTFModel path="/models/configs.glb" />
        </TresMesh>
      </Suspense>
      <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
    </TresCanvas>
  </div>
</template>
