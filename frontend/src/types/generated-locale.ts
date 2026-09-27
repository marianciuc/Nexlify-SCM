// Автоматически сгенерированные типы для переводов
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ - файл перезаписывается автоматически

export interface TranslationKeys_Warehouse_Types {
  distributionCenter: string;
  regionalWarehouse: string;
  localDepot: string;
  specializedStorage: string;
  crossDockFacility: string;
}

export interface TranslationKeys_Warehouse {
  title: string;
  createWarehouse: string;
  warehouseList: string;
  warehouseSettings: string;
  locationManagement: string;
  staffAssignment: string;
  performanceAnalytics: string;
  basicInfo: string;
  locationDetails: string;
  capacityConfiguration: string;
  equipmentSetup: string;
  integrationSetup: string;
  operationalTesting: string;
  goLive: string;
  types: TranslationKeys_Warehouse_Types;
  warehouseName: string;
  warehouseType: string;
  address: string;
  gpsCoordinates: string;
  storageZones: string;
  capacityLimits: string;
  assignManager: string;
  operationalStaff: string;
}

export interface TranslationKeys_Employee_Status {
  active: string;
  inactive: string;
  pending: string;
  invited: string;
}

export interface TranslationKeys_Employee {
  title: string;
  createEmployee: string;
  teamOverview: string;
  roleAssignment: string;
  accessControl: string;
  invite: string;
  invitationSent: string;
  employeeCreated: string;
  selectRole: string;
  assignToWarehouse: string;
  permissions: string;
  status: TranslationKeys_Employee_Status;
}

export interface TranslationKeys_Auth_Verification_DocumentTypes {
  businessRegistration: string;
  taxRegistration: string;
  articlesOfIncorporation: string;
  authorizedRepresentativeId: string;
  importExportLicense: string;
  industryPermits: string;
  bankAccountVerification: string;
  insuranceCertificates: string;
}

export interface TranslationKeys_Auth_Verification_Status {
  pendingDocuments: string;
  documentsSubmitted: string;
  underReview: string;
  additionalInfoRequired: string;
  approved: string;
  rejected: string;
}

export interface TranslationKeys_Auth_Verification {
  title: string;
  subtitle: string;
  status: TranslationKeys_Auth_Verification_Status;
  uploadDocuments: string;
  requiredDocuments: string;
  documentTypes: TranslationKeys_Auth_Verification_DocumentTypes;
  dragDropFiles: string;
  maxFileSize: string;
  allowedFormats: string;
  estimatedTime: string;
  contactSupport: string;
}

export interface TranslationKeys_Auth_Success {
  loginSuccessful: string;
  registrationSuccessful: string;
  logoutSuccessful: string;
  sessionRefreshed: string;
}

export interface TranslationKeys_Auth_Errors {
  invalidCredentials: string;
  emailRequired: string;
  passwordRequired: string;
  emailInvalid: string;
  passwordTooShort: string;
  passwordsDontMatch: string;
  networkError: string;
  sessionExpired: string;
  registrationFailed: string;
}

export interface TranslationKeys_Auth_Roles {
  customer: string;
  orderManager: string;
  warehouseManager: string;
  departmentManager: string;
  manager: string;
  unverifiedManager: string;
  supplier: string;
  logistician: string;
  carrier: string;
  admin: string;
}

export interface TranslationKeys_Auth {
  login: string;
  register: string;
  logout: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  country: string;
  companyTaxId: string;
  companyName: string;
  businessType: string;
  timezone: string;
  rememberMe: string;
  forgotPassword: string;
  signInTitle: string;
  signUpTitle: string;
  createAccount: string;
  enterCredentials: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  loginAs: string;
  selectRole: string;
  dataProcessingConsent: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  contactNumberPlaceholder: string;
  countryPlaceholder: string;
  companyTaxIdPlaceholder: string;
  companyNamePlaceholder: string;
  businessTypePlaceholder: string;
  roles: TranslationKeys_Auth_Roles;
  errors: TranslationKeys_Auth_Errors;
  success: TranslationKeys_Auth_Success;
  verification: TranslationKeys_Auth_Verification;
}

export interface TranslationKeys_Forms_Validation {
  required: string;
  email: string;
  minLength: string;
}

export interface TranslationKeys_Forms {
  validation: TranslationKeys_Forms_Validation;
}

export interface TranslationKeys_Common {
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
}

export interface TranslationKeys_Menu_Admin {
  root: string;
  system: string;
  users: string;
  analytics: string;
  security: string;
}

export interface TranslationKeys_Menu_Users {
  root: string;
  employees: string;
  roles: string;
  verification: string;
}

export interface TranslationKeys_Menu_Communication {
  root: string;
  messages: string;
  notifications: string;
}

export interface TranslationKeys_Menu_Finance {
  root: string;
  invoicing: string;
  payments: string;
  reports: string;
  credit: string;
  history: string;
}

export interface TranslationKeys_Menu_Suppliers {
  root: string;
  directory: string;
  catalog: string;
  ratings: string;
  contracts: string;
}

export interface TranslationKeys_Menu_Logistics {
  root: string;
  carriers: string;
  delivery: string;
  tracking: string;
  calculator: string;
  performance: string;
}

export interface TranslationKeys_Menu_Warehouse {
  root: string;
  create: string;
  directory: string;
  inventory: string;
  receiving: string;
  shipping: string;
}

export interface TranslationKeys_Menu_Orders {
  root: string;
  all: string;
  create: string;
  tracking: string;
  approval: string;
}

export interface TranslationKeys_Menu_SettingsMenu {
  profile: string;
  account: string;
  security: string;
  system: string;
  integration: string;
  backup: string;
}

export interface TranslationKeys_Menu {
  settingsMenu: TranslationKeys_Menu_SettingsMenu;
  dashboard: string;
  settings: string;
  profile: string;
  back: string;
  reports: string;
  analytics: string;
  orders: TranslationKeys_Menu_Orders;
  warehouse: TranslationKeys_Menu_Warehouse;
  logistics: TranslationKeys_Menu_Logistics;
  suppliers: TranslationKeys_Menu_Suppliers;
  finance: TranslationKeys_Menu_Finance;
  communication: TranslationKeys_Menu_Communication;
  users: TranslationKeys_Menu_Users;
  admin: TranslationKeys_Menu_Admin;
  about: string;
}

export interface TranslationKeys {
  menu: TranslationKeys_Menu;
  common: TranslationKeys_Common;
  forms: TranslationKeys_Forms;
  auth: TranslationKeys_Auth;
  employee: TranslationKeys_Employee;
  warehouse: TranslationKeys_Warehouse;
}

export type TranslationPath = 'menu.settingsMenu.profile' | 'menu.settingsMenu.account' | 'menu.settingsMenu.security' | 'menu.settingsMenu.system' | 'menu.settingsMenu.integration' | 'menu.settingsMenu.backup' | 'menu.dashboard' | 'menu.settings' | 'menu.profile' | 'menu.back' | 'menu.reports' | 'menu.analytics' | 'menu.orders.root' | 'menu.orders.all' | 'menu.orders.create' | 'menu.orders.tracking' | 'menu.orders.approval' | 'menu.warehouse.root' | 'menu.warehouse.create' | 'menu.warehouse.directory' | 'menu.warehouse.inventory' | 'menu.warehouse.receiving' | 'menu.warehouse.shipping' | 'menu.logistics.root' | 'menu.logistics.carriers' | 'menu.logistics.delivery' | 'menu.logistics.tracking' | 'menu.logistics.calculator' | 'menu.logistics.performance' | 'menu.suppliers.root' | 'menu.suppliers.directory' | 'menu.suppliers.catalog' | 'menu.suppliers.ratings' | 'menu.suppliers.contracts' | 'menu.finance.root' | 'menu.finance.invoicing' | 'menu.finance.payments' | 'menu.finance.reports' | 'menu.finance.credit' | 'menu.finance.history' | 'menu.communication.root' | 'menu.communication.messages' | 'menu.communication.notifications' | 'menu.users.root' | 'menu.users.employees' | 'menu.users.roles' | 'menu.users.verification' | 'menu.admin.root' | 'menu.admin.system' | 'menu.admin.users' | 'menu.admin.analytics' | 'menu.admin.security' | 'menu.about' | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.delete' | 'common.edit' | 'common.add' | 'common.search' | 'common.filter' | 'forms.validation.required' | 'forms.validation.email' | 'forms.validation.minLength' | 'auth.login' | 'auth.register' | 'auth.logout' | 'auth.email' | 'auth.password' | 'auth.confirmPassword' | 'auth.firstName' | 'auth.lastName' | 'auth.contactNumber' | 'auth.country' | 'auth.companyTaxId' | 'auth.companyName' | 'auth.businessType' | 'auth.timezone' | 'auth.rememberMe' | 'auth.forgotPassword' | 'auth.signInTitle' | 'auth.signUpTitle' | 'auth.createAccount' | 'auth.enterCredentials' | 'auth.alreadyHaveAccount' | 'auth.dontHaveAccount' | 'auth.loginAs' | 'auth.selectRole' | 'auth.dataProcessingConsent' | 'auth.emailPlaceholder' | 'auth.passwordPlaceholder' | 'auth.confirmPasswordPlaceholder' | 'auth.firstNamePlaceholder' | 'auth.lastNamePlaceholder' | 'auth.contactNumberPlaceholder' | 'auth.countryPlaceholder' | 'auth.companyTaxIdPlaceholder' | 'auth.companyNamePlaceholder' | 'auth.businessTypePlaceholder' | 'auth.roles.customer' | 'auth.roles.orderManager' | 'auth.roles.warehouseManager' | 'auth.roles.departmentManager' | 'auth.roles.manager' | 'auth.roles.unverifiedManager' | 'auth.roles.supplier' | 'auth.roles.logistician' | 'auth.roles.carrier' | 'auth.roles.admin' | 'auth.errors.invalidCredentials' | 'auth.errors.emailRequired' | 'auth.errors.passwordRequired' | 'auth.errors.emailInvalid' | 'auth.errors.passwordTooShort' | 'auth.errors.passwordsDontMatch' | 'auth.errors.networkError' | 'auth.errors.sessionExpired' | 'auth.errors.registrationFailed' | 'auth.success.loginSuccessful' | 'auth.success.registrationSuccessful' | 'auth.success.logoutSuccessful' | 'auth.success.sessionRefreshed' | 'auth.verification.title' | 'auth.verification.subtitle' | 'auth.verification.status.pendingDocuments' | 'auth.verification.status.documentsSubmitted' | 'auth.verification.status.underReview' | 'auth.verification.status.additionalInfoRequired' | 'auth.verification.status.approved' | 'auth.verification.status.rejected' | 'auth.verification.uploadDocuments' | 'auth.verification.requiredDocuments' | 'auth.verification.documentTypes.businessRegistration' | 'auth.verification.documentTypes.taxRegistration' | 'auth.verification.documentTypes.articlesOfIncorporation' | 'auth.verification.documentTypes.authorizedRepresentativeId' | 'auth.verification.documentTypes.importExportLicense' | 'auth.verification.documentTypes.industryPermits' | 'auth.verification.documentTypes.bankAccountVerification' | 'auth.verification.documentTypes.insuranceCertificates' | 'auth.verification.dragDropFiles' | 'auth.verification.maxFileSize' | 'auth.verification.allowedFormats' | 'auth.verification.estimatedTime' | 'auth.verification.contactSupport' | 'employee.title' | 'employee.createEmployee' | 'employee.teamOverview' | 'employee.roleAssignment' | 'employee.accessControl' | 'employee.invite' | 'employee.invitationSent' | 'employee.employeeCreated' | 'employee.selectRole' | 'employee.assignToWarehouse' | 'employee.permissions' | 'employee.status.active' | 'employee.status.inactive' | 'employee.status.pending' | 'employee.status.invited' | 'warehouse.title' | 'warehouse.createWarehouse' | 'warehouse.warehouseList' | 'warehouse.warehouseSettings' | 'warehouse.locationManagement' | 'warehouse.staffAssignment' | 'warehouse.performanceAnalytics' | 'warehouse.basicInfo' | 'warehouse.locationDetails' | 'warehouse.capacityConfiguration' | 'warehouse.equipmentSetup' | 'warehouse.integrationSetup' | 'warehouse.operationalTesting' | 'warehouse.goLive' | 'warehouse.types.distributionCenter' | 'warehouse.types.regionalWarehouse' | 'warehouse.types.localDepot' | 'warehouse.types.specializedStorage' | 'warehouse.types.crossDockFacility' | 'warehouse.warehouseName' | 'warehouse.warehouseType' | 'warehouse.address' | 'warehouse.gpsCoordinates' | 'warehouse.storageZones' | 'warehouse.capacityLimits' | 'warehouse.assignManager' | 'warehouse.operationalStaff';

export type Locale = 'cn' | 'en' | 'ru';

export const SUPPORTED_LOCALES: Locale[] = ['cn', 'en', 'ru'];

export const LOCALE_NAMES: Record<Locale, string> = {
  cn: '中文',
  en: 'English',
  ru: 'Русский',
} as const;

export const DEFAULT_LOCALE: Locale = 'en';

export type TFunction = (key: TranslationPath, options?: any) => string;

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  isLoading: boolean;
}
