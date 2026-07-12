import React, { FC, useEffect, useState } from 'react';
import { Text } from '../text';
import { CheckIcon } from '@odigos/ui-kit/icons';
import { StatusType } from '@odigos/ui-kit/types';
import styled from 'styled-components';
import { FlexColumn, FlexRow } from '@odigos/ui-kit/components/styled';

enum StepState {
  Active = 'active',
  Disabled = 'disabled',
  Finished = 'finish',
}

interface StepperProps {
  currentStep: number;
  data: {
    stepNumber: number;
    title: string;
    subtitle?: string;
  }[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Step = styled.div<{ $state: StepState }>`
  display: flex;
  gap: 16px;
  padding: 8px;
  opacity: ${({ $state }) => ($state === StepState.Active ? 1 : $state === StepState.Disabled ? 0.5 : 0.8)};
  transition: all 0.3s;
`;

const IconWrapper = styled(FlexRow)<{ $state: StepState }>`
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 32px;
  border: ${({ theme, $state }) => ($state === StepState.Disabled ? `1px dashed ${theme.text.dark_grey}` : `1px solid ${theme.colors.secondary}`)};
  opacity: ${({ $state }) => ($state === StepState.Finished ? 0.8 : 1)};
`;

const Content = styled(FlexColumn)`
  justify-content: center;
  gap: 8px;
`;

const Title = styled(Text)``;

const Subtitle = styled(Text)``;

const Stepper: FC<StepperProps> = ({ data, currentStep = 0 }) => {
  const [stepsList, setStepsList] = useState<(StepperProps['data'][0] & { state: StepState })[]>([]);

  useEffect(() => {
    setStepsList(
      data.map((step, i) => {
        if (i < currentStep - 1) {
          // Finished
          return { ...step, state: StepState.Finished, subtitle: step.subtitle || StatusType.Success };
        } else if (i === currentStep - 1) {
          // Current
          return { ...step, state: StepState.Active, subtitle: '' };
        } else {
          // Future
          return { ...step, state: StepState.Disabled, subtitle: '' };
        }
      }),
    );
  }, [currentStep, data]);

  return (
    <Container>
      {stepsList.map((step, index) => (
        <Step key={index} $state={step.state}>
          <IconWrapper $state={step.state}>
            {[StepState.Active, StepState.Disabled].includes(step.state) ? <Text size={12}>{step.stepNumber}</Text> : step.state === StepState.Finished ? <CheckIcon size={20} /> : null}
          </IconWrapper>

          <Content>
            <Title family='secondary'>{step.title}</Title>
            {step.subtitle && (
              <Subtitle size={10} weight={300}>
                {step.subtitle}
              </Subtitle>
            )}
          </Content>
        </Step>
      ))}
    </Container>
  );
};

export { Stepper, type StepperProps };
