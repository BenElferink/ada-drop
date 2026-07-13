import React, { type FC, useEffect, useRef, useState } from 'react';
import { Input } from '../input';
import { TrashIcon } from '@odigos/ui-kit/icons';
import { isEmpty } from '@odigos/ui-kit/functions';
import { AddButton } from '@odigos/ui-kit/snippets';
import styled from 'styled-components';
import { FieldLabel } from '../field-label';
import { FieldError } from '../field-error';

type Row = string;

interface InputListProps {
  initialValues?: Row[];
  value?: Row[];
  onChange: (values: Row[]) => void;
  title?: string;
  tooltip?: string;
  required?: boolean;
  errorMessage?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RowWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const INITIAL_ROW: Row = '';

const InputList: FC<InputListProps> = ({ initialValues = [], value, onChange, title, tooltip, required, errorMessage }) => {
  const [rows, setRows] = useState<Row[]>(value || initialValues);

  useEffect(() => {
    if (!rows.length) setRows([INITIAL_ROW]);
  }, []);

  // Filter out rows where either key or value is empty
  const validRows = rows.filter((str) => !!str.trim());
  const recordedRows = useRef(JSON.stringify(validRows));

  useEffect(() => {
    const stringified = JSON.stringify(validRows);

    // Only trigger onChange if valid key-value pairs have changed
    if (recordedRows.current !== stringified) {
      recordedRows.current = stringified;

      if (onChange) onChange(validRows);
    }
  }, [validRows, onChange]);

  const handleAddInput = () => {
    setRows((prev) => {
      const payload = [...prev];
      payload.push(INITIAL_ROW);
      return payload;
    });
  };

  const handleDeleteInput = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleInputChange = (val: string, idx: number) => {
    setRows((prev) => {
      const payload = [...prev];
      payload[idx] = val;
      return payload;
    });
  };

  // Check if any input field is empty
  const isMinRows = rows.length <= 1;
  const isAddButtonDisabled = rows.some((input) => input.trim() === '');
  const isDelButtonDisabled = isMinRows && isAddButtonDisabled;

  return (
    <Container>
      <FieldLabel title={title} required={required} tooltip={tooltip} />

      <ListContainer>
        {rows.map((val, idx) => {
          const isLast = idx === rows.length - 1;

          return (
            <RowWrapper key={`input-list-${idx}`}>
              <Input value={val} onChange={(e) => handleInputChange(e.target.value, idx)} hasError={!!errorMessage} autoFocus={isEmpty(val) && !isMinRows && isLast} />
              <DeleteButton
                disabled={isDelButtonDisabled}
                onClick={() => {
                  if (isMinRows) {
                    handleInputChange('', idx);
                  } else {
                    handleDeleteInput(idx);
                  }
                }}
              >
                <TrashIcon />
              </DeleteButton>
            </RowWrapper>
          );
        })}
      </ListContainer>

      {!!errorMessage && <FieldError>{errorMessage}</FieldError>}

      <AddButton onClick={handleAddInput} disabled={isAddButtonDisabled} />
    </Container>
  );
};

export { InputList, type InputListProps };
