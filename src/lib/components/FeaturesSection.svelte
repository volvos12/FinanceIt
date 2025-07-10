<script>
    let features = [
        {
            icon: "🔍",
            title: "Monitorizare în Timp Real",
            description: "Primești alerte instant când apar noi oportunități de finanțare relevante pentru domeniul tău de activitate."
        },
        {
            icon: "📊",
            title: "Analiză Personalizată",
            description: "Evaluăm eligibilitatea afacerii tale pentru diverse programe de finanțare și îți recomandăm cele mai potrivite opțiuni."
        },
        {
            icon: "📝",
            title: "Ghiduri și Resurse",
            description: "Acces la ghiduri detaliate, modele de documente și sfaturi pentru completarea aplicațiilor cu succes."
        },
        {
            icon: "👥",
            title: "Conectare cu Experți",
            description: "Te punem în legătură cu consultanți specializați în accesarea fondurilor GAL și alte surse guvernamentale."
        },
        {
            icon: "📅",
            title: "Calendar de Finanțare",
            description: "Vizualizează calendarul complet al apelurilor de proiecte și nu rata nicio oportunitate importantă."
        },
        {
            icon: "📱",
            title: "Acces Mobil",
            description: "Monitorizează oportunitățile de finanțare de oriunde te-ai afla, direct de pe telefonul tău mobil."
        }
    ];
</script>

<section id="features" class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Cum te ajutăm să obții finanțare</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
                Aplicația noastră simplifică procesul de identificare și accesare a fondurilor pentru IMM-uri
            </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each features as feature}
                <div class="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-5 text-2xl">
                        {feature.icon}
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                    <p class="text-gray-600">{feature.description}</p>
                </div>
            {/each}
        </div>
    </div>
</section>