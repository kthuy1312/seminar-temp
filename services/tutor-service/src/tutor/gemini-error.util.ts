export function classifyGeminiError(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('quota') || lowerMsg.includes('rate limit') || lowerMsg.includes('429')) {
    return 'quota_exceeded';
  }
  if (lowerMsg.includes('unauthorized') || lowerMsg.includes('key')) {
    return 'unauthorized';
  }
  return 'unknown_error';
}

export function userFacingGeminiHint(kind: string): string {
  switch (kind) {
    case 'quota_exceeded':
      return 'Hệ thống AI đang quá tải hoặc hết lượt sử dụng. Vui lòng thử lại sau.';
    case 'unauthorized':
      return 'Lỗi xác thực API Key AI.';
    default:
      return 'Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.';
  }
}
