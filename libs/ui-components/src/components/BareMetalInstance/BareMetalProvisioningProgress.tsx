import {
  Content,
  Flex,
  FlexItem,
  ProgressStep,
  ProgressStepper,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import type { BareMetalInstance, BareMetalInstanceCondition } from '@osac/types';
import {
  BareMetalInstanceConditionType,
  BareMetalInstanceState,
  ConditionStatus,
} from '@osac/types';

import { useTranslation } from '../../hooks/useTranslation';

import './BareMetalProvisioningProgress.css';

interface Props {
  instance: BareMetalInstance;
}

type StepVariant = 'success' | 'warning' | 'info' | 'pending';

interface ResolvedStep {
  id: string;
  title: string;
  description: string;
  variant: StepVariant;
}

const getCondition = (
  conditions: BareMetalInstanceCondition[],
  type: BareMetalInstanceConditionType,
): BareMetalInstanceCondition | undefined => conditions.find((c) => c.type === type);

const conditionVariant = (condition: BareMetalInstanceCondition | undefined): StepVariant => {
  switch (condition?.status) {
    case ConditionStatus.TRUE:
      return 'success';
    case ConditionStatus.FALSE:
      return 'warning';
    default:
      return 'pending';
  }
};

const resolveSteps = (instance: BareMetalInstance, isProvisioning: boolean): ResolvedStep[] => {
  const conditions = instance.status?.conditions ?? [];

  const provisionedCondition = getCondition(conditions, BareMetalInstanceConditionType.PROVISIONED);
  const configAppliedCondition = getCondition(
    conditions,
    BareMetalInstanceConditionType.CONFIGURATION_APPLIED,
  );
  const readyCondition = getCondition(conditions, BareMetalInstanceConditionType.READY);

  const hasIpAddress = (instance.status?.networkAttachmentStatuses ?? []).some(
    (s) => s.ipAddress.trim().length > 0,
  );

  const networkSetupVariant: StepVariant =
    readyCondition?.status === ConditionStatus.TRUE
      ? 'success'
      : hasIpAddress
        ? 'info'
        : 'pending';

  const rawVariants: StepVariant[] = [
    conditionVariant(provisionedCondition),
    conditionVariant(configAppliedCondition),
    networkSetupVariant,
    conditionVariant(readyCondition),
  ];

  // While provisioning, promote the first pending step to info (currently active)
  let infoPromoted = false;
  const variants: StepVariant[] = rawVariants.map((v) => {
    if (isProvisioning && !infoPromoted && v === 'pending') {
      infoPromoted = true;
      return 'info';
    }
    return v;
  });

  const descriptions: string[] = [
    provisionedCondition?.message || 'Reserving capacity',
    configAppliedCondition?.message || 'Provisioning instance',
    'Discovering IP address',
    readyCondition?.message || 'Synchronizing power state',
  ];

  const titles = ['Host allocation', 'Provisioning', 'Network setup', 'Finalizing'];
  const ids = ['host-allocation', 'provisioning', 'network-setup', 'finalizing'];

  return titles.map((title, i) => ({
    id: ids[i],
    title,
    description: descriptions[i],
    variant: variants[i],
  }));
};

const getCurrentPhase = (steps: ResolvedStep[], isFailed: boolean, t: (s: string) => string): string => {
  if (isFailed) {
    const failedStep = steps.find((s) => s.variant === 'warning');
    return failedStep ? t(failedStep.title) : t('Failed');
  }
  const activeStep = steps.find((s) => s.variant === 'info');
  if (activeStep) {
    return t(activeStep.title);
  }
  if (steps.every((s) => s.variant === 'success')) {
    return t('Ready');
  }
  return t('Preparing');
};

const variantAriaLabel = (variant: StepVariant, t: (s: string) => string): string => {
  switch (variant) {
    case 'success':
      return t('completed');
    case 'warning':
      return t('failed');
    case 'info':
      return t('in progress');
    default:
      return t('pending');
  }
};

const BareMetalProvisioningProgress = ({ instance }: Props) => {
  const { t } = useTranslation();

  const state = instance.status?.state;
  const isProvisioning = state === BareMetalInstanceState.PROVISIONING;
  const isFailed = state === BareMetalInstanceState.FAILED;

  if (!isProvisioning && !isFailed) {
    return null;
  }

  const steps = resolveSteps(instance, isProvisioning);
  const currentPhase = getCurrentPhase(steps, isFailed, t);

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem>
            <Title headingLevel="h2" size="lg">
              {t('Provisioning progress')}
            </Title>
          </FlexItem>
          <FlexItem>
            <Content
              component="p"
              className="bm-provisioning-progress__phase"
            >
              {currentPhase}
            </Content>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <ProgressStepper
          isCenter
          aria-label={t('Bare metal provisioning stages')}
          className="bm-provisioning-progress__stepper"
        >
          {steps.map((step) => (
            <ProgressStep
              key={step.id}
              variant={step.variant}
              id={`baremetal-provision-stage-${step.id}`}
              titleId={`baremetal-provision-stage-${step.id}-title`}
              aria-label={`${t(step.title)}, ${variantAriaLabel(step.variant, t)}, ${step.description}`}
              description={step.description}
            >
              {t(step.title)}
            </ProgressStep>
          ))}
        </ProgressStepper>
      </StackItem>
    </Stack>
  );
};

export default BareMetalProvisioningProgress;
