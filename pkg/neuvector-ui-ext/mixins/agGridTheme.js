/**
 * Mixin for ag-grid components that need to reactively switch between
 * ag-theme-balham (light) and ag-theme-balham-dark as Rancher's theme changes.
 *
 * Uses a MutationObserver on <body> so the grid updates immediately when the
 * user presses Ctrl+T, without requiring a page reload.
 */
export default {
  data() {
    return {
      isDarkTheme: document.body.classList.contains('theme-dark'),
    };
  },

  computed: {
    isLightTheme() {
      return !this.isDarkTheme;
    },
  },

  mounted() {
    this._agThemeObserver = new MutationObserver(() => {
      this.isDarkTheme = document.body.classList.contains('theme-dark');
    });
    this._agThemeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  },

  beforeUnmount() {
    this._agThemeObserver?.disconnect();
  },
};
