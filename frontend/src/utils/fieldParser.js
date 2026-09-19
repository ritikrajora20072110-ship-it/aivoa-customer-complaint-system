// Client-side natural language field and column update intent parser for 0ms instant updates
// Recognizes direct action keywords: change, update, remove, delete, add
// Supports field and column references: field, fields, column, columns, column name
// Preserves all names and values appearing after 'to' EXACTLY as entered.

export const FIELD_MAP = {
  'qms ledger': { key: 'qms_ledger', label: 'QMS Ledger' },
  'qms ledger id': { key: 'qms_ledger', label: 'QMS Ledger' },
  'qms_ledger': { key: 'qms_ledger', label: 'QMS Ledger' },
  'ledger': { key: 'qms_ledger', label: 'QMS Ledger' },
  'customer name': { key: 'customer_name', label: 'Customer Name' },
  'customer': { key: 'customer_name', label: 'Customer Name' },
  'customer id': { key: 'customer_name', label: 'Customer Name' },
  'username': { key: 'customer_name', label: 'Customer Name' },
  'username customer name': { key: 'customer_name', label: 'Customer Name' },
  'client': { key: 'customer_name', label: 'Customer Name' },
  'client name': { key: 'customer_name', label: 'Customer Name' },
  'product name': { key: 'product_name', label: 'Product Name' },
  'product': { key: 'product_name', label: 'Product Name' },
  'drug': { key: 'product_name', label: 'Product Name' },
  'drug product': { key: 'product_name', label: 'Product Name' },
  'product strength': { key: 'product_strength_grade', label: 'Product Strength / Grade' },
  'product strength grade': { key: 'product_strength_grade', label: 'Product Strength / Grade' },
  'strength': { key: 'product_strength_grade', label: 'Product Strength / Grade' },
  'grade': { key: 'product_strength_grade', label: 'Product Strength / Grade' },
  'batch number': { key: 'batch_number', label: 'Batch / Lot Number' },
  'batch no': { key: 'batch_number', label: 'Batch / Lot Number' },
  'batch #': { key: 'batch_number', label: 'Batch / Lot Number' },
  'batch': { key: 'batch_number', label: 'Batch / Lot Number' },
  'lot number': { key: 'batch_number', label: 'Batch / Lot Number' },
  'lot no': { key: 'batch_number', label: 'Batch / Lot Number' },
  'lot': { key: 'batch_number', label: 'Batch / Lot Number' },
  'mfg date': { key: 'mfg_date', label: 'Manufacturing Date' },
  'manufacturing date': { key: 'mfg_date', label: 'Manufacturing Date' },
  'expiry date': { key: 'expiry_date', label: 'Expiry Date' },
  'expiration date': { key: 'expiry_date', label: 'Expiry Date' },
  'expiry': { key: 'expiry_date', label: 'Expiry Date' },
  'quantity affected': { key: 'quantity_affected', label: 'Quantity Affected' },
  'quantity': { key: 'quantity_affected', label: 'Quantity Affected' },
  'qty': { key: 'quantity_affected', label: 'Quantity Affected' },
  'site block': { key: 'site_block', label: 'Originating Site Block' },
  'site': { key: 'site_block', label: 'Originating Site Block' },
  'facility': { key: 'site_block', label: 'Originating Site Block' },
  'cleanroom block': { key: 'site_block', label: 'Originating Site Block' },
  'cleanroom': { key: 'site_block', label: 'Originating Site Block' },
  'impacted npm': { key: 'impacted_npm', label: 'Impacted Packaging Material' },
  'packaging material': { key: 'impacted_npm', label: 'Impacted Packaging Material' },
  'packaging': { key: 'impacted_npm', label: 'Impacted Packaging Material' },
  'complaint type': { key: 'complaint_type', label: 'Complaint Type' },
  'type': { key: 'complaint_type', label: 'Complaint Type' },
  'complaint source': { key: 'complaint_source', label: 'Complaint Source' },
  'source': { key: 'complaint_source', label: 'Complaint Source' },
  'complaint date': { key: 'complaint_date', label: 'Complaint Date' },
  'date': { key: 'complaint_date', label: 'Complaint Date' },
  'defect summary': { key: 'defect_summary', label: 'Defect Summary' },
  'defect': { key: 'defect_summary', label: 'Defect Summary' },
  'description': { key: 'description', label: 'Detailed Description' },
  'suggested severity': { key: 'initial_severity', label: 'Suggested Severity' },
  'severity': { key: 'initial_severity', label: 'Suggested Severity' },
  'risk level': { key: 'initial_severity', label: 'Suggested Severity' },
  'initial severity': { key: 'initial_severity', label: 'Suggested Severity' },
  'suggested next action': { key: 'suggested_next_action', label: 'Suggested Next Action' },
  'next action': { key: 'suggested_next_action', label: 'Suggested Next Action' },
  'action': { key: 'suggested_next_action', label: 'Suggested Next Action' },
  'initial risk assessment': { key: 'initial_risk_assessment', label: 'Initial Risk Assessment' },
  'risk assessment': { key: 'initial_risk_assessment', label: 'Initial Risk Assessment' },
  'priority': { key: 'priority', label: 'Priority' },
  'status': { key: 'status', label: 'Triage Status' },
  'triage status': { key: 'status', label: 'Triage Status' }
};

export const COLUMN_MAP = {
  'customer id': { key: 'customer_name', label: 'Customer ID' },
  'customer': { key: 'customer_name', label: 'Customer' },
  'customer name': { key: 'customer_name', label: 'Customer' },
  'complaint id': { key: 'id', label: 'Complaint ID' },
  'id': { key: 'id', label: 'Complaint ID' },
  'product name': { key: 'product_name', label: 'Product Name' },
  'product': { key: 'product_name', label: 'Product Name' },
  'batch number': { key: 'batch_number', label: 'Batch Number' },
  'batch': { key: 'batch_number', label: 'Batch Number' },
  'defect classification': { key: 'defect_summary', label: 'Defect Classification' },
  'defect': { key: 'defect_summary', label: 'Defect Classification' },
  'severity': { key: 'initial_severity', label: 'Severity' },
  'triage status': { key: 'status', label: 'Triage Status' },
  'status': { key: 'status', label: 'Triage Status' },
  'qms ledger': { key: 'qms_ledger', label: 'QMS Ledger' },
  'ledger': { key: 'qms_ledger', label: 'QMS Ledger' }
};

export function parseIntent(message, context = {}) {
  if (!message || typeof message !== 'string') return null;
  const raw = message.trim();

  // 1. Column Instructions
  // e.g.: "Change column name Customer ID to QMS Ledger"
  const colMatch = raw.match(/^(?:please\s+)?(change|update|rename|modify|remove|delete|add)\s+(?:the\s+)?(?:column\s+name|columns?\s+name|columns?)\s+["']?([^"',;\n]+?)["']?(?:\s+(?:to|as|=|with)\s+(.+))?$/i);
  if (colMatch) {
    const action = colMatch[1].toLowerCase();
    const targetName = colMatch[2].trim();
    let newVal = colMatch[3] ? colMatch[3].trim() : '';
    if ((newVal.startsWith('"') && newVal.endsWith('"')) || (newVal.startsWith("'") && newVal.endsWith("'"))) {
      newVal = newVal.slice(1, -1);
    }
    const targetNorm = targetName.toLowerCase();
    const colInfo = COLUMN_MAP[targetNorm] || { key: targetNorm.replace(/\s+/g, '_'), label: targetName };

    if (action === 'remove' || action === 'delete') {
      return {
        type: 'column_remove',
        columnKey: colInfo.key,
        previousName: colInfo.label,
        action: 'delete'
      };
    } else {
      // Preserve newVal EXACTLY as provided
      return {
        type: 'column_rename',
        columnKey: colInfo.key,
        previousName: colInfo.label,
        newName: newVal,
        action: 'rename'
      };
    }
  }

  // 2. Explicit Field Instructions
  // e.g.: "change field Customer Name to Rithvik Kumar"
  const fieldMatch = raw.match(/^(?:please\s+)?(change|update|modify|set|remove|delete|add)\s+(?:the\s+)?(?:fields?)\s+["']?([^"',;\n]+?)["']?(?:\s+(?:to|as|=|with|is)\s+(.+))?$/i);
  if (fieldMatch) {
    const action = fieldMatch[1].toLowerCase();
    const targetName = fieldMatch[2].trim();
    let newVal = fieldMatch[3] ? fieldMatch[3].trim() : '';
    if ((newVal.startsWith('"') && newVal.endsWith('"')) || (newVal.startsWith("'") && newVal.endsWith("'"))) {
      newVal = newVal.slice(1, -1);
    }
    const targetNorm = targetName.toLowerCase();
    const fieldInfo = FIELD_MAP[targetNorm] || { key: targetNorm.replace(/\s+/g, '_'), label: targetName };
    const prevVal = context[fieldInfo.key] || '';

    if (action === 'remove' || action === 'delete') {
      return {
        type: 'field_update',
        field: fieldInfo.key,
        label: fieldInfo.label,
        value: '',
        previousValue: prevVal,
        action: 'delete'
      };
    } else {
      return {
        type: 'field_update',
        field: fieldInfo.key,
        label: fieldInfo.label,
        value: newVal,
        previousValue: prevVal,
        action: 'update'
      };
    }
  }

  // 3. Natural Field Instructions without "field" keyword (Sorted longest phrase first)
  const phrases = Object.keys(FIELD_MAP).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    // Check remove / delete
    const delRegex = new RegExp(`^(?:please\\s+)?(remove|delete)\\s+(?:the\\s+)?${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (delRegex.test(raw)) {
      const fieldInfo = FIELD_MAP[phrase];
      const prevVal = context[fieldInfo.key] || '';
      return {
        type: 'field_update',
        field: fieldInfo.key,
        label: fieldInfo.label,
        value: '',
        previousValue: prevVal,
        action: 'delete'
      };
    }

    // Check change / update / set / make / add
    const updRegex = new RegExp(`^(?:please\\s+)?(change|update|set|make|replace|add)\\s+(?:the\\s+)?${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?:to|as|=|is|with|\\s)\\s*(.+)$`, 'i');
    const m = raw.match(updRegex);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      const fieldInfo = FIELD_MAP[phrase];
      const prevVal = context[fieldInfo.key] || '';
      return {
        type: 'field_update',
        field: fieldInfo.key,
        label: fieldInfo.label,
        value: val,
        previousValue: prevVal,
        action: 'update'
      };
    }
  }

  return null;
}

// Backward-compatible wrapper for existing calls
export function parseFieldUpdateIntent(message, context = {}) {
  const parsed = parseIntent(message, context);
  if (!parsed) return null;
  if (parsed.type === 'field_update') {
    const res = { [parsed.field]: parsed.value };
    if (parsed.field === 'initial_severity') {
      res.risk_level = parsed.value;
    }
    return res;
  }
  return null;
}
