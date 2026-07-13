import React, { useState, useRef, type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { Badge } from '../badge';
import { Input } from '../input';
import type { SVG } from '@odigos/ui-kit/types';
import { FlexRow } from '../styled';
import { Divider } from '../divider';
import { Checkbox } from '../checkbox';
import { useOnClickOutside } from '@odigos/ui-kit/hooks';
import { FieldLabel } from '../field-label';
import { FieldError } from '../field-error';
import { ExtendArrow } from '../extend-arrow';
import { NoDataFound } from '../no-data-found';
import styled, { css } from 'styled-components';
import { CheckIcon, CrossIcon, SearchIcon } from '@odigos/ui-kit/icons';

interface DropdownOption<T = string> {
  id?: T | null;
  value?: string | null;
  icon?: SVG | null;
}

interface DropdownProps {
  title?: string;
  tooltip?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: DropdownOption | DropdownOption[];
  onSelect?: (option: DropdownOption) => void;
  onDeselect?: (option: DropdownOption) => void;
  isMulti?: boolean;
  disabled?: boolean;
  required?: boolean;
  showSearch?: boolean;
  errorMessage?: string;
  hasError?: boolean; // to show error colors without a message
}

const RootContainer = styled.div<{ $disabled: DropdownProps['disabled'] }>`
  display: flex;
  flex-direction: column;
  min-width: 120px;
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const RelativeContainer = styled.div`
  position: relative;
`;

const DropdownHeader = styled.div<{
  $isOpen: boolean;
  $isMulti?: boolean;
  $hasSelections: boolean;
  $hasError: boolean;
  $disabled: DropdownProps['disabled'];
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: ${({ $isMulti, $hasSelections }) => ($isMulti && $hasSelections ? '0 16px 0 6px' : '0 16px')};
  border-radius: 32px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  ${({ $isOpen, $isMulti, theme }) =>
    $isOpen && !$isMulti
      ? css`
          border: 1px solid ${theme.text.grey};
          background: ${theme.colors.dropdown_bg_2};
        `
      : css`
          border: 1px solid ${theme.colors.border};
          background: transparent;
        `};

  ${({ $hasError }) =>
    $hasError &&
    css`
      border-color: ${({ theme }) => theme.text.error};
    `}

  &:hover {
    border-color: ${({ $isMulti, $hasSelections, $disabled, theme }) => ($disabled ? 'auto' : $isMulti && $hasSelections ? theme.colors.border : theme.colors.secondary)};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Dropdown: FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  onDeselect,
  title,
  tooltip,
  placeholder,
  disabled = false,
  isMulti = false,
  showSearch = false,
  required = false,
  errorMessage,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setIsOpen(false));

  const handleDirection = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isNearBottom = rect.bottom + 300 > window.innerHeight;
      setOpenUpwards(isNearBottom);
    }
  };

  const toggleOpen = () => {
    handleDirection();
    setIsOpen((prev) => !prev);
  };

  const arrLen = Array.isArray(value) ? value.length : 0;

  return (
    <RootContainer $disabled={disabled}>
      <FieldLabel title={title} required={required} tooltip={tooltip} />

      <RelativeContainer ref={containerRef}>
        <DropdownHeader
          $isOpen={isOpen}
          $isMulti={isMulti}
          $hasSelections={Array.isArray(value) ? !!value.length : false}
          $hasError={!!errorMessage || hasError}
          $disabled={disabled}
          onClick={() => !disabled && toggleOpen()}
        >
          <DropdownPlaceholder value={value} placeholder={placeholder} onDeselect={onDeselect} />
          <IconWrapper>
            {isMulti && <Badge label={arrLen} filled={!!arrLen} />}
            <ExtendArrow extend={isOpen} />
          </IconWrapper>
        </DropdownHeader>

        {isOpen && (
          <DropdownList
            openUpwards={openUpwards}
            options={options}
            value={value}
            onSelect={(option) => {
              onSelect?.(option);
              if (!isMulti) toggleOpen();
            }}
            onDeselect={(option) => {
              onDeselect?.(option);
              if (!isMulti) toggleOpen();
            }}
            isMulti={isMulti}
            showSearch={showSearch}
          />
        )}
      </RelativeContainer>

      {!!errorMessage && <FieldError>{errorMessage}</FieldError>}
    </RootContainer>
  );
};

const MultiLabelWrapper = styled(IconWrapper)`
  max-width: calc(100% - 50px);
  overflow-x: auto;
`;

const MultiLabel = styled(Text)`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  background: ${({ theme }) => theme.colors.dropdown_bg_2};
  border-radius: 360px;
  white-space: nowrap;
  text-overflow: ellipsis;
  img {
    &:hover {
      transform: scale(2);
      transition: transform 0.3s;
    }
  }
`;

const Label = styled(Text)``;

const DropdownPlaceholder: FC<{
  value: DropdownProps['value'];
  placeholder: DropdownProps['placeholder'];
  onDeselect: DropdownProps['onDeselect'];
}> = ({ value, placeholder, onDeselect }) => {
  const theme = Theme.useTheme();

  if (Array.isArray(value)) {
    return !!value.length ? (
      <MultiLabelWrapper>
        {value.map((opt) => (
          <MultiLabel key={`multi-label-${opt.id}`} size={14}>
            {opt.value}
            <Divider orientation='vertical' length='10px' margin='0 4px' />
            <CrossIcon
              size={12}
              onClick={(e) => {
                e.stopPropagation();
                onDeselect?.(opt);
              }}
            />
          </MultiLabel>
        ))}
      </MultiLabelWrapper>
    ) : (
      <Label size={14} color={theme.text.grey}>
        {placeholder}
      </Label>
    );
  }

  return (
    <Label size={14} color={!!value?.value ? undefined : theme.text.grey}>
      {value?.value || placeholder}
    </Label>
  );
};

const AbsoluteContainer = styled.div<{ $openUpwards: boolean }>`
  position: absolute;
  ${({ $openUpwards }) => ($openUpwards ? 'bottom' : 'top')}: calc(100% + 8px);
  left: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: calc(100% - 16px);
  max-height: 200px;
  gap: 8px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.dropdown_bg_2};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DropdownList: FC<{
  openUpwards: boolean;
  options: DropdownProps['options'];
  value: DropdownProps['value'];
  onSelect: DropdownProps['onSelect'];
  onDeselect: DropdownProps['onDeselect'];
  isMulti: DropdownProps['isMulti'];
  showSearch: DropdownProps['showSearch'];
}> = ({ openUpwards, options, value, onSelect, onDeselect, isMulti, showSearch }) => {
  const [searchText, setSearchText] = useState('');
  const filteredOptions = options.filter((option) => option.value?.toLowerCase().includes(searchText?.toLowerCase()));

  return (
    <AbsoluteContainer $openUpwards={openUpwards}>
      {showSearch && (
        <SearchInputContainer>
          <Input placeholder='Search...' icon={SearchIcon} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <Divider thickness={1} margin='8px 0 0 0' />
        </SearchInputContainer>
      )}

      {filteredOptions.length === 0 ? (
        <NoDataFound subTitle={showSearch && !!searchText ? undefined : ' '} />
      ) : (
        filteredOptions.map((opt, idx) => <DropdownListItem key={`dropdown-option-${opt.id || idx}`} option={opt} value={value} isMulti={isMulti} onSelect={onSelect} onDeselect={onDeselect} />)
      )}
    </AbsoluteContainer>
  );
};

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 32px;
  &:hover,
  &.selected {
    background: ${({ theme }) => theme.colors.majestic_blue + Theme.opacity.hex['024']};
  }
`;

const DropdownListItem: FC<{
  option: DropdownOption;
  value: DropdownProps['value'];
  isMulti: DropdownProps['isMulti'];
  onSelect: DropdownProps['onSelect'];
  onDeselect: DropdownProps['onDeselect'];
}> = ({ option, value, isMulti, onSelect, onDeselect }) => {
  const theme = Theme.useTheme();
  const isSelected = Array.isArray(value) ? !!value?.find((s) => s.id === option.id) : value?.id === option.id;

  const handleChange = (toAdd: boolean) => (toAdd ? onSelect?.(option) : onDeselect?.(option));

  if (isMulti) {
    return (
      <DropdownItem className={isSelected ? 'selected' : ''} onClick={() => handleChange(!isSelected)}>
        <Checkbox title={option.value || ''} titleColor={theme.text.secondary} value={isSelected} onChange={handleChange} style={{ width: '100%' }} />
      </DropdownItem>
    );
  }

  return (
    <DropdownItem className={isSelected ? 'selected' : ''} onClick={() => (isSelected ? onDeselect?.(option) : onSelect?.(option))}>
      <FlexRow $gap={8}>
        {option.icon && <option.icon />}
        <Text size={14}>{option.value}</Text>
      </FlexRow>
      {isSelected && <CheckIcon />}
    </DropdownItem>
  );
};

export { Dropdown, type DropdownProps, type DropdownOption };
