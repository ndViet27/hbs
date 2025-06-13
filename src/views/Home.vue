<script setup>
  import Drawer from '../containerComponents/Drawer.vue'
  import AppBar from '../containerComponents/AppBar.vue'
  import Footer from '../containerComponents/Footer.vue'

  import { ref, onMounted } from 'vue'
  const isDataLoaded = ref(false);
  const handleDataLoaded = () => {
    isDataLoaded.value = true;
  };
  onMounted(() => {
    // console.log('isMobile', mobile.value)
  })
</script>

<template>
  <v-app>
    <Drawer></Drawer>
    <!-- <AppBar></AppBar> -->
    <v-main>
      <div class="container wrap-content-page">
        <v-card class="mx-auto pa-4" style="box-shadow: none !important; padding-top: 12px !important">
          <div>
            <router-view></router-view>
          </div>
        </v-card>
        <!-- <v-card v-else class="mx-auto pa-5" style="box-shadow: none !important">
          <div class="text-center">
            <v-progress-circular
              color="var(--main-color)" 
              indeterminate
            ></v-progress-circular>
          </div>
        </v-card> -->
      </div>
    </v-main>
    <!-- <Footer></Footer> -->
  </v-app>
</template>
