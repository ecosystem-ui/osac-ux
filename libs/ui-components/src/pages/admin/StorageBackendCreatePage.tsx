import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  ExpandableSection,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import type { TFunction } from 'i18next';
import * as Yup from 'yup';

import type { StorageBackend } from '@osac/types/private';
import {
  useCreateStorageBackend,
  usePrivateStorageBackend,
  useUpdateStorageBackend,
} from '@osac/ui-components/api/v1/private/storage-backends';
import NameField from '@osac/ui-components/components/catalogProvision/wizard/fields/NameField';
import { InputField } from '@osac/ui-components/components/Form/InputField';
import LeaveFormConfirmation from '@osac/ui-components/components/Form/LeaveFormConfirmation';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';
import {
  SelectField,
  type SelectFieldOption,
} from '@osac/ui-components/components/Form/SelectField';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';
import { getErrorMessage } from '@osac/ui-components/utils/error';
import { resourceNameSchema } from '@osac/ui-components/validation/resource-name';

const BACKENDS_LIST_PATH = '/admin/infrastructure/storage/backends';

interface StorageBackendFormValues {
  metadata: { name: string };
  provider: string;
  endpoint: string;
  description: string;
  credentials: { username: string; password: string };
  vast: {
    vipPoolSupernet: string;
    vipPoolSliceSize: string;
    vipPoolGwIp: string;
    vipPoolGwIpv6: string;
  };
}

const CIDR_REGEX = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

const getInitialValues = (backend?: StorageBackend): StorageBackendFormValues => {
  const vastConfig =
    backend?.spec?.providerConfig?.case === 'vast' ? backend.spec.providerConfig.value : undefined;
  return {
    metadata: { name: backend?.metadata?.name ?? '' },
    provider: backend?.spec?.provider ?? '',
    endpoint: backend?.spec?.endpoint ?? '',
    description: backend?.spec?.description ?? '',
    credentials: { username: '', password: '' },
    vast: {
      vipPoolSupernet: vastConfig?.vipPoolSupernet ?? '',
      vipPoolSliceSize: vastConfig?.vipPoolSliceSize ? String(vastConfig.vipPoolSliceSize) : '',
      vipPoolGwIp: vastConfig?.vipPoolGwIp ?? '',
      vipPoolGwIpv6: vastConfig?.vipPoolGwIpv6 ?? '',
    },
  };
};

const getStorageBackendSchema = (t: TFunction, isEdit: boolean) => {
  const pairError = t('Enter both username and password, or leave both blank');
  return Yup.object({
    metadata: Yup.object({ name: resourceNameSchema(t) }),
    provider: Yup.string().required(t('Provider is required')),
    endpoint: Yup.string().required(t('Endpoint is required')),
    description: Yup.string(),
    // On edit, credentials start blank and are all-or-nothing: both blank keeps them
    // unchanged, both filled replaces them, exactly one filled is invalid (there's no
    // server-side way to update just one). On create they're always required.
    credentials: isEdit
      ? Yup.object({
          username: Yup.string().test('credentials-pair', pairError, function (value) {
            const parent = this.parent as { username?: string; password?: string } | undefined;
            return !!value === !!parent?.password;
          }),
          password: Yup.string().test('credentials-pair', pairError, function (value) {
            const parent = this.parent as { username?: string; password?: string } | undefined;
            return !!value === !!parent?.username;
          }),
        })
      : Yup.object({
          username: Yup.string().required(t('Username is required')),
          password: Yup.string().required(t('Password is required')),
        }),
    vast: Yup.object({
      vipPoolSupernet: Yup.string().test(
        'valid-cidr',
        t('Must be a valid CIDR block (e.g. 10.100.0.0/22)'),
        (value) => !value || CIDR_REGEX.test(value),
      ),
      vipPoolSliceSize: Yup.number()
        .integer(t('Must be a whole number'))
        .min(1, t('Must be at least 1'))
        .nullable()
        .transform((v: unknown, orig: unknown) => (orig === '' ? null : v)),
      vipPoolGwIp: Yup.string(),
      vipPoolGwIpv6: Yup.string(),
    }),
  });
};

const StorageBackendForm = ({ backend }: { backend?: StorageBackend }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEdit = !!backend;
  const { mutateAsync: create, error: createError } = useCreateStorageBackend();
  const { mutateAsync: update, error: updateError } = useUpdateStorageBackend();
  const error = isEdit ? updateError : createError;

  const providerOptions: SelectFieldOption[] = [
    { value: 'vast', label: t('VAST') },
    { value: 'ceph', label: t('Ceph') },
    { value: 'pure', label: t('Pure') },
  ];

  const onSubmit = async (values: StorageBackendFormValues) => {
    const vastConfig =
      values.provider === 'vast' &&
      (values.vast.vipPoolSupernet ||
        values.vast.vipPoolSliceSize ||
        values.vast.vipPoolGwIp ||
        values.vast.vipPoolGwIpv6)
        ? {
            vipPoolSupernet: values.vast.vipPoolSupernet || undefined,
            vipPoolSliceSize: values.vast.vipPoolSliceSize
              ? Number(values.vast.vipPoolSliceSize)
              : undefined,
            vipPoolGwIp: values.vast.vipPoolGwIp || undefined,
            vipPoolGwIpv6: values.vast.vipPoolGwIpv6 || undefined,
          }
        : undefined;

    try {
      if (backend) {
        await update({
          id: backend.id,
          version: backend.metadata?.version ?? 0,
          spec: {
            endpoint: values.endpoint,
            description: values.description,
            ...(vastConfig ? { vast: vastConfig } : {}),
            ...(values.credentials.username && values.credentials.password
              ? {
                  credentials: {
                    username: values.credentials.username,
                    password: values.credentials.password,
                  },
                }
              : {}),
          },
        });
        navigate(BACKENDS_LIST_PATH);
      } else {
        const created = await create({
          metadata: values.metadata,
          spec: {
            provider: values.provider,
            endpoint: values.endpoint,
            description: values.description,
            credentials: {
              username: values.credentials.username,
              password: values.credentials.password,
            },
            ...(vastConfig ? { vast: vastConfig } : {}),
          },
        });
        navigate(`${BACKENDS_LIST_PATH}/${created.id}`);
      }
    } catch {
      // Surfaced via the mutation's own `error` state below; nothing further to do here.
    }
  };

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <Breadcrumb>
            <BreadcrumbItem>
              <Button variant="link" isInline onClick={() => navigate(BACKENDS_LIST_PATH)}>
                {t('Storage Backends')}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{isEdit ? t('Edit') : t('Create')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {isEdit ? t('Edit storage backend') : t('Create storage backend')}
          </Title>
        </Stack>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Formik
          initialValues={getInitialValues(backend)}
          validationSchema={getStorageBackendSchema(t, isEdit)}
          onSubmit={onSubmit}
        >
          {({ submitForm, isSubmitting, values }) => (
            <Stack hasGutter>
              <LeaveFormConfirmation />
              <StackItem>
                <OsacForm>
                  <NameField isDisabled={isEdit} />
                  <SelectField
                    name="provider"
                    label={t('Provider')}
                    fieldId="storage-backend-provider"
                    isRequired
                    isDisabled={isEdit}
                    options={providerOptions}
                  />
                  <InputField
                    name="endpoint"
                    label={t('Endpoint')}
                    fieldId="storage-backend-endpoint"
                    isRequired
                  />
                  <InputField
                    name="description"
                    label={t('Description')}
                    fieldId="storage-backend-description"
                  />
                  <InputField
                    name="credentials.username"
                    label={t('Username')}
                    fieldId="storage-backend-username"
                    isRequired={!isEdit}
                    helperText={
                      isEdit ? t('Leave blank to keep the current credentials.') : undefined
                    }
                  />
                  <InputField
                    name="credentials.password"
                    label={t('Password')}
                    fieldId="storage-backend-password"
                    type="password"
                    isRequired={!isEdit}
                  />
                  {values.provider === 'vast' && (
                    <ExpandableSection
                      toggleText={t('VAST VIP Pool configuration')}
                      isIndented
                    >
                      <InputField
                        name="vast.vipPoolSupernet"
                        label={t('VIP pool supernet (CIDR)')}
                        fieldId="storage-backend-vip-pool-supernet"
                        placeholder="10.100.0.0/22"
                        helperText={t(
                          'CIDR block used to carve per-tenant VIP pool IP ranges. Leave empty to require pre-created pools.',
                        )}
                      />
                      <InputField
                        name="vast.vipPoolSliceSize"
                        label={t('IPs per tenant')}
                        fieldId="storage-backend-vip-pool-slice-size"
                        type="number"
                        placeholder="4"
                        helperText={t(
                          'Number of consecutive IPs allocated per tenant within the supernet. Defaults to 4.',
                        )}
                      />
                      <InputField
                        name="vast.vipPoolGwIp"
                        label={t('Gateway IP')}
                        fieldId="storage-backend-vip-pool-gw-ip"
                        helperText={t('Optional default gateway IP applied to self-created VIP pools.')}
                      />
                      <InputField
                        name="vast.vipPoolGwIpv6"
                        label={t('IPv6 gateway')}
                        fieldId="storage-backend-vip-pool-gw-ipv6"
                        helperText={t('Optional IPv6 gateway applied to self-created VIP pools.')}
                      />
                    </ExpandableSection>
                  )}
                </OsacForm>
              </StackItem>

              {!!error && (
                <StackItem>
                  <Alert
                    variant="danger"
                    title={
                      isEdit
                        ? t('Failed to update storage backend')
                        : t('Failed to create storage backend')
                    }
                    isInline
                  >
                    {getErrorMessage(error)}
                  </Alert>
                </StackItem>
              )}
              <StackItem>
                <ActionList>
                  <ActionListGroup>
                    <ActionListItem>
                      <Button
                        variant="primary"
                        onClick={submitForm}
                        isDisabled={isSubmitting}
                        isLoading={isSubmitting}
                      >
                        {isEdit ? t('Save') : t('Create')}
                      </Button>
                    </ActionListItem>
                    <ActionListItem>
                      <Button
                        variant="link"
                        onClick={() => navigate(BACKENDS_LIST_PATH)}
                        isDisabled={isSubmitting}
                      >
                        {t('Cancel')}
                      </Button>
                    </ActionListItem>
                  </ActionListGroup>
                </ActionList>
              </StackItem>
            </Stack>
          )}
        </Formik>
      </PageSection>
    </>
  );
};

export const StorageBackendCreatePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePrivateStorageBackend(id ?? '');

  if (id) {
    if (isLoading) {
      return (
        <Bullseye>
          <Spinner />
        </Bullseye>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" isInline title={t('Failed to fetch storage backend')}>
          {getErrorMessage(error)}
        </Alert>
      );
    }
  }

  return <StorageBackendForm backend={data} />;
};
