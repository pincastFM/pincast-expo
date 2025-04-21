import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { validateContent } from '../utils/validate-content';

// Create a temporary test directory
const TEST_DIR = join(__dirname, 'temp-content');
const CONTENT_DIR = join(TEST_DIR, 'content');

describe('Content Validation', () => {
  beforeEach(async () => {
    // Mock process.cwd to return our test directory
    vi.spyOn(process, 'cwd').mockReturnValue(TEST_DIR);
    
    // Create test directories
    await mkdir(TEST_DIR, { recursive: true });
    await mkdir(CONTENT_DIR, { recursive: true });
    await mkdir(join(CONTENT_DIR, 'nested'), { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up test directory
    await rm(TEST_DIR, { recursive: true, force: true });
    vi.restoreAllMocks();
  });
  
  it('should validate valid markdown files', async () => {
    // Create valid markdown files
    await writeFile(
      join(CONTENT_DIR, 'valid.md'),
      `---
title: Valid Title
description: Valid description
---

# Valid Content`
    );
    
    await writeFile(
      join(CONTENT_DIR, 'nested', 'valid-nested.md'),
      `---
title: Valid Nested Title
description: Valid nested description
---

# Valid Nested Content`
    );
    
    // Run validation
    const errors = await validateContent();
    
    // Expect no errors
    expect(errors).toHaveLength(0);
  });
  
  it('should detect missing front matter fields', async () => {
    // Create invalid markdown file with missing title
    await writeFile(
      join(CONTENT_DIR, 'missing-title.md'),
      `---
description: Description without title
---

# Missing Title`
    );
    
    // Create invalid markdown file with missing description
    await writeFile(
      join(CONTENT_DIR, 'missing-description.md'),
      `---
title: Title without description
---

# Missing Description`
    );
    
    // Run validation
    const errors = await validateContent();
    
    // Expect errors for both files
    expect(errors).toHaveLength(2);
    
    // Check error messages
    const missingTitleError = errors.find(e => e.file.includes('missing-title.md'));
    expect(missingTitleError?.errors).toContain('title: Required');
    
    const missingDescError = errors.find(e => e.file.includes('missing-description.md'));
    expect(missingDescError?.errors).toContain('description: Required');
  });
  
  it('should detect broken internal links', async () => {
    // Create files with internal links
    await writeFile(
      join(CONTENT_DIR, 'with-valid-link.md'),
      `---
title: Page with Valid Link
description: This page has a valid internal link
---

# Page with Valid Link

Check out the [other page](/nested/valid-nested).`
    );
    
    await writeFile(
      join(CONTENT_DIR, 'with-broken-link.md'),
      `---
title: Page with Broken Link
description: This page has a broken internal link
---

# Page with Broken Link

Check out the [non-existent page](/does-not-exist).`
    );
    
    await writeFile(
      join(CONTENT_DIR, 'nested', 'valid-nested.md'),
      `---
title: Valid Nested Title
description: Valid nested description
---

# Valid Nested Content`
    );
    
    // Run validation
    const errors = await validateContent();
    
    // Expect error only for the broken link
    expect(errors).toHaveLength(1);
    
    // Check error message
    const brokenLinkError = errors.find(e => e.file.includes('with-broken-link.md'));
    expect(brokenLinkError?.errors).toContain('Broken internal link: /does-not-exist');
  });
  
  it('should handle empty content directory', async () => {
    // Run validation on empty directory
    const errors = await validateContent();
    
    // Expect no errors
    expect(errors).toHaveLength(0);
  });
});