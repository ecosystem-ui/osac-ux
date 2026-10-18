import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type MessageInitShape } from '@bufbuild/protobuf';
import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
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
import ArrowCircleDownIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-down-icon';
import ArrowCircleUpIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-up-icon';
import InfoAltIcon from '@patternfly/react-icons/dist/esm/icons/info-alt-icon';

import { type SecurityGroup, SecurityGroupSchema, SecurityGroupState } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';

import {
  resourceDisplayName,
  useDeleteSecurityGroup,
  useSecurityGroup,
  useUpdateSecurityGroup,
  useVirtualNetworks,
} from '../../api/v1/networking';
import { SecurityGroupNatGatewaySection } from '../../components/networking/SecurityGroupNatGatewaySection';
import { SecurityGroupRuleModal } from '../../components/networking/SecurityGroupRuleModal';
import { SecurityGroupRulesTable } from '../../components/networking/SecurityGroupRulesTable';
import { toPlainRule } from '../../components/networking/securityGroupRuleUtils';
import { SecurityGroupStatusLabel } from '../../components/networking/SecurityGroupStatusLabel';
import DeleteResourceModal from '../../components/Resource/DeleteResourceModal';
import { ResourceDetailHeader } from '../../components/Resource/ResourceDetailHeader';
import ResourceDetailsPage from '../../components/Resource/ResourceDetailsPage';
import { useTranslation } from '../../hooks/useTranslation';
import { displayValue } from '../../utils/detailFormatters';

import './SecurityGroupDetailPage.css';
import '../../components/shared/details-page.css';

const SG_LIST_PATH = '/networking/security-groups';

type RuleTarget = { direction: 'ingress' | 'egress'; ruleIndex?: number };

const securityGroupWithoutRule = (
  sg: SecurityGroup,
  target: Required<RuleTarget>,
): MessageInitShape<typeof SecurityGroupSchema> => {
  const newIngress = (sg.spec?.ingress ?? []).map(toPlainRule);
  const newEgress = (sg.spec?.egress ?? []).map(toPlainRule);
  const targetList = target.direction === 'ingress' ? newIngress : newEgress;
  targetList.splice(target.ruleIndex, 1);
  return {
    id: sg.id,
    metadata: { name: sg.metadata?.name ?? '' },
    spec: {
      virtualNetwork: sg.spec?.virtualNetwork,
      ingress: newIngress,
      egress: newEgress,
    },
  };
};

export const SecurityGroupDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const [ruleEditor, setRuleEditor] = useState<RuleTarget | null>(null);
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<Required<RuleTarget> | null>(null);
  const [showDeleteSgModal, setShowDeleteSgModal] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const { data: sg, isLoading, error, refetch } = useSecurityGroup(id);
  const { data: virtualNetworks = [] } = useVirtualNetworks();
  const deleteSecurityGroup = useDeleteSecurityGroup();
  const updateSecurityGroup = useUpdateSecurityGroup();

  const sgName = sg?.metadata?.name ?? id;
  const isFailed = sg?.status?.state === SecurityGroupState.FAILED;

  const vnId = sg?.spec?.virtualNetwork?.id ?? '';
  const vn = virtualNetworks.find((v) => v.id === vnId);
  const vnName = resourceDisplayName(vn?.metadata, vnId);

  return (
    <ResourceDetailsPage
      error={error}
      found={!!sg}
      isLoading={isLoading}
      parentLabel={t('Security groups')}
      parentTo={SG_LIST_PATH}
      refetch={refetch}
      resourceLabel={t('security group')}
      cardCount={2}
    >
      {sg ? (
        <>
          <PageSection hasBodyWrapper={false}>
            <Stack hasGutter>
              {isFailed && sg.status?.message && (
                <StackItem>
                  <Alert variant="danger" title={t('Provisioning failed')} isInline>
                    {sg.status.message}
                  </Alert>
                </StackItem>
              )}
              <StackItem>
                <Flex
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                  alignItems={{ default: 'alignItemsFlexStart' }}
                  flexWrap={{ default: 'wrap' }}
                  spaceItems={{ default: 'spaceItemsMd' }}
                >
                  <FlexItem>
                    <ResourceDetailHeader
                      parentTo={SG_LIST_PATH}
                      parentLabel={t('Security groups')}
                      resourceName={sgName}
                      titleAddon={<SecurityGroupStatusLabel state={sg.status?.state} />}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Dropdown
                      isOpen={isActionsOpen}
                      onOpenChange={setIsActionsOpen}
                      toggle={(ref) => (
                        <MenuToggle
                          ref={ref}
                          variant="secondary"
                          onClick={() => setIsActionsOpen((open) => !open)}
                          isExpanded={isActionsOpen}
                          aria-label={t('Actions for {{name}}', { name: sgName })}
                        >
                          {t('Actions')}
                        </MenuToggle>
                      )}
                      popperProps={{ position: 'right' }}
                    >
                      <DropdownList>
                        <DeleteResourceButton
                          isDropdown
                          onClick={() => {
                            setShowDeleteSgModal(true);
                            setIsActionsOpen(false);
                          }}
                        />
                      </DropdownList>
                    </Dropdown>
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
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                    >
                      <InfoAltIcon aria-hidden />
                      <Title headingLevel="h2" size="lg">
                        {t('Overview')}
                      </Title>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <DescriptionList
                      isCompact
                      className="details-page__overview"
                      aria-label={t('Security group details')}
                    >
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Virtual network')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {vnId ? (
                            <Button
                              variant="link"
                              isInline
                              onClick={() => navigate(`/networking/virtual-networks/${vnId}`)}
                            >
                              {vnName}
                            </Button>
                          ) : (
                            displayValue(vnName)
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Project')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {displayValue(sg.metadata?.project)}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      {sg.status?.message && !isFailed ? (
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Message')}</DescriptionListTerm>
                          <DescriptionListDescription>
                            {displayValue(sg.status.message)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      ) : null}
                    </DescriptionList>
                  </StackItem>

                  <StackItem>
                    <Divider />
                  </StackItem>

                  <StackItem>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                    >
                      <ArrowCircleDownIcon aria-hidden />
                      <Title headingLevel="h2" size="lg">
                        {t('Inbound rules')}
                      </Title>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <SecurityGroupRulesTable
                      rules={sg.spec?.ingress ?? []}
                      direction="ingress"
                      onAddRule={() => setRuleEditor({ direction: 'ingress' })}
                      onEditRule={(ruleIndex) => setRuleEditor({ direction: 'ingress', ruleIndex })}
                      onDeleteRule={(ruleIndex) =>
                        setDeleteRuleTarget({ direction: 'ingress', ruleIndex })
                      }
                    />
                  </StackItem>

                  <StackItem>
                    <Divider />
                  </StackItem>

                  <StackItem>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                    >
                      <ArrowCircleUpIcon aria-hidden />
                      <Title headingLevel="h2" size="lg">
                        {t('Outbound rules')}
                      </Title>
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <SecurityGroupRulesTable
                      rules={sg.spec?.egress ?? []}
                      direction="egress"
                      onAddRule={() => setRuleEditor({ direction: 'egress' })}
                      onEditRule={(ruleIndex) => setRuleEditor({ direction: 'egress', ruleIndex })}
                      onDeleteRule={(ruleIndex) =>
                        setDeleteRuleTarget({ direction: 'egress', ruleIndex })
                      }
                    />
                  </StackItem>
                </Stack>
              </GridItem>

              {vnId ? (
                <GridItem md={4}>
                  <SecurityGroupNatGatewaySection virtualNetworkId={vnId} />
                </GridItem>
              ) : null}
            </Grid>
          </PageSection>
        </>
      ) : null}

      {ruleEditor && sg && (
        <SecurityGroupRuleModal
          onClose={() => setRuleEditor(null)}
          securityGroup={sg}
          direction={ruleEditor.direction}
          ruleIndex={ruleEditor.ruleIndex}
        />
      )}

      {deleteRuleTarget && sg && (
        <DeleteResourceModal
          resourceName={t('rule')}
          label={t(
            'This will permanently delete the rule. This action cannot be undone. Traffic matching this rule will be blocked.',
          )}
          errorLabel={t('Failed to delete rule')}
          onClose={() => setDeleteRuleTarget(null)}
          onSuccess={() => setDeleteRuleTarget(null)}
          mutation={updateSecurityGroup}
          variables={{ object: securityGroupWithoutRule(sg, deleteRuleTarget) }}
        />
      )}

      {showDeleteSgModal && (
        <DeleteResourceModal
          resourceName={sgName}
          label={t(
            'This will permanently delete the security group and all its rules. This action cannot be undone.',
          )}
          errorLabel={t('Failed to delete security group')}
          onClose={() => setShowDeleteSgModal(false)}
          onSuccess={() => navigate(SG_LIST_PATH)}
          mutation={deleteSecurityGroup}
          variables={id}
        />
      )}
    </ResourceDetailsPage>
  );
};
