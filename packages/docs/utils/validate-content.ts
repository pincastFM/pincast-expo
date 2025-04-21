import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

// Define the front matter schema
const frontMatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

type ValidationError = {
  file: string;
  errors: string[];
};

/**
 * Check if a path is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Recursively collect all markdown files in a directory
 */
async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });
  const markdownFiles: string[] = [];

  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      const nestedFiles = await collectMarkdownFiles(fullPath);
      markdownFiles.push(...nestedFiles);
    } else if (file.name.endsWith('.md')) {
      markdownFiles.push(fullPath);
    }
  }

  return markdownFiles;
}

/**
 * Validate front matter in a markdown file
 */
async function validateFrontMatter(filePath: string): Promise<ValidationError | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const { data } = matter(content);
    
    try {
      // Validate with zod schema
      frontMatterSchema.parse(data);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          file: filePath,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return {
        file: filePath,
        errors: ['Unknown validation error'],
      };
    }
  } catch (error) {
    return {
      file: filePath,
      errors: [`Failed to read or parse file: ${(error as Error).message}`],
    };
  }
}

/**
 * Check for broken internal links in content
 */
async function validateInternalLinks(filePath: string, allFiles: string[]): Promise<ValidationError | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const markdownLinkRegex = /\[.*?\]\((\/[^)]+)\)/g;
    const errors: string[] = [];
    
    // Get the content directory for path resolution
    const contentDir = resolve(process.cwd(), 'content');
    
    // Create set of valid paths from the files list
    const validPaths = new Set(
      allFiles.map(file => {
        // Convert full file paths to URL paths
        const relativePath = file
          .replace(contentDir, '')
          .replace(/\.md$/, '')
          .replace(/\/index$/, '/');
        return relativePath;
      })
    );
    
    // Add the root path
    validPaths.add('/');
    
    // Find all markdown links in the content
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const link = match[1];
      
      // Skip external links and fragment links
      if (!link.startsWith('/')) continue;
      
      // Remove fragments from the link
      const cleanLink = link.split('#')[0];
      
      // Check if the link points to a valid path
      if (!validPaths.has(cleanLink)) {
        errors.push(`Broken internal link: ${link}`);
      }
    }
    
    if (errors.length > 0) {
      return {
        file: filePath,
        errors,
      };
    }
    
    return null;
  } catch (error) {
    return {
      file: filePath,
      errors: [`Failed to check links: ${(error as Error).message}`],
    };
  }
}

/**
 * Validate all markdown files in the content directory
 */
export async function validateContent(): Promise<ValidationError[]> {
  const contentDir = resolve(process.cwd(), 'content');
  const files = await collectMarkdownFiles(contentDir);
  const errors: ValidationError[] = [];
  
  // Validate front matter
  for (const file of files) {
    const frontMatterErrors = await validateFrontMatter(file);
    if (frontMatterErrors) {
      errors.push(frontMatterErrors);
    }
    
    // Validate internal links
    const linkErrors = await validateInternalLinks(file, files);
    if (linkErrors) {
      errors.push(linkErrors);
    }
  }
  
  return errors;
}

// Allow running directly from command line
if (require.main === module) {
  validateContent()
    .then(errors => {
      if (errors.length === 0) {
        console.log('✅ All content files passed validation!');
        process.exit(0);
      } else {
        console.error(`❌ Found ${errors.length} files with validation errors:`);
        errors.forEach(error => {
          console.error(`\nFile: ${error.file}`);
          error.errors.forEach(err => {
            console.error(`  - ${err}`);
          });
        });
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error during validation:', err);
      process.exit(1);
    });
}