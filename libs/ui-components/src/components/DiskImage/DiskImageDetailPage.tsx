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
import type { TFunction } from 'i18next';

import { type DiskImage, DiskImageLifecycle, SourceType } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';

import DiskImageDeleteConfirmModal from './DiskImageDeleteConfirmModal';
import DiskImageLifecycleLabel from './DiskImageLifecycleLabel';
import { architectureLabels, guestOsFamilyLabels } from './DiskImageTable';
import {
  type DiskImageLifecycleAction,
  getDiskImageLifecycleActions,
  useDiskImageLifecycleAction,
} from './useDiskImageLifecycleAction';
import { useDiskImage } from '../../api/v1/disk-image';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';
import { ResourceDetailHeader } from '../Resource/ResourceDetailHeader';
import ResourceDetailsPage from '../Resource/ResourceDetailsPage';

import './DiskImageDetailPage.css';
import '../shared/details-page.css';

export const DISK_IMAGES_LIST_ROUTE = '/admin/infrastructure/disk-images';

const sourceTypeLabels = (t: TFunction): Record<SourceType, string> => ({
  [SourceType.UNSPECIFIED]: t('Unspecified'),
  [SourceType.REGISTRY]: t('Registry'),
});

// ── Actions dropdown ────────────────────────────────────────────────────────

interface DiskImageActionsDropdownProps {
  diskImage: DiskImage;
  onDeleteSuccess: () => void;
}

const DiskImageActionsDropdown = ({ diskImage, onDeleteSuccess }: DiskImageActionsDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { runLifecycleAction } = useDiskImageLifecycleAction();

  const { canDeprecate, canObsolete, canReactivate, canDelete } = getDiskImageLifecycleActions(
    diskImage.spec?.lifecycle,
  );

  const runTransition = (action: DiskImageLifecycleAction) => {
    runLifecycleAction(diskImage.id, action);
    setOpen(false);
  };

  const name = diskImage.metadata?.name || diskImage.id;
  const hasActions = canDeprecate || canObsolete || canReactivate || canDelete;

  if (!hasActions) {return null;}

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
            <DropdownItem value="deprecate" onClick={() => runTransition(DiskImageLifecycle.DEPRECATED)}>
              {t('Deprecate')}
            </DropdownItem>
          )}
          {canObsolete && (
            <DropdownItem value="obsolete" onClick={() => runTransition(DiskImageLifecycle.OBSOLETE)}>
              {t('Obsolete')}
            </DropdownItem>
          )}
          {canReactivate && (
            <DropdownItem value="reactivate" onClick={() => runTransition(DiskImageLifecycle.AVAILABLE)}>
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
        <DiskImageDeleteConfirmModal
          diskImage={diskImage}
          onClose={() => setDeleteOpen(false)}
          onSuccess={onDeleteSuccess}
        />
      )}
    </>
  );
};

// ── Lifecycle sidebar card ───────────────────────────────────────────────────

interface LifecycleSidebarProps {
  diskImage: DiskImage;
}

const LifecycleSidebar = ({ diskImage }: LifecycleSidebarProps) => {
  const { t } = useTranslation();
  const deprecation = diskImage.spec?.deprecation;

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

      <DescriptionList isCompact aria-label={t('Disk image lifecycle')}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
          <DescriptionListDescription>
            <DiskImageLifecycleLabel lifecycle={diskImage.spec?.lifecycle} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        {deprecation?.deprecationTimestamp ? (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Deprecated on')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={deprecation.deprecationTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        ) : null}
        {deprecation?.obsolescenceTimestamp ? (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Obsolete on')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Timestamp value={deprecation.obsolescenceTimestamp} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        ) : null}
        {!deprecation?.deprecationTimestamp && !deprecation?.obsolescenceTimestamp ? (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Deprecation')}</DescriptionListTerm>
            <DescriptionListDescription>{t('None scheduled')}</DescriptionListDescription>
          </DescriptionListGroup>
        ) : null}
      </DescriptionList>
    </div>
  );
};

// ── Page ────────────────────────────────────────────────────────────────────

const DiskImageDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: diskImage, isLoading, error, refetch } = useDiskImage(id);

  const name = diskImage?.metadata?.name || diskImage?.id || id;
  const isGlobal = diskImage?.metadata?.tenant === 'shared';

  return (
    <ResourceDetailsPage
      isLoading={isLoading}
      error={error}
      found={!!diskImage}
      refetch={refetch}
      parentTo={DISK_IMAGES_LIST_ROUTE}
      parentLabel={t('Disk images')}
      resourceLabel={t('disk image')}
      cardCount={2}
    >
      {diskImage ? (
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
                      parentTo={DISK_IMAGES_LIST_ROUTE}
                      parentLabel={t('Disk images')}
                      resourceName={name}
                      titleAddon={<DiskImageLifecycleLabel lifecycle={diskImage.spec?.lifecycle} />}
                    />
                  </FlexItem>
                  <FlexItem>
                    <DiskImageActionsDropdown
                      diskImage={diskImage}
                      onDeleteSuccess={() => navigate(DISK_IMAGES_LIST_ROUTE)}
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
            <Grid hasGutter>
              <GridItem md={8}>
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
                      aria-label={t('Disk image overview')}
                    >
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Source type')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {sourceTypeLabels(t)[diskImage.spec?.sourceType ?? SourceType.UNSPECIFIED]}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Source reference')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <code>{displayValue(diskImage.spec?.sourceRef)}</code>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Guest OS family')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {guestOsFamilyLabels(t)[diskImage.spec?.guestOsFamily ?? 0]}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Architecture')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {(diskImage.spec?.architecture ?? []).length
                            ? (diskImage.spec?.architecture ?? [])
                                .map(
                                  (value) => architectureLabels(t)[value] ?? t('Unspecified'),
                                )
                                .join(', ')
                            : '—'}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Scope')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {isGlobal ? t('Global') : t('Tenant')}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Timestamp value={diskImage.metadata?.creationTimestamp} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </StackItem>
                </Stack>
              </GridItem>

              <GridItem md={4}>
                <LifecycleSidebar diskImage={diskImage} />
              </GridItem>
            </Grid>
          </PageSection>
        </>
      ) : null}
    </ResourceDetailsPage>
  );
};

export default DiskImageDetailPage;
