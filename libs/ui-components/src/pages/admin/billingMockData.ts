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

/** Predicted provider billing model until billing accounts are exposed by the API. */
export const predictedBillingAccounts: BillingAccount[] = [
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
