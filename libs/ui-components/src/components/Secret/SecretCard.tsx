import {
  Card,
  CardBody,
  Content,
} from '@patternfly/react-core';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';

import { Secret, SecretType } from '@osac/types';
import SecretActionsMenu from '@osac/ui-components/components/Secret/SecretActionsMenu';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { getSecretType, getSecretTypeDataKeys } from './utils.ts';
import { Timestamp } from '../Primitives/Timestamp.tsx';
import ResourceNameField from '../Resource/ResourceNameField.tsx';

import './SecretCard.css';

interface SecretCardProps {
  secret: Secret;
  onEdit: () => void;
  onDelete: () => void;
}

const SecretCard = ({ secret, onEdit, onDelete }: SecretCardProps) => {
  const { t } = useTranslation();
  const secretTypes = getSecretType(t);
  const typeLabel = secretTypes[secret.type] || secretTypes[SecretType.UNSPECIFIED];
  const dataKeys = getSecretTypeDataKeys(secret.type);

  return (
    <Card isFullHeight className="tenant-secrets__card">
      <CardBody>
        <div className="tenant-secrets__card-header">
          <span className="tenant-secrets__card-icon" aria-hidden="true">
            <KeyIcon />
          </span>
          <div className="tenant-secrets__card-header-actions">
            <SecretActionsMenu secret={secret} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
        <Content component="p" className="tenant-secrets__primary-cell">
          <ResourceNameField resource={secret} detailsUrl={`/secrets/${secret.id}`} />
        </Content>
        <dl className="tenant-secrets__specs-list">
          <div className="tenant-secrets__spec-row">
            <dt className="tenant-secrets__spec-label">{t('Type')}</dt>
            <dd className="tenant-secrets__spec-value">{typeLabel}</dd>
          </div>
          <div className="tenant-secrets__spec-row">
            <dt className="tenant-secrets__spec-label">{t('Keys')}</dt>
            <dd className="tenant-secrets__spec-value">{dataKeys || '-'}</dd>
          </div>
          <div className="tenant-secrets__spec-row">
            <dt className="tenant-secrets__spec-label">{t('Added')}</dt>
            <dd className="tenant-secrets__spec-value">
              <Timestamp value={secret.metadata?.creationTimestamp} />
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
};

export default SecretCard;
