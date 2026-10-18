import { useState } from 'react';
import {
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';

import type { ComputeInstance } from '@osac/types';

import type { UtilizationSample, VmNetworkUtilization } from '../../../api/v1/vm-utilization';
import { useVmUtilization } from '../../../api/v1/vm-utilization';
import { useTranslation } from '../../../hooks/useTranslation';

import './VmUtilizationSection.css';

// ── Constants ────────────────────────────────────────────────────────────────

const DONUT_RADIUS = 40;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const WINDOW_OPTIONS = [
  { label: 'Last 5 minutes', minutes: 5 },
  { label: 'Last 15 minutes', minutes: 15 },
  { label: 'Last 1 hour', minutes: 60 },
] as const;

// ── Formatters ───────────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(0)} MiB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${bytes.toFixed(0)} B`;
};

const formatBytesTotal = (bytes: number): string => {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(0)} GiB`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(0)} MiB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${bytes.toFixed(0)} B`;
};

const formatBytesPerSec = (bps: number): string => {
  if (bps >= 1024 ** 2) {
    return `${(bps / 1024 ** 2).toFixed(1)} MBps`;
  }
  if (bps >= 1024) {
    return `${(bps / 1024).toFixed(1)} KBps`;
  }
  return `${bps.toFixed(0)} Bps`;
};

const formatTime = (ms: number): string =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Donut chart ──────────────────────────────────────────────────────────────

interface DonutProps {
  pct: number;
  label: string;
}

const UtilizationDonut = ({ pct, label }: DonutProps) => {
  const arc = (Math.min(pct, 100) / 100) * DONUT_CIRCUMFERENCE;
  return (
    <div className="vm-util-donut" role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="vm-util-donut__svg">
        <circle className="vm-util-donut__track" cx="50" cy="50" r={DONUT_RADIUS} />
        <circle
          className="vm-util-donut__arc"
          cx="50"
          cy="50"
          r={DONUT_RADIUS}
          strokeDasharray={`${arc} ${DONUT_CIRCUMFERENCE}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="vm-util-donut__center">{`${pct.toFixed(0)}%`}</span>
    </div>
  );
};

// ── Sparkline ────────────────────────────────────────────────────────────────

interface SparklineProps {
  samples: UtilizationSample[];
  windowStart: number;
  windowEnd: number;
  /** Max Y value for the Y axis labels */
  yMaxLabel: string;
  /** Optional fill under the line */
  filled?: boolean;
}

const toSparkPoints = (samples: UtilizationSample[], maxVal: number): string => {
  if (samples.length < 2) {
    return '';
  }
  const w = 120;
  const h = 40;
  return samples
    .map((s, i) => {
      const x = (i / (samples.length - 1)) * w;
      const y = h - (s.value / maxVal) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

const toFillPoints = (sparkPoints: string, w = 120, h = 40): string => {
  if (!sparkPoints) {
    return '';
  }
  return `0,${h} ${sparkPoints} ${w},${h}`;
};

const UtilizationSparkline = ({
  samples,
  windowStart,
  windowEnd,
  yMaxLabel,
  filled = false,
}: SparklineProps) => {
  const maxVal = Math.max(...samples.map((s) => s.value), 1);
  const points = toSparkPoints(samples, maxVal);
  const fillPoints = toFillPoints(points);
  const limitY = 6; // "request" line near top

  return (
    <div className="vm-util-spark" aria-hidden="true">
      <div className="vm-util-spark__y">
        <span>{yMaxLabel}</span>
        <span>0</span>
      </div>
      <div className="vm-util-spark__plot">
        <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="vm-util-spark__svg">
          {filled && (
            <polyline
              className="vm-util-spark__fill"
              fill="currentColor"
              stroke="none"
              points={fillPoints}
            />
          )}
          <polyline className="vm-util-spark__line" fill="none" points={points} />
          <line
            className="vm-util-spark__limit"
            x1="0"
            y1={limitY}
            x2="120"
            y2={limitY}
            strokeDasharray="3 3"
          />
        </svg>
      </div>
      <div className="vm-util-spark__x">
        <span>{formatTime(windowStart)}</span>
        <span>{formatTime(windowEnd)}</span>
      </div>
    </div>
  );
};

// ── Tile wrapper ─────────────────────────────────────────────────────────────

interface TileProps {
  label: string;
  abs: string;
  absSub: string;
  children: React.ReactNode;
}

const UtilizationTile = ({ label, abs, absSub, children }: TileProps) => (
  <div className="vm-util-tile">
    <div className="vm-util-tile__label">{label}</div>
    <div className="vm-util-tile__abs">{abs}</div>
    <div className="vm-util-tile__abs-sub">{absSub}</div>
    {children}
  </div>
);

// ── Network tile (no donut — shows in/out breakdown) ─────────────────────────

interface NetworkTileProps {
  net: VmNetworkUtilization;
  windowStart: number;
  windowEnd: number;
  t: (key: string) => string;
}

const NetworkTile = ({ net, windowStart, windowEnd, t }: NetworkTileProps) => (
  <div className="vm-util-tile">
    <div className="vm-util-tile__label">{t('Network transfer')}</div>
    <div className="vm-util-tile__abs">{formatBytesPerSec(net.totalBytesPerSec)}</div>
    <div className="vm-util-tile__abs-sub">{t('Total')}</div>
    <div className="vm-util-net-body">
      <div className="vm-util-net-row">
        <span>{formatBytesPerSec(net.inBytesPerSec)}</span>
        <span>{t('In')}</span>
      </div>
      <div className="vm-util-net-row">
        <span>{formatBytesPerSec(net.outBytesPerSec)}</span>
        <span>{t('Out')}</span>
      </div>
    </div>
    <UtilizationSparkline
      samples={net.history}
      windowStart={windowStart}
      windowEnd={windowEnd}
      yMaxLabel=" "
      filled
    />
  </div>
);

// ── Main section ─────────────────────────────────────────────────────────────

interface VmUtilizationSectionProps {
  vm: ComputeInstance;
}

const VmUtilizationSection = ({ vm }: VmUtilizationSectionProps) => {
  const { t } = useTranslation();
  const [windowMinutes, setWindowMinutes] = useState(5);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const { data } = useVmUtilization(vm.id, windowMinutes);

  const { cpu, memory, storage, network, windowStart, windowEnd } = data;

  const selectedWindow =
    WINDOW_OPTIONS.find((o) => o.minutes === windowMinutes) ?? WINDOW_OPTIONS[0];

  return (
    <div className="vm-utilization">
      <div className="vm-utilization__header">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <FlexItem>
            <Title headingLevel="h2" size="lg">
              {t('Utilization')}
            </Title>
          </FlexItem>
          <FlexItem>
            <Select
              isOpen={isWindowOpen}
              onOpenChange={setIsWindowOpen}
              onSelect={(_, val) => {
                if (typeof val === 'number') {
                  setWindowMinutes(val);
                }
                setIsWindowOpen(false);
              }}
              toggle={(ref) => (
                <MenuToggle
                  ref={ref}
                  variant="plain"
                  onClick={() => setIsWindowOpen((o) => !o)}
                  className="vm-util-window-toggle"
                >
                  {t(selectedWindow.label)}
                  <AngleDownIcon className="vm-util-window-toggle__icon" aria-hidden />
                </MenuToggle>
              )}
            >
              <SelectList>
                {WINDOW_OPTIONS.map((opt) => (
                  <SelectOption
                    key={opt.minutes}
                    value={opt.minutes}
                    isSelected={opt.minutes === windowMinutes}
                  >
                    {t(opt.label)}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>
        </Flex>
      </div>
      <div className="vm-utilization__body">
        <Grid hasGutter>
          {/* CPU */}
          <GridItem sm={6} lg={3}>
            <UtilizationTile
              label={t('vCPUs')}
              abs={`${cpu.usedMillicores} m`}
              absSub={t('Requested of {{total}}', {
                total: Math.round(cpu.totalMillicores / 1000),
              })}
            >
              <UtilizationDonut
                pct={cpu.percentUsed}
                label={t('{{pct}}% vCPU used', { pct: cpu.percentUsed.toFixed(1) })}
              />
              <UtilizationSparkline
                samples={cpu.history}
                windowStart={windowStart}
                windowEnd={windowEnd}
                yMaxLabel={`${cpu.totalMillicores.toFixed(0)}`}
              />
            </UtilizationTile>
          </GridItem>

          {/* Memory */}
          <GridItem sm={6} lg={3}>
            <UtilizationTile
              label={t('Memory')}
              abs={formatBytes(memory.usedBytes)}
              absSub={t('Used of {{total}}', { total: formatBytesTotal(memory.totalBytes) })}
            >
              <UtilizationDonut
                pct={memory.percentUsed}
                label={t('{{pct}}% memory used', { pct: memory.percentUsed.toFixed(0) })}
              />
              <UtilizationSparkline
                samples={memory.history}
                windowStart={windowStart}
                windowEnd={windowEnd}
                yMaxLabel={formatBytesTotal(memory.totalBytes)}
                filled
              />
            </UtilizationTile>
          </GridItem>

          {/* Storage */}
          <GridItem sm={6} lg={3}>
            <UtilizationTile
              label={t('Storage')}
              abs={formatBytes(storage.usedBytes)}
              absSub={t('Used of {{total}}', { total: formatBytesTotal(storage.totalBytes) })}
            >
              <UtilizationDonut
                pct={storage.percentUsed}
                label={t('{{pct}}% storage used', { pct: storage.percentUsed.toFixed(0) })}
              />
              <UtilizationSparkline
                samples={storage.history}
                windowStart={windowStart}
                windowEnd={windowEnd}
                yMaxLabel={formatBytesTotal(storage.totalBytes)}
              />
            </UtilizationTile>
          </GridItem>

          {/* Network */}
          <GridItem sm={6} lg={3}>
            <NetworkTile net={network} windowStart={windowStart} windowEnd={windowEnd} t={t} />
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};

export default VmUtilizationSection;
