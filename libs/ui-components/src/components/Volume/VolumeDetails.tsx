import { useNavigate } from 'react-router-dom';
import {
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

import type { Volume } from '@osac/types';

import { VOLUMES_LIST_PATH } from './values';
import VolumeActionsMenu from './VolumeActionsMenu';
import VolumeSidebarSection from './VolumeSidebarSection';
import { VolumeStatusLabel } from './VolumeStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';
import { Timestamp } from '../Primitives/Timestamp';
import { ResourceDetailHeader } from '../Resource/ResourceDetailHeader';

import './VolumeDetailsPage.css';
import '../shared/details-page.css';

interface VolumeDetailsProps {
  volume: Volume;
}

const formatSizeGib = (sizeGib: bigint | undefined): string =>
  sizeGib === undefined ? '—' : `${sizeGib} GiB`;

const VolumeDetails = ({ volume }: VolumeDetailsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
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
                  parentTo={VOLUMES_LIST_PATH}
                  parentLabel={t('Volumes')}
                  resourceName={volume.metadata?.name ?? volume.id}
                  titleAddon={<VolumeStatusLabel state={volume.status?.state} />}
                  titleSize="3xl"
                  description={t('Review storage configuration and access details for this volume.')}
                />
              </FlexItem>
              <FlexItem>
                <VolumeActionsMenu
                  volume={volume}
                  showLabel
                  onDeleteSuccess={() => navigate(VOLUMES_LIST_PATH)}
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
                  className="volume-details-overview"
                  aria-label={t('Volume overview')}
                >
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {displayValue(volume.metadata?.name)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <VolumeStatusLabel state={volume.status?.state} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Storage tier')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {displayValue(volume.spec?.storageTier)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Size')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {formatSizeGib(volume.spec?.sizeGib)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp value={volume.metadata?.creationTimestamp} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </StackItem>
            </Stack>
          </GridItem>

          <GridItem md={4} className="details-page__column">
            <Stack hasGutter>
              <StackItem>
                <VolumeSidebarSection volume={volume} />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default VolumeDetails;
