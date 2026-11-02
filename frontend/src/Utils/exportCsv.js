/**
 * Universal CSV Export Utility for Dosnoventa Data Tables & Analytics
 * RFC 4180 compliant with UTF-8 BOM for Microsoft Excel & Google Sheets compatibility.
 *
 * @param {string} filename - Target filename (e.g. 'products_catalog.csv')
 * @param {Array<{ label: string, key: string | ((row: any) => any) }>} columns - Column definitions
 * @param {Array<object>} data - Data array to export
 */
export const exportToCsv = (filename, columns, data) => {
  if (!data || !data.length) {
    if (typeof window !== 'undefined') {
      window.alert('No records available to export.');
    }
    return;
  }

  // 1. Generate Header Row
  const headerLine = columns
    .map(col => `"${String(col.label || '').replace(/"/g, '""')}"`)
    .join(',');

  // 2. Format Each Record
  const bodyLines = data.map(row => {
    return columns
      .map(col => {
        let val;
        if (typeof col.key === 'function') {
          val = col.key(row);
        } else if (typeof col.key === 'string') {
          // Support dot-notation like 'user.name'
          val = col.key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), row);
        } else {
          val = '';
        }

        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'number') {
          val = String(val);
        } else if (typeof val === 'boolean') {
          val = val ? 'Yes' : 'No';
        } else if (val instanceof Date) {
          val = val.toISOString();
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        // Clean newlines inside fields to preserve row integrity
        val = val.replace(/\r\n|\n|\r/g, ' ');

        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  // 3. Assemble with UTF-8 BOM (\uFEFF)
  const csvString = '\uFEFF' + [headerLine, ...bodyLines].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger download
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateSuffix = new Date().toISOString().split('T')[0];
  const cleanFilename = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}_${dateSuffix}.csv`;

  anchor.href = downloadUrl;
  anchor.setAttribute('download', cleanFilename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
};

