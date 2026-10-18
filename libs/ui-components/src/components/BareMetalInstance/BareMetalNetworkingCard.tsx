import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Flex, Label, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';
import NetworkWiredIcon from '@patternfly/react-icons/dist/esm/icons/network-wired-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ExternalIPAttachments } from '@osac/types';
import type { BareMetalInstance, ExternalIPAttachment } from '@osac/types';

import { type CelFilter, escapeCelStringLiteral } from '../../api/cel';
import { useListResource } from '../../api/use-resource';
import {
  resourceDisplayName,
  useSecurityGroups,
  useSubnets,
  useVirtualNetworks,
} from '../../api/v1/networking';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import { SubtleContent } from '../SubtleContent/SubtleContent';

interface Props {
  instance: BareMetalInstance;
}

const BareMetalNetworkingCard = ({ instance }: Props) => {
  const { t } = useTranslation();

  const { data: virtualNetworks = [], isLoading: vnLoading, error: vnError } = useVirtualNetworks();
  const { data: subnets = [], isLoading: subnetLoading, error: subnetError } = useSubnets();
  const { data: securityGroups = [], isLoading: sgLoading, error: sgError } = useSecurityGroups();

  const externalIpAttachmentFilter = useMemo((): CelFilter<ExternalIPAttachment> => {
    const id = escapeCelStringLiteral(instance.id);
    return `this.spec.baremetal_instance.id == "${id}"` as CelFilter<ExternalIPAttachment>;
  }, [instance.id]);

  const {
    data: externalIPAttachmentResponse,
    isLoading: eipaLoading,
    error: eipaError,
  } = useListResource(
    ExternalIPAttachments,
    { filter: externalIpAttachmentFilter },
    { enabled: Boolean(instance.spec?.autoExternalIpAttachment) },
  );
  const externalIPAttachments = externalIPAttachmentResponse?.items ?? [];

  const autoCreatedAttachment = externalIPAttachments.find(
    (eipa) => eipa.metadata?.labels?.['osac.openshift.io/auto-created'] === 'true',
  );

  const autoCreatedExternalIpAddress = autoCreatedAttachment?.status?.externalIpAddress;

  const attachmentRows = useMemo(() => {
    const networkAttachments = instance.spec?.networkAttachments ?? [];
    const networkAttachmentStatuses = instance.status?.networkAttachmentStatuses ?? [];

    return networkAttachments.map((attachment, index) => {
      const status = networkAttachmentStatuses[index];

      const subnet = subnets.find((s) => s.id === attachment.subnet?.id);
      const virtualNetworkId = subnet?.spec?.virtualNetwork?.id;
      const vn = virtualNetworks.find((v) => v.id === virtualNetworkId);
      const securityGroupLinks =
        attachment.securityGroups?.map((sg) => {
          const securityGroup = securityGroups.find((item) => item.id === sg.id);

          return {
            id: sg.id,
            name: resourceDisplayName(securityGroup?.metadata, sg.id),
          };
        }) ?? [];

      return {
        virtualNetwork: {
          id: virtualNetworkId,
          name: resourceDisplayName(vn?.metadata, virtualNetworkId),
        },
        subnet: {
          id: subnet?.id,
          name: resourceDisplayName(subnet?.metadata, subnet?.id),
        },
        securityGroups: securityGroupLinks,
        internalIp: status?.ipAddress || '—',
      };
    });
  }, [
    instance.spec?.networkAttachments,
    instance.status?.networkAttachmentStatuses,
    subnets,
    virtualNetworks,
    securityGroups,
  ]);

  const isLoading = vnLoading || subnetLoading || sgLoading || eipaLoading;
  const error = vnError || subnetError || sgError || eipaError;

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <NetworkWiredIcon aria-hidden />
          <Title headingLevel="h2" size="lg">
            {t('Networking')}
          </Title>
        </Flex>
      </StackItem>
      <StackItem>
        {isLoading ? (
          <Spinner />
        ) : (
          <Stack hasGutter>
            {error ? (
              <StackItem>
                <Alert variant="danger" title={t('Failed to load networking resources')} isInline>
                  {getErrorMessage(error)}
                </Alert>
              </StackItem>
            ) : null}

            <StackItem>
              {attachmentRows.length > 0 ? (
                <Table aria-label={t('Network attachments')} variant="compact" borders>
                  <Thead>
                    <Tr>
                      <Th>{t('Virtual network')}</Th>
                      <Th>{t('Subnet')}</Th>
                      <Th>{t('Security groups')}</Th>
                      <Th>{t('Internal IP')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {attachmentRows.map((row, index) => (
                      <Tr key={`network-attachment-${index}`}>
                        <Td dataLabel={t('Virtual network')}>
                          {row.virtualNetwork.id ? (
                            <Link
                              className="bm-details__network-link"
                              to={`/networking/virtual-networks/${encodeURIComponent(row.virtualNetwork.id)}`}
                            >
                              {row.virtualNetwork.name}
                            </Link>
                          ) : (
                            row.virtualNetwork.name
                          )}
                        </Td>
                        <Td dataLabel={t('Subnet')}>
                          {row.subnet.id && row.virtualNetwork.id ? (
                            <Link
                              className="bm-details__network-link"
                              to={`/networking/virtual-networks/${encodeURIComponent(row.virtualNetwork.id)}`}
                            >
                              {row.subnet.name}
                            </Link>
                          ) : (
                            row.subnet.name
                          )}
                        </Td>
                        <Td dataLabel={t('Security groups')}>
                          {row.securityGroups.length > 0
                            ? row.securityGroups.map((securityGroup, securityGroupIndex) => (
                                <span key={securityGroup.id}>
                                  {securityGroupIndex > 0 ? ', ' : null}
                                  {securityGroup.id ? (
                                    <Link
                                      className="bm-details__network-link"
                                      to={`/networking/security-groups/${encodeURIComponent(securityGroup.id)}`}
                                    >
                                      {securityGroup.name}
                                    </Link>
                                  ) : (
                                    securityGroup.name
                                  )}
                                </span>
                              ))
                            : '—'}
                        </Td>
                        <Td dataLabel={t('Internal IP')}>{row.internalIp}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <SubtleContent component="p">{t('No network attachments')}</SubtleContent>
              )}
            </StackItem>

            {autoCreatedExternalIpAddress ? (
              <StackItem>
                <Alert variant="info" title={t('External access')} isInline>
                  <p>
                    {t('External IP')}: <strong>{autoCreatedExternalIpAddress}</strong>{' '}
                    <Label color="blue">{t('Auto-provisioned')}</Label>
                  </p>
                </Alert>
              </StackItem>
            ) : null}
          </Stack>
        )}
      </StackItem>
    </Stack>
  );
};

export default BareMetalNetworkingCard;
