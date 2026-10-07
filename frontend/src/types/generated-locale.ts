// Автоматически сгенерированные типы для переводов
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ - файл перезаписывается автоматически

export interface TranslationKeys_Supplier_Sku_Specs {
  name: string;
  price: string;
  priceHelper: string;
  moq: string;
}

export interface TranslationKeys_Supplier_Sku_Batches {
  lot: string;
  mfg: string;
  exp: string;
  qty: string;
  qc: string;
  approved: string;
}

export interface TranslationKeys_Supplier_Sku_Bins {
  warehouse: string;
  aisleRack: string;
  binCode: string;
  available: string;
  reserved: string;
}

export interface TranslationKeys_Supplier_Sku_Tab {
  bins: string;
  batches: string;
  specs: string;
}

export interface TranslationKeys_Supplier_Sku {
  title: string;
  backToCatalog: string;
  activeInWms: string;
  save: string;
  saved: string;
  tab: TranslationKeys_Supplier_Sku_Tab;
  binsTitle: string;
  bins: TranslationKeys_Supplier_Sku_Bins;
  batchesTitle: string;
  batches: TranslationKeys_Supplier_Sku_Batches;
  specsTitle: string;
  specs: TranslationKeys_Supplier_Sku_Specs;
}

export interface TranslationKeys_Supplier_Scorecard_Helper {
  avgDispatch: string;
  zeroCriticalRma: string;
  competitive: string;
  leadTimeDays: string;
}

export interface TranslationKeys_Supplier_Scorecard_Factor {
  otif: string;
  quality: string;
  price: string;
  leadTime: string;
}

export interface TranslationKeys_Supplier_Scorecard {
  title: string;
  subtitle: string;
  tierGold: string;
  top5Percent: string;
  compositeLabel: string;
  basis: string;
  factorsTitle: string;
  factorCol: string;
  weight: string;
  score: string;
  detail: string;
  threshold: string;
  factor: TranslationKeys_Supplier_Scorecard_Factor;
  helper: TranslationKeys_Supplier_Scorecard_Helper;
}

export interface TranslationKeys_Supplier_Dashboard_Fleet {
  title: string;
  subtitle: string;
  inTransit: string;
  planned: string;
}

export interface TranslationKeys_Supplier_Dashboard_RecentOrders {
  title: string;
  subtitle: string;
}

export interface TranslationKeys_Supplier_Dashboard_Pipeline {
  title: string;
  subtitle: string;
  submitted: string;
  reserved: string;
  paid: string;
  shipped: string;
  completed: string;
}

export interface TranslationKeys_Supplier_Dashboard_Kpi {
  gmv: string;
  vsLastMonth: string;
  activeOrders: string;
  warehouseFill: string;
  otif: string;
  aboveSla: string;
  targetSla: string;
}

export interface TranslationKeys_Supplier_Dashboard {
  welcome: string;
  verifiedSupplier: string;
  activeContext: string;
  openOrdersQueue: string;
  kpi: TranslationKeys_Supplier_Dashboard_Kpi;
  pipeline: TranslationKeys_Supplier_Dashboard_Pipeline;
  recentOrders: TranslationKeys_Supplier_Dashboard_RecentOrders;
  allOrders: string;
  fleet: TranslationKeys_Supplier_Dashboard_Fleet;
  routeMap: string;
}

export interface TranslationKeys_Supplier_Orders_Table {
  orderNumber: string;
  customerDelivery: string;
  items: string;
  total: string;
  status: string;
  action: string;
}

export interface TranslationKeys_Supplier_Orders_Filters {
  ariaLabel: string;
  all: string;
  pending: string;
  readyForDispatch: string;
}

export interface TranslationKeys_Supplier_Orders {
  title: string;
  subtitle: string;
  filters: TranslationKeys_Supplier_Orders_Filters;
  table: TranslationKeys_Supplier_Orders_Table;
  itemsUnit: string;
  fulfillAction: string;
  actionAria: string;
  empty: string;
}

export interface TranslationKeys_Supplier_Products_Warehouse {
  capacity: string;
  filled: string;
  used: string;
  pallets: string;
  coldChainLabel: string;
  tempLabel: string;
}

export interface TranslationKeys_Supplier_Products_Table {
  skuBrand: string;
  nameClass: string;
  logistics: string;
  warehouse: string;
  available: string;
  reserved: string;
  price: string;
  unit: string;
}

export interface TranslationKeys_Supplier_Products_Actions {
  addSku: string;
  manage: string;
  manageAria: string;
  reserve10: string;
  reserveAria: string;
  addBrand: string;
  addCategory: string;
  addManufacturer: string;
}

export interface TranslationKeys_Supplier_Products_Filters {
  searchLabel: string;
  searchPlaceholder: string;
  searchChip: string;
  categoryPlaceholder: string;
  allCategories: string;
  categoryChip: string;
  brandChip: string;
  manufacturerChip: string;
  allItems: string;
  activeLabel: string;
  clearAll: string;
}

export interface TranslationKeys_Supplier_Products {
  title: string;
  subtitle: string;
  emptyDesc: string;
  filters: TranslationKeys_Supplier_Products_Filters;
  actions: TranslationKeys_Supplier_Products_Actions;
  table: TranslationKeys_Supplier_Products_Table;
  warehouse: TranslationKeys_Supplier_Products_Warehouse;
}

export interface TranslationKeys_Supplier {
  products: TranslationKeys_Supplier_Products;
  orders: TranslationKeys_Supplier_Orders;
  dashboard: TranslationKeys_Supplier_Dashboard;
  scorecard: TranslationKeys_Supplier_Scorecard;
  sku: TranslationKeys_Supplier_Sku;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt_RedriveDialog {
  title: string;
  body: string;
  eventId: string;
  topic: string;
  partitionOffset: string;
  warning: string;
  cancel: string;
  confirm: string;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt_Badge {
  redriven: string;
  unresolved: string;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt_Message {
  exception: string;
  payload: string;
  copy: string;
  copied: string;
  copySuccess: string;
  redrive: string;
  redriveSuccess: string;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt_Metrics {
  total: string;
  totalHelper: string;
  unresolved: string;
  unresolvedHelper: string;
  recovered: string;
  recoveredHelper: string;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt_Filter {
  all: string;
  unresolved: string;
  recovered: string;
}

export interface TranslationKeys_Admin_SystemAudit_Dlt {
  title: string;
  subtitle: string;
  tableCaption: string;
  filterAria: string;
  filter: TranslationKeys_Admin_SystemAudit_Dlt_Filter;
  metrics: TranslationKeys_Admin_SystemAudit_Dlt_Metrics;
  message: TranslationKeys_Admin_SystemAudit_Dlt_Message;
  badge: TranslationKeys_Admin_SystemAudit_Dlt_Badge;
  redriveDialog: TranslationKeys_Admin_SystemAudit_Dlt_RedriveDialog;
}

export interface TranslationKeys_Admin_SystemAudit_Disputes_Actions {
  reject: string;
  enforce: string;
}

export interface TranslationKeys_Admin_SystemAudit_Disputes_Status {
  approved: string;
  pending: string;
}

export interface TranslationKeys_Admin_SystemAudit_Disputes_Table {
  claim: string;
  order: string;
  amount: string;
  status: string;
  reason: string;
  reported: string;
  settlement: string;
}

export interface TranslationKeys_Admin_SystemAudit_Disputes {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  tableCaption: string;
  table: TranslationKeys_Admin_SystemAudit_Disputes_Table;
  status: TranslationKeys_Admin_SystemAudit_Disputes_Status;
  actions: TranslationKeys_Admin_SystemAudit_Disputes_Actions;
}

export interface TranslationKeys_Admin_SystemAudit_Tab {
  disputes: string;
  dlt: string;
}

export interface TranslationKeys_Admin_SystemAudit {
  title: string;
  subtitle: string;
  tab: TranslationKeys_Admin_SystemAudit_Tab;
  disputes: TranslationKeys_Admin_SystemAudit_Disputes;
  dlt: TranslationKeys_Admin_SystemAudit_Dlt;
}

export interface TranslationKeys_Admin_Analytics {
  title: string;
  subtitle: string;
  refresh: string;
  refreshed: string;
  otif: string;
  leadTime: string;
  throughput: string;
  savings: string;
  toSlaTarget: string;
  fasterThan: string;
  activeCorridors: string;
  vrpReverseAuctions: string;
  otifTrendTitle: string;
  trendPeriod: string;
  trendOnTime: string;
  trendInFull: string;
  trendDelayed: string;
  trendOtif: string;
  corridorsTitle: string;
  corridor: string;
  distance: string;
  actual: string;
  target: string;
  load: string;
  statusOptimal: string;
  statusAttention: string;
  abcTitle: string;
  abcClass: string;
  abcProfile: string;
  abcShare: string;
  abcExamples: string;
  abcA: string;
  abcADesc: string;
  abcB: string;
  abcBDesc: string;
  abcC: string;
  abcCDesc: string;
  warehouseTurnover: string;
  warehouse: string;
  turnover: string;
  daysOnHand: string;
}

export interface TranslationKeys_Admin_Settings_Env {
  development: string;
  staging: string;
  production: string;
  custom: string;
}

export interface TranslationKeys_Admin_Settings {
  title: string;
  subtitle: string;
  envTitle: string;
  envDescription: string;
  envGroupAria: string;
  env: TranslationKeys_Admin_Settings_Env;
  endpointsTitle: string;
  gatewayLabel: string;
  keycloakLabel: string;
  presetHint: string;
  modesTitle: string;
  mockLabel: string;
  mockDescription: string;
  save: string;
  savedToast: string;
  gatewayRequired: string;
  keycloakRequired: string;
}

export interface TranslationKeys_Admin_Users_Detail_Docs {
  downloadAria: string;
}

export interface TranslationKeys_Admin_Users_Detail_Registry {
  title: string;
  iban: string;
  krs: string;
  regon: string;
  submitted: string;
  noApplication: string;
}

export interface TranslationKeys_Admin_Users_Detail_Form {
  title: string;
  limitLabel: string;
  limitHelper: string;
  termsLabel: string;
  termsHelper: string;
}

export interface TranslationKeys_Admin_Users_Detail_Credit {
  caption: string;
  used: string;
  available: string;
  utilization: string;
  terms: string;
}

export interface TranslationKeys_Admin_Users_Detail_NotFound {
  title: string;
  description: string;
  back: string;
}

export interface TranslationKeys_Admin_Users_Detail {
  backToDirectory: string;
  joined: string;
  openKycQueue: string;
  saveCredit: string;
  notFound: TranslationKeys_Admin_Users_Detail_NotFound;
  credit: TranslationKeys_Admin_Users_Detail_Credit;
  form: TranslationKeys_Admin_Users_Detail_Form;
  registry: TranslationKeys_Admin_Users_Detail_Registry;
  docs: TranslationKeys_Admin_Users_Detail_Docs;
}

export interface TranslationKeys_Admin_Users_Verification_DocPreview {
  title: string;
  org: string;
  signature: string;
  reportRegistry: string;
  reportDate: string;
  entity: string;
  nipLabel: string;
  vatStatus: string;
  vatActive: string;
  mpp: string;
  mppRegistered: string;
  checksum: string;
  close: string;
  download: string;
  downloadStarted: string;
}

export interface TranslationKeys_Admin_Users_Verification_RejectReasons {
  whiteList: string;
  krsMismatch: string;
  transportLicense: string;
  vatRemoved: string;
  creditRisk: string;
}

export interface TranslationKeys_Admin_Users_Verification_RejectDialog {
  title: string;
  org: string;
  reasonLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  confirm: string;
}

export interface TranslationKeys_Admin_Users_Verification_ApproveDialog {
  title: string;
  org: string;
  limitLabel: string;
  requestedHint: string;
  termsLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  confirm: string;
  defaultNotes: string;
}

export interface TranslationKeys_Admin_Users_Verification_ReviewDialog_Outcome {
  approved: string;
  rejected: string;
}

export interface TranslationKeys_Admin_Users_Verification_ReviewDialog_WhiteList {
  match: string;
  mismatch: string;
}

export interface TranslationKeys_Admin_Users_Verification_ReviewDialog_Field {
  nip: string;
  krs: string;
  iban: string;
  email: string;
  phone: string;
  address: string;
}

export interface TranslationKeys_Admin_Users_Verification_ReviewDialog {
  title: string;
  submittedOn: string;
  field: TranslationKeys_Admin_Users_Verification_ReviewDialog_Field;
  whiteList: TranslationKeys_Admin_Users_Verification_ReviewDialog_WhiteList;
  requestedLimit: string;
  checksTitle: string;
  outcome: TranslationKeys_Admin_Users_Verification_ReviewDialog_Outcome;
  rejectionReason: string;
  noNotes: string;
  approve: string;
  reject: string;
}

export interface TranslationKeys_Admin_Users_Verification_Empty {
  title: string;
  subtitle: string;
}

export interface TranslationKeys_Admin_Users_Verification_Bulk {
  approve: string;
  reject: string;
}

export interface TranslationKeys_Admin_Users_Verification_PaymentTerms {
  net15: string;
  net30: string;
  net60: string;
  prepayment: string;
}

export interface TranslationKeys_Admin_Users_Verification_DocType {
  krsExtract: string;
  vatWhiteList: string;
  transportLicense: string;
  bankConfirmation: string;
  isoCertificate: string;
}

export interface TranslationKeys_Admin_Users_Verification_Documents {
  title: string;
  none: string;
  incomplete: string;
  inspectAria: string;
}

export interface TranslationKeys_Admin_Users_Verification_Checks {
  regon: string;
  vatWhiteList: string;
  accountMatch: string;
  vies: string;
  sanctions: string;
  summary: string;
  pass: string;
  fail: string;
}

export interface TranslationKeys_Admin_Users_Verification_Table {
  caption: string;
  organization: string;
  role: string;
  status: string;
  submitted: string;
  age: string;
  checks: string;
  documents: string;
  requestedLimit: string;
}

export interface TranslationKeys_Admin_Users_Verification_Status {
  pendingAudit: string;
  approved: string;
  rejected: string;
}

export interface TranslationKeys_Admin_Users_Verification_Filter {
  ariaLabel: string;
  all: string;
  pending: string;
  approved: string;
  rejected: string;
}

export interface TranslationKeys_Admin_Users_Verification {
  title: string;
  subtitle: string;
  backToDirectory: string;
  newApplication: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchClear: string;
  copiedToast: string;
  copyNip: string;
  copyIban: string;
  ageDays: string;
  review: string;
  reviewAria: string;
  filter: TranslationKeys_Admin_Users_Verification_Filter;
  status: TranslationKeys_Admin_Users_Verification_Status;
  table: TranslationKeys_Admin_Users_Verification_Table;
  checks: TranslationKeys_Admin_Users_Verification_Checks;
  documents: TranslationKeys_Admin_Users_Verification_Documents;
  docType: TranslationKeys_Admin_Users_Verification_DocType;
  paymentTerms: TranslationKeys_Admin_Users_Verification_PaymentTerms;
  bulk: TranslationKeys_Admin_Users_Verification_Bulk;
  empty: TranslationKeys_Admin_Users_Verification_Empty;
  reviewDialog: TranslationKeys_Admin_Users_Verification_ReviewDialog;
  approveDialog: TranslationKeys_Admin_Users_Verification_ApproveDialog;
  rejectDialog: TranslationKeys_Admin_Users_Verification_RejectDialog;
  rejectReasons: TranslationKeys_Admin_Users_Verification_RejectReasons;
  docPreview: TranslationKeys_Admin_Users_Verification_DocPreview;
}

export interface TranslationKeys_Admin_Users_Empty {
  title: string;
  subtitle: string;
}

export interface TranslationKeys_Admin_Users_Role {
  buyer: string;
  supplier: string;
  carrier: string;
}

export interface TranslationKeys_Admin_Users_Kyc {
  verified: string;
  pending: string;
  rejected: string;
  notSubmitted: string;
}

export interface TranslationKeys_Admin_Users_Table {
  name: string;
  nip: string;
  role: string;
  kyc: string;
  creditLimit: string;
  exposure: string;
  joined: string;
}

export interface TranslationKeys_Admin_Users_Filter {
  ariaLabel: string;
  all: string;
  buyer: string;
  supplier: string;
  carrier: string;
}

export interface TranslationKeys_Admin_Users_Bulk {
  exportKyc: string;
  adjustCredit: string;
  clear: string;
  selectAll: string;
  selectOne: string;
}

export interface TranslationKeys_Admin_Users_Actions {
  newEntity: string;
  kycQueue: string;
  configure: string;
  configureAria: string;
  moreAria: string;
}

export interface TranslationKeys_Admin_Users {
  title: string;
  subtitle: string;
  actions: TranslationKeys_Admin_Users_Actions;
  bulk: TranslationKeys_Admin_Users_Bulk;
  bulkActionsLabel: string;
  selectedCount: string;
  cashOnly: string;
  clearAll: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchClear: string;
  filter: TranslationKeys_Admin_Users_Filter;
  table: TranslationKeys_Admin_Users_Table;
  kyc: TranslationKeys_Admin_Users_Kyc;
  role: TranslationKeys_Admin_Users_Role;
  utilizationAria: string;
  empty: TranslationKeys_Admin_Users_Empty;
  verification: TranslationKeys_Admin_Users_Verification;
  detail: TranslationKeys_Admin_Users_Detail;
}

export interface TranslationKeys_Admin {
  users: TranslationKeys_Admin_Users;
  settings: TranslationKeys_Admin_Settings;
  analytics: TranslationKeys_Admin_Analytics;
  systemAudit: TranslationKeys_Admin_SystemAudit;
}

export interface TranslationKeys_Logistics_Fleet_Empty {
  title: string;
  subtitle: string;
}

export interface TranslationKeys_Logistics_Fleet_Status {
  active: string;
  depot: string;
  maintenance: string;
}

export interface TranslationKeys_Logistics_Fleet_Table {
  plate: string;
  model: string;
  type: string;
  driver: string;
  payload: string;
  volume: string;
  inspection: string;
  status: string;
}

export interface TranslationKeys_Logistics_Fleet_Stats {
  total: string;
  totalHelper: string;
  active: string;
  activeHelper: string;
  depot: string;
  depotHelper: string;
  maintenance: string;
  maintenanceHelper: string;
  payload: string;
  volumeHelper: string;
}

export interface TranslationKeys_Logistics_Fleet_Filter {
  ariaLabel: string;
  all: string;
  heavy: string;
  medium: string;
}

export interface TranslationKeys_Logistics_Fleet_Actions {
  addVehicle: string;
  passport: string;
  passportAria: string;
}

export interface TranslationKeys_Logistics_Fleet {
  title: string;
  subtitle: string;
  actions: TranslationKeys_Logistics_Fleet_Actions;
  searchLabel: string;
  searchPlaceholder: string;
  searchClear: string;
  clearAll: string;
  filter: TranslationKeys_Logistics_Fleet_Filter;
  stats: TranslationKeys_Logistics_Fleet_Stats;
  table: TranslationKeys_Logistics_Fleet_Table;
  status: TranslationKeys_Logistics_Fleet_Status;
  payloadAria: string;
  empty: TranslationKeys_Logistics_Fleet_Empty;
}

export interface TranslationKeys_Logistics_RouteDetail {
  backToList: string;
  vehicle: string;
  driver: string;
  distance: string;
  duration: string;
  stops: string;
  co2: string;
  notFoundTitle: string;
  notFoundBody: string;
}

export interface TranslationKeys_Logistics_Routes_Status {
  inTransit: string;
  planned: string;
  completed: string;
}

export interface TranslationKeys_Logistics_Routes_Col {
  code: string;
  corridor: string;
  vehicleDriver: string;
  distanceTime: string;
  stops: string;
  co2: string;
}

export interface TranslationKeys_Logistics_Routes {
  title: string;
  subtitle: string;
  openPlanner: string;
  openRoute: string;
  col: TranslationKeys_Logistics_Routes_Col;
  status: TranslationKeys_Logistics_Routes_Status;
}

export interface TranslationKeys_Logistics {
  routes: TranslationKeys_Logistics_Routes;
  routeDetail: TranslationKeys_Logistics_RouteDetail;
  fleet: TranslationKeys_Logistics_Fleet;
}

export interface TranslationKeys_Buyer_Requests_Detail {
  crumb: string;
  backToList: string;
  supplierFallback: string;
  notFound: string;
  summaryHeading: string;
  budget: string;
  deliveryAddress: string;
  deadline: string;
  notSpecified: string;
  bidsCount: string;
  itemsHeading: string;
  noSpec: string;
  itemCol: string;
  qtyCol: string;
  substitutesCol: string;
  substitutesAllowed: string;
  substitutesNotAllowed: string;
  bidsHeading: string;
  noBidsYet: string;
  supplierCol: string;
  amountCol: string;
  leadTimeCol: string;
  leadTimeDays: string;
  paymentTermsCol: string;
  statusCol: string;
  award: string;
  awarded: string;
  pricesByItem: string;
  alternative: string;
  itemFallback: string;
  noLineBreakdown: string;
  noCategory: string;
  awardConfirmTitle: string;
  awardConfirmDesc: string;
  awardConfirm: string;
  awardError: string;
}

export interface TranslationKeys_Buyer_Requests_BidStatus {
  PENDING: string;
  ACCEPTED: string;
  REJECTED: string;
}

export interface TranslationKeys_Buyer_Requests_Status {
  DRAFT: string;
  OPEN: string;
  EVALUATION: string;
  AWARDED: string;
  CLOSED: string;
}

export interface TranslationKeys_Buyer_Requests_Empty {
  none: string;
  filtered: string;
  desc: string;
}

export interface TranslationKeys_Buyer_Requests_Kpi {
  open: string;
  openHint: string;
  review: string;
  reviewHint: string;
  awarded: string;
  awardedHint: string;
}

export interface TranslationKeys_Buyer_Requests {
  createCta: string;
  createCtaFirst: string;
  mockNotice: string;
  errorTitle: string;
  errorDesc: string;
  retry: string;
  loading: string;
  filterAll: string;
  evaluateBids: string;
  targetBudget: string;
  itemsCount: string;
  itemsCountValue: string;
  deadline: string;
  deadlineNotSet: string;
  bidsReceived: string;
  kpi: TranslationKeys_Buyer_Requests_Kpi;
  empty: TranslationKeys_Buyer_Requests_Empty;
  status: TranslationKeys_Buyer_Requests_Status;
  bidStatus: TranslationKeys_Buyer_Requests_BidStatus;
  detail: TranslationKeys_Buyer_Requests_Detail;
}

export interface TranslationKeys_Buyer_Claims_Status {
  approved: string;
  underReview: string;
}

export interface TranslationKeys_Buyer_Claims_Table {
  claimNumber: string;
  orderNumber: string;
  supplier: string;
  reason: string;
  amount: string;
  date: string;
  status: string;
  settlement: string;
}

export interface TranslationKeys_Buyer_Claims_Form {
  orderLabel: string;
  reasonLabel: string;
  amountLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
}

export interface TranslationKeys_Buyer_Claims_Reasons {
  DAMAGED_CARGO: string;
  MISSING_QUANTITY: string;
  QUALITY_DEFECT: string;
  WRONG_ITEM: string;
}

export interface TranslationKeys_Buyer_Claims {
  reportCta: string;
  modalTitle: string;
  modalDesc: string;
  settlementUnderReview: string;
  submitSuccess: string;
  submit: string;
  reasons: TranslationKeys_Buyer_Claims_Reasons;
  form: TranslationKeys_Buyer_Claims_Form;
  table: TranslationKeys_Buyer_Claims_Table;
  status: TranslationKeys_Buyer_Claims_Status;
}

export interface TranslationKeys_Buyer_Contracts_Status {
  active: string;
  pendingRenewal: string;
  completed: string;
}

export interface TranslationKeys_Buyer_Contracts {
  demoNotice: string;
  print: string;
  volumeProgress: string;
  units: string;
  discount: string;
  discountOf: string;
  slaLeadTime: string;
  leadTimeMax: string;
  slaPenalty: string;
  penaltyPerDay: string;
  validity: string;
  status: TranslationKeys_Buyer_Contracts_Status;
}

export interface TranslationKeys_Buyer_ProductDetail {
  backToCatalog: string;
  loading: string;
  error: string;
  notFound: string;
  category: string;
  brand: string;
  manufacturer: string;
  dimensions: string;
  unitWeight: string;
  warehouse: string;
  available: string;
  moq: string;
  supplier: string;
  purchase: string;
  perUnit: string;
  qtyLabel: string;
  qtyAriaLabel: string;
  moqHint: string;
  addToCart: string;
  noSupplier: string;
  unavailable: string;
  moqError: string;
  addedSuccess: string;
}

export interface TranslationKeys_Buyer_Invoices_Table {
  number: string;
  buyer: string;
  net: string;
  vat: string;
  gross: string;
  dueDate: string;
  status: string;
}

export interface TranslationKeys_Buyer_Invoices {
  netAmount: string;
  netHint: string;
  vatAmount: string;
  vatHint: string;
  grossDebt: string;
  grossHint: string;
  issuedInvoices: string;
  empty: string;
  paid: string;
  unpaid: string;
  overdue: string;
  unknown: string;
  table: TranslationKeys_Buyer_Invoices_Table;
}

export interface TranslationKeys_Buyer_Orders_Create_Errors {
  skuRequired: string;
  nameRequired: string;
  qtyMin: string;
  priceMin: string;
  customerRequired: string;
  destinationRequired: string;
  minOneItem: string;
}

export interface TranslationKeys_Buyer_Orders_Create {
  title: string;
  subtitle: string;
  customerLabel: string;
  customerPlaceholder: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  itemsTitle: string;
  addItem: string;
  itemName: string;
  itemSku: string;
  qty: string;
  unitPrice: string;
  lineTotal: string;
  removeItem: string;
  totalLabel: string;
  cancel: string;
  submit: string;
  submitShort: string;
  errors: TranslationKeys_Buyer_Orders_Create_Errors;
}

export interface TranslationKeys_Buyer_Orders_Table {
  number: string;
  customer: string;
  destination: string;
  amount: string;
  status: string;
  actions: string;
  advance: string;
  advanceTitle: string;
  details: string;
}

export interface TranslationKeys_Buyer_Orders_Status {
  DRAFT: string;
  SUBMITTED: string;
  RESERVED: string;
  AWAITING_PAYMENT: string;
  PAID: string;
  IN_PROCESSING: string;
  SHIPPED: string;
  DELIVERED: string;
  COMPLETED: string;
  CANCELLED_OUT_OF_STOCK: string;
  PAYMENT_FAILED: string;
  DISPUTED: string;
  CANCELLED: string;
}

export interface TranslationKeys_Buyer_Orders_Filters {
  all: string;
  submitted: string;
  reserved: string;
  paid: string;
  shipped: string;
  completed: string;
}

export interface TranslationKeys_Buyer_Orders {
  title: string;
  subtitle: string;
  createOrder: string;
  filters: TranslationKeys_Buyer_Orders_Filters;
  status: TranslationKeys_Buyer_Orders_Status;
  table: TranslationKeys_Buyer_Orders_Table;
  create: TranslationKeys_Buyer_Orders_Create;
}

export interface TranslationKeys_Buyer_Cart_ConfirmClear {
  title: string;
  description: string;
  confirm: string;
  cancel: string;
  success: string;
}

export interface TranslationKeys_Buyer_Cart_Summary {
  title: string;
  lines: string;
  linesValue: string;
  totalUnits: string;
  units: string;
  unitsShort: string;
  cargoWeight: string;
  weightValue: string;
  shipments: string;
  shipmentsValue: string;
  net: string;
  vat: string;
  total: string;
  credit: string;
  checkout: string;
  backToCatalog: string;
}

export interface TranslationKeys_Buyer_Cart_VendorFooter {
  shipmentWeight: string;
  net: string;
  vat: string;
  gross: string;
}

export interface TranslationKeys_Buyer_Cart_Item {
  priceLabel: string;
  batchWeight: string;
  moq: string;
  removeAria: string;
  removeTitle: string;
  decreaseAria: string;
  decreaseTitle: string;
  decreaseMinTitle: string;
  increaseAria: string;
  increaseTitle: string;
  qtyLabel: string;
  subtotal: string;
}

export interface TranslationKeys_Buyer_Cart_Vendor {
  title: string;
  remove: string;
  removeVendorConfirmTitle: string;
  removeVendorConfirmDesc: string;
  removeVendorConfirmAction: string;
  removeVendorConfirmCancel: string;
  removedSuccess: string;
}

export interface TranslationKeys_Buyer_Cart_Empty {
  title: string;
  description: string;
  goToCatalog: string;
}

export interface TranslationKeys_Buyer_Cart {
  title: string;
  subtitle: string;
  clearAll: string;
  empty: TranslationKeys_Buyer_Cart_Empty;
  vendor: TranslationKeys_Buyer_Cart_Vendor;
  item: TranslationKeys_Buyer_Cart_Item;
  vendorFooter: TranslationKeys_Buyer_Cart_VendorFooter;
  summary: TranslationKeys_Buyer_Cart_Summary;
  confirmClear: TranslationKeys_Buyer_Cart_ConfirmClear;
}

export interface TranslationKeys_Buyer_Catalog_Actions {
  addToCart: string;
  addToCartAria: string;
  cannotAdd: string;
  cannotAddTitle: string;
  noSupplierNote: string;
  addedSuccess: string;
}

export interface TranslationKeys_Buyer_Catalog_Errors {
  noSupplier: string;
  moqBelow: string;
}

export interface TranslationKeys_Buyer_Catalog_Stock {
  in: string;
  low: string;
  out: string;
}

export interface TranslationKeys_Buyer_Catalog_Card {
  specLink: string;
}

export interface TranslationKeys_Buyer_Catalog_Table {
  caption: string;
  sku: string;
  item: string;
  brandMfr: string;
  stock: string;
  price: string;
  moq: string;
  qty: string;
  action: string;
  leadTime: string;
  qtyLabel: string;
}

export interface TranslationKeys_Buyer_Catalog_Filters {
  activeFilters: string;
  category: string;
  brand: string;
  manufacturer: string;
  stock: string;
  search: string;
  removeCategory: string;
  removeBrand: string;
  removeManufacturer: string;
  removeStock: string;
  clearSearch: string;
  stockAll: string;
  stockIn: string;
  stockLow: string;
  stockOut: string;
  stockGroupLabel: string;
}

export interface TranslationKeys_Buyer_Catalog_Category {
  title: string;
  searchPlaceholder: string;
  all: string;
}

export interface TranslationKeys_Buyer_Catalog_Empty {
  title: string;
  description: string;
  reset: string;
}

export interface TranslationKeys_Buyer_Catalog {
  demoNotice: string;
  cachedNotice: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  categoriesToggle: string;
  categoriesHide: string;
  moreFilters: string;
  viewTable: string;
  viewTableTitle: string;
  viewGrid: string;
  viewGridTitle: string;
  found: string;
  items: string;
  empty: TranslationKeys_Buyer_Catalog_Empty;
  category: TranslationKeys_Buyer_Catalog_Category;
  filters: TranslationKeys_Buyer_Catalog_Filters;
  table: TranslationKeys_Buyer_Catalog_Table;
  card: TranslationKeys_Buyer_Catalog_Card;
  stock: TranslationKeys_Buyer_Catalog_Stock;
  errors: TranslationKeys_Buyer_Catalog_Errors;
  actions: TranslationKeys_Buyer_Catalog_Actions;
}

export interface TranslationKeys_Buyer_PageTitle {
  catalog: string;
  catalogSubtitle: string;
  cart: string;
  cartSubtitle: string;
  orders: string;
  ordersSubtitle: string;
  invoices: string;
  invoicesSubtitle: string;
  rfq: string;
  rfqSubtitle: string;
  contracts: string;
  contractsSubtitle: string;
  claims: string;
  claimsSubtitle: string;
  settings: string;
  settingsSubtitle: string;
  checkout: string;
  productDetail: string;
}

export interface TranslationKeys_Buyer_Home {
  chooseWorkspace: string;
  platformName: string;
  platformDesc: string;
  footerNote: string;
}

export interface TranslationKeys_Buyer {
  home: TranslationKeys_Buyer_Home;
  pageTitle: TranslationKeys_Buyer_PageTitle;
  catalog: TranslationKeys_Buyer_Catalog;
  cart: TranslationKeys_Buyer_Cart;
  orders: TranslationKeys_Buyer_Orders;
  invoices: TranslationKeys_Buyer_Invoices;
  productDetail: TranslationKeys_Buyer_ProductDetail;
  contracts: TranslationKeys_Buyer_Contracts;
  claims: TranslationKeys_Buyer_Claims;
  requests: TranslationKeys_Buyer_Requests;
}

export interface TranslationKeys_Header {
  skipToContent: string;
  toggleSidebar: string;
  cart: string;
  cartWithCount: string;
  cartAria: string;
  openCartAria: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  language: string;
  languageCurrent: string;
  notifications: string;
  unreadCount: string;
  noNotifications: string;
  markAllRead: string;
  clearAll: string;
  connected: string;
  disconnected: string;
  userMenu: string;
  settingsAndCompany: string;
  activeOrg: string;
  logout: string;
  login: string;
}

export interface TranslationKeys_Nav_Admin {
  analytics: string;
  tenants: string;
  kyc: string;
  audit: string;
  settings: string;
  tenantDetail: string;
}

export interface TranslationKeys_Nav_Logistics {
  map: string;
  routes: string;
  planner: string;
  fleet: string;
  drivers: string;
  ecmr: string;
  settings: string;
  routeDetail: string;
}

export interface TranslationKeys_Nav_Supplier {
  dashboard: string;
  products: string;
  warehouseMap: string;
  transfers: string;
  abcXyz: string;
  fulfillment: string;
  pricing: string;
  rfq: string;
  scorecard: string;
  settings: string;
  skuDetail: string;
}

export interface TranslationKeys_Nav_Buyer {
  catalog: string;
  cart: string;
  orders: string;
  invoices: string;
  rfq: string;
  contracts: string;
  claims: string;
  settings: string;
}

export interface TranslationKeys_Nav {
  sections: string;
  buyer: TranslationKeys_Nav_Buyer;
  supplier: TranslationKeys_Nav_Supplier;
  logistics: TranslationKeys_Nav_Logistics;
  admin: TranslationKeys_Nav_Admin;
}

export interface TranslationKeys_Workspace_Admin {
  title: string;
  shortTitle: string;
  subtitle: string;
  role: string;
}

export interface TranslationKeys_Workspace_Logistics {
  title: string;
  shortTitle: string;
  subtitle: string;
  role: string;
}

export interface TranslationKeys_Workspace_Supplier {
  title: string;
  shortTitle: string;
  subtitle: string;
  role: string;
}

export interface TranslationKeys_Workspace_Buyer {
  title: string;
  shortTitle: string;
  subtitle: string;
  role: string;
}

export interface TranslationKeys_Workspace_Switcher {
  label: string;
  current: string;
  clickToChange: string;
  quickLinks: string;
}

export interface TranslationKeys_Workspace {
  switcher: TranslationKeys_Workspace_Switcher;
  buyer: TranslationKeys_Workspace_Buyer;
  supplier: TranslationKeys_Workspace_Supplier;
  logistics: TranslationKeys_Workspace_Logistics;
  admin: TranslationKeys_Workspace_Admin;
}

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
  filters: string;
  clear: string;
  clearAll: string;
  apply: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  yes: string;
  no: string;
  all: string;
  more: string;
  showMore: string;
  showLess: string;
  actions: string;
  details: string;
  open: string;
  expand: string;
  collapse: string;
  sort: string;
  select: string;
  name: string;
  date: string;
  status: string;
  quantity: string;
  price: string;
  total: string;
  saveDraft: string;
  days: string;
  tons: string;
  administrator: string;
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
  workspace: TranslationKeys_Workspace;
  nav: TranslationKeys_Nav;
  header: TranslationKeys_Header;
  buyer: TranslationKeys_Buyer;
  logistics: TranslationKeys_Logistics;
  admin: TranslationKeys_Admin;
  supplier: TranslationKeys_Supplier;
}

export type TranslationPath = 'menu.settingsMenu.profile' | 'menu.settingsMenu.account' | 'menu.settingsMenu.security' | 'menu.settingsMenu.system' | 'menu.settingsMenu.integration' | 'menu.settingsMenu.backup' | 'menu.dashboard' | 'menu.settings' | 'menu.profile' | 'menu.back' | 'menu.reports' | 'menu.analytics' | 'menu.orders.root' | 'menu.orders.all' | 'menu.orders.create' | 'menu.orders.tracking' | 'menu.orders.approval' | 'menu.warehouse.root' | 'menu.warehouse.create' | 'menu.warehouse.directory' | 'menu.warehouse.inventory' | 'menu.warehouse.receiving' | 'menu.warehouse.shipping' | 'menu.logistics.root' | 'menu.logistics.carriers' | 'menu.logistics.delivery' | 'menu.logistics.tracking' | 'menu.logistics.calculator' | 'menu.logistics.performance' | 'menu.suppliers.root' | 'menu.suppliers.directory' | 'menu.suppliers.catalog' | 'menu.suppliers.ratings' | 'menu.suppliers.contracts' | 'menu.finance.root' | 'menu.finance.invoicing' | 'menu.finance.payments' | 'menu.finance.reports' | 'menu.finance.credit' | 'menu.finance.history' | 'menu.communication.root' | 'menu.communication.messages' | 'menu.communication.notifications' | 'menu.users.root' | 'menu.users.employees' | 'menu.users.roles' | 'menu.users.verification' | 'menu.admin.root' | 'menu.admin.system' | 'menu.admin.users' | 'menu.admin.analytics' | 'menu.admin.security' | 'menu.about' | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.delete' | 'common.edit' | 'common.add' | 'common.search' | 'common.filter' | 'common.filters' | 'common.clear' | 'common.clearAll' | 'common.apply' | 'common.close' | 'common.back' | 'common.next' | 'common.previous' | 'common.yes' | 'common.no' | 'common.all' | 'common.more' | 'common.showMore' | 'common.showLess' | 'common.actions' | 'common.details' | 'common.open' | 'common.expand' | 'common.collapse' | 'common.sort' | 'common.select' | 'common.name' | 'common.date' | 'common.status' | 'common.quantity' | 'common.price' | 'common.total' | 'common.saveDraft' | 'common.days' | 'common.tons' | 'common.administrator' | 'forms.validation.required' | 'forms.validation.email' | 'forms.validation.minLength' | 'auth.login' | 'auth.register' | 'auth.logout' | 'auth.email' | 'auth.password' | 'auth.confirmPassword' | 'auth.firstName' | 'auth.lastName' | 'auth.contactNumber' | 'auth.country' | 'auth.companyTaxId' | 'auth.companyName' | 'auth.businessType' | 'auth.timezone' | 'auth.rememberMe' | 'auth.forgotPassword' | 'auth.signInTitle' | 'auth.signUpTitle' | 'auth.createAccount' | 'auth.enterCredentials' | 'auth.alreadyHaveAccount' | 'auth.dontHaveAccount' | 'auth.loginAs' | 'auth.selectRole' | 'auth.dataProcessingConsent' | 'auth.emailPlaceholder' | 'auth.passwordPlaceholder' | 'auth.confirmPasswordPlaceholder' | 'auth.firstNamePlaceholder' | 'auth.lastNamePlaceholder' | 'auth.contactNumberPlaceholder' | 'auth.countryPlaceholder' | 'auth.companyTaxIdPlaceholder' | 'auth.companyNamePlaceholder' | 'auth.businessTypePlaceholder' | 'auth.roles.customer' | 'auth.roles.orderManager' | 'auth.roles.warehouseManager' | 'auth.roles.departmentManager' | 'auth.roles.manager' | 'auth.roles.unverifiedManager' | 'auth.roles.supplier' | 'auth.roles.logistician' | 'auth.roles.carrier' | 'auth.roles.admin' | 'auth.errors.invalidCredentials' | 'auth.errors.emailRequired' | 'auth.errors.passwordRequired' | 'auth.errors.emailInvalid' | 'auth.errors.passwordTooShort' | 'auth.errors.passwordsDontMatch' | 'auth.errors.networkError' | 'auth.errors.sessionExpired' | 'auth.errors.registrationFailed' | 'auth.success.loginSuccessful' | 'auth.success.registrationSuccessful' | 'auth.success.logoutSuccessful' | 'auth.success.sessionRefreshed' | 'auth.verification.title' | 'auth.verification.subtitle' | 'auth.verification.status.pendingDocuments' | 'auth.verification.status.documentsSubmitted' | 'auth.verification.status.underReview' | 'auth.verification.status.additionalInfoRequired' | 'auth.verification.status.approved' | 'auth.verification.status.rejected' | 'auth.verification.uploadDocuments' | 'auth.verification.requiredDocuments' | 'auth.verification.documentTypes.businessRegistration' | 'auth.verification.documentTypes.taxRegistration' | 'auth.verification.documentTypes.articlesOfIncorporation' | 'auth.verification.documentTypes.authorizedRepresentativeId' | 'auth.verification.documentTypes.importExportLicense' | 'auth.verification.documentTypes.industryPermits' | 'auth.verification.documentTypes.bankAccountVerification' | 'auth.verification.documentTypes.insuranceCertificates' | 'auth.verification.dragDropFiles' | 'auth.verification.maxFileSize' | 'auth.verification.allowedFormats' | 'auth.verification.estimatedTime' | 'auth.verification.contactSupport' | 'employee.title' | 'employee.createEmployee' | 'employee.teamOverview' | 'employee.roleAssignment' | 'employee.accessControl' | 'employee.invite' | 'employee.invitationSent' | 'employee.employeeCreated' | 'employee.selectRole' | 'employee.assignToWarehouse' | 'employee.permissions' | 'employee.status.active' | 'employee.status.inactive' | 'employee.status.pending' | 'employee.status.invited' | 'warehouse.title' | 'warehouse.createWarehouse' | 'warehouse.warehouseList' | 'warehouse.warehouseSettings' | 'warehouse.locationManagement' | 'warehouse.staffAssignment' | 'warehouse.performanceAnalytics' | 'warehouse.basicInfo' | 'warehouse.locationDetails' | 'warehouse.capacityConfiguration' | 'warehouse.equipmentSetup' | 'warehouse.integrationSetup' | 'warehouse.operationalTesting' | 'warehouse.goLive' | 'warehouse.types.distributionCenter' | 'warehouse.types.regionalWarehouse' | 'warehouse.types.localDepot' | 'warehouse.types.specializedStorage' | 'warehouse.types.crossDockFacility' | 'warehouse.warehouseName' | 'warehouse.warehouseType' | 'warehouse.address' | 'warehouse.gpsCoordinates' | 'warehouse.storageZones' | 'warehouse.capacityLimits' | 'warehouse.assignManager' | 'warehouse.operationalStaff' | 'workspace.switcher.label' | 'workspace.switcher.current' | 'workspace.switcher.clickToChange' | 'workspace.switcher.quickLinks' | 'workspace.buyer.title' | 'workspace.buyer.shortTitle' | 'workspace.buyer.subtitle' | 'workspace.buyer.role' | 'workspace.supplier.title' | 'workspace.supplier.shortTitle' | 'workspace.supplier.subtitle' | 'workspace.supplier.role' | 'workspace.logistics.title' | 'workspace.logistics.shortTitle' | 'workspace.logistics.subtitle' | 'workspace.logistics.role' | 'workspace.admin.title' | 'workspace.admin.shortTitle' | 'workspace.admin.subtitle' | 'workspace.admin.role' | 'nav.sections' | 'nav.buyer.catalog' | 'nav.buyer.cart' | 'nav.buyer.orders' | 'nav.buyer.invoices' | 'nav.buyer.rfq' | 'nav.buyer.contracts' | 'nav.buyer.claims' | 'nav.buyer.settings' | 'nav.supplier.dashboard' | 'nav.supplier.products' | 'nav.supplier.warehouseMap' | 'nav.supplier.transfers' | 'nav.supplier.abcXyz' | 'nav.supplier.fulfillment' | 'nav.supplier.pricing' | 'nav.supplier.rfq' | 'nav.supplier.scorecard' | 'nav.supplier.settings' | 'nav.supplier.skuDetail' | 'nav.logistics.map' | 'nav.logistics.routes' | 'nav.logistics.planner' | 'nav.logistics.fleet' | 'nav.logistics.drivers' | 'nav.logistics.ecmr' | 'nav.logistics.settings' | 'nav.logistics.routeDetail' | 'nav.admin.analytics' | 'nav.admin.tenants' | 'nav.admin.kyc' | 'nav.admin.audit' | 'nav.admin.settings' | 'nav.admin.tenantDetail' | 'header.skipToContent' | 'header.toggleSidebar' | 'header.cart' | 'header.cartWithCount' | 'header.cartAria' | 'header.openCartAria' | 'header.theme' | 'header.themeLight' | 'header.themeDark' | 'header.themeSystem' | 'header.language' | 'header.languageCurrent' | 'header.notifications' | 'header.unreadCount' | 'header.noNotifications' | 'header.markAllRead' | 'header.clearAll' | 'header.connected' | 'header.disconnected' | 'header.userMenu' | 'header.settingsAndCompany' | 'header.activeOrg' | 'header.logout' | 'header.login' | 'buyer.home.chooseWorkspace' | 'buyer.home.platformName' | 'buyer.home.platformDesc' | 'buyer.home.footerNote' | 'buyer.pageTitle.catalog' | 'buyer.pageTitle.catalogSubtitle' | 'buyer.pageTitle.cart' | 'buyer.pageTitle.cartSubtitle' | 'buyer.pageTitle.orders' | 'buyer.pageTitle.ordersSubtitle' | 'buyer.pageTitle.invoices' | 'buyer.pageTitle.invoicesSubtitle' | 'buyer.pageTitle.rfq' | 'buyer.pageTitle.rfqSubtitle' | 'buyer.pageTitle.contracts' | 'buyer.pageTitle.contractsSubtitle' | 'buyer.pageTitle.claims' | 'buyer.pageTitle.claimsSubtitle' | 'buyer.pageTitle.settings' | 'buyer.pageTitle.settingsSubtitle' | 'buyer.pageTitle.checkout' | 'buyer.pageTitle.productDetail' | 'buyer.catalog.demoNotice' | 'buyer.catalog.cachedNotice' | 'buyer.catalog.searchPlaceholder' | 'buyer.catalog.searchLabel' | 'buyer.catalog.clearSearch' | 'buyer.catalog.categoriesToggle' | 'buyer.catalog.categoriesHide' | 'buyer.catalog.moreFilters' | 'buyer.catalog.viewTable' | 'buyer.catalog.viewTableTitle' | 'buyer.catalog.viewGrid' | 'buyer.catalog.viewGridTitle' | 'buyer.catalog.found' | 'buyer.catalog.items' | 'buyer.catalog.empty.title' | 'buyer.catalog.empty.description' | 'buyer.catalog.empty.reset' | 'buyer.catalog.category.title' | 'buyer.catalog.category.searchPlaceholder' | 'buyer.catalog.category.all' | 'buyer.catalog.filters.activeFilters' | 'buyer.catalog.filters.category' | 'buyer.catalog.filters.brand' | 'buyer.catalog.filters.manufacturer' | 'buyer.catalog.filters.stock' | 'buyer.catalog.filters.search' | 'buyer.catalog.filters.removeCategory' | 'buyer.catalog.filters.removeBrand' | 'buyer.catalog.filters.removeManufacturer' | 'buyer.catalog.filters.removeStock' | 'buyer.catalog.filters.clearSearch' | 'buyer.catalog.filters.stockAll' | 'buyer.catalog.filters.stockIn' | 'buyer.catalog.filters.stockLow' | 'buyer.catalog.filters.stockOut' | 'buyer.catalog.filters.stockGroupLabel' | 'buyer.catalog.table.caption' | 'buyer.catalog.table.sku' | 'buyer.catalog.table.item' | 'buyer.catalog.table.brandMfr' | 'buyer.catalog.table.stock' | 'buyer.catalog.table.price' | 'buyer.catalog.table.moq' | 'buyer.catalog.table.qty' | 'buyer.catalog.table.action' | 'buyer.catalog.table.leadTime' | 'buyer.catalog.table.qtyLabel' | 'buyer.catalog.card.specLink' | 'buyer.catalog.stock.in' | 'buyer.catalog.stock.low' | 'buyer.catalog.stock.out' | 'buyer.catalog.errors.noSupplier' | 'buyer.catalog.errors.moqBelow' | 'buyer.catalog.actions.addToCart' | 'buyer.catalog.actions.addToCartAria' | 'buyer.catalog.actions.cannotAdd' | 'buyer.catalog.actions.cannotAddTitle' | 'buyer.catalog.actions.noSupplierNote' | 'buyer.catalog.actions.addedSuccess' | 'buyer.cart.title' | 'buyer.cart.subtitle' | 'buyer.cart.clearAll' | 'buyer.cart.empty.title' | 'buyer.cart.empty.description' | 'buyer.cart.empty.goToCatalog' | 'buyer.cart.vendor.title' | 'buyer.cart.vendor.remove' | 'buyer.cart.vendor.removeVendorConfirmTitle' | 'buyer.cart.vendor.removeVendorConfirmDesc' | 'buyer.cart.vendor.removeVendorConfirmAction' | 'buyer.cart.vendor.removeVendorConfirmCancel' | 'buyer.cart.vendor.removedSuccess' | 'buyer.cart.item.priceLabel' | 'buyer.cart.item.batchWeight' | 'buyer.cart.item.moq' | 'buyer.cart.item.removeAria' | 'buyer.cart.item.removeTitle' | 'buyer.cart.item.decreaseAria' | 'buyer.cart.item.decreaseTitle' | 'buyer.cart.item.decreaseMinTitle' | 'buyer.cart.item.increaseAria' | 'buyer.cart.item.increaseTitle' | 'buyer.cart.item.qtyLabel' | 'buyer.cart.item.subtotal' | 'buyer.cart.vendorFooter.shipmentWeight' | 'buyer.cart.vendorFooter.net' | 'buyer.cart.vendorFooter.vat' | 'buyer.cart.vendorFooter.gross' | 'buyer.cart.summary.title' | 'buyer.cart.summary.lines' | 'buyer.cart.summary.linesValue' | 'buyer.cart.summary.totalUnits' | 'buyer.cart.summary.units' | 'buyer.cart.summary.unitsShort' | 'buyer.cart.summary.cargoWeight' | 'buyer.cart.summary.weightValue' | 'buyer.cart.summary.shipments' | 'buyer.cart.summary.shipmentsValue' | 'buyer.cart.summary.net' | 'buyer.cart.summary.vat' | 'buyer.cart.summary.total' | 'buyer.cart.summary.credit' | 'buyer.cart.summary.checkout' | 'buyer.cart.summary.backToCatalog' | 'buyer.cart.confirmClear.title' | 'buyer.cart.confirmClear.description' | 'buyer.cart.confirmClear.confirm' | 'buyer.cart.confirmClear.cancel' | 'buyer.cart.confirmClear.success' | 'buyer.orders.title' | 'buyer.orders.subtitle' | 'buyer.orders.createOrder' | 'buyer.orders.filters.all' | 'buyer.orders.filters.submitted' | 'buyer.orders.filters.reserved' | 'buyer.orders.filters.paid' | 'buyer.orders.filters.shipped' | 'buyer.orders.filters.completed' | 'buyer.orders.status.DRAFT' | 'buyer.orders.status.SUBMITTED' | 'buyer.orders.status.RESERVED' | 'buyer.orders.status.AWAITING_PAYMENT' | 'buyer.orders.status.PAID' | 'buyer.orders.status.IN_PROCESSING' | 'buyer.orders.status.SHIPPED' | 'buyer.orders.status.DELIVERED' | 'buyer.orders.status.COMPLETED' | 'buyer.orders.status.CANCELLED_OUT_OF_STOCK' | 'buyer.orders.status.PAYMENT_FAILED' | 'buyer.orders.status.DISPUTED' | 'buyer.orders.status.CANCELLED' | 'buyer.orders.table.number' | 'buyer.orders.table.customer' | 'buyer.orders.table.destination' | 'buyer.orders.table.amount' | 'buyer.orders.table.status' | 'buyer.orders.table.actions' | 'buyer.orders.table.advance' | 'buyer.orders.table.advanceTitle' | 'buyer.orders.table.details' | 'buyer.orders.create.title' | 'buyer.orders.create.subtitle' | 'buyer.orders.create.customerLabel' | 'buyer.orders.create.customerPlaceholder' | 'buyer.orders.create.destinationLabel' | 'buyer.orders.create.destinationPlaceholder' | 'buyer.orders.create.itemsTitle' | 'buyer.orders.create.addItem' | 'buyer.orders.create.itemName' | 'buyer.orders.create.itemSku' | 'buyer.orders.create.qty' | 'buyer.orders.create.unitPrice' | 'buyer.orders.create.lineTotal' | 'buyer.orders.create.removeItem' | 'buyer.orders.create.totalLabel' | 'buyer.orders.create.cancel' | 'buyer.orders.create.submit' | 'buyer.orders.create.submitShort' | 'buyer.orders.create.errors.skuRequired' | 'buyer.orders.create.errors.nameRequired' | 'buyer.orders.create.errors.qtyMin' | 'buyer.orders.create.errors.priceMin' | 'buyer.orders.create.errors.customerRequired' | 'buyer.orders.create.errors.destinationRequired' | 'buyer.orders.create.errors.minOneItem' | 'buyer.invoices.netAmount' | 'buyer.invoices.netHint' | 'buyer.invoices.vatAmount' | 'buyer.invoices.vatHint' | 'buyer.invoices.grossDebt' | 'buyer.invoices.grossHint' | 'buyer.invoices.issuedInvoices' | 'buyer.invoices.empty' | 'buyer.invoices.paid' | 'buyer.invoices.unpaid' | 'buyer.invoices.overdue' | 'buyer.invoices.unknown' | 'buyer.invoices.table.number' | 'buyer.invoices.table.buyer' | 'buyer.invoices.table.net' | 'buyer.invoices.table.vat' | 'buyer.invoices.table.gross' | 'buyer.invoices.table.dueDate' | 'buyer.invoices.table.status' | 'buyer.productDetail.backToCatalog' | 'buyer.productDetail.loading' | 'buyer.productDetail.error' | 'buyer.productDetail.notFound' | 'buyer.productDetail.category' | 'buyer.productDetail.brand' | 'buyer.productDetail.manufacturer' | 'buyer.productDetail.dimensions' | 'buyer.productDetail.unitWeight' | 'buyer.productDetail.warehouse' | 'buyer.productDetail.available' | 'buyer.productDetail.moq' | 'buyer.productDetail.supplier' | 'buyer.productDetail.purchase' | 'buyer.productDetail.perUnit' | 'buyer.productDetail.qtyLabel' | 'buyer.productDetail.qtyAriaLabel' | 'buyer.productDetail.moqHint' | 'buyer.productDetail.addToCart' | 'buyer.productDetail.noSupplier' | 'buyer.productDetail.unavailable' | 'buyer.productDetail.moqError' | 'buyer.productDetail.addedSuccess' | 'buyer.contracts.demoNotice' | 'buyer.contracts.print' | 'buyer.contracts.volumeProgress' | 'buyer.contracts.units' | 'buyer.contracts.discount' | 'buyer.contracts.discountOf' | 'buyer.contracts.slaLeadTime' | 'buyer.contracts.leadTimeMax' | 'buyer.contracts.slaPenalty' | 'buyer.contracts.penaltyPerDay' | 'buyer.contracts.validity' | 'buyer.contracts.status.active' | 'buyer.contracts.status.pendingRenewal' | 'buyer.contracts.status.completed' | 'buyer.claims.reportCta' | 'buyer.claims.modalTitle' | 'buyer.claims.modalDesc' | 'buyer.claims.settlementUnderReview' | 'buyer.claims.submitSuccess' | 'buyer.claims.submit' | 'buyer.claims.reasons.DAMAGED_CARGO' | 'buyer.claims.reasons.MISSING_QUANTITY' | 'buyer.claims.reasons.QUALITY_DEFECT' | 'buyer.claims.reasons.WRONG_ITEM' | 'buyer.claims.form.orderLabel' | 'buyer.claims.form.reasonLabel' | 'buyer.claims.form.amountLabel' | 'buyer.claims.form.notesLabel' | 'buyer.claims.form.notesPlaceholder' | 'buyer.claims.table.claimNumber' | 'buyer.claims.table.orderNumber' | 'buyer.claims.table.supplier' | 'buyer.claims.table.reason' | 'buyer.claims.table.amount' | 'buyer.claims.table.date' | 'buyer.claims.table.status' | 'buyer.claims.table.settlement' | 'buyer.claims.status.approved' | 'buyer.claims.status.underReview' | 'buyer.requests.createCta' | 'buyer.requests.createCtaFirst' | 'buyer.requests.mockNotice' | 'buyer.requests.errorTitle' | 'buyer.requests.errorDesc' | 'buyer.requests.retry' | 'buyer.requests.loading' | 'buyer.requests.filterAll' | 'buyer.requests.evaluateBids' | 'buyer.requests.targetBudget' | 'buyer.requests.itemsCount' | 'buyer.requests.itemsCountValue' | 'buyer.requests.deadline' | 'buyer.requests.deadlineNotSet' | 'buyer.requests.bidsReceived' | 'buyer.requests.kpi.open' | 'buyer.requests.kpi.openHint' | 'buyer.requests.kpi.review' | 'buyer.requests.kpi.reviewHint' | 'buyer.requests.kpi.awarded' | 'buyer.requests.kpi.awardedHint' | 'buyer.requests.empty.none' | 'buyer.requests.empty.filtered' | 'buyer.requests.empty.desc' | 'buyer.requests.status.DRAFT' | 'buyer.requests.status.OPEN' | 'buyer.requests.status.EVALUATION' | 'buyer.requests.status.AWARDED' | 'buyer.requests.status.CLOSED' | 'buyer.requests.bidStatus.PENDING' | 'buyer.requests.bidStatus.ACCEPTED' | 'buyer.requests.bidStatus.REJECTED' | 'buyer.requests.detail.crumb' | 'buyer.requests.detail.backToList' | 'buyer.requests.detail.supplierFallback' | 'buyer.requests.detail.notFound' | 'buyer.requests.detail.summaryHeading' | 'buyer.requests.detail.budget' | 'buyer.requests.detail.deliveryAddress' | 'buyer.requests.detail.deadline' | 'buyer.requests.detail.notSpecified' | 'buyer.requests.detail.bidsCount' | 'buyer.requests.detail.itemsHeading' | 'buyer.requests.detail.noSpec' | 'buyer.requests.detail.itemCol' | 'buyer.requests.detail.qtyCol' | 'buyer.requests.detail.substitutesCol' | 'buyer.requests.detail.substitutesAllowed' | 'buyer.requests.detail.substitutesNotAllowed' | 'buyer.requests.detail.bidsHeading' | 'buyer.requests.detail.noBidsYet' | 'buyer.requests.detail.supplierCol' | 'buyer.requests.detail.amountCol' | 'buyer.requests.detail.leadTimeCol' | 'buyer.requests.detail.leadTimeDays' | 'buyer.requests.detail.paymentTermsCol' | 'buyer.requests.detail.statusCol' | 'buyer.requests.detail.award' | 'buyer.requests.detail.awarded' | 'buyer.requests.detail.pricesByItem' | 'buyer.requests.detail.alternative' | 'buyer.requests.detail.itemFallback' | 'buyer.requests.detail.noLineBreakdown' | 'buyer.requests.detail.noCategory' | 'buyer.requests.detail.awardConfirmTitle' | 'buyer.requests.detail.awardConfirmDesc' | 'buyer.requests.detail.awardConfirm' | 'buyer.requests.detail.awardError' | 'logistics.routes.title' | 'logistics.routes.subtitle' | 'logistics.routes.openPlanner' | 'logistics.routes.openRoute' | 'logistics.routes.col.code' | 'logistics.routes.col.corridor' | 'logistics.routes.col.vehicleDriver' | 'logistics.routes.col.distanceTime' | 'logistics.routes.col.stops' | 'logistics.routes.col.co2' | 'logistics.routes.status.inTransit' | 'logistics.routes.status.planned' | 'logistics.routes.status.completed' | 'logistics.routeDetail.backToList' | 'logistics.routeDetail.vehicle' | 'logistics.routeDetail.driver' | 'logistics.routeDetail.distance' | 'logistics.routeDetail.duration' | 'logistics.routeDetail.stops' | 'logistics.routeDetail.co2' | 'logistics.routeDetail.notFoundTitle' | 'logistics.routeDetail.notFoundBody' | 'logistics.fleet.title' | 'logistics.fleet.subtitle' | 'logistics.fleet.actions.addVehicle' | 'logistics.fleet.actions.passport' | 'logistics.fleet.actions.passportAria' | 'logistics.fleet.searchLabel' | 'logistics.fleet.searchPlaceholder' | 'logistics.fleet.searchClear' | 'logistics.fleet.clearAll' | 'logistics.fleet.filter.ariaLabel' | 'logistics.fleet.filter.all' | 'logistics.fleet.filter.heavy' | 'logistics.fleet.filter.medium' | 'logistics.fleet.stats.total' | 'logistics.fleet.stats.totalHelper' | 'logistics.fleet.stats.active' | 'logistics.fleet.stats.activeHelper' | 'logistics.fleet.stats.depot' | 'logistics.fleet.stats.depotHelper' | 'logistics.fleet.stats.maintenance' | 'logistics.fleet.stats.maintenanceHelper' | 'logistics.fleet.stats.payload' | 'logistics.fleet.stats.volumeHelper' | 'logistics.fleet.table.plate' | 'logistics.fleet.table.model' | 'logistics.fleet.table.type' | 'logistics.fleet.table.driver' | 'logistics.fleet.table.payload' | 'logistics.fleet.table.volume' | 'logistics.fleet.table.inspection' | 'logistics.fleet.table.status' | 'logistics.fleet.status.active' | 'logistics.fleet.status.depot' | 'logistics.fleet.status.maintenance' | 'logistics.fleet.payloadAria' | 'logistics.fleet.empty.title' | 'logistics.fleet.empty.subtitle' | 'admin.users.title' | 'admin.users.subtitle' | 'admin.users.actions.newEntity' | 'admin.users.actions.kycQueue' | 'admin.users.actions.configure' | 'admin.users.actions.configureAria' | 'admin.users.actions.moreAria' | 'admin.users.bulk.exportKyc' | 'admin.users.bulk.adjustCredit' | 'admin.users.bulk.clear' | 'admin.users.bulk.selectAll' | 'admin.users.bulk.selectOne' | 'admin.users.bulkActionsLabel' | 'admin.users.selectedCount' | 'admin.users.cashOnly' | 'admin.users.clearAll' | 'admin.users.searchLabel' | 'admin.users.searchPlaceholder' | 'admin.users.searchClear' | 'admin.users.filter.ariaLabel' | 'admin.users.filter.all' | 'admin.users.filter.buyer' | 'admin.users.filter.supplier' | 'admin.users.filter.carrier' | 'admin.users.table.name' | 'admin.users.table.nip' | 'admin.users.table.role' | 'admin.users.table.kyc' | 'admin.users.table.creditLimit' | 'admin.users.table.exposure' | 'admin.users.table.joined' | 'admin.users.kyc.verified' | 'admin.users.kyc.pending' | 'admin.users.kyc.rejected' | 'admin.users.kyc.notSubmitted' | 'admin.users.role.buyer' | 'admin.users.role.supplier' | 'admin.users.role.carrier' | 'admin.users.utilizationAria' | 'admin.users.empty.title' | 'admin.users.empty.subtitle' | 'admin.users.verification.title' | 'admin.users.verification.subtitle' | 'admin.users.verification.backToDirectory' | 'admin.users.verification.newApplication' | 'admin.users.verification.searchLabel' | 'admin.users.verification.searchPlaceholder' | 'admin.users.verification.searchClear' | 'admin.users.verification.copiedToast' | 'admin.users.verification.copyNip' | 'admin.users.verification.copyIban' | 'admin.users.verification.ageDays' | 'admin.users.verification.review' | 'admin.users.verification.reviewAria' | 'admin.users.verification.filter.ariaLabel' | 'admin.users.verification.filter.all' | 'admin.users.verification.filter.pending' | 'admin.users.verification.filter.approved' | 'admin.users.verification.filter.rejected' | 'admin.users.verification.status.pendingAudit' | 'admin.users.verification.status.approved' | 'admin.users.verification.status.rejected' | 'admin.users.verification.table.caption' | 'admin.users.verification.table.organization' | 'admin.users.verification.table.role' | 'admin.users.verification.table.status' | 'admin.users.verification.table.submitted' | 'admin.users.verification.table.age' | 'admin.users.verification.table.checks' | 'admin.users.verification.table.documents' | 'admin.users.verification.table.requestedLimit' | 'admin.users.verification.checks.regon' | 'admin.users.verification.checks.vatWhiteList' | 'admin.users.verification.checks.accountMatch' | 'admin.users.verification.checks.vies' | 'admin.users.verification.checks.sanctions' | 'admin.users.verification.checks.summary' | 'admin.users.verification.checks.pass' | 'admin.users.verification.checks.fail' | 'admin.users.verification.documents.title' | 'admin.users.verification.documents.none' | 'admin.users.verification.documents.incomplete' | 'admin.users.verification.documents.inspectAria' | 'admin.users.verification.docType.krsExtract' | 'admin.users.verification.docType.vatWhiteList' | 'admin.users.verification.docType.transportLicense' | 'admin.users.verification.docType.bankConfirmation' | 'admin.users.verification.docType.isoCertificate' | 'admin.users.verification.paymentTerms.net15' | 'admin.users.verification.paymentTerms.net30' | 'admin.users.verification.paymentTerms.net60' | 'admin.users.verification.paymentTerms.prepayment' | 'admin.users.verification.bulk.approve' | 'admin.users.verification.bulk.reject' | 'admin.users.verification.empty.title' | 'admin.users.verification.empty.subtitle' | 'admin.users.verification.reviewDialog.title' | 'admin.users.verification.reviewDialog.submittedOn' | 'admin.users.verification.reviewDialog.field.nip' | 'admin.users.verification.reviewDialog.field.krs' | 'admin.users.verification.reviewDialog.field.iban' | 'admin.users.verification.reviewDialog.field.email' | 'admin.users.verification.reviewDialog.field.phone' | 'admin.users.verification.reviewDialog.field.address' | 'admin.users.verification.reviewDialog.whiteList.match' | 'admin.users.verification.reviewDialog.whiteList.mismatch' | 'admin.users.verification.reviewDialog.requestedLimit' | 'admin.users.verification.reviewDialog.checksTitle' | 'admin.users.verification.reviewDialog.outcome.approved' | 'admin.users.verification.reviewDialog.outcome.rejected' | 'admin.users.verification.reviewDialog.rejectionReason' | 'admin.users.verification.reviewDialog.noNotes' | 'admin.users.verification.reviewDialog.approve' | 'admin.users.verification.reviewDialog.reject' | 'admin.users.verification.approveDialog.title' | 'admin.users.verification.approveDialog.org' | 'admin.users.verification.approveDialog.limitLabel' | 'admin.users.verification.approveDialog.requestedHint' | 'admin.users.verification.approveDialog.termsLabel' | 'admin.users.verification.approveDialog.notesLabel' | 'admin.users.verification.approveDialog.notesPlaceholder' | 'admin.users.verification.approveDialog.confirm' | 'admin.users.verification.approveDialog.defaultNotes' | 'admin.users.verification.rejectDialog.title' | 'admin.users.verification.rejectDialog.org' | 'admin.users.verification.rejectDialog.reasonLabel' | 'admin.users.verification.rejectDialog.notesLabel' | 'admin.users.verification.rejectDialog.notesPlaceholder' | 'admin.users.verification.rejectDialog.confirm' | 'admin.users.verification.rejectReasons.whiteList' | 'admin.users.verification.rejectReasons.krsMismatch' | 'admin.users.verification.rejectReasons.transportLicense' | 'admin.users.verification.rejectReasons.vatRemoved' | 'admin.users.verification.rejectReasons.creditRisk' | 'admin.users.verification.docPreview.title' | 'admin.users.verification.docPreview.org' | 'admin.users.verification.docPreview.signature' | 'admin.users.verification.docPreview.reportRegistry' | 'admin.users.verification.docPreview.reportDate' | 'admin.users.verification.docPreview.entity' | 'admin.users.verification.docPreview.nipLabel' | 'admin.users.verification.docPreview.vatStatus' | 'admin.users.verification.docPreview.vatActive' | 'admin.users.verification.docPreview.mpp' | 'admin.users.verification.docPreview.mppRegistered' | 'admin.users.verification.docPreview.checksum' | 'admin.users.verification.docPreview.close' | 'admin.users.verification.docPreview.download' | 'admin.users.verification.docPreview.downloadStarted' | 'admin.users.detail.backToDirectory' | 'admin.users.detail.joined' | 'admin.users.detail.openKycQueue' | 'admin.users.detail.saveCredit' | 'admin.users.detail.notFound.title' | 'admin.users.detail.notFound.description' | 'admin.users.detail.notFound.back' | 'admin.users.detail.credit.caption' | 'admin.users.detail.credit.used' | 'admin.users.detail.credit.available' | 'admin.users.detail.credit.utilization' | 'admin.users.detail.credit.terms' | 'admin.users.detail.form.title' | 'admin.users.detail.form.limitLabel' | 'admin.users.detail.form.limitHelper' | 'admin.users.detail.form.termsLabel' | 'admin.users.detail.form.termsHelper' | 'admin.users.detail.registry.title' | 'admin.users.detail.registry.iban' | 'admin.users.detail.registry.krs' | 'admin.users.detail.registry.regon' | 'admin.users.detail.registry.submitted' | 'admin.users.detail.registry.noApplication' | 'admin.users.detail.docs.downloadAria' | 'admin.settings.title' | 'admin.settings.subtitle' | 'admin.settings.envTitle' | 'admin.settings.envDescription' | 'admin.settings.envGroupAria' | 'admin.settings.env.development' | 'admin.settings.env.staging' | 'admin.settings.env.production' | 'admin.settings.env.custom' | 'admin.settings.endpointsTitle' | 'admin.settings.gatewayLabel' | 'admin.settings.keycloakLabel' | 'admin.settings.presetHint' | 'admin.settings.modesTitle' | 'admin.settings.mockLabel' | 'admin.settings.mockDescription' | 'admin.settings.save' | 'admin.settings.savedToast' | 'admin.settings.gatewayRequired' | 'admin.settings.keycloakRequired' | 'admin.analytics.title' | 'admin.analytics.subtitle' | 'admin.analytics.refresh' | 'admin.analytics.refreshed' | 'admin.analytics.otif' | 'admin.analytics.leadTime' | 'admin.analytics.throughput' | 'admin.analytics.savings' | 'admin.analytics.toSlaTarget' | 'admin.analytics.fasterThan' | 'admin.analytics.activeCorridors' | 'admin.analytics.vrpReverseAuctions' | 'admin.analytics.otifTrendTitle' | 'admin.analytics.trendPeriod' | 'admin.analytics.trendOnTime' | 'admin.analytics.trendInFull' | 'admin.analytics.trendDelayed' | 'admin.analytics.trendOtif' | 'admin.analytics.corridorsTitle' | 'admin.analytics.corridor' | 'admin.analytics.distance' | 'admin.analytics.actual' | 'admin.analytics.target' | 'admin.analytics.load' | 'admin.analytics.statusOptimal' | 'admin.analytics.statusAttention' | 'admin.analytics.abcTitle' | 'admin.analytics.abcClass' | 'admin.analytics.abcProfile' | 'admin.analytics.abcShare' | 'admin.analytics.abcExamples' | 'admin.analytics.abcA' | 'admin.analytics.abcADesc' | 'admin.analytics.abcB' | 'admin.analytics.abcBDesc' | 'admin.analytics.abcC' | 'admin.analytics.abcCDesc' | 'admin.analytics.warehouseTurnover' | 'admin.analytics.warehouse' | 'admin.analytics.turnover' | 'admin.analytics.daysOnHand' | 'admin.systemAudit.title' | 'admin.systemAudit.subtitle' | 'admin.systemAudit.tab.disputes' | 'admin.systemAudit.tab.dlt' | 'admin.systemAudit.disputes.title' | 'admin.systemAudit.disputes.subtitle' | 'admin.systemAudit.disputes.emptyTitle' | 'admin.systemAudit.disputes.emptySubtitle' | 'admin.systemAudit.disputes.tableCaption' | 'admin.systemAudit.disputes.table.claim' | 'admin.systemAudit.disputes.table.order' | 'admin.systemAudit.disputes.table.amount' | 'admin.systemAudit.disputes.table.status' | 'admin.systemAudit.disputes.table.reason' | 'admin.systemAudit.disputes.table.reported' | 'admin.systemAudit.disputes.table.settlement' | 'admin.systemAudit.disputes.status.approved' | 'admin.systemAudit.disputes.status.pending' | 'admin.systemAudit.disputes.actions.reject' | 'admin.systemAudit.disputes.actions.enforce' | 'admin.systemAudit.dlt.title' | 'admin.systemAudit.dlt.subtitle' | 'admin.systemAudit.dlt.tableCaption' | 'admin.systemAudit.dlt.filterAria' | 'admin.systemAudit.dlt.filter.all' | 'admin.systemAudit.dlt.filter.unresolved' | 'admin.systemAudit.dlt.filter.recovered' | 'admin.systemAudit.dlt.metrics.total' | 'admin.systemAudit.dlt.metrics.totalHelper' | 'admin.systemAudit.dlt.metrics.unresolved' | 'admin.systemAudit.dlt.metrics.unresolvedHelper' | 'admin.systemAudit.dlt.metrics.recovered' | 'admin.systemAudit.dlt.metrics.recoveredHelper' | 'admin.systemAudit.dlt.message.exception' | 'admin.systemAudit.dlt.message.payload' | 'admin.systemAudit.dlt.message.copy' | 'admin.systemAudit.dlt.message.copied' | 'admin.systemAudit.dlt.message.copySuccess' | 'admin.systemAudit.dlt.message.redrive' | 'admin.systemAudit.dlt.message.redriveSuccess' | 'admin.systemAudit.dlt.badge.redriven' | 'admin.systemAudit.dlt.badge.unresolved' | 'admin.systemAudit.dlt.redriveDialog.title' | 'admin.systemAudit.dlt.redriveDialog.body' | 'admin.systemAudit.dlt.redriveDialog.eventId' | 'admin.systemAudit.dlt.redriveDialog.topic' | 'admin.systemAudit.dlt.redriveDialog.partitionOffset' | 'admin.systemAudit.dlt.redriveDialog.warning' | 'admin.systemAudit.dlt.redriveDialog.cancel' | 'admin.systemAudit.dlt.redriveDialog.confirm' | 'supplier.products.title' | 'supplier.products.subtitle' | 'supplier.products.emptyDesc' | 'supplier.products.filters.searchLabel' | 'supplier.products.filters.searchPlaceholder' | 'supplier.products.filters.searchChip' | 'supplier.products.filters.categoryPlaceholder' | 'supplier.products.filters.allCategories' | 'supplier.products.filters.categoryChip' | 'supplier.products.filters.brandChip' | 'supplier.products.filters.manufacturerChip' | 'supplier.products.filters.allItems' | 'supplier.products.filters.activeLabel' | 'supplier.products.filters.clearAll' | 'supplier.products.actions.addSku' | 'supplier.products.actions.manage' | 'supplier.products.actions.manageAria' | 'supplier.products.actions.reserve10' | 'supplier.products.actions.reserveAria' | 'supplier.products.actions.addBrand' | 'supplier.products.actions.addCategory' | 'supplier.products.actions.addManufacturer' | 'supplier.products.table.skuBrand' | 'supplier.products.table.nameClass' | 'supplier.products.table.logistics' | 'supplier.products.table.warehouse' | 'supplier.products.table.available' | 'supplier.products.table.reserved' | 'supplier.products.table.price' | 'supplier.products.table.unit' | 'supplier.products.warehouse.capacity' | 'supplier.products.warehouse.filled' | 'supplier.products.warehouse.used' | 'supplier.products.warehouse.pallets' | 'supplier.products.warehouse.coldChainLabel' | 'supplier.products.warehouse.tempLabel' | 'supplier.orders.title' | 'supplier.orders.subtitle' | 'supplier.orders.filters.ariaLabel' | 'supplier.orders.filters.all' | 'supplier.orders.filters.pending' | 'supplier.orders.filters.readyForDispatch' | 'supplier.orders.table.orderNumber' | 'supplier.orders.table.customerDelivery' | 'supplier.orders.table.items' | 'supplier.orders.table.total' | 'supplier.orders.table.status' | 'supplier.orders.table.action' | 'supplier.orders.itemsUnit' | 'supplier.orders.fulfillAction' | 'supplier.orders.actionAria' | 'supplier.orders.empty' | 'supplier.dashboard.welcome' | 'supplier.dashboard.verifiedSupplier' | 'supplier.dashboard.activeContext' | 'supplier.dashboard.openOrdersQueue' | 'supplier.dashboard.kpi.gmv' | 'supplier.dashboard.kpi.vsLastMonth' | 'supplier.dashboard.kpi.activeOrders' | 'supplier.dashboard.kpi.warehouseFill' | 'supplier.dashboard.kpi.otif' | 'supplier.dashboard.kpi.aboveSla' | 'supplier.dashboard.kpi.targetSla' | 'supplier.dashboard.pipeline.title' | 'supplier.dashboard.pipeline.subtitle' | 'supplier.dashboard.pipeline.submitted' | 'supplier.dashboard.pipeline.reserved' | 'supplier.dashboard.pipeline.paid' | 'supplier.dashboard.pipeline.shipped' | 'supplier.dashboard.pipeline.completed' | 'supplier.dashboard.recentOrders.title' | 'supplier.dashboard.recentOrders.subtitle' | 'supplier.dashboard.allOrders' | 'supplier.dashboard.fleet.title' | 'supplier.dashboard.fleet.subtitle' | 'supplier.dashboard.fleet.inTransit' | 'supplier.dashboard.fleet.planned' | 'supplier.dashboard.routeMap' | 'supplier.scorecard.title' | 'supplier.scorecard.subtitle' | 'supplier.scorecard.tierGold' | 'supplier.scorecard.top5Percent' | 'supplier.scorecard.compositeLabel' | 'supplier.scorecard.basis' | 'supplier.scorecard.factorsTitle' | 'supplier.scorecard.factorCol' | 'supplier.scorecard.weight' | 'supplier.scorecard.score' | 'supplier.scorecard.detail' | 'supplier.scorecard.threshold' | 'supplier.scorecard.factor.otif' | 'supplier.scorecard.factor.quality' | 'supplier.scorecard.factor.price' | 'supplier.scorecard.factor.leadTime' | 'supplier.scorecard.helper.avgDispatch' | 'supplier.scorecard.helper.zeroCriticalRma' | 'supplier.scorecard.helper.competitive' | 'supplier.scorecard.helper.leadTimeDays' | 'supplier.sku.title' | 'supplier.sku.backToCatalog' | 'supplier.sku.activeInWms' | 'supplier.sku.save' | 'supplier.sku.saved' | 'supplier.sku.tab.bins' | 'supplier.sku.tab.batches' | 'supplier.sku.tab.specs' | 'supplier.sku.binsTitle' | 'supplier.sku.bins.warehouse' | 'supplier.sku.bins.aisleRack' | 'supplier.sku.bins.binCode' | 'supplier.sku.bins.available' | 'supplier.sku.bins.reserved' | 'supplier.sku.batchesTitle' | 'supplier.sku.batches.lot' | 'supplier.sku.batches.mfg' | 'supplier.sku.batches.exp' | 'supplier.sku.batches.qty' | 'supplier.sku.batches.qc' | 'supplier.sku.batches.approved' | 'supplier.sku.specsTitle' | 'supplier.sku.specs.name' | 'supplier.sku.specs.price' | 'supplier.sku.specs.priceHelper' | 'supplier.sku.specs.moq';

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
