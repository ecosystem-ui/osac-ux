import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Label,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import SyncIcon from '@patternfly/react-icons/dist/esm/icons/sync-icon';
import UsersIcon from '@patternfly/react-icons/dist/esm/icons/users-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Tenants } from '@osac/types/private';
import { useListResource } from '@osac/ui-components/api/use-resource';
import ListPage from '@osac/ui-components/components/Page/ListPage';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { type BillingAccount, predictedBillingAccounts } from './billingMockData';

import './BillingPage.css';

const accountStatusColor = (status: BillingAccount['accountStatus']) => {
  switch (status) {
    case 'Active':
      return 'green' as const;
    case 'Inactive':
      return 'orange' as const;
    default:
      return 'blue' as const;
  }
};

const approvalStatusColor = (status: BillingAccount['approvalStatus']) => {
  switch (status) {
    case 'Approved':
      return 'green' as const;
    case 'Rejected':
      return 'red' as const;
    default:
      return 'orange' as const;
  }
};

const BillingPage = () => {
  const { t } = useTranslation();
  const { data: tenantsResponse, error, isLoading } = useListResource(Tenants);
  const tenants = tenantsResponse?.items ?? [];
  const linkedAccounts = useMemo(
    () =>
      predictedBillingAccounts
        .filter((account) => account.externalId.trim())
        .sort((left, right) => left.accountName.localeCompare(right.accountName)),
    [],
  );
  const activeCount = predictedBillingAccounts.filter(
    (account) => account.accountStatus === 'Active',
  ).length;
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));

  return (
    <div className="admin-billing-page">
      <ListPage
        title={t('Billing')}
        label={t('Administration')}
        description={t(
          'Account status comes from M360. Linked tenants are billing accounts with an external ID set for OSAC.',
        )}
        actions={
          <a
            className="pf-v6-c-button pf-m-primary"
            href="https://m360.example.com/accounts"
            target="_blank"
            rel="noreferrer"
          >
            <span className="pf-v6-c-button__text">{t('Open M360 accounts')}</span>
            <span className="pf-v6-c-button__icon pf-m-end">
              <ExternalLinkAltIcon aria-hidden />
            </span>
          </a>
        }
      >
        <ListPageBody error={error} isLoading={isLoading}>
          <Alert
            className="admin-billing-page__alert"
            variant="info"
            isInline
            title={t('Account balances are not shown in OSAC')}
          >
            <Content component="p">
              {t('OSAC uses M360 for account status and tenant linking only.')}
            </Content>
          </Alert>

          <div className="admin-billing-page__kpi-grid">
            <Card isFullHeight>
              <CardHeader>
                <CardTitle>
                  <CheckCircleIcon aria-hidden /> {t('Active M360 accounts')}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h2" size="4xl" className="admin-billing-page__kpi-value">
                  {activeCount}
                </Title>
                <Content component="p" className="admin-billing-page__kpi-hint">
                  {t('Accounts with Active status in M360')}
                </Content>
              </CardBody>
            </Card>
            <Card isFullHeight>
              <CardHeader>
                <CardTitle>
                  <UsersIcon aria-hidden /> {t('Linked OSAC tenants')}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h2" size="4xl" className="admin-billing-page__kpi-value">
                  {linkedAccounts.length}
                </Title>
                <Content component="p" className="admin-billing-page__kpi-hint">
                  {t('M360 accounts with an external ID linked to OSAC')}
                </Content>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('Linked OSAC tenants')}</CardTitle>
            </CardHeader>
            <CardBody>
              <Toolbar className="admin-billing-page__table-toolbar">
                <ToolbarContent alignItems="center">
                  <ToolbarGroup>
                    <ToolbarItem>
                      <button className="pf-v6-c-button pf-m-secondary" type="button">
                        <span className="pf-v6-c-button__text">{t('Refresh')}</span>
                        <span className="pf-v6-c-button__icon pf-m-end">
                          <SyncIcon aria-hidden />
                        </span>
                      </button>
                    </ToolbarItem>
                  </ToolbarGroup>
                  <ToolbarGroup align={{ default: 'alignEnd' }}>
                    <ToolbarItem>
                      <Content component="p" className="admin-billing-page__table-meta">
                        {t('{{count}} linked tenants', { count: linkedAccounts.length })}
                      </Content>
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>

              {linkedAccounts.length === 0 ? (
                <Content component="p" className="admin-billing-page__empty">
                  {t('No billing accounts are linked to OSAC yet.')}
                </Content>
              ) : (
                <Table aria-label={t('Linked OSAC tenants')} variant="compact">
                  <Thead>
                    <Tr>
                      <Th>{t('Linked tenant')}</Th>
                      <Th>{t('Billing account')}</Th>
                      <Th>{t('Account number')}</Th>
                      <Th>{t('Status')}</Th>
                      <Th>{t('Approval')}</Th>
                      <Th>{t('External ID')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {linkedAccounts.map((account) => {
                      const tenant = account.tenantId
                        ? tenantById.get(account.tenantId)
                        : undefined;
                      const tenantName = tenant?.metadata?.name ?? account.externalId;

                      return (
                        <Tr
                          key={account.id}
                          className={
                            account.accountStatus === 'Inactive'
                              ? 'admin-billing-page__table-row--inactive'
                              : undefined
                          }
                        >
                          <Td dataLabel={t('Linked tenant')}>
                            {tenant ? (
                              <Link
                                className="admin-billing-page__table-tenant-link"
                                to={`/admin/tenants/${tenant.id}`}
                              >
                                {tenantName}
                              </Link>
                            ) : (
                              tenantName
                            )}
                          </Td>
                          <Td dataLabel={t('Billing account')}>
                            <a
                              className="admin-billing-page__table-account-link"
                              href={`https://m360.example.com/accounts/${account.accountName}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {account.accountName}
                            </a>
                          </Td>
                          <Td dataLabel={t('Account number')}>{account.accountNumber}</Td>
                          <Td dataLabel={t('Status')}>
                            <Label color={accountStatusColor(account.accountStatus)} isCompact>
                              {account.accountStatus}
                            </Label>
                          </Td>
                          <Td dataLabel={t('Approval')}>
                            <Label color={approvalStatusColor(account.approvalStatus)} isCompact>
                              {account.approvalStatus}
                            </Label>
                          </Td>
                          <Td dataLabel={t('External ID')}>{account.externalId}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </ListPageBody>
      </ListPage>
    </div>
  );
};

export default BillingPage;
