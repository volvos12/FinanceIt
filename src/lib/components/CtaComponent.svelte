<script>
    import {currentUser} from '$lib/pocketbase'
</script>
<section class="py-20 bg-purple-100">
    <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-purple-900 mb-4">
            Pregătit să descoperi oportunități de finanțare?
        </h2>
        <p class="text-purple-700 max-w-2xl mx-auto mb-8 text-lg">
            Înregistrează-te gratuit și începe să monitorizezi sursele de finanțare disponibile pentru IMM-ul tău.
        </p>
        {#if $currentUser }
            <a href="/GalList" class="bg-purple-700 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-purple-800 transition-colors inline-block">
                Începe Acum
            </a>
            {:else}
            <a href="/AuthPage?isLogin=false" class="bg-purple-700 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-purple-800 transition-colors inline-block">
                Creează Cont Gratuit
            </a>
        {/if}

    </div>
</section>