import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import type { ComputeInstance } from '@osac/types';

import VmDetailsActionButtons from './VmDetailsActionButtons';
import VmNetworkingTab from './VmNetworkingTab';
import VmResizeModal from './VmResizeModal';
import VmStorageCard from './VmStorageCard';
import VmUserDataCard from './VmUserDataCard';
import VmUtilizationSection from './VmUtilizationSection';
import { useInstanceType } from '../../../api/v1/instance-types';
import { useTranslation } from '../../../hooks/useTranslation';
import { displayValue } from '../../../utils/detailFormatters';
import { getErrorMessage } from '../../../utils/error';
import { VmStatusLabel } from '../../../VmStatusLabel';
import { formatBootDiskSizeForReview } from '../../catalogProvision/wizard/catalogOverlay';
import { Timestamp } from '../../Primitives/Timestamp';
import { ResourceConditionsTable } from '../../Resource/ResourceConditionsTable';
import { ResourceDetailHeader } from '../../Resource/ResourceDetailHeader';
import VmConsoleTab from '../console/VmConsoleTab';

import './VmDetails.css';
import '../../shared/details-page.css';

interface Props {
  vm: ComputeInstance;
}

const VmDetails = ({ vm }: Props) => {
  const { t } = useTranslation();
  const [resizeOpen, setResizeOpen] = useState(false);
  const { data: instanceType, error: instanceTypeError } = useInstanceType(
    vm.spec?.instanceType?.id,
  );
  const conditions = vm.status?.conditions ?? [];
  const catalogItem = vm.spec?.catalogItem;
  const diskImage = vm.spec?.diskImage;
  const bootDisk = vm.spec?.bootDisk;

  return (
    <>
      <PageSection hasBodyWrapper={false} className="vm-details__header-section">
        <Stack hasGutter>
          {instanceTypeError ? (
            <StackItem>
              <Alert variant="danger" title={t('Could not load instance types')} isInline>
                {getErrorMessage(instanceTypeError)}
              </Alert>
            </StackItem>
          ) : null}
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
              flexWrap={{ default: 'wrap' }}
              spaceItems={{ default: 'spaceItemsMd' }}
            >
              <FlexItem>
                <ResourceDetailHeader
                  parentTo="/vms"
                  parentLabel={t('Virtual machines')}
                  resourceName={vm.metadata?.name ?? vm.id}
                  description={t(
                    'Review configuration, networking, and access for this virtual machine.',
                  )}
                  titleAddon={<VmStatusLabel state={vm.status?.state} />}
                  titleSize="3xl"
                />
              </FlexItem>
              <FlexItem>
                <VmDetailsActionButtons vm={vm} />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Divider className="vm-details__section-divider" />
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter className="details-page__content-grid">
          <GridItem md={8} className="details-page__column">
            <Stack hasGutter>
              <StackItem>
                <Grid hasGutter className="vm-details__overview-grid">
                  <GridItem md={6}>
                    <Title headingLevel="h2" size="md" className="vm-details__section-title">
                      {t('Overview')}
                    </Title>
                    <DescriptionList
                      isCompact
                      className="details-page__overview"
                      aria-label={t('Virtual machine overview')}
                    >
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Catalog item')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {catalogItem?.id ? (
                            <Link
                              className="vm-details__catalog-link"
                              to={`/vms/create/${encodeURIComponent(catalogItem.id)}`}
                            >
                              {displayValue(catalogItem.name || catalogItem.id)}
                            </Link>
                          ) : (
                            displayValue(undefined)
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Boot disk')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {bootDisk
                            ? `${formatBootDiskSizeForReview(bootDisk.sizeGib)}, ${displayValue(bootDisk.storageTier?.name || bootDisk.storageTier?.id)}`
                            : displayValue(undefined)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Flex
                            spaceItems={{ default: 'spaceItemsSm' }}
                            alignItems={{ default: 'alignItemsCenter' }}
                          >
                            <FlexItem>
                              {displayValue(instanceType?.metadata?.name || vm.spec?.instanceType?.id)}
                            </FlexItem>
                            <FlexItem>
                              <Button
                                variant="plain"
                                aria-label={t('Resize virtual machine')}
                                onClick={() => setResizeOpen(true)}
                                icon={<PencilAltIcon />}
                              />
                            </FlexItem>
                          </Flex>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>

                  <GridItem md={6}>
                    <Title headingLevel="h2" size="md" className="vm-details__section-title">
                      {t('Lifecycle')}
                    </Title>
                    <DescriptionList
                      isCompact
                      className="details-page__overview"
                      aria-label={t('Virtual machine lifecycle')}
                    >
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Timestamp value={vm.metadata?.creationTimestamp} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Creator')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {displayValue(vm.metadata?.creator)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Last restarted')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Timestamp value={vm.status?.lastRestartedAt} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <Divider className="vm-details__section-divider" />
              </StackItem>

              <StackItem>
                <VmUtilizationSection vm={vm} />
              </StackItem>

              <StackItem>
                <Divider className="vm-details__section-divider" />
              </StackItem>

              <StackItem>
                <VmNetworkingTab vm={vm} />
              </StackItem>

              <StackItem>
                <VmStorageCard vm={vm} />
              </StackItem>

              <StackItem>
                <Divider className="vm-details__section-divider" />
              </StackItem>

              <StackItem>
                <Card>
                  <CardTitle>{t('Console')}</CardTitle>
                  <CardBody className="vm-details__console-body">
                    <VmConsoleTab vm={vm} />
                  </CardBody>
                </Card>
              </StackItem>

              <StackItem>
                <Divider className="vm-details__section-divider" />
              </StackItem>

              <StackItem>
                <Stack hasGutter className="vm-details__conditions">
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Conditions')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    <ResourceConditionsTable
                      ariaLabel={t('Virtual machine conditions')}
                      conditions={conditions}
                      conditionResourceKind="compute_instance"
                    />
                  </StackItem>
                </Stack>
              </StackItem>
            </Stack>
          </GridItem>

          <GridItem md={4} className="details-page__column">
            <Stack hasGutter>
              <StackItem>
                <Card variant="secondary" className="details-page__rail-card">
                  <CardTitle>{t('Specifications')}</CardTitle>
                  <CardBody>
                    <DescriptionList isCompact aria-label={t('Virtual machine specifications')}>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('External IP')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {displayValue(vm.status?.externalIpAddress)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Internal IP')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {displayValue(vm.status?.internalIpAddress)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Disk image')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {displayValue(diskImage?.name || diskImage?.id)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </StackItem>

              <StackItem>
                <Card variant="secondary" className="details-page__rail-card">
                  <CardTitle>{t('Access')}</CardTitle>
                  <CardBody>
                    <DescriptionList isCompact aria-label={t('Virtual machine access')}>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('SSH public key')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {vm.spec?.sshKey?.id ? (
                            <Link
                              className="vm-details__resource-link"
                              to={`/secrets/${encodeURIComponent(vm.spec.sshKey.id)}`}
                            >
                              {displayValue(vm.spec.sshKey.name || vm.spec.sshKey.id)}
                            </Link>
                          ) : (
                            displayValue(vm.spec?.sshKey?.name)
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('User data')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {vm.spec?.userData?.trim() ? t('Configured') : t('Not configured')}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </StackItem>

              <StackItem>
                <VmUserDataCard vm={vm} />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>

      {resizeOpen ? <VmResizeModal vm={vm} onClose={() => setResizeOpen(false)} /> : null}
    </>
  );
};

export default VmDetails;
