import { useState } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectList,
  SelectOption,
  Skeleton,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';

import type { Cluster } from '@osac/types';

import {
  useCreateMaasApiKey,
  useMaasApiKeys,
  useMaasModels,
  useMaasSubscriptions,
  useRevokeMaasApiKey,
} from '../../../api/v1/maas';
import { useTranslation } from '../../../hooks/useTranslation';
import { Timestamp } from '../../Primitives/Timestamp';

import './ClusterAiGridTab.css';

interface ClusterAiGridTabProps {
  cluster: Cluster;
}

// ─── Create key modal ─────────────────────────────────────────────────────────

interface CreateKeyModalProps {
  clusterId: string;
  onClose: () => void;
}

const CreateKeyModal = ({ clusterId, onClose }: CreateKeyModalProps) => {
  const { t } = useTranslation();
  const { data: subscriptions = [], isLoading } = useMaasSubscriptions(clusterId);
  const { mutate: createKey, isPending } = useCreateMaasApiKey();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  const selectedSub = subscriptions.find((s) => s.id === selectedSubId);

  const handleCreate = () => {
    if (!selectedSubId) return;
    createKey({ clusterId, subscriptionId: selectedSubId }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Create API key')} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <FormGroup label={t('Subscription')} isRequired>
              <Select
                isOpen={isSelectOpen}
                selected={selectedSub?.spec.name ?? t('Select subscription')}
                onOpenChange={setIsSelectOpen}
                onSelect={(_evt, value) => {
                  setSelectedSubId(String(value));
                  setIsSelectOpen(false);
                }}
                toggle={(ref) => (
                  <Button
                    ref={ref}
                    variant="control"
                    onClick={() => setIsSelectOpen((o) => !o)}
                    isDisabled={isLoading}
                    aria-expanded={isSelectOpen}
                  >
                    {isLoading ? t('Loading…') : (selectedSub?.spec.name ?? t('Select subscription'))}
                  </Button>
                )}
              >
                <SelectList>
                  {subscriptions.map((sub) => (
                    <SelectOption key={sub.id} value={sub.id}>
                      {sub.spec.name ?? sub.id}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FormGroup>
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          isDisabled={!selectedSubId || isPending}
          isLoading={isPending}
          onClick={handleCreate}
        >
          {t('Create')}
        </Button>
        <Button variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const ClusterAiGridTab = ({ cluster }: ClusterAiGridTabProps) => {
  const { t } = useTranslation();
  const clusterId = cluster.id;

  const { data: models = [], isLoading: modelsLoading } = useMaasModels(clusterId);
  const { data: subscriptions = [], isLoading: subscriptionsLoading } =
    useMaasSubscriptions(clusterId);
  const { data: apiKeys = [], isLoading: keysLoading } = useMaasApiKeys(clusterId);
  const { mutate: revokeKey, isPending: revoking } = useRevokeMaasApiKey();

  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | undefined>();

  const handleRevoke = (keyId: string) => {
    setRevokingKeyId(keyId);
    revokeKey({ clusterId, keyId }, { onSettled: () => setRevokingKeyId(undefined) });
  };

  const skeletonRow = (cols: number) => (
    <Tr>
      {Array.from({ length: cols }).map((_, i) => (
        <Td key={i}>
          <Skeleton />
        </Td>
      ))}
    </Tr>
  );

  return (
    <>
      {createKeyOpen && (
        <CreateKeyModal clusterId={clusterId} onClose={() => setCreateKeyOpen(false)} />
      )}

      <Stack hasGutter>
        {/* ── Models ──────────────────────────────────────────────────────── */}
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h2" size="lg">
                {t('Models')}
              </Title>
            </StackItem>
            <StackItem>
              <Table aria-label={t('Available models')} variant="compact">
                <Thead>
                  <Tr>
                    <Th>{t('Model ID')}</Th>
                    <Th>{t('Owned by')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {modelsLoading ? (
                    skeletonRow(2)
                  ) : models.length === 0 ? (
                    <Tr>
                      <Td colSpan={2}>{t('No models available.')}</Td>
                    </Tr>
                  ) : (
                    models.map((model) => (
                      <Tr key={model.id}>
                        <Td dataLabel={t('Model ID')}>
                          <code className="cluster-ai-grid__key-preview">{model.id}</code>
                        </Td>
                        <Td dataLabel={t('Owned by')}>{model.ownedBy ?? '—'}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </StackItem>

        {/* ── Subscriptions ────────────────────────────────────────────────── */}
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h2" size="lg">
                {t('Subscriptions')}
              </Title>
            </StackItem>
            <StackItem>
              <Table aria-label={t('Subscriptions')} variant="compact">
                <Thead>
                  <Tr>
                    <Th>{t('Name')}</Th>
                    <Th>{t('Models')}</Th>
                    <Th>{t('Rate limit (req/min)')}</Th>
                    <Th>{t('Token limit (tokens/day)')}</Th>
                    <Th>{t('Active keys')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {subscriptionsLoading ? (
                    skeletonRow(5)
                  ) : subscriptions.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}>{t('No subscriptions configured.')}</Td>
                    </Tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <Tr key={sub.id}>
                        <Td dataLabel={t('Name')}>{sub.spec.name ?? sub.id}</Td>
                        <Td dataLabel={t('Models')}>
                          {sub.spec.modelRefs?.map((m) => m.name).join(', ') ?? '—'}
                        </Td>
                        <Td dataLabel={t('Rate limit (req/min)')}>
                          {sub.spec.requestsPerMinute?.toLocaleString() ?? '—'}
                        </Td>
                        <Td dataLabel={t('Token limit (tokens/day)')}>
                          {sub.spec.tokensPerDay?.toLocaleString() ?? '—'}
                        </Td>
                        <Td dataLabel={t('Active keys')}>
                          {sub.status?.activeKeyCount ?? 0}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </StackItem>

        {/* ── API Keys ────────────────────────────────────────────────────── */}
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <FlexItem>
                  <Title headingLevel="h2" size="lg">
                    {t('API keys')}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="link"
                    isInline
                    icon={<PlusCircleIcon />}
                    onClick={() => setCreateKeyOpen(true)}
                  >
                    {t('Create API key')}
                  </Button>
                </FlexItem>
              </Flex>
            </StackItem>
            <StackItem>
              <Table aria-label={t('API keys')} variant="compact">
                <Thead>
                  <Tr>
                    <Th>{t('Key')}</Th>
                    <Th>{t('Subscription')}</Th>
                    <Th>{t('Created')}</Th>
                    <Th aria-label={t('Actions')} />
                  </Tr>
                </Thead>
                <Tbody>
                  {keysLoading ? (
                    skeletonRow(4)
                  ) : apiKeys.length === 0 ? (
                    <Tr>
                      <Td colSpan={4}>{t('No API keys. Create one to start using this cluster.')}</Td>
                    </Tr>
                  ) : (
                    apiKeys.map((key) => (
                      <Tr key={key.id}>
                        <Td dataLabel={t('Key')}>
                          <code className="cluster-ai-grid__key-preview">{key.keyPreview}</code>
                        </Td>
                        <Td dataLabel={t('Subscription')}>
                          {key.subscriptionName ?? key.subscriptionId}
                        </Td>
                        <Td dataLabel={t('Created')}>
                          <Timestamp value={key.createdAt} />
                        </Td>
                        <Td dataLabel={t('Actions')} isActionCell>
                          <Button
                            variant="plain"
                            aria-label={t('Revoke key')}
                            icon={<TrashIcon />}
                            isDisabled={revoking && revokingKeyId === key.id}
                            isLoading={revoking && revokingKeyId === key.id}
                            onClick={() => handleRevoke(key.id)}
                          />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </>
  );
};
