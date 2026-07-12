import React, { type ReactNode, type FC, useState, CSSProperties, useMemo, useCallback } from 'react';
import { Text } from '../text';
import { TableRow } from './table-row';
import styled from 'styled-components';
import { SortArrowsIcon } from '@odigos/ui-kit/icons';
import { FlexRow } from '@odigos/ui-kit/components/styled';
import { SortDirection, StatusType, type SVG } from '@odigos/ui-kit/types';

interface ColumnCell {
  key: string; // used to bind the row cell to the column
  title: string;
  sortable?: boolean;
}

interface RowCell {
  columnKey: string; // used to bind the row cell to the column
  icon?: SVG;
  component?: () => ReactNode;
  value?: string | number | boolean;
  textColor?: CSSProperties['color'];
  withTooltip?: boolean;
}

interface Row {
  status?: StatusType;
  faded?: boolean;
  onClick?: () => void;
  cells: RowCell[];
}

interface InteractiveTableProps {
  columns: ColumnCell[];
  rows: Row[];
}

const Container = styled.div`
  width: 100%;
`;

const Table = styled.table`
  position: relative;
  z-index: 0;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
`;

const TableHead = styled.thead`
  // only supported with "border-collapse: collapse;"
  // border-top: 1px solid ${({ theme }) => theme.colors.dropdown_bg_2};
  // border-bottom: 1px solid ${({ theme }) => theme.colors.dropdown_bg_2};
`;

const TableTitle = styled.th`
  // only required with "border-collapse: separate;"
  border-top: 1px solid ${({ theme }) => theme.colors.dropdown_bg_2};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dropdown_bg_2};

  padding: 8px;
`;

const SortClickable = styled(FlexRow)`
  cursor: pointer;
  &:hover {
    * {
      color: ${({ theme }) => theme.text.secondary};
    }
  }
`;

const Title = styled(Text)`
  color: ${({ theme }) => theme.text.darker_grey};
  font-family: ${({ theme }) => theme.font_family.secondary};
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  text-wrap: nowrap;
`;

const TableBody = styled.tbody``;

const InteractiveTable: FC<InteractiveTableProps> = ({ columns, rows }) => {
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Ascending);
  const [sortBy, setSortBy] = useState<string>('name');

  const onSort = useCallback(
    (key: string) => {
      if (sortBy === key) {
        setSortDirection((prev) => (prev === SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending));
      } else {
        setSortBy(key);
        setSortDirection(SortDirection.Ascending);
      }
    },
    [sortBy],
  );

  const sortedRows = useMemo(() => {
    const getCellValue = (row: InteractiveTableProps['rows'][0], key: string) => {
      return row.cells.find(({ columnKey }) => columnKey === key)?.value ?? null;
    };

    const compareValues = (a: unknown, b: unknown) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;

      // Fallback (handles null, undefined, mixed types)
      return String(a).localeCompare(String(b));
    };

    return (
      sortBy
        ? [...rows].sort((a, b) => {
            const valueA = getCellValue(a, sortBy);
            const valueB = getCellValue(b, sortBy);
            const direction = sortDirection === SortDirection.Ascending ? 1 : -1;

            return direction * compareValues(valueA, valueB);
          })
        : rows
    ).map(({ status, faded, cells, onClick }, i) => <TableRow key={`row-${i}`} index={i} columns={columns} cells={cells} onClick={onClick} status={status} faded={faded} />);
  }, [columns, rows, sortBy, sortDirection]);

  return (
    <Container>
      <Table>
        <TableHead>
          <tr>
            {columns.map(({ key, title, sortable }) => (
              <TableTitle key={`column-${key}`}>
                {sortable ? (
                  <SortClickable onClick={() => onSort(key)}>
                    <SortArrowsIcon />
                    <Title>{title}</Title>
                  </SortClickable>
                ) : (
                  <Title>{title}</Title>
                )}
              </TableTitle>
            ))}
          </tr>
        </TableHead>

        <TableBody>{sortedRows}</TableBody>
      </Table>
    </Container>
  );
};

export { InteractiveTable, type InteractiveTableProps, type ColumnCell, type RowCell, type Row };
