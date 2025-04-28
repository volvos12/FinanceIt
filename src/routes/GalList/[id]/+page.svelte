<script lang="ts">
    import {pb, currentUser} from '$lib/pocketbase.js'
    import {page} from '$app/state'
    import {onMount} from "svelte";
    const id = page.params.id
    let gal:any = $state({});
    let Teritoriu:any = $state([]);
    let files:any = $state([]);
    onMount(async() => {
        try {
            gal = await pb.collection('GALs').getOne(id);
        } catch (error) {
            console.error('Error fetching GAL:', error);
        }
        Teritoriu = gal.Acoperire_teritoriala.split(',')
        files = await pb.collection('files').getList(1, 50, {
            filter: `gal="${id}"`
        });

    })

</script>

<div class="pt-[130px]"></div>

<div class="min-h-screen bg-purple-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- GAL Header -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-purple-700 h-32 relative">
                <div class="absolute -bottom-12 left-8 bg-white p-2 rounded-lg shadow-md">
                    <!--<img src={gal.logo || "/placeholder.svg"} alt={`Logo ${gal.name}`} class="h-20 w-20 object-contain" />-->
                </div>
            </div>
            <div class="pt-16 pb-6 px-8">
                <h2 class="text-2xl font-bold text-gray-900 capitalize">{gal.Denumire_GAL}</h2>
                <p class="text-gray-600 mt-1 capitalize">Județul {gal.Judet}</p>
            </div>


            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Left column - Basic info -->
                <div class="col-span-2">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">Informații generale</h3>

                        <div class="prose max-w-none">
                            <p class="text-gray-700 mb-6">Descriere</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-medium text-gray-900 mb-2">Teritoriu acoperit</h4>
                                <ul class="list-disc list-inside text-gray-700 space-y-1">
                                    {#each Teritoriu as Teritoriu}
                                        <li>{Teritoriu}</li>
                                    {/each}
                                </ul>
                            </div>

                            <div>
                                <h4 class="font-medium text-gray-900 mb-2">Date demografice</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Populație:</span>
                                        <span class="text-gray-900 font-medium">{gal.Populatie} locuitori</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Suprafață:</span>
                                        <span class="text-gray-900 font-medium">{gal.Suprafata} km²</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Files section -->
                    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">Documente și fișiere</h3>

                        <div class="space-y-4">
                            {#each files?.items || [] as file}
                                <div class="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                                    <div class="flex items-start">
                                        <div class="bg-purple-100 p-2 rounded-md mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex justify-between">
                                                <h4 class="font-medium text-gray-900">{file.fileName}</h4>
                                                <span class="text-sm text-gray-500">{(file.file.size/1024).toFixed(2)}KB</span>
                                            </div>
                                            <div class="mt-2 flex justify-between items-center">
                                                <span class="text-xs text-gray-500">Actualizat: {new Date(file.created).toLocaleDateString('ro-RO')}</span>
                                                <a
                                                        href={pb.getFileUrl(file, file.file)}
                                                        target="_blank"
                                                        class="text-purple-700 hover:text-purple-900 text-sm font-medium flex items-center"
                                                >
                                                    Descarcă
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Right column - Contact info -->
                <div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">Contact</h3>

                        <div class="space-y-4">
                            <div>
                                <h4 class="font-medium text-gray-900 mb-2">Locatie</h4>
                                <p class="text-gray-700 capitalize">{gal.Sediu_social}</p>
                            </div>

                            <div>
                                <h4 class="font-medium text-gray-900 mb-2">Informații de contact</h4>
                                <div class="space-y-2">
                                    <div class="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span class="text-gray-700">{gal.Telefon}</span>
                                    </div>
                                    <div class="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-gray-700 lowercase">{gal.Email}</span>
                                    </div>
                                    <div class="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        <a href={`https://${gal.Website}`} rel="noopener noreferrer" class="text-purple-700 hover:text-purple-900">
                                            {gal.Website}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 class="font-medium text-gray-900 mb-2">Social Media</h4>
                                <div class="flex space-x-3">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map placeholder -->
                    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">Localizare</h3>
                        <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                            <span class="text-gray-500">Hartă teritoriu GAL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>