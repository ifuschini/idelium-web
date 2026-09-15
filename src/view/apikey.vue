<template>
  <div class="apikey-page">
    <header class="apikey-page-header">
      <div>
        <p class="apikey-eyebrow">
          {{ language[config.currentLanguage].Apikey.cliEyebrow }}
        </p>
        <h1 class="apikey-title">
          {{ language[config.currentLanguage].Apikey.pageTitle }}
        </h1>
        <p class="apikey-subtitle">
          {{ language[config.currentLanguage].Apikey.pageDescription }}
        </p>
      </div>
      <button
        v-if="canCreateCredential"
        type="button"
        class="btn btn-primary apikey-primary-action"
        v-on:click="openCreatePanel()"
      >
        <font-awesome-icon icon="plus" aria-hidden="true" />
        {{ language[config.currentLanguage].Apikey.createApiKey }}
      </button>
    </header>

    <nav
      class="apikey-tabs"
      :aria-label="language[config.currentLanguage].Apikey.tabsLabel"
    >
      <button
        v-for="tab in apikeyTabs"
        v-bind:key="tab.id"
        type="button"
        :class="[
          'apikey-tab',
          { 'apikey-tab--active': activeApikeyTab === tab.id },
        ]"
        :aria-selected="activeApikeyTab === tab.id"
        role="tab"
        v-on:click="selectApiKeyTab(tab.id)"
      >
        <span>{{ tab.label }}</span>
        <small>{{ tab.description }}</small>
      </button>
    </nav>

    <section
      v-if="activeApikeyTab === 'credentials' || activeApikeyTab === 'cli'"
      class="apikey-grid apikey-grid--single"
      role="tabpanel"
    >
      <article
        v-if="activeApikeyTab === 'credentials'"
        class="apikey-card apikey-card-main"
      >
        <div class="apikey-card-header">
          <div>
            <p class="apikey-eyebrow">
              {{ language[config.currentLanguage].Apikey.credentialEyebrow }}
            </p>
            <h2 class="apikey-card-title">
              {{ language[config.currentLanguage].Apikey.legacyCliKeyTitle }}
            </h2>
          </div>
          <span v-if="legacyKeyActive === true" class="apikey-status">
            {{ language[config.currentLanguage].Apikey.statusActive }}
          </span>
        </div>

        <div v-if="showError == true" class="alert alert-danger apikey-alert">
          {{ error }}
        </div>

        <div class="apikey-value-panel">
          <span
            v-if="legacyKeyLoading"
            class="apikey-empty-state"
            role="status"
          >
            {{ language[config.currentLanguage].Apikey.legacyLoading }}
          </span>
          <code
            v-else-if="apikey"
            class="apikey-value"
            :aria-label="
              language[config.currentLanguage].Apikey.legacyMaskedValue
            "
            >{{ legacyKeyLoadedFromServer ? maskApiKey(apikey) : apikey }}</code
          >
          <div
            v-else-if="legacyKeyPersisted"
            class="apikey-stored-state"
            role="status"
          >
            <font-awesome-icon icon="key" aria-hidden="true" />
            <div>
              <strong>{{
                language[config.currentLanguage].Apikey.keyStoredTitle
              }}</strong>
              <span>{{
                language[config.currentLanguage].Apikey.keyStoredHelp
              }}</span>
            </div>
          </div>
          <span v-else class="apikey-empty-state">
            {{ language[config.currentLanguage].Apikey.keyNotGenerated }}
          </span>
        </div>

        <div class="apikey-actions">
          <button
            type="button"
            class="btn btn-outline-success apikey-secondary-action"
            v-on:click="copyClipboard(apikey)"
            :disabled="!apikey"
            :title="language[config.currentLanguage].Actions.copy"
          >
            <font-awesome-icon icon="copy" class="idelium-action-icon--copy" />
            {{ language[config.currentLanguage].Apikey.btnCopyKey }}
          </button>
          <button
            type="button"
            class="btn btn-outline-primary apikey-secondary-action"
            v-on:click="downloadKey()"
            :disabled="!apikey"
            :title="language[config.currentLanguage].Actions.download"
          >
            <font-awesome-icon
              icon="download"
              class="idelium-action-icon--download"
            />
            {{ language[config.currentLanguage].Apikey.btnDownloadConfig }}
          </button>
          <button
            type="button"
            class="btn btn-primary apikey-primary-action"
            v-on:click="generateKey()"
            size="sm"
          >
            {{ language[config.currentLanguage].Apikey.btnGenerateKey }}
          </button>
        </div>

        <section
          v-if="showLegacyRotationPanel"
          class="apikey-legacy-rotation"
          aria-labelledby="legacy-key-rotation-title"
        >
          <div class="apikey-card-header">
            <div>
              <p class="apikey-eyebrow">
                {{ language[config.currentLanguage].Apikey.rotationEyebrow }}
              </p>
              <h3 id="legacy-key-rotation-title" class="apikey-card-title">
                {{
                  language[config.currentLanguage].Apikey.rotationLegacyTitle
                }}
              </h3>
              <p class="apikey-cli-copy">
                {{ language[config.currentLanguage].Apikey.rotationLegacyHelp }}
              </p>
            </div>
            <font-awesome-icon
              icon="clock"
              class="apikey-legacy-rotation-icon"
              aria-hidden="true"
            />
          </div>

          <fieldset class="apikey-expiry-options">
            <legend>
              {{ language[config.currentLanguage].Apikey.expiryPolicy }}
            </legend>
            <label
              v-for="option in legacyExpiryOptions"
              v-bind:key="option.value"
              :class="[
                'apikey-expiry-option',
                {
                  'apikey-expiry-option--selected':
                    legacyExpiryDays === option.value,
                },
              ]"
            >
              <input
                v-model="legacyExpiryDays"
                type="radio"
                name="legacy-key-expiry"
                :value="option.value"
              />
              <span>
                <strong>{{ option.label }}</strong>
                <small>{{ option.description }}</small>
              </span>
            </label>
          </fieldset>

          <p v-if="legacyRotationError" class="alert alert-danger apikey-alert">
            {{ legacyRotationError }}
          </p>
          <div class="apikey-legacy-rotation-actions">
            <button
              type="button"
              class="btn btn-outline-secondary apikey-secondary-action"
              v-on:click="cancelLegacyKeyRotation()"
            >
              <font-awesome-icon icon="times-circle" aria-hidden="true" />
              {{ language[config.currentLanguage].Apikey.actions.cancel }}
            </button>
            <button
              type="button"
              class="btn btn-primary apikey-primary-action"
              v-on:click="generateAction()"
            >
              <font-awesome-icon icon="sync" aria-hidden="true" />
              {{ language[config.currentLanguage].Apikey.confirmRotation }}
            </button>
          </div>
        </section>
      </article>

      <aside
        v-if="activeApikeyTab === 'cli'"
        class="apikey-card apikey-cli-card"
      >
        <p class="apikey-eyebrow">
          {{ language[config.currentLanguage].Apikey.packageEyebrow }}
        </p>
        <h2 class="apikey-card-title">
          {{ language[config.currentLanguage].Apikey.cliTitle }}
        </h2>
        <p class="apikey-cli-copy">
          {{ language[config.currentLanguage].Apikey.cliInfo }}
        </p>
        <div class="apikey-command">pip install idelium</div>
        <div class="apikey-command">idelium --help</div>
        <div class="apikey-snippet-list">
          <article
            v-for="snippet in usageSnippets"
            v-bind:key="snippet.id"
            class="apikey-snippet"
          >
            <div class="apikey-card-header">
              <h3 class="apikey-snippet-title">{{ snippet.title }}</h3>
              <button
                type="button"
                class="btn btn-outline-success apikey-secondary-action"
                v-on:click="copyUsageSnippet(snippet)"
                :aria-label="`${language[config.currentLanguage].Apikey.copySnippet}: ${snippet.title}`"
              >
                <font-awesome-icon
                  icon="copy"
                  class="idelium-action-icon--copy"
                />
                {{ language[config.currentLanguage].Apikey.copySnippet }}
              </button>
            </div>
            <pre><code>{{ snippet.body }}</code></pre>
          </article>
          <p class="apikey-security-note">
            {{ language[config.currentLanguage].Apikey.usageGuidance }}
          </p>
        </div>
        <div class="apikey-cli-actions">
          <button
            type="button"
            class="btn btn-success apikey-pypi-button"
            v-on:click="goGithub()"
            size="sm"
          >
            {{ language[config.currentLanguage].Apikey.btnDownloadKey }}
          </button>
        </div>
      </aside>
    </section>

    <section
      v-if="activeApikeyTab === 'credentials'"
      class="apikey-card apikey-inventory-card"
      role="tabpanel"
    >
      <div class="apikey-card-header">
        <div>
          <p class="apikey-eyebrow">
            {{
              language[config.currentLanguage].Apikey.credentialLifecycleTitle
            }}
          </p>
          <h2 class="apikey-card-title">
            {{ language[config.currentLanguage].Apikey.inventoryTitle }}
          </h2>
          <p class="apikey-cli-copy">
            {{
              language[config.currentLanguage].Apikey
                .credentialLifecycleDescription
            }}
          </p>
        </div>
        <IdButton
          v-if="canCreateCredential"
          class="apikey-credential-create-action"
          icon-only
          variant="primary"
          :accessible-label="
            language[config.currentLanguage].Apikey.createTooltip
          "
          :tooltip="language[config.currentLanguage].Apikey.createTooltip"
          v-on:click="openCreatePanel()"
        >
          <template #icon>
            <font-awesome-icon
              icon="plus"
              class="idelium-action-icon--create"
              aria-hidden="true"
            />
          </template>
        </IdButton>
      </div>
      <EnterpriseDataTable
        :accessible-label="
          language[config.currentLanguage].Apikey.inventoryTitle
        "
        :actions="credentialActions"
        :capabilities="credentialCapabilities"
        :columns="credentialColumns"
        :copy="credentialTableCopy"
        density="compact"
        :has-active-filters="hasCredentialFilters"
        :loading="legacyKeyLoading"
        :local-limit="100"
        :rows="credentialRows"
        :error="showError ? error : null"
        v-on:action="handleCredentialAction"
        v-on:clear-filters="clearCredentialFilters"
        v-on:confirm-action="confirmCredentialAction"
        v-on:create="openCreatePanel"
        v-on:retry="getApiKey"
      >
        <template #toolbar>
          <div class="apikey-inventory-toolbar">
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterStatus
              }}</span>
              <select
                v-model="credentialFilters.status"
                class="form-control apikey-filter"
              >
                <option value="">
                  {{ language[config.currentLanguage].Apikey.filterAll }}
                </option>
                <option
                  v-for="statusOption in credentialStatusOptions"
                  v-bind:key="statusOption"
                  :value="statusOption"
                >
                  {{ credentialStatusLabel(statusOption) }}
                </option>
              </select>
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterScope
              }}</span>
              <input
                v-model="credentialFilters.scope"
                class="form-control apikey-filter"
                :placeholder="
                  language[config.currentLanguage].Apikey.filterScope
                "
              />
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterOwner
              }}</span>
              <input
                v-model="credentialFilters.owner"
                class="form-control apikey-filter"
                :placeholder="
                  language[config.currentLanguage].Apikey.filterOwner
                "
              />
            </label>
            <label>
              <span>{{
                language[config.currentLanguage].Apikey.filterExpiry
              }}</span>
              <select
                v-model="credentialFilters.expiry"
                class="form-control apikey-filter"
              >
                <option value="">
                  {{ language[config.currentLanguage].Apikey.filterAll }}
                </option>
                <option value="expired">
                  {{ language[config.currentLanguage].Apikey.expired }}
                </option>
                <option value="none">
                  {{ language[config.currentLanguage].Apikey.noExpiry }}
                </option>
              </select>
            </label>
          </div>
        </template>
      </EnterpriseDataTable>
      <div
        v-if="credentialRows.length > 0"
        class="apikey-mobile-credentials"
        :aria-label="language[config.currentLanguage].Apikey.inventoryTitle"
      >
        <article
          v-for="credential in credentialRows"
          v-bind:key="credential.id"
          class="apikey-mobile-credential"
        >
          <div class="apikey-mobile-credential-header">
            <div>
              <strong>{{ credential.name }}</strong>
              <small>{{ credential.fingerprint }}</small>
            </div>
            <span class="apikey-status-badge">{{ credential.status }}</span>
          </div>
          <dl class="apikey-mobile-credential-meta">
            <div>
              <dt>{{ language[config.currentLanguage].Apikey.colScopes }}</dt>
              <dd>{{ credential.scopes }}</dd>
            </div>
            <div>
              <dt>{{ language[config.currentLanguage].Apikey.colExpiry }}</dt>
              <dd>{{ credential.expiresAt }}</dd>
            </div>
            <div v-if="credential.actor && credential.actor !== 'unknown'">
              <dt>{{ language[config.currentLanguage].Apikey.colOwner }}</dt>
              <dd>{{ credential.actor }}</dd>
            </div>
            <div v-if="credential.lastUsedAt && credential.lastUsedAt !== '—'">
              <dt>{{ language[config.currentLanguage].Apikey.colLastUsed }}</dt>
              <dd>{{ credential.lastUsedAt }}</dd>
            </div>
          </dl>
          <div class="apikey-mobile-credential-actions">
            <button
              v-if="credentialActions.some((action) => action.id === 'rotate')"
              type="button"
              class="btn btn-outline-secondary"
              v-on:click="
                handleCredentialAction({ action: 'rotate', row: credential })
              "
            >
              {{ language[config.currentLanguage].Apikey.actions.rotate }}
            </button>
            <button
              v-if="credentialActions.some((action) => action.id === 'revoke')"
              type="button"
              class="btn btn-outline-danger"
              v-on:click="
                confirmCredentialAction({ action: 'revoke', row: credential })
              "
            >
              {{ language[config.currentLanguage].Apikey.actions.revoke }}
            </button>
          </div>
        </article>
      </div>
      <p class="apikey-security-note">
        {{ language[config.currentLanguage].Apikey.revealOnceNotice }}
      </p>
    </section>

    <section
      v-if="activeApikeyTab === 'credentials' && rotationTarget"
      class="apikey-card apikey-rotation-card"
      role="tabpanel"
    >
      <div class="apikey-card-header">
        <div>
          <p class="apikey-eyebrow">
            {{ language[config.currentLanguage].Apikey.rotationTitle }}
          </p>
          <h2 class="apikey-card-title">
            {{ rotationTarget.name }}
          </h2>
          <p class="apikey-cli-copy">
            {{ language[config.currentLanguage].Apikey.rotationHelp }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary apikey-secondary-action"
          v-on:click="cancelCredentialRotation()"
        >
          {{ language[config.currentLanguage].Apikey.actions.cancel }}
        </button>
      </div>
      <dl class="apikey-rotation-metadata">
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colFingerprint }}</dt>
          <dd>
            {{ rotationTarget.fingerprint || rotationTarget.prefix || "—" }}
          </dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colScopes }}</dt>
          <dd>{{ rotationTarget.scopes.join(", ") }}</dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colLastUsed }}</dt>
          <dd>{{ rotationTarget.lastUsedAt || "—" }}</dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colExpiry }}</dt>
          <dd>{{ rotationTarget.expiresAt || "—" }}</dd>
        </div>
      </dl>
      <label class="apikey-rotation-policy">
        <span>{{
          language[config.currentLanguage].Apikey.rotationPolicy
        }}</span>
        <select v-model="rotationPolicy" class="form-control apikey-filter">
          <option value="immediate">
            {{ language[config.currentLanguage].Apikey.rotationImmediate }}
          </option>
          <option value="overlap-24h">
            {{ language[config.currentLanguage].Apikey.rotationOverlap24h }}
          </option>
          <option value="overlap-7d">
            {{ language[config.currentLanguage].Apikey.rotationOverlap7d }}
          </option>
        </select>
      </label>
      <p
        v-if="rotationErrors.length > 0"
        class="apikey-alert alert alert-danger"
      >
        {{ rotationErrors.join(", ") }}
      </p>
      <button
        type="button"
        class="btn btn-primary apikey-primary-action"
        v-on:click="rotateCredential()"
      >
        {{ language[config.currentLanguage].Apikey.actions.rotate }}
      </button>
    </section>

    <section
      v-if="activeApikeyTab === 'credentials' && revocationTarget"
      class="apikey-card apikey-rotation-card"
      role="tabpanel"
    >
      <div class="apikey-card-header">
        <div>
          <p class="apikey-eyebrow">
            {{ language[config.currentLanguage].Apikey.revocationTitle }}
          </p>
          <h2 class="apikey-card-title">
            {{ revocationTarget.name }}
          </h2>
          <p class="apikey-cli-copy">
            {{ language[config.currentLanguage].Apikey.revocationHelp }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary apikey-secondary-action"
          v-on:click="cancelCredentialRevocation()"
        >
          {{ language[config.currentLanguage].Apikey.actions.cancel }}
        </button>
      </div>
      <dl class="apikey-rotation-metadata">
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colFingerprint }}</dt>
          <dd>
            {{ revocationTarget.fingerprint || revocationTarget.prefix || "—" }}
          </dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colScopes }}</dt>
          <dd>{{ revocationTarget.scopes.join(", ") }}</dd>
        </div>
        <div>
          <dt>{{ language[config.currentLanguage].Apikey.colLastUsed }}</dt>
          <dd>{{ revocationTarget.lastUsedAt || "—" }}</dd>
        </div>
        <div>
          <dt>
            {{ language[config.currentLanguage].Apikey.revocationImpact }}
          </dt>
          <dd>
            {{ language[config.currentLanguage].Apikey.revocationImpactHelp }}
          </dd>
        </div>
      </dl>
      <div class="apikey-revocation-form">
        <label>
          <span>{{
            language[config.currentLanguage].Apikey.confirmCredentialName
          }}</span>
          <input
            v-model="revocationForm.confirmName"
            class="form-control apikey-filter"
          />
        </label>
        <label>
          <span>{{
            language[config.currentLanguage].Apikey.confirmCredentialFingerprint
          }}</span>
          <input
            v-model="revocationForm.confirmFingerprint"
            class="form-control apikey-filter"
          />
        </label>
        <label>
          <span>{{
            language[config.currentLanguage].Apikey.revocationReason
          }}</span>
          <textarea
            v-model="revocationForm.reason"
            class="form-control apikey-filter"
            rows="3"
          ></textarea>
        </label>
        <label
          v-if="revocationRequiresElevatedConfirmation"
          class="apikey-reveal-acknowledgement"
        >
          <input v-model="revocationForm.elevated" type="checkbox" />
          <span>{{
            language[config.currentLanguage].Apikey.revocationElevatedConfirm
          }}</span>
        </label>
      </div>
      <p
        v-if="revocationErrors.length > 0"
        class="apikey-alert alert alert-danger"
      >
        {{ revocationErrors.join(", ") }}
      </p>
      <button
        type="button"
        class="btn btn-danger apikey-primary-action"
        v-on:click="revokeCredential()"
      >
        {{ language[config.currentLanguage].Apikey.actions.revoke }}
      </button>
    </section>

    <section
      v-if="activeApikeyTab === 'credentials' && showCreateCredentialPanel"
      class="apikey-card apikey-create-card"
      role="tabpanel"
      aria-labelledby="create-api-key-title"
    >
      <div class="apikey-card-header">
        <div>
          <p class="apikey-eyebrow">
            {{ language[config.currentLanguage].Apikey.createCredentialTitle }}
          </p>
          <h2 id="create-api-key-title" class="apikey-card-title">
            {{ language[config.currentLanguage].Apikey.createCredentialTitle }}
          </h2>
          <p class="apikey-cli-copy">
            {{ language[config.currentLanguage].Apikey.createCredentialHelp }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary apikey-secondary-action"
          v-on:click="cancelCreatePanel()"
        >
          {{ language[config.currentLanguage].Apikey.actions.cancel }}
        </button>
      </div>
      <form class="apikey-create-form" v-on:submit.prevent="createCredential()">
        <label>
          <span>{{ language[config.currentLanguage].Apikey.colName }}</span>
          <input
            v-model="credentialCreate.name"
            class="form-control apikey-filter"
          />
        </label>
        <label>
          <span>{{ language[config.currentLanguage].Apikey.description }}</span>
          <textarea
            v-model="credentialCreate.description"
            class="form-control apikey-filter"
            rows="3"
          ></textarea>
        </label>
        <label>
          <span>{{ language[config.currentLanguage].Apikey.colExpiry }}</span>
          <input
            v-model="credentialCreate.expiresAt"
            class="form-control apikey-filter"
            type="date"
          />
        </label>
        <fieldset class="apikey-scope-fieldset">
          <legend>
            {{ language[config.currentLanguage].Apikey.colScopes }}
          </legend>
          <label
            v-for="scope in credentialScopeOptions"
            v-bind:key="scope.id"
            class="apikey-scope-option"
          >
            <input
              v-model="credentialCreate.scopes"
              type="checkbox"
              :value="scope.id"
            />
            <span>
              <strong>{{ scope.label }}</strong>
              {{ scope.description }}
            </span>
          </label>
        </fieldset>
        <label>
          <span>{{ language[config.currentLanguage].Apikey.constraints }}</span>
          <input
            v-model="credentialCreate.constraints"
            class="form-control apikey-filter"
          />
        </label>
        <p
          v-if="credentialCreateErrors.length > 0"
          class="apikey-alert alert alert-danger"
        >
          {{ credentialCreateErrors.join(", ") }}
        </p>
        <button type="submit" class="btn btn-primary apikey-primary-action">
          {{ language[config.currentLanguage].Apikey.actions.create }}
        </button>
      </form>
      <div
        v-if="activeRevealSecret"
        class="apikey-reveal-panel"
        role="region"
        :aria-label="language[config.currentLanguage].Apikey.revealOnceTitle"
      >
        <div>
          <p class="apikey-eyebrow">
            {{ language[config.currentLanguage].Apikey.revealOnceTitle }}
          </p>
          <strong>{{
            language[config.currentLanguage].Apikey.revealOnceNotice
          }}</strong>
          <p class="apikey-reveal-help">
            {{ language[config.currentLanguage].Apikey.revealOnceHelp }}
          </p>
        </div>
        <label class="apikey-reveal-acknowledgement">
          <input v-model="revealAcknowledged" type="checkbox" />
          <span>{{
            language[config.currentLanguage].Apikey.revealOnceAcknowledge
          }}</span>
        </label>
        <code aria-live="off">{{ activeRevealSecret }}</code>
        <div class="apikey-reveal-actions">
          <button
            type="button"
            class="btn btn-outline-success apikey-secondary-action"
            v-on:click="copyRevealOnceSecret()"
            :disabled="!revealCanExport"
            :aria-label="language[config.currentLanguage].Apikey.copySecret"
          >
            <font-awesome-icon icon="copy" class="idelium-action-icon--copy" />
            {{ language[config.currentLanguage].Apikey.copySecret }}
          </button>
          <button
            type="button"
            class="btn btn-outline-primary apikey-secondary-action"
            v-on:click="downloadRevealOnceSecret()"
            :disabled="!revealCanExport"
            :aria-label="language[config.currentLanguage].Apikey.downloadSecret"
          >
            <font-awesome-icon
              icon="download"
              class="idelium-action-icon--download"
            />
            {{ language[config.currentLanguage].Apikey.downloadSecret }}
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary apikey-secondary-action"
            v-on:click="clearRevealOnceSecret('dismissed')"
          >
            {{ language[config.currentLanguage].Apikey.clearSecret }}
          </button>
        </div>
        <p class="apikey-reveal-feedback" aria-live="polite">
          {{ revealFeedback }}
        </p>
      </div>
    </section>
  </div>
</template>
<style scoped>
.apikey-page {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin: 0 auto;
  max-width: 1180px;
  width: 100%;
}

.apikey-page-header {
  align-items: flex-end;
  border-bottom: 1px solid var(--id-color-border);
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  padding: 0.25rem 0 1.25rem;
}

.apikey-page-header .apikey-primary-action {
  flex: 0 0 auto;
}

.apikey-eyebrow {
  color: var(--id-color-text-subtle);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.16rem;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.apikey-title {
  color: var(--id-color-text);
  font-size: clamp(1.6rem, 2vw, 2.15rem);
  font-weight: 850;
  letter-spacing: 0.03rem;
  margin: 0;
}

.apikey-subtitle,
.apikey-cli-copy {
  color: var(--id-color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0.35rem 0 0;
}

.apikey-grid {
  display: grid;
  gap: 1.4rem;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.42fr);
}

.apikey-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.apikey-tabs {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: 1.1rem;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0.7rem;
}

.apikey-tab {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: 0.95rem;
  color: var(--id-color-text-muted);
  display: grid;
  gap: 0.35rem;
  min-height: 4.25rem;
  padding: 0.85rem 1rem;
  text-align: left;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.apikey-tab span {
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.14rem;
  text-transform: uppercase;
}

.apikey-tab small {
  color: var(--id-color-text-subtle);
  font-size: 0.68rem;
  line-height: 1.35;
}

.apikey-tab:hover,
.apikey-tab:focus-visible {
  border-color: color-mix(
    in srgb,
    var(--id-color-primary) 52%,
    var(--id-color-border)
  );
  color: var(--id-color-text);
  outline: none;
  transform: translateY(-1px);
}

.apikey-tab--active {
  background: var(--id-color-primary);
  border-color: var(--id-color-primary-strong);
  box-shadow: 0 0.9rem 2.3rem
    color-mix(in srgb, var(--id-color-primary) 24%, transparent);
  color: var(--id-color-on-primary);
}

.apikey-tab--active small {
  color: color-mix(in srgb, var(--id-color-on-primary) 74%, transparent);
}

.apikey-card {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: 1.1rem;
  box-shadow: none;
  min-width: 0;
  padding: 1.25rem;
}

.apikey-mobile-credentials {
  display: none;
}

.apikey-mobile-credential {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: 0.85rem;
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
}

.apikey-mobile-credential-header,
.apikey-mobile-credential-actions {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.apikey-mobile-credential-header strong,
.apikey-mobile-credential-header small {
  display: block;
}

.apikey-mobile-credential-header small,
.apikey-mobile-credential-meta dt {
  color: var(--id-color-text-muted);
  font-size: 0.75rem;
}

.apikey-status-badge {
  background: color-mix(in srgb, var(--id-color-primary) 14%, transparent);
  border-radius: 999px;
  color: var(--id-color-text);
  font-size: 0.72rem;
  font-weight: 750;
  padding: 0.25rem 0.55rem;
}

.apikey-mobile-credential-meta {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
}

.apikey-mobile-credential-meta dd {
  color: var(--id-color-text);
  margin: 0.2rem 0 0;
  overflow-wrap: anywhere;
}

.apikey-card-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.apikey-card-title {
  color: var(--id-color-text);
  font-size: 1.05rem;
  font-weight: 850;
  margin: 0;
}

.apikey-status {
  background: color-mix(
    in srgb,
    var(--id-color-success) 14%,
    var(--id-color-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--id-color-success) 38%, var(--id-color-border));
  border-radius: 999px;
  color: var(--id-color-success);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.1rem;
  padding: 0.36rem 0.7rem;
  text-transform: uppercase;
}

.apikey-alert {
  font-weight: 800;
  text-transform: uppercase;
}

.apikey-value-panel {
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--id-color-text) 3%, transparent),
      transparent
    ),
    var(--id-color-surface-muted);
  border: 1px solid var(--id-color-border);
  border-radius: 1rem;
  min-height: 12rem;
  padding: 1.15rem;
}

.apikey-value {
  background: transparent;
  color: var(--id-color-text);
  display: block;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 0.92rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.apikey-stored-state,
.apikey-empty-state {
  align-items: flex-start;
  color: var(--id-color-text-muted);
  display: flex;
  gap: 0.8rem;
  line-height: 1.5;
  min-height: 9.5rem;
  justify-content: center;
  flex-direction: column;
}

.apikey-stored-state {
  color: var(--id-color-success-text, var(--id-color-text));
  flex-direction: row;
  justify-content: flex-start;
}

.apikey-stored-state svg {
  color: var(--id-color-success, var(--id-color-primary));
  font-size: 1.35rem;
  margin-top: 0.15rem;
}

.apikey-stored-state div {
  display: grid;
  gap: 0.25rem;
}

.apikey-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1rem;
}

.apikey-legacy-rotation {
  background: color-mix(
    in srgb,
    var(--id-color-warning) 7%,
    var(--id-color-surface-raised)
  );
  border: 1px solid
    color-mix(in srgb, var(--id-color-warning) 38%, var(--id-color-border));
  border-radius: 1rem;
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
}

.apikey-legacy-rotation-icon {
  color: var(--id-color-warning);
  font-size: 1.5rem;
}

.apikey-expiry-options {
  border: 0;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
}

.apikey-expiry-options legend {
  color: var(--id-color-text-subtle);
  font-size: 0.68rem;
  font-weight: 850;
  grid-column: 1 / -1;
  letter-spacing: 0.12rem;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
}

.apikey-expiry-option {
  align-items: flex-start;
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border);
  border-radius: 0.85rem;
  color: var(--id-color-text);
  cursor: pointer;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 5rem;
  padding: 0.85rem;
}

.apikey-expiry-option--selected {
  border-color: var(--id-color-primary);
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--id-color-primary) 18%, transparent);
}

.apikey-expiry-option strong,
.apikey-expiry-option small {
  display: block;
}

.apikey-expiry-option small {
  color: var(--id-color-text-muted);
  line-height: 1.4;
  margin-top: 0.25rem;
}

.apikey-legacy-rotation-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.apikey-secondary-action,
.apikey-primary-action {
  align-items: center;
  display: inline-flex;
  gap: 0.45rem;
  justify-content: center;
  min-height: 2.65rem;
}

.apikey-primary-action {
  margin-left: auto;
  min-width: 13rem;
}

.apikey-cli-card {
  display: flex;
  flex-direction: column;
}

.apikey-command {
  background: var(--id-color-canvas-subtle);
  border: 1px solid var(--id-color-border);
  border-radius: 0.8rem;
  color: var(--id-color-text);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
  font-size: 0.82rem;
  margin-top: 0.85rem;
  padding: 0.8rem 0.9rem;
}

.apikey-snippet-list {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.apikey-snippet {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: 0.9rem;
  padding: 0.85rem;
}

.apikey-snippet-title {
  color: var(--id-color-text);
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0.1rem;
  margin: 0;
  text-transform: uppercase;
}

.apikey-snippet pre {
  background: var(--id-color-canvas-subtle);
  border-radius: 0.75rem;
  color: var(--id-color-text);
  font-size: 0.73rem;
  line-height: 1.55;
  margin: 0.75rem 0 0;
  max-height: 14rem;
  overflow: auto;
  padding: 0.85rem;
  white-space: pre-wrap;
}

.apikey-cli-actions {
  margin-top: auto;
  padding-top: 1rem;
}

.apikey-pypi-button {
  min-height: 2.65rem;
  width: 100%;
}

.apikey-inventory-card {
  display: grid;
  gap: 1rem;
}

.apikey-inventory-toolbar {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
}

.apikey-inventory-toolbar label {
  color: var(--id-color-text-muted);
  display: grid;
  font-size: 0.68rem;
  font-weight: 850;
  gap: 0.35rem;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.apikey-filter {
  background: var(--id-color-surface);
  border: 1px solid var(--id-color-border-strong);
  color: var(--id-color-text);
  min-height: 2.5rem;
}

.apikey-security-note {
  background: color-mix(
    in srgb,
    var(--id-color-success) 10%,
    var(--id-color-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--id-color-success) 34%, var(--id-color-border));
  border-radius: 0.9rem;
  color: var(--id-color-success);
  font-weight: 700;
  margin: 0;
  padding: 0.85rem;
}

.apikey-create-card,
.apikey-create-form {
  display: grid;
  gap: 1rem;
}

.apikey-rotation-card {
  display: grid;
  gap: 1rem;
}

.apikey-rotation-metadata {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.apikey-rotation-metadata div {
  background: var(--id-color-surface-raised);
  border: 1px solid var(--id-color-border);
  border-radius: 0.85rem;
  padding: 0.85rem;
}

.apikey-rotation-metadata dt,
.apikey-rotation-policy span {
  color: var(--id-color-text-subtle);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.apikey-rotation-metadata dd {
  color: var(--id-color-text);
  font-weight: 800;
  margin: 0.35rem 0 0;
  overflow-wrap: anywhere;
}

.apikey-rotation-policy {
  display: grid;
  gap: 0.4rem;
}

.apikey-revocation-form {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.apikey-revocation-form label {
  color: var(--id-color-text-muted);
  display: grid;
  font-size: 0.72rem;
  font-weight: 850;
  gap: 0.4rem;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
}

.apikey-revocation-form label:nth-child(3),
.apikey-revocation-form .apikey-reveal-acknowledgement {
  grid-column: 1 / -1;
}

.apikey-create-form label {
  color: var(--id-color-text-muted);
  display: grid;
  font-size: 0.72rem;
  font-weight: 850;
  gap: 0.4rem;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
}

.apikey-scope-fieldset {
  border: 1px solid var(--id-color-border-strong);
  border-radius: 0.9rem;
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.apikey-scope-fieldset legend {
  color: var(--id-color-text);
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: 0.12rem;
  padding: 0 0.45rem;
  text-transform: uppercase;
}

.apikey-scope-option {
  align-items: flex-start;
  display: grid;
  gap: 0.7rem;
  grid-template-columns: auto minmax(0, 1fr);
  text-transform: none;
}

.apikey-scope-option strong {
  color: var(--id-color-text);
  display: block;
}

.apikey-reveal-panel {
  background: color-mix(
    in srgb,
    var(--id-color-warning) 12%,
    var(--id-color-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--id-color-warning) 38%, var(--id-color-border));
  border-radius: 0.9rem;
  color: var(--id-color-warning);
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
}

.apikey-reveal-help,
.apikey-reveal-feedback {
  color: color-mix(in srgb, var(--id-color-warning) 76%, var(--id-color-text));
  margin: 0.35rem 0 0;
}

.apikey-reveal-acknowledgement {
  align-items: flex-start;
  display: grid;
  gap: 0.7rem;
  grid-template-columns: auto minmax(0, 1fr);
  letter-spacing: normal;
  text-transform: none;
}

.apikey-reveal-panel code {
  color: var(--id-color-text);
  overflow-wrap: anywhere;
}

.apikey-reveal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media only screen and (max-width: 960px) {
  .apikey-grid {
    grid-template-columns: 1fr;
  }

  .apikey-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .apikey-inventory-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .apikey-rotation-metadata {
    grid-template-columns: 1fr 1fr;
  }

  .apikey-revocation-form {
    grid-template-columns: 1fr;
  }

  .apikey-expiry-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media only screen and (max-width: 600px) {
  .apikey-page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .apikey-page-header .apikey-primary-action {
    width: 100%;
  }

  .apikey-primary-action {
    margin-left: 0;
    width: 100%;
  }

  .apikey-secondary-action {
    flex: 1 1 100%;
  }

  .apikey-inventory-toolbar {
    grid-template-columns: 1fr;
  }

  .apikey-rotation-metadata {
    grid-template-columns: 1fr;
  }

  .apikey-tabs {
    grid-template-columns: 1fr;
  }

  .apikey-inventory-card > .enterprise-data-table {
    display: none;
  }

  .apikey-mobile-credentials {
    display: grid;
    gap: 0.75rem;
  }

  .apikey-expiry-options {
    grid-template-columns: 1fr;
  }
}
</style>
<script>
import apiClient from "@/services/apiClient";

import copy from "copy-to-clipboard";
import download from "@/shared/download";
import EnterpriseDataTable from "@/components/grid/EnterpriseDataTable.vue";
import IdButton from "@/components/ui/IdButton.vue";
import {
  applyCredentialRotationResult,
  createRevealOnceSession,
  createCredentialCreationRequest,
  createCredentialRevocationRequest,
  createCredentialRotationRequest,
  credentialUsageSnippets,
  credentialInventoryActions,
  credentialInventoryRow,
  defaultCredentialCreationModel,
  normalizeCredentialInventory,
  normalizeCredentialInventoryFilters,
  revealOnceDownloadPayload,
  shouldClearRevealOnceRoute,
} from "@/domain/credentialLifecycle";

export default {
  name: "ApikeyComponent",
  components: { EnterpriseDataTable, IdButton },
  data() {
    return {
      activeApikeyTab: "credentials",
      status: "not_accepted",
      error: null,
      legacyExpiryDays: "90",
      legacyRotationError: "",
      showError: false,
      apikey: null,
      legacyKeyPersisted: false,
      legacyKeyActive: null,
      legacyKeyLoadedFromServer: false,
      legacyKeyLoading: true,
      credentials: [],
      credentialCapabilities: [
        "credential.create",
        "credential.rotate",
        "credential.revoke",
        "credential.audit",
      ],
      credentialFilters: {
        expiry: "",
        owner: "",
        scope: "",
        status: "",
      },
      credentialCreate: defaultCredentialCreationModel(),
      credentialCreateErrors: [],
      revealAcknowledged: false,
      revealFeedback: "",
      revealTimeoutId: null,
      revealedCredential: null,
      revocationErrors: [],
      revocationForm: {
        confirmFingerprint: "",
        confirmName: "",
        elevated: false,
        reason: "",
      },
      revocationTarget: null,
      rotationErrors: [],
      rotationPolicy: "overlap-24h",
      rotationTarget: null,
      showLegacyRotationPanel: false,
      showCreateCredentialPanel: false,
      credentialStatusOptions: [
        "active",
        "expiring",
        "expired",
        "rotated",
        "revoked",
        "legacy",
        "unknown",
      ],
    };
  },
  computed: {
    legacyExpiryOptions() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return [
        { value: "30", label: copy.expiry30, description: copy.expiry30Help },
        { value: "60", label: copy.expiry60, description: copy.expiry60Help },
        { value: "90", label: copy.expiry90, description: copy.expiry90Help },
        {
          value: "180",
          label: copy.expiry180,
          description: copy.expiry180Help,
        },
        {
          value: "365",
          label: copy.expiry365,
          description: copy.expiry365Help,
        },
        {
          value: "never",
          label: copy.expiryNever,
          description: copy.expiryNeverHelp,
        },
      ];
    },
    apikeyTabs() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return [
        {
          description: copy.tabCredentialsDescription,
          id: "credentials",
          label: copy.tabCredentials,
        },
        {
          description: copy.tabCliDescription,
          id: "cli",
          label: copy.tabCliSetup,
        },
      ];
    },
    credentialColumns() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return [
        { key: "name", label: copy.colName, required: true, sortable: true },
        { key: "fingerprint", label: copy.colFingerprint, required: true },
        { key: "scopes", label: copy.colScopes },
        { key: "status", label: copy.colStatus, type: "badge" },
        { key: "actor", label: copy.colOwner },
        { key: "createdAt", label: copy.colCreated },
        { key: "lastUsedAt", label: copy.colLastUsed },
        { key: "expiresAt", label: copy.colExpiry },
        { key: "lineage", label: copy.colLineage },
      ];
    },
    credentialRows() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return normalizeCredentialInventory(this.credentials, {
        filters: {
          expiry: this.credentialFilters.expiry,
          owner: this.credentialFilters.owner,
          scope: this.credentialFilters.scope,
          status: this.credentialFilters.status,
        },
        limit: 100,
      }).map((credential) => credentialInventoryRow(credential, copy));
    },
    credentialActions() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      const presentation = {
        audit: {
          icon: "history",
          iconClass: "idelium-action-icon--navigation",
        },
        revoke: {
          icon: "trash",
          iconClass: "idelium-action-icon--delete",
        },
        rotate: {
          icon: "sync",
          iconClass: "idelium-action-icon--refresh",
        },
      };
      return credentialInventoryActions(
        {},
        {
          capabilities: this.credentialCapabilities,
          copy: {
            auditTooltip: copy.auditTooltip,
            createTooltip: copy.createTooltip,
            revokeTooltip: copy.revokeTooltip,
            rotateTooltip: copy.rotateTooltip,
          },
        },
      )
        .filter((action) => action.id !== "create")
        .map((action) => ({
          ...action,
          ...presentation[action.id],
          label: copy.actions[action.id] || action.label,
        }));
    },
    canCreateCredential() {
      return this.credentialCapabilities.includes("credential.create");
    },
    credentialScopeOptions() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return [
        {
          description: copy.scopeRunExecuteHelp,
          id: "run:execute",
          label: copy.scopeRunExecute,
        },
        {
          description: copy.scopeArtifactReadHelp,
          id: "artifact:read",
          label: copy.scopeArtifactRead,
        },
        {
          description: copy.scopeCredentialAdminHelp,
          id: "credential:admin",
          label: copy.scopeCredentialAdmin,
        },
      ];
    },
    credentialTableCopy() {
      const copy = this.language[this.config.currentLanguage].Apikey;
      return {
        actions: copy.actionsLabel,
        clearFilters: copy.clearFilters,
        create: copy.createApiKey,
        moreActions: copy.moreActions,
        resultCount: copy.resultCount,
        scrollRegion: copy.inventoryScrollRegion,
        selectPage: copy.selectPage,
        selectRow: copy.selectRow,
        states: {
          empty: { title: copy.emptyTitle, description: copy.emptyDescription },
          "no-results": {
            title: copy.noResultsTitle,
            description: copy.noResultsDescription,
          },
          error: { title: copy.errorTitle, description: copy.errorDescription },
        },
        retry: copy.retry,
      };
    },
    hasCredentialFilters() {
      const filters = normalizeCredentialInventoryFilters({
        expiry: this.credentialFilters.expiry,
        owner: this.credentialFilters.owner,
        scope: this.credentialFilters.scope,
        status: this.credentialFilters.status,
      });
      return (
        filters.statuses.length > 0 ||
        filters.scopes.length > 0 ||
        Boolean(filters.owner) ||
        Boolean(filters.expiry)
      );
    },
    activeRevealSecret() {
      return this.revealedCredential?.secret ?? "";
    },
    revealCanExport() {
      return Boolean(this.activeRevealSecret && this.revealAcknowledged);
    },
    revocationRequiresElevatedConfirmation() {
      const activeCredentials = this.credentials.filter((credential) =>
        ["active", "legacy"].includes(String(credential.status).toLowerCase()),
      );
      return activeCredentials.length <= 1;
    },
    usageSnippets() {
      return credentialUsageSnippets({
        baseUrl: "https://idelium.org",
        cliVersion: "1.0.14",
        cycleId: "${IDELIUM_CYCLE_ID}",
        environment: "${IDELIUM_ENVIRONMENT}",
        projectId: "${IDELIUM_PROJECT_ID}",
      }).map((snippet) => ({
        ...snippet,
        title:
          this.language[this.config.currentLanguage].Apikey.usageSnippetTitles[
            snippet.id
          ] || snippet.title,
      }));
    },
  },
  watch: {
    $route(to, from) {
      this.syncApiKeyTabFromRoute(to);
      if (shouldClearRevealOnceRoute(to, from, this.revealedCredential)) {
        this.clearRevealOnceSecret("navigation");
      }
      if (this.isApiKeyTabOnlyNavigation(to, from)) return;
      this.getApiKey();
      this.$forceUpdate();
    },
  },
  created() {
    this.syncApiKeyTabFromRoute(this.$route);
    this.emitter.on("refreshApiKey", (msg) => {
      if (msg == true) this.getApiKey();
      else this.$forceUpdate();
    });
    this.getApiKey();
    this.registerRevealOnceCleanup();
  },
  beforeUnmount() {
    this.clearRevealOnceSecret("unmount");
    this.unregisterRevealOnceCleanup();
  },
  methods: {
    normalizedApiKeyTab(tab) {
      return tab === "cli" ? "cli" : "credentials";
    },
    syncApiKeyTabFromRoute(route) {
      const requestedTab = route?.params?.tab;
      this.activeApikeyTab = this.normalizedApiKeyTab(requestedTab);
      this.showCreateCredentialPanel = ["create", "operations"].includes(
        requestedTab,
      );
    },
    isApiKeyTabOnlyNavigation(to, from) {
      if (!to || !from || to.name !== "apikey" || from.name !== "apikey") {
        return false;
      }
      const toParams = { ...(to.params ?? {}) };
      const fromParams = { ...(from.params ?? {}) };
      delete toParams.tab;
      delete fromParams.tab;
      return (
        JSON.stringify(toParams) === JSON.stringify(fromParams) &&
        JSON.stringify(to.query ?? {}) === JSON.stringify(from.query ?? {}) &&
        to.params?.tab !== from.params?.tab
      );
    },
    selectApiKeyTab(tab) {
      const normalizedTab = this.normalizedApiKeyTab(tab);
      if (tab === "create") this.showCreateCredentialPanel = true;
      if (tab === "operations") this.showCreateCredentialPanel = false;
      this.activeApikeyTab = normalizedTab;
      if (!this.$router?.push) return;
      const targetParams = { ...(this.$route?.params ?? {}) };
      if (normalizedTab === "overview") delete targetParams.tab;
      else {
        targetParams.tab = ["create", "operations"].includes(tab)
          ? tab
          : normalizedTab;
      }
      this.$router.push({
        name: "apikey",
        params: targetParams,
        query: this.$route?.query ?? {},
      });
    },
    openCreatePanel() {
      this.rotationTarget = null;
      this.revocationTarget = null;
      this.credentialCreateErrors = [];
      this.showCreateCredentialPanel = true;
      this.selectApiKeyTab("create");
    },
    cancelCreatePanel() {
      this.showCreateCredentialPanel = false;
      this.credentialCreateErrors = [];
    },
    makeToast(text) {
      this.$wkToast(text);
    },
    copyClipboard(text) {
      if (!text) return;
      copy(text);
      this.makeToast(this.language[this.config.currentLanguage].Apikey.keyCopy);
    },
    getApiKey() {
      this.legacyKeyLoading = true;
      this.legacyKeyLoadedFromServer = false;
      this.emitter.emit("showLoader", true);
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.apikey, {
          headers: this.setHeaders(),
        })
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.legacyKeyLoading = false;
          this.showError = false;
          this.apikey = response.data.apiKey || null;
          this.legacyKeyActive =
            typeof response.data.active === "boolean"
              ? response.data.active
              : null;
          this.legacyKeyLoadedFromServer = Boolean(this.apikey);
          this.legacyKeyPersisted =
            !this.apikey && response.data.active !== false;
          this.credentials = this.normalizeCredentialResponse(response.data);
          this.loadCredentialInventory();
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.legacyKeyLoading = false;
          this.Logout(this, e);
          this.error = e;
          this.showError = true;
        });
    },
    maskApiKey(value) {
      const text = String(value ?? "");
      if (text.length <= 8) return "••••••••";
      return `${text.slice(0, 4)}${"•".repeat(Math.min(text.length - 8, 24))}${text.slice(-4)}`;
    },
    normalizeCredentialResponse(data) {
      // Some deployments include an empty credentials collection in the legacy
      // metadata response. Keep deriving the legacy inventory row from the
      // metadata instead of treating that empty collection as authoritative.
      if (Array.isArray(data?.credentials) && data.credentials.length > 0) {
        return data.credentials;
      }
      if (
        Array.isArray(data?.credentials) &&
        !data?.apiKey &&
        typeof data?.active !== "boolean"
      ) {
        return [
          {
            actor: "legacy",
            id: "legacy-key",
            lastUsedUnavailable: true,
            legacy: true,
            name: this.language[this.config.currentLanguage].Apikey.legacyName,
            scopes: ["legacy"],
            status: "unknown",
          },
        ];
      }
      if (!data?.apiKey && typeof data?.active !== "boolean") return [];
      if (!data?.apiKey) {
        return [
          {
            actor: "legacy",
            expiresAt: data.expiresAt ?? null,
            id: "legacy-key",
            keyPrefix: data.keyPrefix ?? null,
            lastUsedUnavailable: true,
            legacy: true,
            name: this.language[this.config.currentLanguage].Apikey.legacyName,
            scopes: ["legacy"],
            status: data.active ? "active" : "revoked",
          },
        ];
      }
      return [
        {
          actor: "legacy",
          id: "legacy-key",
          keyPrefix: String(data.apiKey).slice(0, 12),
          lastUsedUnavailable: true,
          legacy: true,
          name: this.language[this.config.currentLanguage].Apikey.legacyName,
          scopes: ["legacy"],
          status: "legacy",
        },
      ];
    },
    createCredential() {
      const request = createCredentialCreationRequest(this.credentialCreate, {
        actor: "current-user",
        actorScopes: ["run:execute", "artifact:read", "credential:admin"],
        capabilities: this.credentialCapabilities,
        existingCredentials: this.credentials,
        tenantId: "current-tenant",
      });
      if (!request.allowed) {
        this.credentialCreateErrors = request.errors.map((error) =>
          this.credentialErrorLabel(error),
        );
        return;
      }
      this.credentialCreateErrors = [];
      apiClient
        .post(this.credentialEndpoint(), request.body, {
          headers: { ...this.setHeaders(), ...request.headers },
        })
        .then((response) => {
          this.openRevealOnceSession(response.data);
          this.credentials = [
            ...this.credentials,
            this.revealedCredential.credential,
          ];
          if (this.$router?.push) {
            this.$router.push({
              name: "apikey",
              params: {
                ...(this.$route?.params ?? {}),
                tab: "create",
              },
              query: {
                credentialId: this.revealedCredential.credential.id,
                mode: "reveal-once",
              },
            });
          }
        })
        .catch((e) => {
          this.credentialCreateErrors = [
            this.language[this.config.currentLanguage].Apikey.createFailed,
          ];
          this.Logout(this, e);
        });
    },
    openRevealOnceSession(data) {
      this.clearRevealOnceSecret("replace");
      this.revealedCredential = createRevealOnceSession(data, {
        tenantId: "current-tenant",
      });
      this.revealAcknowledged = false;
      this.revealFeedback =
        this.language[this.config.currentLanguage].Apikey.revealOnceReady;
      this.showCreateCredentialPanel = true;
      this.selectApiKeyTab("credentials");
      this.revealTimeoutId = window.setTimeout(
        () => {
          this.clearRevealOnceSecret("timeout");
        },
        10 * 60 * 1000,
      );
    },
    clearRevealOnceSecret(reason) {
      if (this.revealTimeoutId) {
        window.clearTimeout(this.revealTimeoutId);
        this.revealTimeoutId = null;
      }
      if (!this.revealedCredential && !this.revealAcknowledged) return;
      this.revealedCredential = null;
      this.revealAcknowledged = false;
      if (reason === "timeout") {
        this.revealFeedback =
          this.language[this.config.currentLanguage].Apikey.revealOnceExpired;
      }
    },
    registerRevealOnceCleanup() {
      if (typeof window === "undefined") return;
      window.addEventListener("pagehide", this.handleRevealPageExit);
      window.addEventListener("beforeunload", this.handleRevealPageExit);
      document.addEventListener(
        "visibilitychange",
        this.handleRevealVisibilityChange,
      );
    },
    unregisterRevealOnceCleanup() {
      if (typeof window === "undefined") return;
      window.removeEventListener("pagehide", this.handleRevealPageExit);
      window.removeEventListener("beforeunload", this.handleRevealPageExit);
      document.removeEventListener(
        "visibilitychange",
        this.handleRevealVisibilityChange,
      );
    },
    handleRevealPageExit() {
      this.clearRevealOnceSecret("page-exit");
    },
    handleRevealVisibilityChange() {
      if (document.visibilityState === "hidden") {
        this.clearRevealOnceSecret("hidden");
      }
    },
    copyRevealOnceSecret() {
      if (!this.revealCanExport) return;
      copy(this.activeRevealSecret);
      this.revealFeedback =
        this.language[this.config.currentLanguage].Apikey.copySecretFeedback;
      this.makeToast(this.revealFeedback);
    },
    copyUsageSnippet(snippet) {
      copy(snippet.body);
      this.makeToast(
        this.language[this.config.currentLanguage].Apikey.copySnippetFeedback,
      );
    },
    downloadRevealOnceSecret() {
      const payload = revealOnceDownloadPayload(this.revealedCredential, {
        acknowledged: this.revealAcknowledged,
      });
      if (!payload.allowed) {
        this.revealFeedback =
          this.language[
            this.config.currentLanguage
          ].Apikey.acknowledgementRequired;
        return;
      }
      const blob = new Blob([payload.text], { type: payload.mimeType });
      const objectUrl = window.URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = objectUrl;
      element.download = payload.filename;
      element.rel = "noopener";
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(objectUrl);
      this.revealFeedback =
        this.language[
          this.config.currentLanguage
        ].Apikey.downloadSecretFeedback;
      this.makeToast(this.revealFeedback);
    },
    credentialEndpoint() {
      return (
        this.config.serviceBaseUrl +
        (this.config.url.serviceAccounts || "admin/service-accounts")
      );
    },
    loadCredentialInventory() {
      apiClient
        .get(this.credentialEndpoint(), { headers: this.setHeaders() })
        .then((response) => {
          const payload = response.data;
          const listed = Array.isArray(payload)
            ? payload
            : (payload?.serviceAccounts ?? payload?.credentials);
          if (Array.isArray(listed)) {
            const legacy = this.credentials.filter(
              (credential) =>
                credential.legacy === true || credential.id === "legacy-key",
            );
            const named = listed.filter(
              (credential) =>
                credential.legacy !== true && credential.id !== "legacy-key",
            );
            this.credentials = [...legacy, ...named];
          }
        })
        .catch(() => {
          // The legacy metadata remains useful when named credentials are unavailable.
        });
    },
    credentialErrorLabel(error) {
      return (
        this.language[this.config.currentLanguage].Apikey.validation[
          error.code
        ] || error.code
      );
    },
    credentialStatusLabel(status) {
      return (
        this.language[this.config.currentLanguage].Apikey.statuses[status] ||
        status
      );
    },
    clearCredentialFilters() {
      this.credentialFilters = { expiry: "", owner: "", scope: "", status: "" };
    },
    handleCredentialAction(event) {
      if (event.action === "rotate") {
        this.prepareCredentialRotation(event.row);
        return;
      }
      if (event.action === "revoke") {
        this.prepareCredentialRevocation(event.row);
        return;
      }
      this.makeToast(
        `${this.language[this.config.currentLanguage].Apikey.actions[event.action]}: ${event.row.name}`,
      );
    },
    confirmCredentialAction(event) {
      if (event.action === "revoke") {
        this.prepareCredentialRevocation(event.row);
        return;
      }
      this.handleCredentialAction(event);
    },
    generateKey() {
      this.legacyRotationError = "";
      this.showLegacyRotationPanel = true;
    },
    cancelLegacyKeyRotation() {
      this.legacyRotationError = "";
      this.showLegacyRotationPanel = false;
    },
    prepareCredentialRotation(row) {
      const target = this.credentials.find((credential) => {
        const id = credential.id ?? credential.credentialId ?? credential.keyId;
        return id === row.id;
      });
      this.rotationTarget = target
        ? {
            ...target,
            expiresAt: target.expiresAt || null,
            fingerprint:
              target.fingerprint || target.keyPrefix || target.prefix,
            id: target.id ?? target.credentialId ?? target.keyId,
            lastUsedAt: target.lastUsedAt || null,
            scopes: Array.isArray(target.scopes)
              ? target.scopes
              : String(target.scopes ?? "")
                  .split(/[,\s]+/)
                  .filter(Boolean),
          }
        : null;
      this.rotationPolicy = "overlap-24h";
      this.rotationErrors = [];
      this.showCreateCredentialPanel = false;
      this.selectApiKeyTab("credentials");
    },
    cancelCredentialRotation() {
      this.rotationTarget = null;
      this.rotationErrors = [];
      this.rotationPolicy = "overlap-24h";
    },
    prepareCredentialRevocation(row) {
      const target = this.normalizedCredentialTarget(row);
      this.revocationTarget = target;
      this.revocationForm = {
        confirmFingerprint: "",
        confirmName: "",
        elevated: false,
        reason: "",
      };
      this.revocationErrors = [];
      this.showCreateCredentialPanel = false;
      this.selectApiKeyTab("credentials");
    },
    cancelCredentialRevocation() {
      this.revocationTarget = null;
      this.revocationForm = {
        confirmFingerprint: "",
        confirmName: "",
        elevated: false,
        reason: "",
      };
      this.revocationErrors = [];
    },
    revokeCredential() {
      const request = createCredentialRevocationRequest(
        this.revocationForm,
        this.revocationTarget,
        {
          actor: "current-user",
          capabilities: this.credentialCapabilities,
          reasonRequired: this.config.credentialAuditReasonRequired === true,
          requiresElevatedConfirmation:
            this.revocationRequiresElevatedConfirmation,
          tenantId: "current-tenant",
        },
      );
      if (!request.allowed) {
        this.revocationErrors = request.errors.map((error) =>
          this.credentialErrorLabel(error),
        );
        return;
      }
      this.revocationErrors = [];
      return apiClient
        .post(
          this.credentialRevocationEndpoint(this.revocationTarget.id),
          request.body,
          {
            headers: { ...this.setHeaders(), ...request.headers },
          },
        )
        .then((response) => {
          const durableStatus = response.data?.status ?? "revoked";
          this.credentials = this.credentials.map((credential) => {
            const id =
              credential.id ?? credential.credentialId ?? credential.keyId;
            if (id !== this.revocationTarget.id) return credential;
            return {
              ...credential,
              revokedAt: response.data?.revokedAt ?? new Date().toISOString(),
              revokedBy: response.data?.actor ?? "current-user",
              status: durableStatus,
            };
          });
          this.cancelCredentialRevocation();
        })
        .catch((e) => {
          this.revocationErrors = [
            this.language[this.config.currentLanguage].Apikey.revocationFailed,
          ];
          this.Logout(this, e);
        });
    },
    normalizedCredentialTarget(row) {
      const target = this.credentials.find((credential) => {
        const id = credential.id ?? credential.credentialId ?? credential.keyId;
        return id === row.id;
      });
      return target
        ? {
            ...target,
            expiresAt: target.expiresAt || null,
            fingerprint:
              target.fingerprint || target.keyPrefix || target.prefix,
            id: target.id ?? target.credentialId ?? target.keyId,
            lastUsedAt: target.lastUsedAt || null,
            scopes: Array.isArray(target.scopes)
              ? target.scopes
              : String(target.scopes ?? "")
                  .split(/[,\s]+/)
                  .filter(Boolean),
          }
        : null;
    },
    rotateCredential() {
      const request = createCredentialRotationRequest(
        { policy: this.rotationPolicy },
        this.rotationTarget,
        {
          actor: "current-user",
          capabilities: this.credentialCapabilities,
          tenantId: "current-tenant",
        },
      );
      if (!request.allowed) {
        this.rotationErrors = request.errors.map((error) =>
          this.credentialErrorLabel(error),
        );
        return;
      }
      this.rotationErrors = [];
      return apiClient
        .post(
          this.credentialRotationEndpoint(this.rotationTarget.id),
          request.body,
          {
            headers: { ...this.setHeaders(), ...request.headers },
          },
        )
        .then((response) => {
          const replacement = response.data?.credential ?? response.data;
          this.openRevealOnceSession(replacement);
          this.credentials = applyCredentialRotationResult(
            this.credentials,
            this.rotationTarget,
            this.revealedCredential.credential,
            {
              actor: "current-user",
              tenantId: "current-tenant",
            },
          );
          this.cancelCredentialRotation();
        })
        .catch((e) => {
          this.rotationErrors = [
            this.language[this.config.currentLanguage].Apikey.rotationFailed,
          ];
          this.Logout(this, e);
        });
    },
    credentialRotationEndpoint(id) {
      return `${this.credentialEndpoint()}/${encodeURIComponent(id)}/rotate`;
    },
    credentialRevocationEndpoint(id) {
      return `${this.credentialEndpoint()}/${encodeURIComponent(id)}/revoke`;
    },
    generateAction() {
      const expiresInDays =
        this.legacyExpiryDays === "never"
          ? null
          : Number.parseInt(this.legacyExpiryDays, 10);
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.apikey,
          { expiresInDays },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.apikey = response.data.apiKey || null;
          this.legacyKeyLoadedFromServer = false;
          this.legacyKeyActive =
            typeof response.data.active === "boolean"
              ? response.data.active
              : true;
          this.legacyKeyPersisted = false;
          this.credentials = this.normalizeCredentialResponse(response.data);
          this.showLegacyRotationPanel = false;
          this.legacyRotationError = "";
        })
        .catch((e) => {
          this.emitter.emit("showLoader", false);
          this.Logout(this, e);
          this.error = e;
          const responseMessage =
            e?.response?.data?.error?.message ?? e?.response?.data?.message;
          this.legacyRotationError =
            responseMessage ||
            this.language[this.config.currentLanguage].Apikey
              .rotationLegacyFailed;
        });
    },
    goGithub() {
      window.open("https://pypi.org/project/idelium/", "_blank");
    },
    downloadKey() {
      download.file("idelium", this.apikey, "plain/text");
    },
  },
};
</script>
