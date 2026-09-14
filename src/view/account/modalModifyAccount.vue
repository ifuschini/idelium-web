<template>
  <!-- Modal -->
  <div
    class="modal fade"
    ref="mymodal"
    id="accountModal"
    tabindex="-1"
    aria-labelledby="accountModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="accountModalLabel">
            <font-awesome-icon icon="user" class="iconClass" /> {{ titleModal }}
          </h5>
          <button
            type="button"
            class="btn-close"
            :aria-label="language[config.currentLanguage].Accounts.btnCancel"
            @click="hideModal()"
          ></button>
        </div>
        <div class="modal-body">
          <div class="account-form-intro">
            {{ language[config.currentLanguage].Accounts.formHelp }}
          </div>
          <form @submit.prevent="requestSubmit()">
            <div class="account-form-mode">
              {{
                isModifyType
                  ? language[config.currentLanguage].Accounts.modifyFormHelp
                  : language[config.currentLanguage].Accounts.invitationFormHelp
              }}
            </div>
            <div class="mb-3" v-if="!isModifyType">
              <label class="form-label" for="account-email">
                {{ language[config.currentLanguage].Profile.email }}
              </label>
              <input
                class="form-control"
                :disabled="isModifyType"
                id="account-email"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderEmail
                "
                v-model="email"
                type="email"
                :class="{ 'is-invalid': emailCheck == false }"
                aria-describedby="account-email-feedback"
              />
              <div
                class="invalid-feedback d-block"
                id="account-email-feedback"
                v-if="emailCheck == false"
              >
                {{ language[config.currentLanguage].Accounts.accountExist }}
              </div>
              <div class="form-text" v-else>
                {{ language[config.currentLanguage].Accounts.emailHelp }}
              </div>
            </div>
            <div class="account-readonly-summary" v-else>
              <div>
                <span>{{
                  language[config.currentLanguage].Profile.email
                }}</span>
                <strong>{{ email }}</strong>
              </div>
              <div v-if="isSuperAdmin == true">
                <span>{{
                  language[config.currentLanguage].Accounts.costumer
                }}</span>
                <strong>{{ currentCustomerLabel }}</strong>
              </div>
              <div>
                <span>{{
                  language[config.currentLanguage].Accounts.role
                }}</span>
                <strong>{{ currentRoleLabel }}</strong>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="account-name">
                {{ language[config.currentLanguage].Accounts.name }}
              </label>
              <input
                class="form-control"
                id="account-name"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderName
                "
                v-model="name"
                :class="{ 'is-invalid': checkName == false && name.length > 0 }"
              />
              <div class="form-text">
                {{ language[config.currentLanguage].Accounts.nameHelp }}
              </div>
            </div>
            <div class="account-invitation-notice" v-if="!isModifyType">
              <strong>
                {{
                  language[config.currentLanguage].Accounts
                    .invitationNoticeTitle
                }}
              </strong>
              <span>
                {{
                  language[config.currentLanguage].Accounts.invitationExpiryHelp
                }}
              </span>
            </div>
            <div class="mb-3" v-if="isModifyType">
              <label class="form-label" for="account-password">
                {{ language[config.currentLanguage].Profile.password }}
              </label>
              <input
                class="form-control"
                id="account-password"
                :placeholder="
                  language[config.currentLanguage].Accounts.placeholderPassword
                "
                v-model="password"
                type="password"
                autocomplete="new-password"
                :class="{ 'is-invalid': password.length > 0 && !checkPassword }"
                aria-describedby="account-password-feedback"
              />
              <div class="form-text">
                {{ language[config.currentLanguage].Accounts.passwordHelp }}
              </div>
              <div
                v-if="password.length > 0 && !checkPassword"
                id="account-password-feedback"
                class="invalid-feedback d-block"
              >
                {{
                  language[config.currentLanguage].Accounts.passwordPolicyError
                }}
              </div>
            </div>
            <div class="form-check mb-3" v-if="isModifyType && isInvited">
              <input
                id="account-force-activate"
                class="form-check-input"
                type="checkbox"
                v-model="forceActivate"
              />
              <label class="form-check-label" for="account-force-activate">
                {{ language[config.currentLanguage].Accounts.forceActivate }}
              </label>
              <div class="form-text">
                {{
                  language[config.currentLanguage].Accounts.forceActivateHelp
                }}
              </div>
            </div>
            <div class="mb-3" v-if="isModifyType">
              <label class="form-label" for="account-confirm-password">
                {{ language[config.currentLanguage].Profile.confirmPassword }}
              </label>
              <input
                class="form-control"
                id="account-confirm-password"
                :disabled="!checkPassword"
                :placeholder="
                  language[config.currentLanguage].Accounts
                    .placeholderConfirmPassword
                "
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
              />
            </div>
            <div class="mb-3" v-if="isSuperAdmin == true && !isModifyType">
              <label class="form-label" for="account-customer">
                {{ language[config.currentLanguage].Accounts.costumer }}
              </label>
              <select
                class="form-select"
                id="account-customer"
                v-model="selectedCostumer"
                :disabled="isModifyType"
              >
                <option :value="null" disabled>
                  {{
                    language[config.currentLanguage].Accounts
                      .placeholderCostumer
                  }}
                </option>
                <option
                  v-for="item in costumers"
                  v-bind:key="item.id"
                  :value="item.id"
                >
                  {{ item.costumer }}
                </option>
              </select>
            </div>
            <div class="mb-3" v-if="!isModifyType">
              <RolePicker
                v-model="selectedRole"
                :assignable-role-ids="assignableRoleIds"
                :copy="rolePickerCopy"
                :current-role="dataAccount.role"
                :language-code="config.currentLanguage"
                :roles="roles"
              />
            </div>
            <div class="mb-3" v-if="isModifyType && canAssignRoles">
              <RolePicker
                v-model="selectedRole"
                :assignable-role-ids="assignableRoleIds"
                :copy="rolePickerCopy"
                :current-role="currentRoleDefinition"
                :language-code="config.currentLanguage"
                :roles="roles"
              />
            </div>
            <div class="mb-3" v-if="isProtectedAdminChange">
              <label class="form-label" for="account-replacement-admin">
                {{ language[config.currentLanguage].Accounts.replacementAdmin }}
              </label>
              <select
                class="form-select"
                id="account-replacement-admin"
                v-model="replacementAdminId"
              >
                <option value="" disabled>
                  {{
                    language[config.currentLanguage].Accounts
                      .placeholderReplacementAdmin
                  }}
                </option>
                <option
                  v-for="account in availableReplacementAdmins"
                  v-bind:key="account.id"
                  :value="String(account.id)"
                >
                  {{ account.email || account.name }}
                </option>
              </select>
              <div class="form-text">
                {{
                  language[config.currentLanguage].Accounts.replacementAdminHelp
                }}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="hideModal()"
          >
            {{ language[config.currentLanguage].Accounts.btnCancel }}
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm"
            @click="requestSubmit()"
            :disabled="disableButton"
          >
            {{ labelButtonAction }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showConfirmation"
    class="account-confirmation"
    role="dialog"
    aria-modal="true"
    aria-labelledby="account-confirmation-title"
  >
    <div class="account-confirmation-card">
      <h6 id="account-confirmation-title">
        {{ language[config.currentLanguage].Accounts.confirmModifyTitle }}
      </h6>
      <p>
        {{ language[config.currentLanguage].Accounts.confirmModifyMessage }}
      </p>
      <ul>
        <li v-for="change in modificationChanges" :key="change">
          {{ change }}
        </li>
      </ul>
      <div class="account-confirmation-actions">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showConfirmation = false"
        >
          {{ language[config.currentLanguage].Accounts.btnCancel }}
        </button>
        <button
          type="button"
          class="btn btn-warning btn-sm"
          @click="confirmSubmit"
        >
          {{ language[config.currentLanguage].Accounts.confirmModify }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import validatePassword from "@/shared/validatePassword";
import { hideModalSafely } from "@/shared/bootstrapModal";
import RolePicker from "@/components/account/RolePicker.vue";
export default {
  components: { RolePicker },
  props: [
    "arrayAccounts",
    "roles",
    "costumers",
    "isSuperAdmin",
    "canAssignRoles",
  ],
  emits: ["updateData"],
  data() {
    return {
      modalElem: null,
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      forceActivate: false,
      checkPassword: false,
      checkName: false,
      selectedRole: null,
      selectedCostumer: null,
      replacementAdminId: "",
      type: "",
      titleModal: "",
      isModifyType: true,
      labelButtonAction: null,
      disableButton: true,
      showConfirmation: false,
      emailCheck: true,
      dataAccount: {
        id: null,
        email: "",
        name: "",
        role: null,
        idCostumer: null,
      },
    };
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById("accountModal"));
  },
  computed: {
    currentRoleLabel() {
      let role = this.roles.find(({ id }) => id === this.selectedRole);
      return role ? role.name : "-";
    },
    currentRoleDefinition() {
      return this.roleById(this.dataAccount.role);
    },
    selectedRoleDefinition() {
      return this.roleById(this.selectedRole);
    },
    currentCustomerLabel() {
      let customer = this.costumers.find(
        ({ id }) => id === this.selectedCostumer,
      );
      return customer ? customer.costumer : "-";
    },
    isLastActiveAdministrator() {
      if (!this.isAdministratorRole(this.currentRoleDefinition)) return false;
      return this.availableReplacementAdmins.length === 0;
    },
    isProtectedAdminChange() {
      if (!this.isModifyType || !this.canAssignRoles) return false;
      if (String(this.selectedRole) === String(this.dataAccount.role))
        return false;
      return (
        this.isLastActiveAdministrator &&
        !this.isAdministratorRole(this.selectedRoleDefinition)
      );
    },
    isInvited() {
      return this.accountStatus(this.dataAccount) === "invited";
    },
    availableReplacementAdmins() {
      const tenantId = this.dataAccount.tenantId || this.dataAccount.idCostumer;
      return this.arrayAccounts.filter((account) => {
        const sameTenant =
          !tenantId ||
          account.tenantId === tenantId ||
          account.idCostumer === tenantId;
        return (
          sameTenant &&
          String(account.id) !== String(this.dataAccount.id) &&
          this.isAdministratorRole(this.roleById(account.role)) &&
          this.accountStatus(account) === "active"
        );
      });
    },
    assignableRoleIds() {
      if (this.isSuperAdmin) return this.roles.map((role) => String(role.id));
      return this.roles
        .filter(
          (role) =>
            !String(role.name ?? "")
              .toLowerCase()
              .includes("super"),
        )
        .map((role) => String(role.id));
    },
    rolePickerCopy() {
      return this.language[this.config.currentLanguage].Accounts.rolePicker;
    },
    modificationChanges() {
      const copy = this.language[this.config.currentLanguage].Accounts;
      const changes = [];
      if (this.password.length > 0) changes.push(copy.confirmModifyPassword);
      if (String(this.selectedRole) !== String(this.dataAccount.role)) {
        changes.push(copy.confirmModifyRole);
      }
      if (this.name !== this.dataAccount.name)
        changes.push(copy.confirmModifyProfile);
      if (this.forceActivate) changes.push(copy.confirmModifyActivation);
      return changes.length > 0 ? changes : [copy.confirmModifyProfile];
    },
  },
  watch: {
    password() {
      this.checkPassword = validatePassword.validPassword(this.password);
      this.activateButton();
    },
    confirmPassword() {
      this.activateButton();
    },
    name() {
      this.activateButton();
    },
    email() {
      this.activateButton();
    },
    selectedRole() {
      this.activateButton();
    },
    selectedCostumer() {
      this.activateButton();
    },
    forceActivate() {
      this.activateButton();
    },
  },
  methods: {
    activateButton() {
      if (this.name == "") this.checkName = false;
      else this.checkName = true;
      if (this.type == "modify") {
        const passwordProvided = this.password.length > 0;
        if (
          this.checkName == false ||
          (passwordProvided &&
            (!this.checkPassword || this.password != this.confirmPassword)) ||
          (this.isProtectedAdminChange && !this.replacementAdminId)
        ) {
          this.disableButton = true;
        } else {
          this.disableButton = false;
        }
      } else {
        if (
          this.selectedRole == null ||
          (this.selectedCostumer == null && this.isSuperAdmin == true) ||
          this.email.length < 3 ||
          this.checkName == false
        ) {
          this.disableButton = true;
        } else {
          this.disableButton = false;
        }
        let find = this.arrayAccounts.find(({ email }) => email === this.email);
        if (find) {
          this.disableButton = true;
          this.emailCheck = false;
        } else {
          this.emailCheck = true;
        }
      }
    },
    showModal(dataAccount, type) {
      this.type = type;
      this.password = "";
      this.confirmPassword = "";
      this.forceActivate = false;
      this.name = "";
      this.checkPassword = false;
      this.checkName = false;
      this.disableButton = true;
      this.emailCheck = true;
      this.replacementAdminId = "";
      this.showConfirmation = false;
      if (type == "modify") {
        this.isModifyType = true;
        this.dataAccount = dataAccount;
        this.email = this.dataAccount.email;
        this.name = this.dataAccount.name;
        this.selectedRole = this.dataAccount.role;
        this.selectedCostumer = this.dataAccount.idCostumer;
        this.titleModal =
          this.language[this.config.currentLanguage].Accounts.modal
            .modifyAccount +
          " " +
          this.email;
        this.labelButtonAction =
          this.language[
            this.config.currentLanguage
          ].Accounts.modal.modifyAccount;
      } else {
        this.isModifyType = false;
        this.selectedRole = null;
        this.selectedCostumer = null;
        this.email = "";
        this.dataAccount = {
          id: null,
          email: "",
          name: "",
        };
        this.titleModal =
          this.language[this.config.currentLanguage].Accounts.modal.addAccount;
        this.labelButtonAction =
          this.language[this.config.currentLanguage].Accounts.modal.addAccount;
      }
      this.activateButton();
      this.modalElem.show();
    },
    requestSubmit() {
      if (this.disableButton) return;
      if (this.type === "modify") {
        this.showConfirmation = true;
        return;
      }
      this.sendData();
    },
    confirmSubmit() {
      this.showConfirmation = false;
      this.sendData();
    },
    sendData() {
      let sendData = {
        name: this.name,
        id: this.dataAccount.id,
        type: this.type,
      };
      if (this.type == "modify") {
        sendData.password = this.password;
        sendData.forceActivate = this.forceActivate;
        sendData.role = this.selectedRole;
        sendData.replacementAdminId = this.replacementAdminId || null;
      }
      if (this.type == "new") {
        sendData.email = this.email;
        sendData.role = this.selectedRole;
        sendData.idCostumer = this.selectedCostumer;
      }
      this.$emit("updateData", sendData);
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    hideModal() {
      this.showConfirmation = false;
      hideModalSafely(this.$refs.mymodal, this.modalElem);
    },
    roleById(roleId) {
      return this.roles.find(({ id }) => String(id) === String(roleId));
    },
    isAdministratorRole(role) {
      return String(role?.name ?? role ?? "")
        .toLowerCase()
        .includes("admin");
    },
    accountStatus(account) {
      if (account.status) return account.status;
      if (account.suspendedAt) return "suspended";
      if (account.archivedAt) return "archived";
      return "active";
    },
    toggleModal() {
      // this.$refs['my-modal'].toggle('#toggle-btn')
    },
  },
};
</script>

<style scoped>
.modal-dialog {
  max-width: 900px !important;
  width: calc(100% - 2rem) !important;
}

.account-invitation-notice {
  background: #172033 !important;
  border: 1px solid #0b1020 !important;
  border-radius: 0.8rem;
  color: #ffffff !important;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  line-height: 1.55;
  margin-bottom: 1rem;
  padding: 0.85rem;
}

.modal-content .form-text {
  color: #43566f !important;
  opacity: 1 !important;
}

div.account-invitation-notice strong,
div.account-invitation-notice span {
  color: #ffffff !important;
  opacity: 1 !important;
}

.account-invitation-notice strong {
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.account-confirmation {
  align-items: center;
  background: rgba(15, 23, 42, 0.62);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 2000;
}

.account-confirmation-card {
  background: var(--bs-body-bg, #ffffff);
  border: 1px solid var(--bs-border-color, #d7dee8);
  border-radius: 0.75rem;
  box-shadow: 0 1rem 2rem rgba(15, 23, 42, 0.22);
  color: var(--bs-body-color, #172033);
  max-width: 32rem;
  padding: 1.25rem;
  width: 100%;
}

.account-confirmation-card h6 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.account-confirmation-card p {
  margin-bottom: 0.75rem;
}

.account-confirmation-card ul {
  margin-bottom: 1rem;
  padding-left: 1.25rem;
}

.account-confirmation-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

@media (max-width: 576px) {
  .modal-dialog {
    width: calc(100% - 1rem) !important;
  }
}
</style>
