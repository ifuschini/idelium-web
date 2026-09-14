<template>
  <section
    :class="['enterprise-grid-state', `enterprise-grid-state--${variant}`]"
    role="status"
    aria-live="polite"
  >
    <div class="enterprise-grid-state__icon" aria-hidden="true">
      <font-awesome-icon :icon="iconName" />
    </div>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <div v-if="$slots.actions" class="enterprise-grid-state__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "EnterpriseGridState",
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: "empty",
      validator(value) {
        return [
          "empty",
          "loading",
          "no-results",
          "error",
          "permission",
          "partial",
          "stale",
        ].includes(value);
      },
    },
  },
  computed: {
    iconName() {
      const icons = {
        empty: "table",
        error: "exclamation-triangle",
        loading: "sync",
        permission: "lock",
        partial: "exclamation-circle",
        stale: "history",
      };
      return icons[this.variant] || icons.empty;
    },
  },
};
</script>

<style scoped>
.enterprise-grid-state {
  align-items: center;
  background: color-mix(
    in srgb,
    var(--id-color-primary) 7%,
    var(--id-color-surface)
  );
  border: 1px dashed var(--id-color-border-strong);
  border-radius: var(--id-radius-large, 1rem);
  color: var(--id-color-text-muted);
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  min-height: 8rem;
  padding: 1.25rem;
}

.enterprise-grid-state__icon {
  align-items: center;
  background: color-mix(
    in srgb,
    var(--id-color-primary) 14%,
    var(--id-color-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--id-color-primary) 55%, var(--id-color-border));
  border-radius: var(--id-radius-medium, 0.75rem);
  color: var(--id-color-primary-strong);
  display: inline-flex;
  flex: 0 0 auto;
  height: 3rem;
  justify-content: center;
  width: 3rem;
}

.enterprise-grid-state h3 {
  color: var(--id-color-text);
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  margin: 0 0 0.4rem;
  text-transform: uppercase;
}

.enterprise-grid-state p {
  margin: 0;
}

.enterprise-grid-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-2);
  margin-top: var(--id-space-3);
}

.enterprise-grid-state--error .enterprise-grid-state__icon,
.enterprise-grid-state--permission .enterprise-grid-state__icon {
  background: color-mix(
    in srgb,
    var(--id-color-danger) 14%,
    var(--id-color-surface)
  );
  border-color: color-mix(
    in srgb,
    var(--id-color-danger) 55%,
    var(--id-color-border)
  );
  color: var(--id-color-danger);
}
</style>
