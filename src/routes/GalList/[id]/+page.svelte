<script lang="ts">
    import NotificationComponent from "$lib/components/NotificationComponent.svelte";
    import Device from 'svelte-device-info'
    import {page} from "$app/state";
    import {pb} from "$lib/pocketbase";
    import {goto} from "$app/navigation";
    const { data } = $props()
    let gal = $state(data?.data?.gal ?? null);
    let Teritoriu = $state(data?.data?.Teritoriu ?? []);
    let files = $state(data?.data?.files ?? []);
    let oldFiles = files;
    let oldIds = oldFiles.map(f => f.id).sort();

    // Processing state
    let isProcessing = $state(false);
    let processingResults: any = $state(null);
    let processingError: any = $state(null);
    let newFilesNotif = $state(false);
    let noNewFiles = $state(false);

    // Pagination state
    let currentPage = $state(1);
    const filesPerPage = 10;

    // Derived values for paginationserve
    const totalPages = $derived(Math.ceil(files.length / filesPerPage));
    const startIndex = $derived((currentPage - 1) * filesPerPage);
    const endIndex = $derived(startIndex + filesPerPage);
    const paginatedFiles = $derived(files.slice(startIndex, endIndex));



    function goBack() {
        goto('/GalList');
    }

    function goToPage(pageNumber: number) {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
        }
    }

    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
        }
    }

    function stripHtml(text:any) {
        if (typeof text !== 'string') return text;

        // Remove HTML tags and decode HTML entities
        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
            .replace(/&amp;/g, '&')  // Replace &amp; with &
            .replace(/&lt;/g, '<')   // Replace &lt; with <
            .replace(/&gt;/g, '>')   // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim(); // Remove leading/trailing whitespace
    }

    function ShortenText(str: string) {
        const charMap: { [key: string]: string } = {
            'ă': 'a', 'Ă': 'A',
            'ș': 's', 'Ș': 'S',
            'ţ': 't', 'ț': 't', 'Ț': 'T', 'Ţ': 'T',
            'â': 'a', 'Â': 'A',
            'î': 'i', 'Î': 'I'
        };
        let result = str.replace(/[ăĂșȘțȚţŢâÂîÎ]/g, (char) => charMap[char] || char);

        if(Device.isPhone || Device.isTablet){
            if (str.length > 30) {
                const first30 = str.slice(0, 30);
                result = first30 + "...";
            }
        }else if(Device.isTablet){
            if (str.length > 50) {
                const first30 = str.slice(0, 50);
                result = first30 + "...";
            }
        }else{
            if (str.length > 70) {
                const first30 = str.slice(0, 70);
                result = first30 + "...";
            }
        }
        return result;

    }

    async function processFiles() {
        if (!gal?.id) {
            processingError = 'GAL ID not available';
            return;
        }

        isProcessing = true;
        processingError = null;
        processingResults = null;

        try {
            const response = await fetch(`/GalList/${page.params.id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    galId: gal.id
                })
            });

            const result:any = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Processing failed');
            }

            if (result.success) {
                processingResults = result.processingResults;
                files = result.files || files;
            } else {
                throw new Error(result.error || 'Processing failed');
            }

        } catch (error:any) {
            console.error('Error processing files:', error);
            processingError = error.message || 'An error occurred during processing';
        } finally {
            isProcessing = false;
            files = await pb.collection('files').getFullList({
                filter: `gal = "${page.params.id}"`,
                sort: "-created"
            });
            let newIds = files.map(f => f.id).sort();
            console.log(JSON.stringify(oldIds), JSON.stringify(newIds));
            if(JSON.stringify(oldIds) === JSON.stringify(newIds)){
                noNewFiles=true
            }else{
                newFilesNotif=true;
                oldIds=newIds;
            }
        }
    }
</script>

<NotificationComponent constant={newFilesNotif} functionName={()=>{newFilesNotif=false}} message="Fisiere Noi Adaugate." GoodOrBad={false}/>
<NotificationComponent constant={noNewFiles} functionName={()=>{noNewFiles=false}} message="Nu Au Fost Adaugate Fisiere Noi" GoodOrBad={true}/>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Header spacer -->
    <div class="pt-24"></div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div class="mb-6">
            <button
                    data-sveltekit-preload-data="hover"
                    data-sveltekit-preload-code="hover"
                    onclick={goBack}
                    class="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Înapoi la lista GAL
            </button>
        </div>

        <!-- Hero Section -->
        <div class="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <!-- Header with gradient background -->
            <div class="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 h-40">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <!-- Decorative elements -->
                <div class="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div class="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
            </div>

            <!-- Content -->
            <div class="relative px-8 py-8">
                <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-6">
                    <div class="flex items-end space-x-4">
                        <!-- Avatar/Logo placeholder -->
                        <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>

                        <div class="pb-2">
                            <h1 class="text-3xl font-bold text-gray-900 capitalize">{gal?.Denumire_GAL}</h1>
                            <p class="text-lg text-gray-600 capitalize flex items-center mt-1">
                                <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Județul {gal?.Judet}
                            </p>
                        </div>
                    </div>

                    <!-- Quick stats -->
                    <div class="flex space-x-6 mt-4 sm:mt-0">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-indigo-600">{gal?.Populatie?.toLocaleString()}</div>
                            <div class="text-sm text-gray-500">Locuitori</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">{gal?.Suprafata}</div>
                            <div class="text-sm text-gray-500">km²</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Territory Information -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div class="flex items-center mb-6">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
                            </svg>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900">Teritoriu acoperit</h2>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {#each Teritoriu as teritoriu}
                            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
                                <span class="text-green-800 font-medium">{stripHtml(teritoriu)}</span>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Files Section -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-xl font-semibold text-gray-900">Documente și fișiere</h2>
                                    {#if files.length > 0}
                                        <p class="text-sm text-gray-600 mt-1">
                                            Afișare {startIndex + 1}-{Math.min(endIndex, files.length)} din {files.length} fișiere
                                        </p>
                                    {/if}
                                </div>
                            </div>

                            <button
                                    onclick={processFiles}
                                    disabled={isProcessing || !gal?.snapshot_config?.sections}
                                    class="mt-4 cursor-pointer sm:mt-0 cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {#if isProcessing}
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Se procesează...
                                {:else}
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Verifică fișiere noi
                                {/if}
                            </button>
                        </div>
                    </div>

                    <div class="p-6">
                        <!-- Processing Status -->
                        {#if processingError}
                            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div class="flex">
                                    <svg class="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L8.707 7.293z" clip-rule="evenodd"></path>
                                    </svg>
                                    <div class="ml-3">
                                        <p class="text-sm text-red-800 font-medium">Eroare: {processingError}</p>
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <!-- Files List -->
                        {#if files.length > 0}
                            <div class="space-y-4">
                                {#each paginatedFiles as file}
                                    <div class="group border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50">
                                        <div class="flex items-start">
                                            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                                                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                            </div>

                                            <div class="flex-1 min-w-0">
                                                <h4 class="font-medium text-gray-900 break-words">{ShortenText(file.nume)}</h4>
                                                <div class="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                    <span class="text-sm text-gray-500 flex items-center">
                                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        Actualizat: {file.created}
                                                    </span>
                                                    <a
                                                            href={file.fisier}
                                                            target="_blank"
                                                            class="mt-2 sm:mt-0 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                                                    >
                                                        Descarcă
                                                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            <!-- Pagination Controls -->
                            {#if totalPages > 1}
                                <div class="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                    <!-- Page Info -->
                                    <div class="text-sm text-gray-700">
                                        Pagina <span class="font-medium">{currentPage}</span> din <span class="font-medium">{totalPages}</span>
                                    </div>

                                    <!-- Navigation Controls -->
                                    <div class="flex items-center space-x-2">
                                        <!-- Previous Button -->
                                        <button
                                                onclick={prevPage}
                                                disabled={currentPage === 1}
                                                class="inline-flex cursor-pointer items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                            </svg>
                                            Anterior
                                        </button>

                                        <!-- Page Numbers -->
                                        <div class="flex items-center space-x-1">
                                            {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                                                return startPage + i;
                                            }) as pageNum}
                                                <button
                                                        onclick={() => goToPage(pageNum)}
                                                        class="inline-flex cursor-pointer items-center justify-center w-10 h-10 text-sm font-medium border rounded-lg transition-colors {currentPage === pageNum
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-700'}"
                                                >
                                                    {pageNum}
                                                </button>
                                            {/each}
                                        </div>

                                        <!-- Next Button -->
                                        <button
                                                onclick={nextPage}
                                                disabled={currentPage === totalPages}
                                                class="inline-flex cursor-pointer items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Următor
                                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        {:else}
                            <div class="text-center py-12">
                                <h3 class="mt-2 text-sm font-medium text-gray-900">Nu există fișiere</h3>
                                <p class="mt-1 text-sm text-gray-500">Nu există fișiere noi încărcate pe acest site sau nu avem acces la ele.</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-8">
                <!-- Contact Information -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div class="flex items-center mb-6">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900">Contact</h2>
                    </div>

                    <div class="space-y-6">
                        <!-- Location -->
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                                <svg class="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Locație
                            </h4>
                            <p class="text-gray-700 capitalize bg-gray-50 rounded-lg p-3">{gal?.Sediu_social}</p>
                        </div>

                        <!-- Contact Details -->
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3">Informații de contact</h4>
                            <div class="space-y-3">
                                <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <span class="text-gray-700 font-medium">{gal?.Telefon}</span>
                                </div>

                                <div class="flex items-center p-3 bg-green-50 rounded-lg">
                                    <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="text-gray-700 lowercase font-medium">{gal?.Email}</span>
                                </div>

                                <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                                    <svg class="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                                    </svg>
                                    <a href={`https://${gal?.Website}`} target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 font-medium transition-colors">
                                        {gal?.Website}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map Section -->
                <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div class="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900">Localizare</h2>
                        </div>
                    </div>

                    <div class="p-6">
                        <div class="bg-gradient-to-br from-gray-100 to-gray-200 h-64 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-teal-100/50"></div>
                            <div class="relative text-center">
                                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
                                </svg>
                                <span class="text-gray-500 font-medium">Hartă teritoriu GAL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
