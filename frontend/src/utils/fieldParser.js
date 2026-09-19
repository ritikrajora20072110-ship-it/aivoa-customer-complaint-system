// Client-side natural language field update intent parser for 0ms instant updates

export function parseFieldUpdateIntent(message) {
  if (!message || typeof message !== 'string') return null;
  const raw = message.trim();
  
  // 1. Customer Name / Username
  let m = raw.match(/(?:change|update|set|make|replace|rename)\s+(?:the\s+)?(?:username\s+customer\s+name|customer\s+name|username|customer|client(?:\s+name)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (!m) m = raw.match(/(?:username\s+customer\s+name|customer\s+name|customer)\s*(?:is|should\s+be|=|:)\s*([^.,;\n]+)/i);
  if (m) return { customer_name: m[1].trim().replace(/^["']|["']$/g, '') };

  // 2. Product Name
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:product(?:\s+name)?|drug(?:\s+product)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (!m) m = raw.match(/(?:product(?:\s+name)?|drug)\s*(?:is|should\s+be|=|:)\s*([^.,;\n]+)/i);
  if (m) return { product_name: m[1].trim().replace(/^["']|["']$/g, '') };

  // 3. Batch Number / Lot Number
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:batch(?:\s+number|\s+no|\s+#)?|lot(?:\s+number|\s+no|\s+#)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (!m) m = raw.match(/(?:batch(?:\s+number|\s+no|\s+#)?|lot(?:\s+number|\s+no|\s+#)?)\s*(?:is|should\s+be|=|:)\s*([^.,;\n]+)/i);
  if (m) return { batch_number: m[1].trim().replace(/^["']|["']$/g, '') };

  // 4. Severity (Suggested) / Risk Level
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:suggested\s+severity|severity|risk\s+level|criticality)\s*(?:to|as|=|is|with|\s)\s*(critical|major|minor|pending triage)/i);
  if (!m) m = raw.match(/(?:severity|risk\s+level)\s*(?:is|should\s+be|=|:)\s*(critical|major|minor)/i);
  if (m) {
    const val = m[1].trim();
    const titleVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    return { initial_severity: titleVal, risk_level: titleVal };
  }

  // 5. Suggested Next Action
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:suggested\s+next\s+action|next\s+action|action)\s*(?:to|as|=|is|with|\s)\s*([^.;\n]+)/i);
  if (m) return { suggested_next_action: m[1].trim().replace(/^["']|["']$/g, '') };

  // 6. Initial Risk Assessment
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:initial\s+risk\s+assessment|risk\s+assessment(?:\s+description)?)\s*(?:to|as|=|is|with|\s)\s*([^;\n]+)/i);
  if (m) return { initial_risk_assessment: m[1].trim().replace(/^["']|["']$/g, '') };

  // 7. Priority
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:priority)\s*(?:to|as|=|is|with|\s)\s*(urgent|high|medium|low)/i);
  if (m) {
    const val = m[1].trim();
    return { priority: val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() };
  }

  // 8. Site Block / Facility
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:site(?:\s+block)?|facility|cleanroom(?:\s+block)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (m) return { site_block: m[1].trim().replace(/^["']|["']$/g, '') };

  // 9. Quantity Affected
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:quantity(?:\s+affected)?|qty)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (m) return { quantity_affected: m[1].trim().replace(/^["']|["']$/g, '') };

  // 10. Defect Summary
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:defect(?:\s+summary)?)\s*(?:to|as|=|is|with|\s)\s*([^.;\n]+)/i);
  if (m) return { defect_summary: m[1].trim().replace(/^["']|["']$/g, '') };

  // 11. Expiry Date
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:expiry(?:\s+date)?|expiration(?:\s+date)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (m) return { expiry_date: m[1].trim().replace(/^["']|["']$/g, '') };

  // 12. Manufacturing Date
  m = raw.match(/(?:change|update|set|make)\s+(?:the\s+)?(?:mfg(?:\s+date)?|manufacturing(?:\s+date)?)\s*(?:to|as|=|is|with|\s)\s*([^.,;\n]+)/i);
  if (m) return { mfg_date: m[1].trim().replace(/^["']|["']$/g, '') };

  return null;
}
