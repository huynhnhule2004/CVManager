<template>
    <div class="profile-picture">
      <img v-if="src" :src="src"  :key="src" alt="Profile Picture" class="profile-img" />
      <img v-else :src="defaultImg"  :key="defaultImg" alt="Default Profile Picture" class="profile-img" />
    </div>
  </template>
  
  <script>
  export default {
    props: {
      src: {
        type: String,
        required: false,
        default: null
      }
    },
    data() {
      return {
        defaultImg: 'path/to/default-image.png' // Đặt hình ảnh mặc định tại đây
      };
    },
    watch: {
      src(newSrc) {
        console.log('Profile Picture src changed:', newSrc);
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-picture {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: #e0e0e0;
    overflow: hidden;
  }
  
  .profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  </style>
  