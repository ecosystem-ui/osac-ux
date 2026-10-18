import { Flex, FlexItem } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { usePrivateStorageBackends } from '@osac/ui-components/api/v1/private/storage-backends';
import ListPageBody from '@osac/ui-components/components/Page/ListPageBody';
import CreateButton from '@osac/ui-components/components/Primitives/CreateButton.tsx';
import { StorageBackendsTable } from '@osac/ui-components/components/Storage/StorageBackendsTable';
import { SubtleContent } from '@osac/ui-components/components/SubtleContent/SubtleContent';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import '../../components/Storage/StorageTables.css';

export const StorageBackendsListPage = () => {
  const { t } = useTranslation();

  const { data: backends = [], isLoading, error } = usePrivateStorageBackends();

  return (
    <>
      <Flex className="pf-v6-u-mt-md" justifyContent={{ default: 'justifyContentFlexEnd' }}>
        <FlexItem>
          <CreateButton
            to="/admin/infrastructure/storage/backends/create"
            variant="secondary"
            size="sm"
            icon={<PlusCircleIcon />}
          >
            {t('Create backend')}
          </CreateButton>
        </FlexItem>
      </Flex>
      <ListPageBody isLoading={isLoading} error={error}>
        {backends.length === 0 ? (
          <SubtleContent component="p">
            {t('No storage backends yet. Create one to get started.')}
          </SubtleContent>
        ) : (
          <StorageBackendsTable backends={backends} />
        )}
      </ListPageBody>
    </>
  );
};
