type TagProps = { 
  label: string; 
  tone?: 'default' | 'success' | 'warn' | 'muted' 
};

export function Tag({ label, tone = 'default' }: TagProps) {
  const colors = {
    default: { bg: '#eef2f7', fg: '#0f172a' },
    success: { bg: '#ecfdf5', fg: '#065f46' },
    warn: { bg: '#fff7ed', fg: '#9a3412' },
    muted: { bg: '#f1f5f9', fg: '#475569' },
  }[tone];
  
  return (
    <span style={{ 
      background: colors.bg, 
      color: colors.fg, 
      padding: '2px 8px', 
      borderRadius: 999, 
      fontSize: 12 
    }}>
      {label}
    </span>
  );
}
