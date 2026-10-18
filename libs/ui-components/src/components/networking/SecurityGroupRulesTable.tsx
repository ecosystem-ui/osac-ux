import { Button } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { TFunction } from 'i18next';

import { Protocol, type SecurityRule } from '@osac/types';

import SecurityGroupRuleActionsMenu from './SecurityGroupRuleActionsMenu';
import { useTranslation } from '../../hooks/useTranslation';
import { SubtleContent } from '../SubtleContent/SubtleContent';

import './SecurityGroupRulesTable.css';

interface SecurityGroupRulesTableProps {
  rules: SecurityRule[];
  direction: 'ingress' | 'egress';
  onAddRule: () => void;
  onEditRule: (index: number) => void;
  onDeleteRule: (index: number) => void;
}

export const protocolToString = (protocol: Protocol, t: TFunction): string => {
  switch (protocol) {
    case Protocol.TCP:
      return t('TCP');
    case Protocol.UDP:
      return t('UDP');
    case Protocol.ICMP:
      return t('ICMP');
    case Protocol.ALL:
      return t('All');
    default:
      return t('Unknown');
  }
};

const formatPortRange = (portFrom?: number, portTo?: number): string => {
  if (portFrom === undefined && portTo === undefined) {
    return '—';
  }
  if (portFrom === portTo) {
    return String(portFrom);
  }
  return `${portFrom ?? '—'}-${portTo ?? '—'}`;
};

const formatCidr = (ipv4Cidr?: string): string => ipv4Cidr || '—';

export const SecurityGroupRulesTable = ({
  rules,
  direction,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: SecurityGroupRulesTableProps) => {
  const { t } = useTranslation();

  const cidrLabel = direction === 'ingress' ? t('Source CIDR') : t('Destination CIDR');

  if (rules.length === 0) {
    return (
      <div>
        <SubtleContent component="p">
          {direction === 'ingress'
            ? t('No inbound rules yet. Add one to allow incoming traffic.')
            : t('No outbound rules yet. Add one to allow outgoing traffic.')}
        </SubtleContent>
        <div className="security-group-rules-table__toolbar security-group-rules-table__toolbar--empty">
          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircleIcon />}
            className="security-group-rules-table__add-button"
            onClick={onAddRule}
          >
            {t('Add rule')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="security-group-rules-table__toolbar security-group-rules-table__toolbar--table">
        <Button
          variant="secondary"
          size="sm"
          icon={<PlusCircleIcon />}
          className="security-group-rules-table__add-button"
          onClick={onAddRule}
        >
          {t('Add rule')}
        </Button>
      </div>
      <Table aria-label={`${direction} rules`} variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Protocol')}</Th>
            <Th>{t('Port Range')}</Th>
            <Th>{cidrLabel}</Th>
            <Th>{t('Actions')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rules.map((rule, index) => (
            <Tr key={index}>
              <Td dataLabel={t('Protocol')}>{protocolToString(rule.protocol, t)}</Td>
              <Td dataLabel={t('Port Range')}>{formatPortRange(rule.portFrom, rule.portTo)}</Td>
              <Td dataLabel={cidrLabel}>{formatCidr(rule.ipv4Cidr)}</Td>
              <Td dataLabel={t('Actions')}>
                <SecurityGroupRuleActionsMenu
                  onEdit={() => onEditRule(index)}
                  onDelete={() => onDeleteRule(index)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};
