class ExtractData {
  extractMimeType(base64String: string): string | null {
    const match = base64String.match(/^data:(.+?);base64,/);
    return match ? match[1] : null;
  }

  extractBase64Data(base64String: string) {
    const parts = base64String.split(',');

    const base64Data = parts[1];

    return base64Data;
  }
}

const extractData = new ExtractData();

export { extractData };
