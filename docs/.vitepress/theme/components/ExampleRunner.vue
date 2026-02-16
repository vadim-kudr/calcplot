<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  code: {
    type: String,
    required: true
  }
});

const container = ref(null);
const containerId = `calcplot-${Math.random().toString(36).substr(2, 9)}`;
let cleanup = null;

onMounted(() => {
  if (window.CalcPlotExampleRunner) {
    try {
      // Execute example using the global runner
      window.CalcPlotExampleRunner.executeExample(props.code, containerId);
    } catch (error) {
      console.error('Error executing example:', error);
      if (container.value) {
        container.value.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    }
  } else {
    console.error('CalcPlotExampleRunner not available');
  }
});

onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});
</script>

<template>
  <div class="example-runner">
    <div class="example-code">
      <slot />
    </div>
    <div :id="containerId" ref="container" class="calcplot-container"></div>
  </div>
</template>

<style scoped>
.example-runner {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.example-code {
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  padding: 1rem;
}

.example-code :deep(pre) {
  margin: 0;
  border-radius: 0;
  background: transparent;
}

.error {
  color: var(--vp-c-danger-1);
  padding: 1rem;
  background: var(--vp-c-danger-soft);
  border-radius: 4px;
}
</style>