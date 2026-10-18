import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';

import type { BareMetalInstance } from '@osac/types';

import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';

import '../shared/details-page.css';

// MISSING: Hardware spec (CPU, RAM, disk capacity) not available in BareMetalInstanceStatus.
// The inventory backend (BCM / Ironic) exposes these at allocation time but they are not yet
// surfaced through the fulfillment service API.
// Predicted fields on BareMetalHardware (once available):
//   cpuCores: number        — physical CPU core count
//   memoryGiB: number       — total installed RAM in GiB
//   totalDiskGiB: number    — sum of provisioned disk capacity in GiB
const MISSING_cpuCores: number | undefined = undefined;
const MISSING_memoryGiB: number | undefined = undefined;
const MISSING_totalDiskGiB: number | undefined = undefined;

interface Props {
  instance: BareMetalInstance;
}

export const BareMetalInventorySection = ({ instance }: Props) => {
  const { t } = useTranslation();

  const nics = instance.status?.hardware?.nics ?? [];
  const macAddresses = nics.map((nic) => nic.mac).filter(Boolean);

  return (
    <Card variant="secondary" className="details-page__rail-card">
      <CardTitle>{t('Inventory')}</CardTitle>
      <CardBody>
        <DescriptionList isCompact aria-label={t('Bare metal instance inventory')}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
            <DescriptionListDescription>
              {displayValue(instance.spec?.instanceType?.name || instance.spec?.instanceType?.id)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Disk image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {instance.spec?.diskImage?.name || instance.spec?.diskImage?.id ? (
                <span className="bm-details__disk-image-value">
                  <CubeIcon aria-hidden className="bm-details__disk-image-icon" />
                  {instance.spec.diskImage?.name || instance.spec.diskImage?.id}
                </span>
              ) : (
                displayValue(undefined)
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* MISSING: cpuCores — not yet in BareMetalHardware proto */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('CPU cores')}</DescriptionListTerm>
            <DescriptionListDescription>
              {MISSING_cpuCores != null ? String(MISSING_cpuCores) : displayValue(undefined)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* MISSING: memoryGiB — not yet in BareMetalHardware proto */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Memory')}</DescriptionListTerm>
            <DescriptionListDescription>
              {MISSING_memoryGiB != null
                ? t('{{count}} GiB', { count: MISSING_memoryGiB })
                : displayValue(undefined)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {/* MISSING: totalDiskGiB — not yet in BareMetalHardware proto */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Total disk')}</DescriptionListTerm>
            <DescriptionListDescription>
              {MISSING_totalDiskGiB != null
                ? t('{{count}} GiB', { count: MISSING_totalDiskGiB })
                : displayValue(undefined)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {nics.length === 1 ? t('NIC MAC address') : t('NIC MAC addresses')}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {macAddresses.length > 0
                ? macAddresses.map((mac) => <div key={mac}>{mac}</div>)
                : displayValue(undefined)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
