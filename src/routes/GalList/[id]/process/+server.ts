import { json } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';
import { JSDOM } from 'jsdom';
import { PRIVATE_SUPERUSER_EMAIL, PRIVATE_SUPERUSER_PASSWORD } from '$env/static/private';
await pb.admins.authWithPassword(PRIVATE_SUPERUSER_EMAIL, PRIVATE_SUPERUSER_PASSWORD);

async function hashContent(content: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(content, 'utf8');
    return hash.digest('hex');
}

function extractFileContent(html: string, fileSelectors: string[]): string {
    try {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        if (!document) {
            return '';
        }

        const fileElements: any[] = [];

        fileSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const href = el.getAttribute('href');
                    if (href) {
                        fileElements.push({
                            href: href.trim(),
                            text: (el.textContent?.trim() || '').substring(0, 200),
                            title: (el.getAttribute('title') || '').substring(0, 100),
                            download: (el.getAttribute('download') || '').substring(0, 100)
                        });
                    }
                });
            } catch (error:any) {
                console.warn(`Invalid selector "${selector}":`, error.message);
            }
        });

        // Sort for consistent hashing and stringify
        return JSON.stringify(
            fileElements.sort((a, b) => a.href.localeCompare(b.href))
        );
    } catch (error) {
        console.error('Error extracting file content:', error);
        return '';
    }
}

function extractFiles(html: string, fileSelectors: string[], baseUrl: string) {
    try {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        if (!document) {
            return [];
        }

        const files: any[] = [];
        const seenUrls = new Set();

        fileSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const href = el.getAttribute('href');
                    if (href && !seenUrls.has(href)) {
                        seenUrls.add(href);

                        let fullUrl = href;
                        if (href.startsWith('/')) {
                            fullUrl = baseUrl + href;
                        } else if (!href.startsWith('http')) {
                            fullUrl = baseUrl + '/' + href;
                        }

                        // Validate URL
                        if (isValidUrl(fullUrl)) {
                            files.push({
                                url: fullUrl,
                                name: extractFileName(href, el.textContent?.trim() || ''),
                                linkText: (el.textContent?.trim() || '').substring(0, 200),
                                title: (el.getAttribute('title') || '').substring(0, 100)
                            });
                        }
                    }
                });
            } catch (error:any) {
                console.warn(`Error with selector "${selector}":`, error.message);
            }
        });

        return files;
    } catch (error) {
        console.error('Error extracting files:', error);
        return [];
    }
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function extractFileName(href: string, linkText: string): string {
    const urlParts = href.split('/');
    const lastPart = urlParts[urlParts.length - 1].split('?')[0];

    if (lastPart && lastPart.includes('.')) {
        return decodeURIComponent(lastPart).substring(0, 200);
    }

    if (linkText && linkText.length > 0 && linkText.length < 100) {
        return linkText.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim().substring(0, 200);
    }

    return `document_${Date.now()}`;
}

async function fetchPageContent(url: string): Promise<string | null> {
    try {
        console.log(`Fetching: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        // Limit HTML size to prevent memory issues
        if (text.length > 5 * 1024 * 1024) {
            console.warn(`Large HTML content (${Math.round(text.length / 1024 / 1024)}MB), truncating...`);
            return text.substring(0, 5 * 1024 * 1024);
        }

        return text;
    } catch (error:any) {
        if (error.name === 'AbortError') {
            console.error(`Timeout fetching ${url}`);
        } else {
            console.error(`Failed to fetch ${url}: ${error.message}`);
        }
        return null;
    }
}

async function getPageSnapshot(galId: string, sectionName: string, pageUrl: string) {
    try {
        const escapedGalId = galId.replace(/"/g, '\\"');
        const escapedSectionName = sectionName.replace(/"/g, '\\"');
        const escapedPageUrl = pageUrl.replace(/"/g, '\\"');

        const snapshots = await pb.collection('page_snapshots').getList(1, 1, {
            filter: `gal = "${escapedGalId}" && section_name = "${escapedSectionName}" && page_url = "${escapedPageUrl}"`
        });

        return snapshots.items.length > 0 ? snapshots.items[0] : null;
    } catch (error) {
        console.error(`Error getting snapshot for ${pageUrl}:`, error);
        return null;
    }
}


async function savePageSnapshot(galId: string, sectionName: string, pageUrl: string, contentHash: string, hasChanged = false) {
    try {
        const now = new Date().toISOString();
        const existingSnapshot = await getPageSnapshot(galId, sectionName, pageUrl);

        if (existingSnapshot) {
            return await pb.collection('page_snapshots').update(existingSnapshot.id, {
                content_hash: contentHash,
                last_checked: now,
                last_modified: hasChanged ? now : existingSnapshot.last_modified
            });
        } else {
            return await pb.collection('page_snapshots').create({
                gal: galId,
                section_name: sectionName,
                page_url: pageUrl,
                content_hash: contentHash,
                last_checked: now,
                last_modified: now
            });
        }
    } catch (error) {
        console.error(`Error saving snapshot for ${pageUrl}:`, error);
        throw error;
    }
}

async function fileExists(galId: string, fileUrl: string): Promise<boolean> {
    try {
        const escapedGalId = galId.replace(/"/g, '\\"');
        const escapedFileUrl = fileUrl.replace(/"/g, '\\"');

        const existingFiles = await pb.collection('files').getList(1, 1, {
            filter: `gal = "${escapedGalId}" && fisier = "${escapedFileUrl}"`
        });

        return existingFiles.totalItems > 0;
    } catch (error) {
        console.error(`Error checking file existence for ${fileUrl}:`, error);
        return false;
    }
}

async function saveFiles(galId: string, files: any[]): Promise<any[]> {
    const savedFiles = [];

    for (const file of files) {
        try {
            if (!file.url || !file.name) {
                console.warn(`Skipping invalid file data: ${JSON.stringify(file)}`);
                continue;
            }

            const exists = await fileExists(galId, file.url);

            if (!exists) {
                const fileData = {
                    gal: galId,
                    fisier: file.url.substring(0, 2000),
                    nume: file.name.substring(0, 500)
                };

                if (!fileData.gal || !fileData.fisier || !fileData.nume) {
                    console.warn(`Skipping file with missing required data: ${file.name}`);
                    continue;
                }

                const savedFile = await pb.collection('files').create(fileData);
                savedFiles.push(savedFile);
                console.log(`New file saved: ${file.name}`);
            } else {
                console.log(`File exists: ${file.name}`);
            }
        } catch (error) {
            console.error(`Failed to save file ${file.name}:`, error);
            continue;
        }
    }

    return savedFiles;
}

async function processPage(gal: any, sectionName: string, pageUrl: string, fileSelectors: string[], baseUrl: string) {
    try {
        const fullUrl = pageUrl.startsWith('http') ? pageUrl : `${baseUrl}${pageUrl}`;

        // Fetch page content
        const html = await fetchPageContent(fullUrl);
        if (!html) {
            return { processed: false, hasChanged: false, filesFound: 0, error: 'Failed to fetch' };
        }

        // Extract file-related content and hash it
        const fileContent = extractFileContent(html, fileSelectors);
        const contentHash = await hashContent(fileContent);

        // Get existing snapshot
        const existingSnapshot = await getPageSnapshot(gal.id, sectionName, pageUrl);

        // Check if content changed
        const hasChanged = !existingSnapshot || existingSnapshot.content_hash !== contentHash;

        if (hasChanged) {
            console.log(`Content changed on ${pageUrl}`);

            // Extract and save files
            const files = extractFiles(html, fileSelectors, baseUrl);
            const savedFiles = await saveFiles(gal.id, files);

            // Save updated snapshot
            await savePageSnapshot(gal.id, sectionName, pageUrl, contentHash, !existingSnapshot);

            return {
                processed: true,
                hasChanged: true,
                filesFound: files.length,
                newFiles: savedFiles.length
            };
        } else {
            console.log(`No changes on ${pageUrl}`);

            // Update last_checked timestamp
            await savePageSnapshot(gal.id, sectionName, pageUrl, contentHash, false);

            return { processed: true, hasChanged: false, filesFound: 0, newFiles: 0 };
        }

    } catch (error:any) {
        console.error(`Error processing ${pageUrl}:`, error);
        return { processed: false, hasChanged: false, filesFound: 0, error: error.message };
    }
}

async function processGALPages(gal: any): Promise<any> {
    console.log(`Processing GAL: ${gal.Denumire_GAL}`);

    const websiteField = gal.Website || gal.website || gal.site_web || gal.url || gal.domeniu;
    if (!websiteField) {
        console.error(`No website field found for ${gal.Denumire_GAL}`);
        return { error: 'No website configured' };
    }

    if (!gal.snapshot_config?.sections) {
        console.error(`No snapshot config found for ${gal.Denumire_GAL}`);
        return { error: 'No snapshot configuration found' };
    }

    const baseUrl = `https://${websiteField}`;
    const results = {
        processedSections: 0,
        processedPages: 0,
        changedPages: 0,
        totalFiles: 0,
        newFiles: 0,
        errors: 0,
        sectionResults: [] as any[]
    };

    // Process each section
    for (const [sectionName, sectionConfig] of Object.entries(gal.snapshot_config.sections)) {
        console.log(`Processing section: ${sectionName}`);

        const sectionResults = {
            name: sectionName,
            processedPages: 0,
            changedPages: 0,
            totalFiles: 0,
            newFiles: 0,
            errors: 0
        };

        // Process pages in this section
        for (const pageUrl of (sectionConfig as any).urls) {
            try {
                const result:any = await processPage(gal, sectionName, pageUrl, (sectionConfig as any).file_selectors, baseUrl);

                if (result.processed) {
                    sectionResults.processedPages++;
                    if (result.hasChanged) {
                        sectionResults.changedPages++;
                    }
                    sectionResults.totalFiles += result.filesFound;
                    sectionResults.newFiles += result.newFiles;
                } else {
                    sectionResults.errors++;
                }

                // Small delay between pages
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Failed to process page ${pageUrl}:`, error);
                sectionResults.errors++;
            }
        }

        results.processedSections++;
        results.processedPages += sectionResults.processedPages;
        results.changedPages += sectionResults.changedPages;
        results.totalFiles += sectionResults.totalFiles;
        results.newFiles += sectionResults.newFiles;
        results.errors += sectionResults.errors;
        results.sectionResults.push(sectionResults);
    }

    console.log(`GAL completed: ${results.processedPages} pages, ${results.changedPages} changed, ${results.newFiles} new files`);
    return results;
}

export async function POST({ request, params }) {
    try {
        const { galId } = await request.json();

        if (!galId) {
            return json({ error: 'GAL ID is required' }, { status: 400 });
        }

        // Get GAL data
        const gal = await pb.collection('GALs').getOne(galId);

        if (!gal) {
            return json({ error: 'GAL not found' }, { status: 404 });
        }

        // Check if GAL has snapshot configuration
        if (!gal.snapshot_config?.sections) {
            return json({ error: 'No snapshot configuration found for this GAL' }, { status: 400 });
        }

        // Process the GAL pages
        const processingResults = await processGALPages(gal);

        // Get updated files list
        const updatedFiles = await pb.collection('files').getFullList({
            filter: `gal = "${galId}"`
        });

        return json({
            success: true,
            processingResults,
            files: updatedFiles
        });

    } catch (error:any) {
        console.error('Error in file processing:', error);
        return json({
            error: error.message || 'An error occurred during processing'
        }, { status: 500 });
    }
}