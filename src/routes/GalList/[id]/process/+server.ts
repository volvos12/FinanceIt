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
            } catch (error: any) {
                console.warn(`Invalid selector "${selector}":`, error.message);
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
            } catch (error: any) {
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced from 20s to 10s

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

        // Reduced size limit for faster processing
        if (text.length > 2 * 1024 * 1024) {
            return text.substring(0, 2 * 1024 * 1024);
        }

        return text;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error(`Timeout fetching ${url}`);
        } else {
            console.error(`Failed to fetch ${url}: ${error.message}`);
        }
        return null;
    }
}


async function batchGetSnapshots(galId: string, sectionName: string, pageUrls: string[]) {
    try {
        const escapedGalId = galId.replace(/"/g, '\\"');
        const escapedSectionName = sectionName.replace(/"/g, '\\"');

        // Get all snapshots for this GAL and section at once
        const snapshots = await pb.collection('page_snapshots').getFullList({
            filter: `gal = "${escapedGalId}" && section_name = "${escapedSectionName}"`
        });

        // Create a map for O(1) lookup
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
            filter: `gal = "${escapedGalId}"`
        });

        // Create a Set for O(1) lookup
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
    const promises = updates.map(update => {
        if (update.existingId) {
            return pb.collection('page_snapshots').update(update.existingId, update.data);
        } else {
            return pb.collection('page_snapshots').create(update.data);
        }
    });

    return Promise.allSettled(promises);
}

async function batchSaveFiles(files: any[]) {
    const promises = files.map(file => pb.collection('files').create(file));
    return Promise.allSettled(promises);
}


async function processPagesConcurrently(
    gal: any,
    sectionName: string,
    pageUrls: string[],
    fileSelectors: string[],
    baseUrl: string,
    concurrency = 5 // Process 5 pages at once
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

    for (let i = 0; i < pageUrls.length; i += concurrency) {
        const batch = pageUrls.slice(i, i + concurrency);

        const batchPromises = batch.map(async (pageUrl) => {
            try {
                const fullUrl = pageUrl.startsWith('http') ? pageUrl : `${baseUrl}${pageUrl}`;

                // Fetch page content
                const html = await fetchPageContent(fullUrl);
                if (!html) {
                    return { processed: false, error: 'Failed to fetch' };
                }

                // Extract and hash content
                const fileContent = extractFileContent(html, fileSelectors);
                const contentHash = await hashContent(fileContent);

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
                    // Extract files
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
                return { processed: false, error: error.message };
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

    const savePromises = [];

    if (snapshotUpdates.length > 0) {
        savePromises.push(batchSaveSnapshots(snapshotUpdates));
    }

    if (newFiles.length > 0) {
        // Save files in chunks to avoid overwhelming the database
        const chunkSize = 10;
        for (let i = 0; i < newFiles.length; i += chunkSize) {
            const chunk = newFiles.slice(i, i + chunkSize);
            savePromises.push(batchSaveFiles(chunk));
        }
    }

    await Promise.allSettled(savePromises);

    return results;
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
    const overallResults = {
        processedSections: 0,
        processedPages: 0,
        changedPages: 0,
        totalFiles: 0,
        newFiles: 0,
        errors: 0,
        sectionResults: [] as any[]
    };

    for (const [sectionName, sectionConfig] of Object.entries(gal.snapshot_config.sections)) {
        console.log(`Processing section: ${sectionName}`);

        const sectionResults = await processPagesConcurrently(
            gal,
            sectionName,
            (sectionConfig as any).urls,
            (sectionConfig as any).file_selectors,
            baseUrl,
            8 // Increased concurrency for faster processing
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
    }

    console.log(`GAL completed: ${overallResults.processedPages} pages, ${overallResults.changedPages} changed, ${overallResults.newFiles} new files`);
    return overallResults;
}

export async function POST({ request, params }) {
    try {
        const { galId } = await request.json();

        if (!galId) {
            return json({ error: 'GAL ID is required' }, { status: 400 });
        }

        const gal = await pb.collection('GALs').getOne(galId);

        if (!gal) {
            return json({ error: 'GAL not found' }, { status: 404 });
        }

        if (!gal.snapshot_config?.sections) {
            return json({ error: 'No snapshot configuration found for this GAL' }, { status: 400 });
        }

        const processingResults = await processGALPages(gal);

        const updatedFiles = await pb.collection('files').getFullList({
            filter: `gal = "${galId}"`
        });

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