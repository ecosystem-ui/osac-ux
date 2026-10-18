import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertActionLink,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  MenuToggle,
  Modal,
} from '@patternfly/react-core';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';

import { type Cluster, ClusterState } from '@osac/types';
import DeleteResourceButton from '@osac/ui-components/components/Resource/DeleteResourceButton';
import { getErrorMessage } from '@osac/ui-components/utils/error';

import ClusterPasswordModal from './ClusterPasswordModal';
import { useDownloadKubeconfig } from '../../../api/v1/cluster';
import { useFetchAiGridUrl } from '../../../api/v1/maas';
import { useTranslation } from '../../../hooks/useTranslation';
import ClusterDeleteConfirmModal from '../ClusterDeleteConfirmModal';

interface ClusterDetailsActionButtonsProps {
  cluster: Cluster;
  isRhoaiInstalled?: boolean;
}

const ClusterDetailsActionButtons = ({
  cluster,
  isRhoaiInstalled = false,
}: ClusterDetailsActionButtonsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { download, isPending, error, setError } = useDownloadKubeconfig();
  const { mutate: fetchAiGridUrl, isPending: aiGridPending } = useFetchAiGridUrl();

  const isReady = cluster.status?.state === ClusterState.READY;
  const canDelete = cluster.status?.state !== ClusterState.DELETING;
  const clusterName = cluster.metadata?.name ?? cluster.id;
  const kubeconfigSecretId = cluster.status?.kubeconfigSecret?.id ?? '';
  const passwordSecretId = cluster.status?.passwordSecret?.id ?? '';

  return (
    <>
      {deleteOpen && (
        <ClusterDeleteConfirmModal
          cluster={cluster}
          onClose={() => setDeleteOpen(false)}
          onSuccess={() => navigate('/clusters', { replace: true })}
        />
      )}
      {passwordOpen && (
        <ClusterPasswordModal
          passwordSecretId={passwordSecretId}
          onClose={() => setPasswordOpen(false)}
        />
      )}
      {error && (
        <Modal
          variant="small"
          isOpen
          onClose={() => setError(undefined)}
          title={t('Failed to download kubeconfig')}
        >
          <Alert
            variant="danger"
            title={t('Failed to download kubeconfig')}
            isInline
            actionLinks={
              <AlertActionLink onClick={() => download(kubeconfigSecretId, clusterName)}>
                {t('Retry')}
              </AlertActionLink>
            }
          >
            {getErrorMessage(error)}
          </Alert>
        </Modal>
      )}
      <Flex
        justifyContent={{ default: 'justifyContentFlexEnd' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
      >
        {isRhoaiInstalled && (
          <Button
            variant="primary"
            icon={<ExternalLinkAltIcon />}
            isDisabled={!isReady || aiGridPending}
            isLoading={aiGridPending}
            onClick={() =>
              fetchAiGridUrl(cluster.id, {
                onSuccess: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
              })
            }
          >
            {t('Open AI Grid')}
          </Button>
        )}
        <Dropdown
          isOpen={isActionsOpen}
          onOpenChange={setIsActionsOpen}
          toggle={(ref) => (
            <MenuToggle
              ref={ref}
              variant="secondary"
              onClick={() => setIsActionsOpen((open) => !open)}
              aria-label={t('Actions for {{name}}', { name: clusterName })}
            >
              {t('Actions')}
            </MenuToggle>
          )}
          popperProps={{ position: 'right' }}
        >
          <DropdownList>
            <DropdownItem
              icon={<DownloadIcon />}
              isDisabled={!isReady || !kubeconfigSecretId || isPending}
              onClick={() => {
                void download(kubeconfigSecretId, clusterName);
                setIsActionsOpen(false);
              }}
            >
              {t(isPending ? 'Downloading kubeconfig...' : 'Download kubeconfig')}
            </DropdownItem>
            <DropdownItem
              icon={<KeyIcon />}
              isDisabled={!isReady || !passwordSecretId}
              onClick={() => {
                setPasswordOpen(true);
                setIsActionsOpen(false);
              }}
            >
              {t('View password')}
            </DropdownItem>
            <DeleteResourceButton
              isDropdown
              canDelete={canDelete}
              onClick={() => {
                if (canDelete) {
                  setDeleteOpen(true);
                  setIsActionsOpen(false);
                }
              }}
            />
          </DropdownList>
        </Dropdown>
      </Flex>
    </>
  );
};

export default ClusterDetailsActionButtons;
