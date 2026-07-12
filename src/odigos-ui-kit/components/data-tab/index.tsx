import React, { type CSSProperties, type FC, Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import type { SVG } from '@odigos/ui-kit/types';
import { Divider } from '../divider';
import { ScrollX } from '../scroll-x';
import { Checkbox } from '../checkbox';
import { IconGroup } from '../icon-group';
import { IconButton } from '../icon-button';
import { IconWrapped } from '../icon-wrapped';
import { ExtendArrow } from '../extend-arrow';
import styled, { css } from 'styled-components';
import { StatusType, SignalType } from '@odigos/ui-kit/types';
import { MonitorsIcons } from '../monitors-icons';
import { FlexColumn, FlexRow } from '@odigos/ui-kit/components/styled';
import { FadeLoader } from '../fade-loader';

interface IconProps {
  icon?: SVG;
  icons?: SVG[];
  iconSrc?: string;
  iconSrcs?: string[];
}

interface VisualProps {
  status?: StatusType;
  faded?: boolean;
  bgColor?: CSSProperties['backgroundColor'];
  bgColorHover?: CSSProperties['backgroundColor'];
  monitors?: SignalType[];
  monitorsWithLabels?: boolean;
  componentsUnderTitles?: ReactNode[];
}

interface CheckboxProps {
  withCheckbox?: boolean;
  isCheckboxDisabled?: boolean;
  isChecked?: boolean;
  isLoading?: boolean;
  onCheckboxChange?: (value: boolean) => void;
}

interface ExtendableProps {
  withExtend?: boolean;
  isExtended?: boolean;
  renderExtended?: () => ReactNode;
}

interface DataTabProps {
  title: string;
  subTitle?: string;
  hoverText?: string;
  onClick?: () => void;
  renderActions?: () => ReactNode;

  iconProps?: IconProps;
  visualProps?: VisualProps;
  checkboxProps?: CheckboxProps;
  extendableProps?: ExtendableProps;
}

const ControlledVisibility = styled.div`
  visibility: hidden;
`;

const Container = styled.div<{ $withClick?: boolean; $status?: StatusType; $faded?: boolean; $bgColor?: CSSProperties['backgroundColor']; $bgColorHover?: CSSProperties['backgroundColor'] }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  padding: 16px;
  width: calc(100% - 32px);
  border-radius: 16px;
  background-color: ${({ theme, $status, $bgColor }) => $bgColor || ($status ? theme.text[$status] + Theme.opacity.hex['010'] : theme.colors.secondary + Theme.opacity.hex['005'])};
  opacity: ${({ $faded }) => ($faded ? 0.5 : 1)};

  ${({ theme, $status, $bgColorHover, $withClick }) =>
    $withClick
      ? css`
          &:hover {
            cursor: pointer;
            background-color: ${$bgColorHover || ($status ? theme.text[$status] + Theme.opacity.hex['020'] : theme.colors.secondary + Theme.opacity.hex['010'])};
            ${ControlledVisibility} {
              visibility: visible;
            }
          }
        `
      : `
      &:hover {
        ${ControlledVisibility} {
          visibility: visible;
        }
      }
    `}
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const HoverText = styled(Text)`
  margin-right: 16px;
`;

const SubText = styled(Text)`
  font-size: 10px;
  color: ${({ theme }) => theme.text.grey};
`;

const DataTab: FC<DataTabProps> = ({
  title,
  subTitle,
  hoverText,
  onClick,
  renderActions,
  iconProps: { icon, icons, iconSrc, iconSrcs } = {},
  visualProps: { status, faded, bgColor, bgColorHover, monitors, monitorsWithLabels, componentsUnderTitles } = {},
  checkboxProps: { withCheckbox, isCheckboxDisabled, isChecked, isLoading: isCheckboxLoading, onCheckboxChange } = {},
  extendableProps: { withExtend, isExtended, renderExtended } = {},
  ...props
}) => {
  const theme = Theme.useTheme();
  const [extend, setExtend] = useState(isExtended || false);
  const [textMaxWidth, setTextMaxWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const monitorsRef = useRef<HTMLDivElement>(null);

  // Dynamically define maximim width for title and subtitle
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const actionsWidth = actionsRef.current?.clientWidth || 0;

      // 85 is the sum of the container-padding, icon-width, and flex-row-gap.
      // 125 is the sum of the above, plus checkboxes.
      const widthOfNonTextContents = (withCheckbox ? 125 : 85) + actionsWidth;

      setTextMaxWidth(containerWidth - widthOfNonTextContents);
    }
  }, [withCheckbox]);

  return (
    <Container ref={containerRef} $status={status} $faded={faded} $bgColor={bgColor} $bgColorHover={bgColorHover} $withClick={!!onClick} onClick={onClick} {...props}>
      <FlexRow $gap={8}>
        <FlexRow $gap={16}>
          {isCheckboxLoading ? <FadeLoader /> : withCheckbox ? <Checkbox value={isChecked} onChange={onCheckboxChange} disabled={isCheckboxDisabled} /> : null}

          {!!icons?.length || !!iconSrcs?.length ? (
            <IconGroup icons={icons} iconSrcs={iconSrcs} status={status} id={`${title}-${subTitle}`} />
          ) : !!icon || !!iconSrc ? (
            <IconWrapped icon={icon} src={iconSrc} status={status} />
          ) : null}
        </FlexRow>

        <FlexColumn $gap={4}>
          {title && <ScrollX maxWidth={textMaxWidth} text={title} textSize={14} />}

          <FlexRow $gap={4}>
            {subTitle && <ScrollX maxWidth={textMaxWidth - (monitorsRef.current?.clientWidth || 0)} text={subTitle} textSize={10} textColor={theme.text.grey} />}

            {monitors && monitors.length > 0 && (
              <FlexRow $gap={4} ref={monitorsRef}>
                {subTitle && <SubText>•</SubText>}
                <MonitorsIcons monitors={monitors} withLabels={monitorsWithLabels} size={10} />
              </FlexRow>
            )}
          </FlexRow>

          {componentsUnderTitles && componentsUnderTitles.length > 0 ? (
            <FlexRow $gap={4}>
              {componentsUnderTitles?.map((component, i) => (
                <Fragment key={`componentsUnderTitles-${i}`}>{component}</Fragment>
              ))}
            </FlexRow>
          ) : null}
        </FlexColumn>

        <ActionsWrapper ref={actionsRef}>
          {!!hoverText && (
            <ControlledVisibility>
              <HoverText size={14} family='secondary'>
                {hoverText}
              </HoverText>
            </ControlledVisibility>
          )}
          {renderActions && renderActions()}
          {withExtend && (
            <Fragment>
              <Divider orientation='vertical' length='16px' margin='0 2px' />
              <IconButton onClick={() => setExtend((prev) => !prev)}>
                <ExtendArrow extend={extend} />
              </IconButton>
            </Fragment>
          )}
        </ActionsWrapper>
      </FlexRow>

      {extend && renderExtended && (
        <FlexColumn>
          <Divider margin='16px 0' />
          {renderExtended()}
        </FlexColumn>
      )}
    </Container>
  );
};

export { DataTab, type DataTabProps };
