# LogisticCommerce Platform Development Plan / План разработки платформы LogisticCommerce

## Guidelines for Working with This Document / Рекомендации по работе с документом

### EN: Document Guidelines

- **Status Values**: `TODO`, `IN_PROGRESS`, `TESTING`, `COMPLETED`, `BLOCKED`
- **Priority Levels**: `HIGH`, `MEDIUM`, `LOW`
- **Date Format**: YYYY-MM-DD
- **Task Format**: `[STATUS] [PRIORITY] Task Name - Description (Added: YYYY-MM-DD)`
- **Module Structure**: Each module should have menu items and tasks clearly separated
- **Updating**: Always update the status and add comments when making changes
- **For Developers**: Check tasks marked as `TODO` or `IN_PROGRESS` for immediate work
- **For AI Agents**: Use this document to understand project structure and current priorities

### RU: Руководство по документу

- **Значения статусов**: `TODO`, `IN_PROGRESS`, `TESTING`, `COMPLETED`, `BLOCKED`
- **Уровни приоритета**: `HIGH`, `MEDIUM`, `LOW`
- **Формат даты**: YYYY-MM-DD
- **Формат задачи**: `[STATUS] [PRIORITY] Название задачи - Описание (Добавлено: YYYY-MM-DD)`
- **Структура модулей**: Каждый модуль должен иметь четко разделенные пункты меню и задачи
- **Обновление**: Всегда обновляйте статус и добавляйте комментарии при внесении изменений
- **Для разработчиков**: Проверяйте задачи со статусом `TODO` или `IN_PROGRESS` для немедленной работы
- **Для AI-агентов**: Используйте этот документ для понимания структуры проекта и текущих приоритетов

---

## Project Overview / Обзор проекта

### EN: Project Description

B2B Platform for Supply Chain Management - A comprehensive React application serving multiple user roles (customers,
suppliers, logistics operators, warehouse managers) with integrated order management, warehouse operations, logistics
coordination, and financial transactions.

### RU: Описание проекта

B2B платформа для управления цепочками поставок - комплексное React приложение, обслуживающее несколько ролей
пользователей (клиенты, поставщики, логистические операторы, менеджеры складов) с интегрированным управлением заказами,
складскими операциями, логистической координацией и финансовыми транзакциями.

---

## User Roles & Access / Роли пользователей и доступ

### Company Registration & Verification Flow / Процесс регистрации и верификации компании

#### EN: Registration and Verification Process

1. **Initial Registration**: User provides company details (Tax ID, country, company name, contact info)
2. **Automatic Validation**: System validates Tax ID format and checks basic company information
3. **Document Upload**: User uploads required verification documents (business license, tax certificate, etc.)
4. **Pending Status**: User becomes "Unverified Manager" with limited access to verification status page only
5. **Manual Review**: Administrator reviews submitted documents
6. **Verification Complete**: Upon approval, user becomes "Manager" (main company manager) with full access
7. **Team Building**: Manager can create employee accounts (Order Managers, Warehouse Managers, Department Managers)

#### RU: Процесс регистрации и верификации

1. **Первичная регистрация**: Пользователь предоставляет данные компании (Tax ID, страна, название компании, контактная
   информация)
2. **Автоматическая проверка**: Система проверяет формат Tax ID и базовую информацию о компании
3. **Загрузка документов**: Пользователь загружает необходимые документы для верификации (бизнес-лицензия, налоговый
   сертификат и т.д.)
4. **Статус ожидания**: Пользователь получает статус "Неподтвержденный менеджер" с ограниченным доступом только к
   странице статуса верификации
5. **Ручная проверка**: Администратор проверяет поданные документы
6. **Завершение верификации**: После одобрения пользователь становится "Менеджером" (главный менеджер компании) с полным
   доступом
7. **Создание команды**: Менеджер может создавать аккаунты сотрудников (Менеджеры заказов, Управляющие складом, Зав.
   менеджеры)

### User Roles Hierarchy / Иерархия ролей пользователей

#### System Level / Системный уровень

- **System Administrator** / **Системный администратор**: Can create Logistics Operators and System Moderators / Может
  создавать логистических операторов и модераторов системы

#### Company Level / Уровень компании

- **Unverified Manager** / **Неподтвержденный менеджер**: Limited access to verification status page only / Ограниченный
  доступ только к странице статуса верификации
- **Manager (Main Company Manager)** / **Менеджер (Главный менеджер компании)**: Full company management access, can
  create employee accounts / Полный доступ к управлению компанией, может создавать аккаунты сотрудников
- **Order Manager** / **Менеджер заказов**: Order placement and tracking, supplier communication / Размещение и
  отслеживание заказов, коммуникация с поставщиками
- **Warehouse Manager** / **Управляющий складом**: Inventory control, receiving and shipping / Контроль запасов, прием и
  отгрузка
- **Department Manager** / **Зав. менеджер**: Departmental oversight and reporting / Надзор за отделом и отчетность

#### Service Providers / Поставщики услуг

- **Supplier** / **Поставщик**: Product catalog management, order fulfillment / Управление каталогом продуктов,
  выполнение заказов
- **Logistics Operator** / **Логистический оператор**: Carrier marketplace management, delivery coordination /
  Управление рынком перевозчиков, координация доставок
- **Carrier** / **Перевозчик**: Transportation services, quote management / Транспортные услуги, управление котировками

### Customer (Order Manager) / Клиент (Менеджер заказов)

- Order placement and tracking / Размещение и отслеживание заказов
- Supplier marketplace browsing / Просмотр рынка поставщиков
- Payment management / Управление платежами
- Communication with suppliers / Коммуникация с поставщиками

### Manager (Main Company Manager) / Менеджер (Главный менеджер компании)

- Full company management access / Полный доступ к управлению компанией
- Employee account creation and management / Создание и управление аккаунтами сотрудников
- Warehouse creation and management / Создание и управление складами
- Company settings and configuration / Настройки и конфигурация компании
- Financial oversight and reporting / Финансовый надзор и отчетность

### Unverified Manager / Неподтвержденный менеджер

- View verification status only / Только просмотр статуса верификации
- Upload additional verification documents / Загрузка дополнительных документов для верификации
- Basic profile management / Базовое управление профилем

### Warehouse Manager / Управляющий складом

- Inventory control / Контроль запасов
- Receiving and shipping / Прием и отгрузка
- Stock level monitoring / Мониторинг уровня запасов
- Warehouse staff coordination / Координация складского персонала

### Department Manager / Зав. менеджер

- Departmental oversight / Надзор за отделом
- Team performance monitoring / Мониторинг производительности команды
- Departmental reporting / Отчетность отдела
- Resource allocation / Распределение ресурсов

### Supplier / Поставщик

- Product catalog management / Управление каталогом продуктов
- Order fulfillment / Выполнение заказов
- Inventory management / Управление запасами

### Logistics Operator / Логистический оператор

- Carrier marketplace management / Управление рынком перевозчиков
- Delivery option recommendations / Рекомендации вариантов доставки
- Shipment coordination / Координация отгрузок
- Communication with carriers and clients / Коммуникация с перевозчиками и клиентами
- Cost optimization and carrier selection / Оптимизация затрат и выбор перевозчиков

### Carrier / Перевозчик

- Service registration and capabilities / Регистрация услуг и возможностей
- Quote management / Управление котировками
- Delivery scheduling / Планирование доставок
- Shipment tracking updates / Обновления отслеживания отгрузок
- Performance metrics monitoring / Мониторинг показателей производительности

### Warehouse Manager / Менеджер склада

- Inventory control / Контроль запасов
- Receiving and shipping / Прием и отгрузка
- Stock level monitoring / Мониторинг уровня запасов

### Administrator / Администратор

- User management / Управление пользователями
- System configuration / Конфигурация системы
- Analytics and reporting / Аналитика и отчетность

---

## Module Structure / Структура модулей

## 1. Authentication & User Management / Аутентификация и управление пользователями

### Menu Items / Пункты меню

- **EN**: Login, Register, Profile Settings, User Management (Admin), Role Assignment, Company Verification
- **RU**: Вход, Регистрация, Настройки профиля, Управление пользователями (Админ), Назначение ролей, Верификация
  компаний

### Tasks / Задачи

- [COMPLETED] [HIGH] Basic authentication implementation - Login/Register forms (Added: 2025-01-22)
- [TODO] [HIGH] Role-based access control - Implement middleware for route protection (Added: 2025-01-22)
- [TODO] [HIGH] Company registration workflow - Extended registration with Tax ID and country validation (Added:
  2025-07-22)
- [TODO] [HIGH] Document upload system - File upload for verification documents (Added: 2025-07-22)
- [TODO] [HIGH] Verification status page - Limited access page for unverified managers (Added: 2025-07-22)
- [TODO] [HIGH] Admin verification dashboard - Manual document review and approval system (Added: 2025-07-22)
- [TODO] [HIGH] Employee account creation - Manager interface for creating team member accounts (Added: 2025-07-22)
- [TODO] [MEDIUM] Tax ID validation service - Integration with government databases for company verification (Added:
  2025-07-22)
- [TODO] [MEDIUM] Multi-factor authentication - Add 2FA for enhanced security (Added: 2025-01-22)
- [TODO] [MEDIUM] Session management - Implement session timeout and refresh (Added: 2025-01-22)
- [TODO] [MEDIUM] Email verification workflow - Email confirmation for new registrations (Added: 2025-07-22)
- [TODO] [LOW] Social login integration - Google, Microsoft OAuth (Added: 2025-01-22)
- [TODO] [LOW] Automated compliance checks - Integration with business registry APIs (Added: 2025-07-22)

## 1.1. Company Verification System / Система верификации компаний

### Menu Items / Пункты меню

- **EN**: Verification Status, Document Upload, Company Details, Verification History, Resubmission
- **RU**: Статус верификации, Загрузка документов, Данные компании, История верификации, Повторная подача

### Verification Document Types / Типы документов для верификации

#### Required Documents / Обязательные документы

- **Business Registration Certificate** / **Свидетельство о регистрации бизнеса**
- **Tax Registration Certificate** / **Свидетельство о налоговой регистрации**
- **Company Articles of Incorporation** / **Устав компании**
- **Authorized Representative ID** / **Удостоверение личности уполномоченного представителя**

#### Additional Documents (if applicable) / Дополнительные документы (при необходимости)

- **Import/Export License** / **Лицензия на импорт/экспорт**
- **Industry-specific Permits** / **Отраслевые разрешения**
- **Bank Account Verification** / **Подтверждение банковского счета**
- **Insurance Certificates** / **Страховые сертификаты**

### Verification Statuses / Статусы верификации

1. **PENDING_DOCUMENTS** / **ОЖИДАНИЕ_ДОКУМЕНТОВ**: Initial registration completed, waiting for document upload
2. **DOCUMENTS_SUBMITTED** / **ДОКУМЕНТЫ_ПОДАНЫ**: Documents uploaded, waiting for review
3. **UNDER_REVIEW** / **НА_ПРОВЕРКЕ**: Manual review in progress
4. **ADDITIONAL_INFO_REQUIRED** / **ТРЕБУЕТСЯ*ДОПОЛНИТЕЛЬНАЯ*ИНФОРМАЦИЯ**: More documents or clarification needed
5. **APPROVED** / **ОДОБРЕНО**: Verification successful, full access granted
6. **REJECTED** / **ОТКЛОНЕНО**: Verification failed, resubmission required

### Tasks / Задачи

- [TODO] [HIGH] Document upload interface - Drag-and-drop file upload with validation (Added: 2025-07-22)
- [TODO] [HIGH] Verification status dashboard - Real-time status tracking for users (Added: 2025-07-22)
- [TODO] [HIGH] Admin review interface - Document viewer and approval workflow for administrators (Added: 2025-07-22)
- [TODO] [HIGH] Notification system - Email/SMS notifications for status changes (Added: 2025-07-22)
- [TODO] [MEDIUM] Document validation - Automated checks for document format and completeness (Added: 2025-07-22)
- [TODO] [MEDIUM] Resubmission workflow - Process for rejected applications (Added: 2025-07-22)
- [TODO] [MEDIUM] Audit trail - Complete history of verification process (Added: 2025-07-22)
- [TODO] [LOW] Integration with external verification services - Third-party document validation (Added: 2025-07-22)

## 1.2. Employee Management System / Система управления сотрудниками

### Menu Items / Пункты меню

- **EN**: Team Overview, Create Employee, Role Assignment, Access Control, Performance Tracking
- **RU**: Обзор команды, Создать сотрудника, Назначение ролей, Контроль доступа, Отслеживание производительности

### Employee Creation Workflow / Процесс создания сотрудников

#### Available Roles for Manager Creation / Доступные роли для создания менеджером

1. **Order Manager** / **Менеджер заказов**: Order processing and supplier communication
2. **Warehouse Manager** / **Управляющий складом**: Inventory and warehouse operations
3. **Department Manager** / **Зав. менеджер**: Departmental oversight and coordination

#### Employee Onboarding Process / Процесс введения в должность сотрудников

1. **Account Creation** / **Создание аккаунта**: Manager creates employee account with basic details
2. **Role Assignment** / **Назначение роли**: Specific role and permissions assignment
3. **Invitation Email** / **Приглашение по email**: Employee receives setup instructions
4. **Profile Completion** / **Завершение профиля**: Employee completes personal details and password setup
5. **Training Assignment** / **Назначение обучения**: Role-specific training materials and certification
6. **Access Activation** / **Активация доступа**: Full system access granted upon completion

### Tasks / Задачи

- [TODO] [HIGH] Employee creation interface - Form for creating new employee accounts (Added: 2025-07-22)
- [TODO] [HIGH] Role-based permissions matrix - Granular access control system (Added: 2025-07-22)
- [TODO] [HIGH] Employee invitation system - Email invitations with onboarding workflow (Added: 2025-07-22)
- [TODO] [MEDIUM] Team overview dashboard - Employee status and performance monitoring (Added: 2025-07-22)
- [TODO] [MEDIUM] Employee profile management - Self-service profile updates and preferences (Added: 2025-07-22)
- [TODO] [MEDIUM] Access control management - Dynamic permission assignment and revocation (Added: 2025-07-22)
- [TODO] [LOW] Employee performance tracking - KPIs and performance metrics per role (Added: 2025-07-22)
- [TODO] [LOW] Training module integration - Role-specific training and certification tracking (Added: 2025-07-22)

## 2. Dashboard & Analytics / Панель управления и аналитика

### Menu Items / Пункты меню

- **EN**: Dashboard, Reports, Analytics, Performance Metrics, KPI Monitoring
- **RU**: Панель управления, Отчеты, Аналитика, Метрики производительности, Мониторинг KPI

### Tasks / Задачи

- [TODO] [HIGH] Main dashboard implementation - Role-specific dashboard views (Added: 2025-01-22)
- [TODO] [HIGH] Real-time data integration - WebSocket connections for live updates (Added: 2025-01-22)
- [TODO] [MEDIUM] Charts and graphs - Data visualization components (Added: 2025-01-22)
- [TODO] [MEDIUM] Report generation - PDF/Excel export functionality (Added: 2025-01-22)
- [TODO] [LOW] Custom dashboard widgets - Drag-and-drop dashboard customization (Added: 2025-01-22)

## 3. Order Management / Управление заказами

### Menu Items / Пункты меню

- **EN**: Create Order, Order History, Order Tracking, Order Approval, Bulk Orders
- **RU**: Создать заказ, История заказов, Отслеживание заказов, Подтверждение заказов, Массовые заказы

### Tasks / Задачи

- [TODO] [HIGH] Order creation workflow - Multi-step order form with validation (Added: 2025-01-22)
- [TODO] [HIGH] Order status tracking - Real-time status updates with notifications (Added: 2025-01-22)
- [TODO] [HIGH] Order approval system - Multi-level approval workflow (Added: 2025-01-22)
- [TODO] [MEDIUM] Bulk order processing - CSV import/export functionality (Added: 2025-01-22)
- [TODO] [MEDIUM] Order templates - Save and reuse order configurations (Added: 2025-01-22)
- [TODO] [LOW] Order analytics - Performance metrics and insights (Added: 2025-01-22)

## 4. Warehouse Creation & Management / Создание и управление складами

### Menu Items / Пункты меню

- **EN**: Warehouse Directory, Create Warehouse, Warehouse Settings, Location Management, Staff Assignment, Performance
  Analytics
- **RU**: Каталог складов, Создать склад, Настройки склада, Управление локациями, Назначение персонала, Аналитика
  производительности

### Warehouse Creation Workflow / Процесс создания склада

#### EN: Warehouse Setup Process

1. **Basic Information**: Warehouse name, type, description
2. **Location Details**: Address, GPS coordinates, timezone
3. **Capacity Configuration**: Storage zones, capacity limits, special storage requirements
4. **Staff Assignment**: Assign warehouse managers and operational staff
5. **Equipment Setup**: Configure handling equipment, security systems, IT infrastructure
6. **Integration Setup**: Connect with inventory management, WMS systems
7. **Operational Testing**: Test receiving, storage, and shipping processes
8. **Go-Live**: Activate warehouse for operations

#### RU: Процесс настройки склада

1. **Базовая информация**: Название склада, тип, описание
2. **Детали локации**: Адрес, GPS координаты, часовой пояс
3. **Конфигурация мощности**: Зоны хранения, лимиты мощности, особые требования к хранению
4. **Назначение персонала**: Назначение управляющих складом и операционного персонала
5. **Настройка оборудования**: Конфигурация погрузочного оборудования, систем безопасности, ИТ-инфраструктуры
6. **Настройка интеграции**: Подключение к системам управления запасами, WMS системам
7. **Операционное тестирование**: Тестирование процессов приема, хранения и отгрузки
8. **Запуск**: Активация склада для операций

### Warehouse Types / Типы складов

- **Distribution Center** / **Распределительный центр**: Large-scale distribution operations
- **Regional Warehouse** / **Региональный склад**: Regional storage and distribution
- **Local Depot** / **Местное депо**: Last-mile distribution point
- **Specialized Storage** / **Специализированное хранение**: Temperature-controlled, hazardous materials, etc.
- **Cross-Dock Facility** / **Кросс-док терминал**: Direct transfer operations

### Tasks / Задачи

- [TODO] [HIGH] Warehouse creation interface - Multi-step warehouse setup wizard (Added: 2025-07-22)
- [TODO] [HIGH] Location management system - GPS integration and address validation (Added: 2025-07-22)
- [TODO] [HIGH] Capacity planning tools - Storage zone configuration and capacity calculations (Added: 2025-07-22)
- [TODO] [HIGH] Staff assignment interface - Assign managers and operational staff to warehouses (Added: 2025-07-22)
- [TODO] [MEDIUM] Warehouse performance dashboard - KPIs, utilization rates, operational metrics (Added: 2025-07-22)
- [TODO] [MEDIUM] Equipment management - Track and manage warehouse equipment and assets (Added: 2025-07-22)
- [TODO] [MEDIUM] Integration management - Connect with external WMS and inventory systems (Added: 2025-07-22)
- [TODO] [LOW] Warehouse analytics - Predictive analytics for capacity planning and optimization (Added: 2025-07-22)

## 5. Inventory & Warehouse Operations / Управление запасами и складскими операциями

### Menu Items / Пункты меню

- **EN**: Inventory Overview, Stock Levels, Warehouse Locations, Receiving, Shipping, Stock Alerts
- **RU**: Обзор запасов, Уровни запасов, Расположения складов, Прием, Отгрузка, Уведомления о запасах

### Tasks / Задачи

- [TODO] [HIGH] Inventory tracking system - Real-time stock level monitoring (Added: 2025-01-22)
- [TODO] [HIGH] Warehouse location management - Multi-location inventory tracking (Added: 2025-01-22)
- [TODO] [HIGH] Automatic reorder alerts - Low stock notifications and suggestions (Added: 2025-01-22)
- [TODO] [MEDIUM] Receiving workflow - Goods receipt and quality control (Added: 2025-01-22)
- [TODO] [MEDIUM] Shipping management - Pick, pack, and ship processes (Added: 2025-01-22)
- [TODO] [LOW] Inventory forecasting - Demand prediction algorithms (Added: 2025-01-22)

## 6. Supplier & Marketplace / Поставщики и торговая площадка

### Menu Items / Пункты меню

- **EN**: Supplier Directory, Product Catalog, Supplier Ratings, Contract Management, Bidding System
- **RU**: Каталог поставщиков, Каталог продуктов, Рейтинги поставщиков, Управление контрактами, Система торгов

### Tasks / Задачи

- [TODO] [HIGH] Supplier registration - Onboarding workflow for new suppliers (Added: 2025-01-22)
- [TODO] [HIGH] Product catalog management - Rich product information with images (Added: 2025-01-22)
- [TODO] [HIGH] Bidding system implementation - Open procurement requests (Added: 2025-01-22)
- [TODO] [MEDIUM] Supplier rating system - Reviews and performance metrics (Added: 2025-01-22)
- [TODO] [MEDIUM] Contract management - Digital contract creation and signing (Added: 2025-01-22)
- [TODO] [LOW] Supplier analytics - Performance tracking and insights (Added: 2025-01-22)

## 7. Logistics & Carrier Management / Логистика и управление перевозчиками

### Menu Items / Пункты меню

- **EN**: Carrier Directory, Delivery Options, Shipment Tracking, Cost Calculator, Carrier Performance, Delivery
  Requests
- **RU**: Каталог перевозчиков, Варианты доставки, Отслеживание отгрузок, Калькулятор стоимости, Производительность
  перевозчиков, Запросы на доставку

### Logistics Workflow / Логистический процесс

#### EN: Outsourced Delivery Process

1. **Order Analysis**: System analyzes order parameters (weight, dimensions, destination, urgency)
2. **Carrier Matching**: AI algorithm suggests suitable carriers based on cargo specifications
3. **Quote Comparison**: Multiple carriers provide quotes automatically through API integration
4. **Logistician Review**: Logistics operator reviews and selects optimal delivery option
5. **Booking Coordination**: Logistician coordinates pickup/delivery with selected carrier
6. **Communication Hub**: Central communication between customers, suppliers, and carriers
7. **Tracking & Updates**: Real-time shipment tracking with status updates to all parties

#### RU: Процесс аутсорсинговой доставки

1. **Анализ заказа**: Система анализирует параметры заказа (вес, размеры, пункт назначения, срочность)
2. **Подбор перевозчиков**: ИИ-алгоритм предлагает подходящих перевозчиков на основе характеристик груза
3. **Сравнение предложений**: Несколько перевозчиков автоматически предоставляют расценки через API-интеграцию
4. **Проверка логистом**: Логистический оператор проверяет и выбирает оптимальный вариант доставки
5. **Координация бронирования**: Логист координирует забор/доставку с выбранным перевозчиком
6. **Центр коммуникации**: Централизованная связь между клиентами, поставщиками и перевозчиками
7. **Отслеживание и обновления**: Отслеживание отгрузки в реальном времени с обновлениями статуса для всех сторон

### Carrier Types & Selection Criteria / Типы перевозчиков и критерии выбора

#### Small Packages (< 20kg) / Малые посылки (< 20кг)

- Express couriers (DHL, FedEx, UPS) / Экспресс-курьеры
- Local delivery services / Местные службы доставки
- Postal services / Почтовые службы

#### Medium Cargo (20-1000kg) / Средний груз (20-1000кг)

- LTL (Less Than Truckload) carriers / Сборные грузы
- Regional freight companies / Региональные грузовые компании
- Specialized equipment carriers / Перевозчики со специализированным оборудованием

#### Large Cargo (> 1000kg) / Крупный груз (> 1000кг)

- FTL (Full Truckload) carriers / Полнозагрузные перевозки
- Heavy haul specialists / Специалисты по тяжелым грузам
- Intermodal transportation / Интермодальные перевозки

#### Special Requirements / Особые требования

- Temperature-controlled transport / Транспорт с температурным режимом
- Hazardous materials carriers / Перевозчики опасных материалов
- Oversized cargo specialists / Специалисты по негабаритным грузам

### Tasks / Задачи

- [TODO] [HIGH] Carrier registration system - Onboarding workflow for transport companies (Added: 2025-07-22)
- [TODO] [HIGH] Smart carrier recommendation - AI-powered carrier selection based on cargo parameters (Added:
  2025-07-22)
- [TODO] [HIGH] Automated quote collection - API integration with major carriers for instant quotes (Added: 2025-07-22)
- [TODO] [HIGH] Delivery option comparison - Side-by-side comparison of carrier offers (Added: 2025-07-22)
- [TODO] [HIGH] Shipment booking system - Streamlined booking process with selected carriers (Added: 2025-07-22)
- [TODO] [HIGH] Multi-party communication hub - Centralized messaging for all stakeholders (Added: 2025-07-22)
- [TODO] [MEDIUM] Carrier performance tracking - KPIs for delivery time, damage rates, customer satisfaction (Added:
  2025-07-22)
- [TODO] [MEDIUM] Real-time shipment tracking - Integration with carrier tracking APIs (Added: 2025-07-22)
- [TODO] [MEDIUM] Cost optimization algorithms - Dynamic pricing and route optimization suggestions (Added: 2025-07-22)
- [TODO] [MEDIUM] Delivery time predictions - ML-based estimated delivery time calculations (Added: 2025-07-22)
- [TODO] [MEDIUM] Insurance and liability management - Cargo insurance options and claims processing (Added: 2025-07-22)
- [TODO] [LOW] Carrier rating system - Customer feedback and performance ratings (Added: 2025-07-22)
- [TODO] [LOW] Advanced analytics - Delivery performance insights and optimization recommendations (Added: 2025-07-22)
- [TODO] [LOW] Mobile carrier app - Dedicated mobile app for carrier partners (Added: 2025-07-22)

## 8. Financial Management & Payments / Финансовое управление и платежи

### Menu Items / Пункты меню

- **EN**: Invoicing, Payment Processing, Financial Reports, Credit Management, Payment History
- **RU**: Выставление счетов, Обработка платежей, Финансовые отчеты, Управление кредитами, История платежей

### Tasks / Задачи

- [TODO] [HIGH] Invoice generation - Automated invoice creation from orders (Added: 2025-01-22)
- [TODO] [HIGH] Payment integration - Stripe/PayPal integration for online payments (Added: 2025-01-22)
- [TODO] [HIGH] Credit management - Customer credit limits and terms (Added: 2025-01-22)
- [TODO] [MEDIUM] Payment tracking - Payment status monitoring and reminders (Added: 2025-01-22)
- [TODO] [MEDIUM] Financial reporting - Revenue, expenses, and profit analysis (Added: 2025-01-22)
- [TODO] [LOW] Tax calculation - Automated tax computation for different regions (Added: 2025-01-22)

## 9. Communication & Chat / Коммуникация и чат

### Menu Items / Пункты меню

- **EN**: Messages, Chat Rooms, Notifications, Document Sharing, Video Calls
- **RU**: Сообщения, Чат-комнаты, Уведомления, Обмен документами, Видеозвонки

### Tasks / Задачи

- [TODO] [HIGH] Real-time chat system - WebSocket-based messaging (Added: 2025-01-22)
- [TODO] [HIGH] Notification system - Email, SMS, and in-app notifications (Added: 2025-01-22)
- [TODO] [MEDIUM] File sharing - Document and image sharing in chat (Added: 2025-01-22)
- [TODO] [MEDIUM] Chat rooms - Group conversations for projects/orders (Added: 2025-01-22)
- [TODO] [LOW] Video conferencing - Integrated video call functionality (Added: 2025-01-22)
- [TODO] [LOW] Translation services - Multi-language chat support (Added: 2025-01-22)

## 11. Carrier Management Portal / Портал управления перевозчиками

### Menu Items / Пункты меню

- **EN**: Carrier Registration, Service Catalog, Quote Management, Delivery Schedule, Performance Dashboard, Payment
  History
- **RU**: Регистрация перевозчика, Каталог услуг, Управление котировками, График доставок, Панель производительности,
  История платежей

### Tasks / Задачи

- [TODO] [HIGH] Carrier onboarding workflow - Registration process with document verification (Added: 2025-07-22)
- [TODO] [HIGH] Service capability matrix - Define transportation services and coverage areas (Added: 2025-07-22)
- [TODO] [HIGH] Dynamic pricing engine - Automated quote generation based on parameters (Added: 2025-07-22)
- [TODO] [MEDIUM] Capacity management - Real-time vehicle availability and scheduling (Added: 2025-07-22)
- [TODO] [MEDIUM] Performance dashboard - KPIs, ratings, and improvement suggestions (Added: 2025-07-22)
- [TODO] [MEDIUM] Payment integration - Automated invoicing and payment processing for carriers (Added: 2025-07-22)
- [TODO] [LOW] Carrier mobile app - Mobile interface for drivers and dispatchers (Added: 2025-07-22)

## 10. Settings & Configuration / Настройки и конфигурация

### Menu Items / Пункты меню

- **EN**: System Settings, User Preferences, Integration Settings, Security Settings, Backup & Recovery
- **RU**: Системные настройки, Пользовательские предпочтения, Настройки интеграции, Настройки безопасности, Резервное
  копирование и восстановление

### Tasks / Задачи

- [TODO] [HIGH] User preference management - Language, timezone, notification settings (Added: 2025-01-22)
- [TODO] [MEDIUM] System configuration - Global system parameters (Added: 2025-01-22)
- [TODO] [MEDIUM] Integration settings - API configurations for external services (Added: 2025-01-22)
- [TODO] [MEDIUM] Security settings - Password policies, session management (Added: 2025-01-22)
- [TODO] [LOW] Backup configuration - Automated backup scheduling (Added: 2025-01-22)

---

## CODING GUIDELINES AND STANDARDS / СТАНДАРТЫ И ПРИНЦИПЫ РАЗРАБОТКИ

### EN: Development Standards

This section outlines the coding standards, architectural patterns, and best practices that MUST be followed when
working on this project. These guidelines are based on the current tech stack and project structure.

### RU: Стандарты разработки

Данный раздел описывает стандарты кодирования, архитектурные паттерны и лучшие практики, которые ДОЛЖНЫ соблюдаться при
работе над проектом. Эти рекомендации основаны на текущем техническом стеке и структуре проекта.

---

## Tech Stack Overview / Обзор технического стека

### Core Technologies / Основные технологии

- **Frontend Framework**: React 19.0.0 with TypeScript 5.7.2
- **Build Tool**: Vite 6.1.0
- **Routing**: TanStack Router v1.121.2 (File-based routing)
- **State Management**: Zustand 5.0.6
- **Data Fetching**: TanStack Query v5.83.0 (React Query)
- **Forms**: TanStack Form v1.14.1 + React Hook Form 7.60.0
- **Validation**: Zod 3.25.76
- **Styling**: TailwindCSS 4.0.6
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React 0.476.0
- **Internationalization**: i18next 25.3.2
- **Testing**: Vitest 3.0.5
- **Code Quality**: ESLint 9.31.0 + Prettier 3.6.2

### API Integration / Интеграция API

- **HTTP Client**: openapi-fetch 0.14.0
- **Type Generation**: openapi-typescript 7.8.0
- **Authentication**: JWT with jose 6.0.12

---

## Component Architecture / Архитектура компонентов

### 1. Component Reusability / Переиспользование компонентов

**RULE**: Always check existing components before creating new ones / Всегда проверяйте существующие компоненты перед
созданием новых

#### Component Hierarchy / Иерархия компонентов

1. **Base UI Components** (`/src/components/ui/`):
    - Use Shadcn/ui components as foundation
    - Already available: Button, Card, Input, Select, Dialog, etc.
    - DO NOT create custom versions unless absolutely necessary

2. **Reusable Business Components** (`/src/components/`):
    - Create generic components that can be used across multiple features
    - Examples: `LoadingSpinner`, `ErrorBoundary`, `LanguageSwitcher`

3. **Feature-Specific Components** (`/src/components/[feature]/`):
    - Components specific to a business domain
    - Examples: `auth/`, `forms/`

4. **One-time Components**:
    - AVOID creating single-use components
    - If needed, make them generic for future reuse

#### Adding New UI Components / Добавление новых UI компонентов

```bash
# Use Shadcn CLI to add components
pnpx shadcn@latest add [component-name]
```

### 2. Component Structure / Структура компонентов

```tsx
// Component file structure example
import { ComponentProps } from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// Props interface (if needed for internal component logic only)
interface ComponentNameProps extends ComponentProps<'div'> {
  variant?: 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Brief description of what this component does
 * @param variant - Component visual variant
 * @param size - Component size
 */
export function ComponentName({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'destructive' && 'destructive-classes',
        size === 'sm' && 'small-classes',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## Data Types and API Integration / Типы данных и интеграция API

### 1. Type Management / Управление типами

**CRITICAL RULE**: Never create custom interface or types for API data / Никогда не создавайте собственные интерфейсы
или типы для API данных

#### Auto-Generated Types / Автоматически генерируемые типы

- All API types MUST be auto-generated in `/src/types/api.ts`
- Use `pnpm generate:paths` command to update API types
- Generated from OpenAPI specification at `http://localhost:8888/v3/api-docs/aggregated`

#### When API Types Are Missing / Когда API типы отсутствуют

If required types don't exist in `/src/types/api.ts`:

1. **Document the requirement** in this guidelines.md file
2. **Add to the appropriate section** (Backend Tasks)
3. **Stop current work session** until backend provides the endpoint
4. **Format**:

```markdown
### Required API Endpoints / Требуемые API эндпоинты

- [BLOCKED] [HIGH] `POST /api/companies/register` - Company registration endpoint with Tax ID validation
- [BLOCKED] [HIGH] `GET /api/users/profile` - User profile data with company information
```

### 2. Type Import Patterns / Паттерны импорта типов

```tsx
// Correct way to import API types
import type { UserProfile, CompanyDetails } from '@/types/api';

// Use for internal component logic only
interface LocalComponentState {
  isLoading: boolean;
  error: string | null;
}
```

---

## Styling Guidelines / Руководство по стилизации

### 1. TailwindCSS Usage / Использование TailwindCSS

**Primary styling method**: TailwindCSS classes
**Utility**: `cn()` function for conditional classes from `/src/lib/utils`

```tsx
// Correct usage
import { cn } from '@/lib/utils';

<div
  className={cn(
    'flex items-center justify-between p-4 rounded-lg border',
    isActive && 'bg-primary text-primary-foreground',
    disabled && 'opacity-50 pointer-events-none',
    className
  )}
/>;
```

### 2. Design System / Система дизайна

- **Color Palette**: Defined in `/src/styles.css` with CSS custom properties
- **Spacing**: Use Tailwind spacing scale (4px base unit)
- **Typography**: System font stack defined in `/src/styles.css`
- **Radius**: Consistent border radius using `--radius` custom property

### 3. Component Variants / Варианты компонентов

Use `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## Icons and Assets / Иконки и ассеты

### 1. Icon Library / Библиотека иконок

**Primary Source**: Lucide React (already installed)

```tsx
// Correct icon usage
import { Camera, ChevronRight, Settings } from 'lucide-react';

// In component
<Settings className='h-4 w-4' />;
```

### 2. Icon Guidelines / Руководство по иконкам

- **Default size**: `h-4 w-4` (16px)
- **Consistent sizing**: Use Tailwind size classes
- **Accessibility**: Always provide meaningful context

```tsx
// Good example
<Button>
  <Settings className="h-4 w-4 mr-2" />
  Settings
</Button>

// With accessibility
<Button aria-label="Open settings">
  <Settings className="h-4 w-4" />
</Button>
```

---

## Data Fetching / Получение данных

### 1. TanStack Query (React Query) / TanStack Query

**Primary method** for API calls and caching

#### Query Structure / Структура запросов

```tsx
// /src/queries/[feature].queries.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from '@/service/api/apiClient';
import type {UserProfile} from '@/types/api';

// Query hooks
export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: () => apiClient.GET('/api/users/profile'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Mutation hooks
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserProfile>) => apiClient.PUT('/api/users/profile', {body: data}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user', 'profile']});
        },
    });
};
```

### 2. API Client / API клиент

Use `openapi-fetch` for type-safe API calls:

```tsx
// /src/service/api/apiClient.ts
import createClient from 'openapi-fetch';
import type {paths} from '@/types/api';

export const apiClient = createClient<paths>({
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8888',
});
```

---

## State Management / Управление состоянием

### 1. Local State / Локальное состояние

- **React useState**: For component-level state
- **TanStack Form**: For form state management
- **TanStack Query**: For server state

### 2. Global State / Глобальное состояние

Use **Zustand** for client-side global state:

```tsx
// /src/service/auth/auth-store.ts
import { create } from 'zustand';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  login: user => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

---

## Routing / Маршрутизация

### 1. File-based Routing / Файловая маршрутизация

Using **TanStack Router** with file-based routing in `/src/routes/`

#### Route Structure / Структура маршрутов

```
src/routes/
├── __root.tsx              # Root layout
├── index.tsx               # Home page (/)
├── about.tsx               # About page (/about)
├── auth/
│   ├── login.tsx           # /auth/login
│   └── register.tsx        # /auth/register
└── dashboard/
    ├── route.tsx           # Dashboard layout
    ├── index.tsx           # /dashboard
    └── settings/
        └── route.tsx       # /dashboard/settings
```

#### Route Component Pattern / Паттерн компонентов маршрутов

```tsx
// Route file example
import {createFileRoute} from '@tanstack/react-router';
import {DashboardComponent} from '@/components/dashboard/DashboardComponent';

export const Route = createFileRoute('/dashboard')({
    component: DashboardComponent,
    loader: async () => {
        // Data loading logic
        return await fetchDashboardData();
    },
});
```

---

## Internationalization / Интернационализация

### 1. i18next Setup / Настройка i18next

Translation files located in `/public/locales/[lang]/translation.json`

```tsx
// Component usage
import {useTranslation} from 'react-i18next';

export function Component() {
    const {t} = useTranslation();

    return (
        <div>
            <h1>{t('menu.dashboard')}</h1>
            <p>{t('common.welcome', {name: user.name})}</p>
        </div>
    );
}
```

### 2. Translation Key Structure / Структура ключей перевода

```json
{
  "menu": {
    "dashboard": "Dashboard",
    "orders": "Orders",
    "settings": "Settings"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "errors": {
    "network": "Network error occurred",
    "validation": "Please check your input"
  }
}
```

---

## Form Management / Управление формами

### 1. Form Libraries / Библиотеки форм

**Primary**: TanStack Form with Zod validation

```tsx
import {useForm} from '@tanstack/react-form';
import {zodValidator} from '@tanstack/zod-form-adapter';
import {z} from 'zod';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export function LoginForm() {
    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({value}) => {
            // Submit logic
        },
        validatorAdapter: zodValidator,
        validators: {
            onChange: formSchema,
        },
    });

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            {/* Form fields */}
        </form>
    );
}
```

---

## Error Handling / Обработка ошибок

### 1. Error Boundaries / Границы ошибок

Use the existing `ErrorBoundary` component:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <ComponentThatMightThrow />
</ErrorBoundary>;
```

### 2. API Error Handling / Обработка ошибок API

```tsx
import { toast } from 'sonner';

const { mutate, isError, error } = useMutation({
  mutationFn: apiCall,
  onError: error => {
    toast.error(error.message || 'An error occurred');
  },
  onSuccess: () => {
    toast.success('Operation completed successfully');
  },
});
```

---

## Testing Guidelines / Руководство по тестированию

### 1. Testing Setup / Настройка тестирования

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **DOM Environment**: jsdom

### 2. Test Structure / Структура тестов

```tsx
import {render, screen} from '@testing-library/react';
import {expect, test} from 'vitest';
import {ComponentName} from './ComponentName';

test('renders component correctly', () => {
    render(<ComponentName/>);
    expect(screen.getByRole('button')).toBeInTheDocument();
});
```

---

## Code Quality / Качество кода

### 1. ESLint and Prettier / ESLint и Prettier

- **ESLint**: Configured with TypeScript, React, and import rules
- **Prettier**: Code formatting with specific rules
- **Husky**: Pre-commit hooks for code quality

### 2. Import Organization / Организация импортов

```tsx
// External libraries (React, third-party)
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal modules (with line break)
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/service/auth/auth-store';
import type { User } from '@/types/api';
```

### 3. Comments / Комментарии

**RULE**: Comments MUST be written in English only / Комментарии ДОЛЖНЫ быть написаны только на английском

```tsx
/**
 * Main dashboard component that displays user overview and quick actions
 * Handles authentication state and redirects unauthorized users
 */
export function Dashboard() {
  // Initialize auth state and check permissions
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    // Component JSX
  );
}
```

#### Comment Guidelines / Руководство по комментариям

- **Function/Class comments**: Use JSDoc format above functions and classes
- **Inline comments**: Brief explanations for complex logic
- **TODO comments**: Include ticket/issue reference when possible
- **Language**: English only, regardless of team nationality

---

## Performance Guidelines / Руководство по производительности

### 1. Component Optimization / Оптимизация компонентов

```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  return <ComplexVisualization data={data} onUpdate={onUpdate} />;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(rawData);
}, [rawData]);

// Use useCallback for event handlers
const handleUpdate = useCallback(
  (id: string) => {
    updateItem(id);
  },
  [updateItem]
);
```

### 2. Bundle Optimization / Оптимизация бандла

- **Lazy loading**: Use dynamic imports for routes
- **Tree shaking**: Import only needed functions
- **Code splitting**: Automatic with Vite

---

## Security Guidelines / Руководство по безопасности

### 1. Authentication / Аутентификация

```tsx
// JWT handling with jose library
import { jwtVerify } from 'jose';

// Secure token storage (use cookies, not localStorage)
import Cookies from 'js-cookie';

const token = Cookies.get('authToken');
```

### 2. Input Validation / Валидация ввода

```tsx
// Always validate inputs with Zod
const userInputSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

// Sanitize before display
const sanitizedContent = DOMPurify.sanitize(userContent);
```

---

## File Organization / Организация файлов

### 1. Directory Structure / Структура директорий

```
src/
├── components/           # Reusable components
│   ├── ui/              # Base UI components (Shadcn)
│   ├── auth/            # Authentication components
│   └── forms/           # Form components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── queries/             # TanStack Query hooks
├── routes/              # File-based routing
├── service/             # Business logic and API
│   ├── api/            # API clients
│   └── auth/           # Authentication logic
├── types/               # TypeScript type definitions
└── styles.css          # Global styles
```

### 2. File Naming / Именование файлов

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useUserData.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: kebab-case (`user-profile.types.ts`)

---

## Development Workflow / Рабочий процесс разработки

### 1. Development Commands / Команды разработки

```bash
# Development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check

# Testing
pnpm test

# Build
pnpm build
```

### 2. Pre-commit Checklist / Чек-лист перед коммитом

1. ✅ All TypeScript errors resolved
2. ✅ ESLint warnings addressed
3. ✅ Code formatted with Prettier
4. ✅ Tests passing
5. ✅ No console.log statements
6. ✅ Comments in English only
7. ✅ API types up to date

---

## Common Patterns / Общие паттерны

### 1. Loading States / Состояния загрузки

```tsx
import {LoadingSpinner} from '@/components/LoadingSpinner';

export function DataComponent() {
    const {data, isLoading, error} = useQuery({
        queryKey: ['data'],
        queryFn: fetchData,
    });

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>{/* Render data */}</div>;
}
```

### 2. Form Patterns / Паттерны форм

```tsx
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';

export function StandardForm() {
    return (
        <Form>
            <FormField
                name='email'
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} type='email'/>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <Button type='submit'>Submit</Button>
        </Form>
    );
}
```

### 3. Modal Patterns / Паттерны модальных окон

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
}
```

---

**This document serves as the primary reference for all development work on this project. Any deviation from these
guidelines must be discussed and approved by the team lead.**

**Данный документ служит основным справочником для всех работ по разработке этого проекта. Любые отклонения от этих
рекомендаций должны быть обсуждены и одобрены руководителем команды.**

---
