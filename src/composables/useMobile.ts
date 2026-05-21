import { onMounted, onBeforeUnmount, ref } from 'vue';

export function useMobile() {
  const isMobile = ref(false);

  function detect() {
    isMobile.value =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia('(pointer: coarse)').matches;
  }

  onMounted(() => {
    detect();
    window.addEventListener('resize', detect);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', detect);
  });

  return { isMobile };
}
