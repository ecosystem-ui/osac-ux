// MISSING: No billing account API in @osac/types yet.
// BillingAccount shape and fixture data are predicted from the M360 integration described in
// the OSAC architecture docs. Replace with generated types once the Billing service is available.

export type BillingAccountStatus = 'Active' | 'Inactive' | 'Pending';
export type BillingApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

export interface BillingAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  accountStatus: BillingAccountStatus;
  approvalStatus: BillingApprovalStatus;
  externalId: string;
  tenantId?: string;
}

export const MISSING_billingAccounts: BillingAccount[] = [
  {
    id: 'billing-acme-enterprise',
    accountName: 'acme-enterprise-billing',
    accountNumber: 'M360-10001',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: 'tenant-acme',
    tenantId: 'tenant-acme',
  },
  {
    id: 'billing-globex-enterprise',
    accountName: 'globex-enterprise-billing',
    accountNumber: 'M360-10002',
    accountStatus: 'Inactive',
    approvalStatus: 'Pending',
    externalId: 'tenant-globex',
    tenantId: 'tenant-globex',
  },
  {
    id: 'billing-north-summit',
    accountName: 'north-summit-bank-enterprise-billing',
    accountNumber: 'M360-10003',
    accountStatus: 'Active',
    approvalStatus: 'Approved',
    externalId: '',
  },
];
