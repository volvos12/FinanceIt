<script>
    import { Home, Search } from 'lucide-svelte';
</script>

<div class="max-w-7xl mx-auto pt-[100px] sm:px-6 lg:px-8"></div>
<div class="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">

    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto text-center">
            <!-- 404 Number -->
            <div class="mb-8">
                <h1 class="text-9xl font-bold text-purple-600 mb-4">404</h1>
                <div class="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>

            <!-- Error Message -->
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">
                    Pagina nu a fost găsită
                </h2>
                <p class="text-lg text-gray-600 mb-6">
                    Ne pare rău, dar pagina pe care o căutați nu există sau a fost mutată.
                    Vă rugăm să verificați URL-ul sau să navigați înapoi la pagina principală.
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a
                        href="/"
                        class="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Home class="w-5 h-5 mr-2" />
                    Înapoi la Pagina Principală
                </a>

                <a data-sveltekit-preload-data="hover" data-sveltekit-preload-code="hover" class="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-600 hover:text-white transition-colors" href="/GalList">
                    <Search class="w-5 h-5 mr-2" />
                    Caută Finanțări
                </a>
            </div>

            <!-- Help Section -->
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">
                    Ai nevoie de ajutor?
                </h3>
                <p class="text-gray-600 mb-4">
                    Explorează opțiunile noastre de finanțare pentru IMM-uri sau contactează echipa noastră de suport.
                </p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="/contact" class="text-purple-600 hover:text-purple-700 font-medium">
                        Contactează Suportul
                    </a>
                    <span class="hidden sm:inline text-gray-300">|</span>
                    <a href="/faq" class="text-purple-600 hover:text-purple-700 font-medium">
                        Întrebări Frecvente
                    </a>
                </div>
            </div>
        </div>
    </main>

</div>

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
</style>
