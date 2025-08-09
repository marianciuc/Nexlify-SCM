import {z} from 'zod';

// Company registration form schema with Tax ID validation
export const companyRegistrationSchema = z
    .object({
        // Personal Information
        firstName: z.string().min(1, 'forms.validation.required'),
        lastName: z.string().min(1, 'forms.validation.required'),
        email: z.string().email('forms.validation.email'),
        contactNumber: z.string().min(1, 'forms.validation.required'),

        // Authentication
        password: z.string().min(6, 'forms.validation.minLength'),
        confirmPassword: z.string().min(6, 'forms.validation.minLength'),

        // Company Information
        companyName: z.string().min(1, 'forms.validation.required'),
        companyTaxId: z.string().min(1, 'forms.validation.required'),
        country: z.string().min(1, 'forms.validation.required'),
        businessType: z.enum([
            'manufacturing',
            'retail',
            'wholesale',
            'distribution',
            'logistics',
            'other',
        ]),

        // Legal
        dataProcessingConsent: z.boolean().refine(val => val === true, {
            message: 'forms.validation.required',
        }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'auth.errors.passwordsDontMatch',
        path: ['confirmPassword'],
    });

// Verification status enum
export const VerificationStatus = {
    PENDING_DOCUMENTS: 'PENDING_DOCUMENTS',
    DOCUMENTS_SUBMITTED: 'DOCUMENTS_SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    ADDITIONAL_INFO_REQUIRED: 'ADDITIONAL_INFO_REQUIRED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

// User roles enum
export const UserRole = {
    CUSTOMER: 'customer',
    ORDER_MANAGER: 'orderManager',
    WAREHOUSE_MANAGER: 'warehouseManager',
    DEPARTMENT_MANAGER: 'departmentManager',
    MANAGER: 'manager',
    UNVERIFIED_MANAGER: 'unverifiedManager',
    SUPPLIER: 'supplier',
    LOGISTICIAN: 'logistician',
    CARRIER: 'carrier',
    ADMIN: 'admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Document types for verification
export const DocumentType = {
    BUSINESS_REGISTRATION: 'businessRegistration',
    TAX_REGISTRATION: 'taxRegistration',
    ARTICLES_OF_INCORPORATION: 'articlesOfIncorporation',
    AUTHORIZED_REPRESENTATIVE_ID: 'authorizedRepresentativeId',
    IMPORT_EXPORT_LICENSE: 'importExportLicense',
    INDUSTRY_PERMITS: 'industryPermits',
    BANK_ACCOUNT_VERIFICATION: 'bankAccountVerification',
    INSURANCE_CERTIFICATES: 'insuranceCertificates',
} as const;

export type DocumentTypeType = (typeof DocumentType)[keyof typeof DocumentType];

// Business types
export const BusinessType = {
    MANUFACTURING: 'manufacturing',
    RETAIL: 'retail',
    WHOLESALE: 'wholesale',
    DISTRIBUTION: 'distribution',
    LOGISTICS: 'logistics',
    OTHER: 'other',
} as const;

export type BusinessTypeType = (typeof BusinessType)[keyof typeof BusinessType];

export type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;
