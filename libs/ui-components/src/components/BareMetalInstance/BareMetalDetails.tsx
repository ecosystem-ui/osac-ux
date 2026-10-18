import {
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

import type { BareMetalInstance } from '@osac/types';
import { BareMetalInstanceState } from '@osac/types';

import BareMetalActionButtons from './BareMetalActionButtons';
import { BareMetalActivitySection } from './BareMetalActivitySection';
import BareMetalDetailsCard from './BareMetalDetailsCard';
import { BareMetalInventorySection } from './BareMetalInventorySection';
import BareMetalNetworkingCard from './BareMetalNetworkingCard';
import BareMetalProvisioningProgress from './BareMetalProvisioningProgress';
import { BareMetalStatusLabel } from './BareMetalStatusLabel';
import { useTranslation } from '../../hooks/useTranslation';
import { ResourceConditionsTable } from '../Resource/ResourceConditionsTable';
import { ResourceDetailHeader } from '../Resource/ResourceDetailHeader';

import './BareMetalDetails.css';
import '../shared/details-page.css';

interface Props {
  instance: BareMetalInstance;
}

const BareMetalDetails = ({ instance }: Props) => {
  const { t } = useTranslation();
  const conditions = instance.status?.conditions ?? [];
  const state = instance.status?.state;
  const showProvisioningProgress =
    state === BareMetalInstanceState.PROVISIONING || state === BareMetalInstanceState.FAILED;

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
                  parentTo="/bare-metal"
                  parentLabel={t('Bare Metal')}
                  resourceName={instance.metadata?.name ?? instance.id}
                  titleAddon={<BareMetalStatusLabel state={instance.status?.state} />}
                />
              </FlexItem>
              <FlexItem>
                <BareMetalActionButtons instance={instance} />
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
                <BareMetalDetailsCard instance={instance} />
              </StackItem>
              {showProvisioningProgress ? (
                <>
                  <StackItem>
                    <Divider />
                  </StackItem>
                  <StackItem>
                    <BareMetalProvisioningProgress instance={instance} />
                  </StackItem>
                </>
              ) : null}
              <StackItem>
                <Divider />
              </StackItem>
              <StackItem>
                <BareMetalNetworkingCard instance={instance} />
              </StackItem>
              <StackItem>
                <Divider />
              </StackItem>
              <StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <Title headingLevel="h2" size="lg">
                      {t('Conditions')}
                    </Title>
                  </StackItem>
                  <StackItem>
                    <ResourceConditionsTable
                      ariaLabel={t('Bare metal instance conditions')}
                      conditions={conditions}
                      conditionResourceKind="bare_metal_instance"
                    />
                  </StackItem>
                </Stack>
              </StackItem>
            </Stack>
          </GridItem>
          <GridItem md={4} className="details-page__column">
            <Stack hasGutter>
              <StackItem>
                <BareMetalActivitySection instance={instance} />
              </StackItem>
              <StackItem>
                <BareMetalInventorySection instance={instance} />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export default BareMetalDetails;
