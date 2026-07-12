import React, { type FC } from 'react';
import { Text } from '../text';
import { Badge } from '../badge';
import type { SVG } from '@odigos/ui-kit/types';
import { Tooltip } from '../tooltip';
import styled from 'styled-components';
import { FadeLoader } from '../fade-loader';
import { FlexRow } from '@odigos/ui-kit/components/styled';

interface IconTitleBadgeProps {
  icon?: SVG;
  title: string;
  badge?: string | number;
  badgeTooltip?: string;
  loading?: boolean;
}

const Title = styled(Text)`
  color: ${({ theme }) => theme.text.grey};
`;

const IconTitleBadge: FC<IconTitleBadgeProps> = ({ icon: Icon, title, badge, badgeTooltip, loading }) => {
  return (
    <FlexRow $gap={6}>
      {Icon && <Icon />}
      <Title size={14}>{title}</Title>

      {/* use typeof, because we should allow zero-values */}
      {typeof badge !== 'undefined' && (
        <Tooltip text={badgeTooltip}>
          <Badge label={badge} />
        </Tooltip>
      )}

      {loading && <FadeLoader />}
    </FlexRow>
  );
};

export { IconTitleBadge, type IconTitleBadgeProps };
