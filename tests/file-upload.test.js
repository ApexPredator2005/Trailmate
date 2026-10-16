/**
 * tests/file-upload.test.js — File Upload Safety & Magic-Byte Validation Tests
 */

import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../src/components/ScrapbookWorkspace.js';

describe('File Upload Safety & Magic-Byte Validation', () => {
  it('accepts a valid JPEG image with authentic magic bytes (FF D8 FF)', async () => {
    // Construct minimal authentic JPEG header
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60]);
    const file = new File([jpegBytes], 'mountain_view.jpg', { type: 'image/jpeg' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid PNG image with authentic magic bytes (89 50 4E 47)', async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52]);
    const file = new File([pngBytes], 'lake_sunset.png', { type: 'image/png' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid WebP image with authentic RIFF/WEBP header', async () => {
    const webpBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20]);
    const file = new File([webpBytes], 'camp.webp', { type: 'image/webp' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid GIF image with authentic GIF89a header', async () => {
    const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const file = new File([gifBytes], 'sparkle.gif', { type: 'image/gif' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects an SVG file disguised as an image to prevent XML/XSS vector execution', async () => {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const file = new File([svgContent], 'malicious.svg', { type: 'image/svg+xml' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Only JPEG, PNG, WebP, and GIF images are permitted');
  });

  it('rejects an executable or script disguised with an image extension', async () => {
    // Shell script disguised with .jpg extension
    const scriptContent = '#!/bin/bash\necho "Malicious payload"\nexit 0';
    const file = new File([scriptContent], 'innocent_look.jpg', { type: 'image/jpeg' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid image content or an unsupported format');
  });

  it('rejects truncated or corrupted files smaller than 12 bytes', async () => {
    const corruptBytes = new Uint8Array([0xff, 0xd8, 0xff]);
    const file = new File([corruptBytes], 'broken.jpg', { type: 'image/jpeg' });

    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('corrupted or truncated');
  });

  it('rejects oversized files exceeding 10MB limit', async () => {
    // Mock oversized file > 10MB
    const oversizedFile = {
      name: 'huge_panorama.jpg',
      size: 11 * 1024 * 1024, // 11MB
    };

    const result = await validateImageFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds the maximum allowed size of 10MB');
  });
});
