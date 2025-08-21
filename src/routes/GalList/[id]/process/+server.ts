import { json } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';
import { JSDOM } from 'jsdom';
import { PRIVATE_SUPERUSER_EMAIL, PRIVATE_SUPERUSER_PASSWORD } from '$env/static/private';
import crypto from 'crypto';
import type { RecordModel } from 'pocketbase';

await pb.admins.authWithPassword(PRIVATE_SUPERUSER_EMAIL, PRIVATE_SUPERUSER_PASSWORD);

// Move crypto to top level to avoid repeated imports
function hashContent(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// Cache for parsed DOMs to avoid re-parsing
const domCache = new Map<string, Document>();

function extractFileContent(html: string, fileSelectors: string[]): string {
    try {
        // Check cache first
        const cacheKey = hashContent(html).substring(0, 16);
        let document = domCache.get(cacheKey);

        if (!document) {
            const dom = new JSDOM(html);
            document = dom.window.document;

            // Cache with size limit
            if (domCache.size > 50) {
                const firstKey = domCache.keys().next().value;
                //@ts-ignore
                domCache.delete(firstKey);
            }
            domCache.set(cacheKey, document);
        }

        const fileElements: any[] = [];

        // Combine all selectors into one query for better performance
        const combinedSelector = fileSelectors.join(', ');
        const elements = document.querySelectorAll(combinedSelector);

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
        // Reuse cached DOM
        const cacheKey = hashContent(html).substring(0, 16);
        let document = domCache.get(cacheKey);

        if (!document) {
            const dom = new JSDOM(html);
            document = dom.window.document;

            if (domCache.size > 50) {
                const firstKey = domCache.keys().next().value;
                //@ts-ignore
                domCache.delete(firstKey);
            }
            domCache.set(cacheKey, document);
        }

        const files: any[] = [];
        const seenUrls = new Set();

        // Use combined selector
        const combinedSelector = fileSelectors.join(', ');
        const elements = document.querySelectorAll(combinedSelector);

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

// Enhanced HTTP client with connection pooling
class HttpClient {
    private static instance: HttpClient;
    private agent: any;

    private constructor() {
        // Use undici for better performance (if available in your environment)
        // Otherwise, keep using fetch but with optimizations
    }

    static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }

    async fetchWithRetry(url: string, maxRetries = 2): Promise<string | null> {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (attempt < maxRetries && response.status >= 500) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
                        continue;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const text = await response.text();

                // Reduced size limit for faster processing
                if (text.length > 1.5 * 1024 * 1024) { // 1.5MB instead of 2MB
                    return text.substring(0, 1.5 * 1024 * 1024);
                }

                return text;
            } catch (error: any) {
                if (attempt === maxRetries) {
                    if (error.name === 'AbortError') {
                        console.error(`Timeout fetching ${url} after ${maxRetries + 1} attempts`);
                    } else {
                        console.error(`Failed to fetch ${url} after ${maxRetries + 1} attempts: ${error.message}`);
                    }
                    return null;
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            }
        }
        return null;
    }
}

const httpClient = HttpClient.getInstance();

async function batchGetSnapshots(galId: string, sectionName: string, pageUrls: string[]) {
    try {
        const escapedGalId = galId.replace(/"/g, '\\"');
        const escapedSectionName = sectionName.replace(/"/g, '\\"');

        const snapshots = await pb.collection('page_snapshots').getFullList({
            filter: `gal = "${escapedGalId}" && section_name = "${escapedSectionName}"`,
            fields: 'id,page_url,content_hash,last_modified' // Only fetch needed fields
        });

        const snapshotMap = new Map();
        snapshots.forEach(snapshot => {
            snapshotMap.set(snapshot.page_url, snapshot);
        });

        return snapshotMap;
    } catch (error) {
        console.error('Error getting batch snapshots:', error);
        return new Map();
    }
}

async function batchGetExistingFiles(galId: string) {
    try {
        const escapedGalId = galId.replace(/"/g, '\\"');
        const existingFiles = await pb.collection('files').getFullList({
            filter: `gal = "${escapedGalId}"`,
            fields: 'fisier' // Only fetch the URL field
        });

        const fileSet = new Set();
        existingFiles.forEach(file => {
            fileSet.add(file.fisier);
        });

        return fileSet;
    } catch (error) {
        console.error('Error getting existing files:', error);
        return new Set();
    }
}

async function batchSaveSnapshots(updates: any[]) {
    // Process in smaller chunks for better performance
    const chunkSize = 5;
    const results = [];

    for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        const promises = chunk.map(update => {
            if (update.existingId) {
                return pb.collection('page_snapshots').update(update.existingId, update.data);
            } else {
                return pb.collection('page_snapshots').create(update.data);
            }
        });

        const chunkResults = await Promise.allSettled(promises);
        results.push(...chunkResults);
    }

    return results;
}

async function batchSaveFiles(files: any[]) {
    if (files.length === 0) return [];

    // Smaller chunks for file operations
    const chunkSize = 3;
    const results = [];

    for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const promises = chunk.map(file => pb.collection('files').create(file));
        const chunkResults = await Promise.allSettled(promises);
        results.push(...chunkResults);

        // Small delay between chunks to avoid overwhelming the database
        if (i + chunkSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

async function processPagesConcurrently(
    gal: any,
    sectionName: string,
    pageUrls: string[],
    fileSelectors: string[],
    baseUrl: string,
    concurrency = 10 // Increased concurrency
) {
    const snapshotMap = await batchGetSnapshots(gal.id, sectionName, pageUrls);
    const existingFilesSet = await batchGetExistingFiles(gal.id);

    const results = {
        processedPages: 0,
        changedPages: 0,
        totalFiles: 0,
        newFiles: 0,
        errors: 0
    };

    const snapshotUpdates: any[] = [];
    const newFiles: any[] = [];

    // Process pages in batches
    for (let i = 0; i < pageUrls.length; i += concurrency) {
        const batch = pageUrls.slice(i, i + concurrency);

        const batchPromises = batch.map(async (pageUrl) => {
            try {
                const fullUrl = pageUrl.startsWith('http') ? pageUrl : `${baseUrl}${pageUrl}`;

                // Use enhanced HTTP client
                const html = await httpClient.fetchWithRetry(fullUrl);
                if (!html) {
                    return {processed: false, error: 'Failed to fetch'};
                }

                // Extract and hash content
                const fileContent = extractFileContent(html, fileSelectors);
                const contentHash = hashContent(fileContent);

                // Check existing snapshot
                const existingSnapshot = snapshotMap.get(pageUrl);
                const hasChanged = !existingSnapshot || existingSnapshot.content_hash !== contentHash;

                const now = new Date().toISOString();

                // Prepare snapshot update
                const snapshotData = {
                    content_hash: contentHash,
                    last_checked: now,
                    last_modified: hasChanged ? now : (existingSnapshot?.last_modified || now)
                };

                if (existingSnapshot) {
                    snapshotUpdates.push({
                        existingId: existingSnapshot.id,
                        data: snapshotData
                    });
                } else {
                    snapshotUpdates.push({
                        existingId: null,
                        data: {
                            gal: gal.id,
                            section_name: sectionName,
                            page_url: pageUrl,
                            ...snapshotData
                        }
                    });
                }

                let filesFound = 0;
                let newFilesCount = 0;

                if (hasChanged) {
                    // Extract files (reuses the same DOM from cache)
                    const files = extractFiles(html, fileSelectors, baseUrl);
                    filesFound = files.length;

                    // Filter new files
                    const filesToSave = files.filter(file =>
                        file.url && file.name && !existingFilesSet.has(file.url)
                    ).map(file => ({
                        gal: gal.id,
                        fisier: file.url.substring(0, 2000),
                        nume: file.name.substring(0, 500)
                    }));

                    newFiles.push(...filesToSave);
                    newFilesCount = filesToSave.length;

                    // Update existing files set
                    filesToSave.forEach(file => existingFilesSet.add(file.fisier));
                }

                return {
                    processed: true,
                    hasChanged,
                    filesFound,
                    newFiles: newFilesCount
                };

            } catch (error: any) {
                console.error(`Error processing ${pageUrl}:`, error);
                return {processed: false, error: error.message};
            }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value.processed) {
                results.processedPages++;
                if (result.value.hasChanged) {
                    results.changedPages++;
                }
                //@ts-ignore
                results.totalFiles += result.value.filesFound;
                //@ts-ignore
                results.newFiles += result.value.newFiles;
            } else {
                results.errors++;
            }
        });
    }

    // Save all updates
    const savePromises = [];

    if (snapshotUpdates.length > 0) {
        savePromises.push(batchSaveSnapshots(snapshotUpdates));
    }

    if (newFiles.length > 0) {
        savePromises.push(batchSaveFiles(newFiles));
    }

    await Promise.allSettled(savePromises);

    return results;
}

async function processGALPages(gal: any): Promise<any> {
    console.log(`Processing GAL: ${gal.Denumire_GAL}`);

    const websiteField = gal.Website || gal.website || gal.site_web || gal.url || gal.domeniu;
    if (!websiteField) {
        console.error(`No website field found for ${gal.Denumire_GAL}`);
        return {error: 'No website configured'};
    }

    if (!gal.snapshot_config?.sections) {
        console.error(`No snapshot config found for ${gal.Denumire_GAL}`);
        return {error: 'No snapshot configuration found'};
    }

    const baseUrl = `https://${websiteField}`;
    const overallResults = {
        processedSections: 0,
        processedPages: 0,
        changedPages: 0,
        totalFiles: 0,
        newFiles: 0,
        errors: 0,
        sectionResults: [] as any[]
    };

    // Process sections sequentially to avoid overwhelming the target server
    for (const [sectionName, sectionConfig] of Object.entries(gal.snapshot_config.sections)) {
        console.log(`Processing section: ${sectionName}`);

        const sectionResults = await processPagesConcurrently(
            gal,
            sectionName,
            (sectionConfig as any).urls,
            (sectionConfig as any).file_selectors,
            baseUrl,
            12 // Optimized concurrency
        );

        overallResults.processedSections++;
        overallResults.processedPages += sectionResults.processedPages;
        overallResults.changedPages += sectionResults.changedPages;
        overallResults.totalFiles += sectionResults.totalFiles;
        overallResults.newFiles += sectionResults.newFiles;
        overallResults.errors += sectionResults.errors;
        overallResults.sectionResults.push({
            name: sectionName,
            ...sectionResults
        });

        // Small delay between sections to be respectful to the target server
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Clear DOM cache after processing
    domCache.clear();

    console.log(`GAL completed: ${overallResults.processedPages} pages, ${overallResults.changedPages} changed, ${overallResults.newFiles} new files`);
    return overallResults;
}

export async function POST({request, params}) {
    try {
        const {galId} = await request.json();

        if (!galId) {
            return json({error: 'GAL ID is required'}, {status: 400});
        }

        const gal = await pb.collection('GALs').getOne(galId);

        if (!gal) {
            return json({error: 'GAL not found'}, {status: 404});
        }

        if (!gal.snapshot_config?.sections) {
            return json({error: 'No snapshot configuration found for this GAL'}, {status: 400});
        }

        const processingResults = await processGALPages(gal);

        // Only fetch updated files if processing was successful
        let updatedFiles: RecordModel[] = [];
        if (!processingResults.error && processingResults.newFiles > 0) {
            updatedFiles = await pb.collection('files').getFullList({
                filter: `gal = "${galId}"`,
                sort: '-created' // Get newest files first
            });
        }

        return json({
            success: true,
            processingResults,
            files: updatedFiles
        });

    } catch (error: any) {
        console.error('Error in file processing:', error);
        return json({
            error: error.message || 'An error occurred during processing'
        }, { status: 500 });
    }
}