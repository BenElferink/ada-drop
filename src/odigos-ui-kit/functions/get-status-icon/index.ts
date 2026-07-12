import { StatusType, type SVG } from '@odigos/ui-kit/types';
import { CheckCircledIcon, ErrorTriangleIcon, InfoIcon, OdigosLogo, WarningTriangleIcon } from '@odigos/ui-kit/icons';

export const getStatusIcon = (type: StatusType, theme: Record<'text', Record<StatusType, string>>) => {
  const LOGOS: Record<StatusType, SVG> = {
    [StatusType.Success]: (props) => CheckCircledIcon({ fill: theme.text[type], ...props }),
    [StatusType.Error]: (props) => ErrorTriangleIcon({ fill: theme.text[type], ...props }),
    [StatusType.Warning]: (props) => WarningTriangleIcon({ fill: theme.text[type], ...props }),
    [StatusType.Info]: (props) => InfoIcon({ fill: theme.text[type], ...props }),
    [StatusType.Default]: (props) => OdigosLogo({ fill: theme.text[type], ...props }),
  };

  return LOGOS[type];
};
