import { useState } from 'react';
import {
  Content,
  FormSelect,
  FormSelectOption,
  Gallery,
  GalleryItem,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { VirtualNetworkState } from '@osac/types';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import ResourceNameField from '@osac/ui-components/components/Resource/ResourceNameField.tsx';
import { SEARCH_PARAM, usePageFilter } from '@osac/ui-components/hooks/use-page-filter.ts';

import VirtualNetworkCard from './VirtualNetworkCard';
import {
  useNatGateways,
  useSecurityGroups,
  useSubnets,
  useVirtualNetworks,
} from '../../api/v1/networking';
import { VirtualNetworkCreateModal } from '../../components/networking/VirtualNetworkCreateModal';
import { VirtualNetworkStatusLabel } from '../../components/networking/VirtualNetworkStatusLabel';
import ListPage from '../../components/Page/ListPage';
import ListPageBody from '../../components/Page/ListPageBody';
import type { ViewType } from '../../components/Primitives/ViewSwitcher';
import {
  DEFAULT_VIEW_TYPE,
  getViewTypePrefKey,
  isViewType,
} from '../../components/Primitives/ViewSwitcher';
import ViewSwitcher from '../../components/Primitives/ViewSwitcher';
import { SubtleContent } from '../../components/SubtleContent/SubtleContent';
import { useUserPreferences } from '../../hooks/use-user-preferences';
import { useTranslation } from '../../hooks/useTranslation';

export const VIRTUAL_NETWORKS_VIEW_KEY = 'virtual-networks';
const STATUS_PARAM = 'status';

const STATUS_FILTER_OPTIONS = [
  { value: 'ready', state: VirtualNetworkState.READY },
  { value: 'pending', state: VirtualNetworkState.PENDING },
  { value: 'failed', state: VirtualNetworkState.FAILED },
] as const;

type StatusFilterValue = (typeof STATUS_FILTER_OPTIONS)[number]['value'];

const isStatusFilterValue = (value: string): value is StatusFilterValue =>
  STATUS_FILTER_OPTIONS.some((option) => option.value === value);

export const VirtualNetworksListPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = usePageFilter(SEARCH_PARAM);
  const [statusFilter, setStatusFilter] = usePageFilter(STATUS_PARAM);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewTypePref] = useUserPreferences(getViewTypePrefKey(VIRTUAL_NETWORKS_VIEW_KEY));
  const viewType: ViewType = isViewType(viewTypePref) ? viewTypePref : DEFAULT_VIEW_TYPE;

  const { data: virtualNetworks = [], isLoading, error } = useVirtualNetworks();
  const { data: allSubnets = [] } = useSubnets();
  const {
    data: allSecurityGroups = [],
    isLoading: isLoadingSecurityGroups,
    error: securityGroupsError,
  } = useSecurityGroups();
  const {
    natGatewaysByVirtualNetworkId,
    isLoading: isLoadingNatGateways,
    error: natGatewaysError,
  } = useNatGateways();

  const subnetCountByVN = allSubnets.reduce(
    (acc, subnet) => {
      const vnId = subnet.spec?.virtualNetwork?.id;
      if (vnId) {
        acc[vnId] = (acc[vnId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const securityGroupCountByVN = allSecurityGroups.reduce(
    (acc, securityGroup) => {
      const vnId = securityGroup.spec?.virtualNetwork?.id;
      if (vnId) {
        acc[vnId] = (acc[vnId] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const selectedStatus: StatusFilterValue | 'all' = isStatusFilterValue(statusFilter)
    ? statusFilter
    : 'all';
  const selectedStatusOption = STATUS_FILTER_OPTIONS.find(
    (option) => option.value === selectedStatus,
  );
  const filteredVNs = virtualNetworks.filter((vn) => {
    const name = vn.metadata?.name ?? '';
    const matchesStatus = !selectedStatusOption || vn.status?.state === selectedStatusOption.state;
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <ListPage
        title={t('Virtual networks')}
        description={t('Manage virtual networks for your compute instances.')}
        actions={
          <CreateButton onClick={() => setIsCreateModalOpen(true)}>
            {t('Create virtual network')}
          </CreateButton>
        }
      >
        <ListPageBody
          isLoading={isLoading || isLoadingNatGateways || isLoadingSecurityGroups}
          error={error ?? natGatewaysError ?? securityGroupsError}
        >
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <FormSelect
                    id="virtual-networks-status-filter"
                    value={selectedStatus}
                    onChange={(_event, value) => setStatusFilter(value === 'all' ? '' : value)}
                    aria-label={t('Filter virtual networks by status')}
                  >
                    <FormSelectOption value="all" label={t('All statuses')} />
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <FormSelectOption
                        key={option.value}
                        value={option.value}
                        label={
                          option.value === 'ready'
                            ? t('Ready')
                            : option.value === 'pending'
                              ? t('Provisioning')
                              : t('Failed')
                        }
                      />
                    ))}
                  </FormSelect>
                </ToolbarItem>
                <ToolbarItem>
                  <SearchInput
                    placeholder={t('Search virtual networks by name…')}
                    value={search}
                    onChange={(_e, v) => setSearch(v)}
                    onClear={() => setSearch('')}
                  />
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarGroup align={{ default: 'alignEnd' }}>
                <ToolbarItem>
                  <ViewSwitcher pageKey={VIRTUAL_NETWORKS_VIEW_KEY} />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
          {filteredVNs.length === 0 ? (
            <SubtleContent component="p">
              {search
                ? t('No virtual networks match your search.')
                : t('No virtual networks yet. Create one to get started.')}
            </SubtleContent>
          ) : viewType === 'cards' ? (
            <Gallery
              hasGutter
              minWidths={{ default: '20.875rem' }}
              maxWidths={{ default: '20.875rem' }}
            >
              {filteredVNs.map((vn) => {
                const natGatewayWithAddress = natGatewaysByVirtualNetworkId[vn.id];

                return (
                  <GalleryItem key={vn.id}>
                    <VirtualNetworkCard
                      virtualNetwork={vn}
                      subnetCount={subnetCountByVN[vn.id] || 0}
                      securityGroupCount={securityGroupCountByVN[vn.id] || 0}
                      natGateway={natGatewayWithAddress?.natGateway}
                      natGatewayAddress={natGatewayWithAddress?.address}
                    />
                  </GalleryItem>
                );
              })}
            </Gallery>
          ) : (
            <Table aria-label={t('Virtual networks')} variant="compact" borders>
              <Thead>
                <Tr>
                  <Th>{t('Name')}</Th>
                  <Th>{t('Status')}</Th>
                  <Th>{t('IPv4 CIDR')}</Th>
                  <Th>{t('IPv6 CIDR')}</Th>
                  <Th>{t('Subnets')}</Th>
                  <Th>{t('Security groups')}</Th>
                  <Th>{t('NAT gateway')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredVNs.map((vn) => {
                  const subnetCount = subnetCountByVN[vn.id] || 0;
                  const natGatewayWithAddress = natGatewaysByVirtualNetworkId[vn.id];
                  const natGateway = natGatewayWithAddress?.natGateway;
                  const address = natGatewayWithAddress?.address;

                  return (
                    <Tr key={vn.id}>
                      <Td dataLabel={t('Name')}>
                        <ResourceNameField
                          resource={vn}
                          detailsUrl={`/networking/virtual-networks/${vn.id}`}
                        />
                      </Td>
                      <Td dataLabel={t('Status')}>
                        <VirtualNetworkStatusLabel state={vn.status?.state} />
                      </Td>
                      <Td dataLabel={t('IPv4 CIDR')}>
                        <code>{vn.spec?.ipv4Cidr ?? '—'}</code>
                      </Td>
                      <Td dataLabel={t('IPv6 CIDR')}>
                        <code>{vn.spec?.ipv6Cidr ?? '—'}</code>
                      </Td>
                      <Td dataLabel={t('Subnets')}>{subnetCount}</Td>
                      <Td dataLabel={t('Security groups')}>{securityGroupCountByVN[vn.id] || 0}</Td>
                      <Td dataLabel={t('NAT gateway')}>
                        {natGateway ? (
                          <>
                            <Content component="p">
                              {natGateway.metadata?.name ?? natGateway.id}
                            </Content>
                            <Content component="p">
                              <code>{address ?? '—'}</code>
                            </Content>
                          </>
                        ) : (
                          <Content component="p">—</Content>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </ListPageBody>
      </ListPage>

      {isCreateModalOpen && (
        <VirtualNetworkCreateModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  );
};
