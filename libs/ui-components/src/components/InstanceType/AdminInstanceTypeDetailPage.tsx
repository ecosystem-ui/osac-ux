import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import {
  InstanceTypeState,
  InstanceTypes,
  type InstanceType as PrivateInstanceType,
} from '@osac/types/private';
import { useGetResource } from '@osac/ui-components/api/use-resource';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';
import { ResourceDetailHeader } from '@osac/ui-components/components/Resource/ResourceDetailHeader';
import ResourceDetailsPage from '@osac/ui-components/components/Resource/ResourceDetailsPage';

import InstanceTypeDeleteConfirmModal from './InstanceTypeDeleteConfirmModal';
import InstanceTypeLifecycleLabel from './InstanceTypeLifecycleLabel';
import {
  getInstanceTypeLifecycleActions,
  useInstanceTypeLifecycleAction,
} from './useInstanceTypeLifecycleAction';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';
import { SubtleContent } from '../SubtleContent/SubtleContent';

import '../shared/details-page.css';

export const INSTANCE_TYPES_LIST_ROUTE = '/admin/infrastructure/instance-types';

// ── Header Actions dropdown ──────────────────────────────────────────────────

interface ActionsDropdownProps {
  instanceType: PrivateInstanceType;
  onDeleted: () => void;
}

const ActionsDropdown = ({ instanceType, onDeleted }: ActionsDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { runLifecycleAction } = useInstanceTypeLifecycleAction();

  const { canDeprecate, canObsolete, canReactivate, canDelete } = getInstanceTypeLifecycleActions(
    instanceType.spec?.state,
  );

  const name = instanceType.metadata?.name || instanceType.id;

  if (!canDeprecate && !canObsolete && !canReactivate && !canDelete) {return null;}

  return (
    <>
      <Dropdown
        isOpen={open}
        onOpenChange={setOpen}
        toggle={(ref) => (
          <MenuToggle
            ref={ref}
            variant="secondary"
            onClick={() => setOpen((o) => !o)}
            isExpanded={open}
            aria-label={t('Actions for {{name}}', { name })}
          >
            {t('Actions')}
          </MenuToggle>
        )}
        popperProps={{ position: 'right' }}
      >
        <DropdownList>
          {canDeprecate && (
            <DropdownItem
              value="deprecate"
              onClick={() => {
                runLifecycleAction(instanceType.id, InstanceTypeState.DEPRECATED);
                setOpen(false);
              }}
            >
              {t('Deprecate')}
            </DropdownItem>
          )}
          {canObsolete && (
            <DropdownItem
              value="obsolete"
              onClick={() => {
                runLifecycleAction(instanceType.id, InstanceTypeState.OBSOLETE);
                setOpen(false);
              }}
            >
              {t('Obsolete')}
            </DropdownItem>
          )}
          {canReactivate && (
            <DropdownItem
              value="reactivate"
              onClick={() => {
                runLifecycleAction(instanceType.id, InstanceTypeState.ACTIVE);
                setOpen(false);
              }}
            >
              {t('Reactivate')}
            </DropdownItem>
          )}
          {canDelete && (
            <DeleteResourceButton
              isDropdown
              onClick={() => {
                setDeleteOpen(true);
                setOpen(false);
              }}
            />
          )}
        </DropdownList>
      </Dropdown>

      {deleteOpen && (
        <InstanceTypeDeleteConfirmModal
          instanceType={instanceType}
          onClose={() => setDeleteOpen(false)}
          onSuccess={onDeleted}
        />
      )}
    </>
  );
};

// ── Lifecycle sidebar card ───────────────────────────────────────────────────

interface LifecycleSidebarProps {
  instanceType: PrivateInstanceType;
}

const LifecycleSidebar = ({ instanceType }: LifecycleSidebarProps) => {
  const { t } = useTranslation();

  return (
    <div className="details-page__sidebar">
      <Flex
        className="details-page__sidebar-header"
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem>
          <Title headingLevel="h2" size="md" className="details-page__sidebar-title">
            {t('Lifecycle')}
          </Title>
        </FlexItem>
      </Flex>

      <DescriptionList isCompact aria-label={t('Instance type lifecycle')}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('State')}</DescriptionListTerm>
          <DescriptionListDescription>
            <InstanceTypeLifecycleLabel state={instanceType.spec?.state} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Timestamp value={instanceType.metadata?.creationTimestamp} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

// ── Page ────────────────────────────────────────────────────────────────────

const AdminInstanceTypeDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useGetResource(InstanceTypes, { id });
  const instanceType = data?.object;

  const name = instanceType?.metadata?.name ?? id;
  const gpu = instanceType?.spec?.gpu;

  return (
    <ResourceDetailsPage
      error={error}
      found={!!instanceType}
      isLoading={isLoading}
      parentLabel={t('Instance types')}
      parentTo={INSTANCE_TYPES_LIST_ROUTE}
      refetch={refetch}
      resourceLabel={t('instance type')}
      cardCount={2}
    >
      {instanceType ? (
        <>
          <PageSection hasBodyWrapper={false}>
            <Stack hasGutter>
              <StackItem>
                <Flex
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                  alignItems={{ default: 'alignItemsFlexStart' }}
                  flexWrap={{ default: 'wrap' }}
                  spaceItems={{ default: 'spaceItemsMd' }}
                >
                  <FlexItem>
                    <ResourceDetailHeader
                      parentTo={INSTANCE_TYPES_LIST_ROUTE}
                      parentLabel={t('Instance types')}
                      resourceName={name}
                      description={instanceType.spec?.description}
                      titleAddon={
                        <InstanceTypeLifecycleLabel state={instanceType.spec?.state} />
                      }
                    />
                  </FlexItem>
                  <FlexItem>
                    <ActionsDropdown
                      instanceType={instanceType}
                      onDeleted={() => navigate(INSTANCE_TYPES_LIST_ROUTE)}
                    />
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <Divider />
              </StackItem>
            </Stack>
          </PageSection>

          <PageSection hasBodyWrapper={false}>
            <Grid hasGutter className="details-page__content-grid">
              <GridItem md={8} className="details-page__column">
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Overview')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    <DescriptionList
                      isCompact
                      className="details-page__overview"
                      aria-label={t('Instance type overview')}
                    >
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <code>{name}</code>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('vCPUs')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {instanceType.spec?.vcpus ?? '—'}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Memory (GiB)')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {instanceType.spec?.memoryGib ?? '—'}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </StackItem>

                  <StackItem>
                    <Divider />
                  </StackItem>

                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('GPU configuration')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    {gpu ? (
                      <DescriptionList
                        isCompact
                        className="details-page__overview"
                        aria-label={t('Instance type GPU configuration')}
                      >
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Count')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            {displayValue(gpu.count?.toString())}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Resource name')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            {displayValue(gpu.resourceName)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('PCI device selector')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            <code>{displayValue(gpu.pciDeviceSelector)}</code>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    ) : (
                      <SubtleContent component="p">
                        {t('This instance type has no GPU attached.')}
                      </SubtleContent>
                    )}
                  </StackItem>
                </Stack>
              </GridItem>

              <GridItem md={4} className="details-page__column">
                <LifecycleSidebar instanceType={instanceType} />
              </GridItem>
            </Grid>
          </PageSection>
        </>
      ) : null}
    </ResourceDetailsPage>
  );
};

export default AdminInstanceTypeDetailPage;
