<script>
    import Maria from '$lib/assets/Maria.png';
    import Ion from '$lib/assets/Ion.png';
    import Elena from '$lib/assets/Elena.png';
    let testimonials = [
        {
            text: "Datorită FundingMonitor am descoperit o oportunitate de finanțare prin GAL-ul local de care nu știam. Am obținut 50.000 € pentru modernizarea afacerii mele și am creat 3 noi locuri de muncă.",
            author: "Maria Popescu",
            company: "Pensiune Agroturistică, Județul Suceava",
            image: Maria
        },
        {
            text: "Procesul de aplicare pentru fonduri GAL părea complicat, dar cu ghidurile și asistența primită prin platformă, am reușit să depunem un proiect de succes pentru atelierul nostru de producție.",
            author: "Ion Dumitrescu",
            company: "Atelier Mobilă, Județul Cluj",
            image: Ion
        },
        {
            text: "Am economisit timp prețios folosind FundingMonitor. Alertele personalizate ne-au ajutat să identificăm rapid o finanțare pentru digitalizarea afacerii noastre prin programul GAL.",
            author: "Elena Ionescu",
            company: "Producător Local, Județul Ilfov",
            image: Elena
        }
    ];
</script>

<section id="testimonials" class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Povești de Succes</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
                Afaceri care au obținut finanțare cu ajutorul platformei noastre
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            {#each testimonials as testimonial}
                <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                    <p class="text-gray-600 italic mb-6">{testimonial.text}</p>
                    <div class="flex items-center">
                        <img src={testimonial.image || "/"} alt={testimonial.author} class="w-12 h-12 rounded-full mr-4">
                        <div>
                            <h4 class="font-semibold text-gray-800">{testimonial.author}</h4>
                            <p class="text-gray-500 text-sm">{testimonial.company}</p>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>