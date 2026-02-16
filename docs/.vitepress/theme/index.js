import DefaultTheme from 'vitepress/theme';
import ExampleRunner from './components/ExampleRunner.vue';
import './assets/examples.css';
import './assets/example-runner.js';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register ExampleRunner globally
    app.component('ExampleRunner', ExampleRunner);
  }
};