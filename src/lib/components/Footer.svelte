<script>
    let footerLinks = [
        {
            title: "FinanceIt",
            links: [
                { name: "Despre Noi", href: "#" },
                { name: "Echipa", href: "#" },
                { name: "Cariere", href: "#" },
                { name: "Blog", href: "#" }
            ]
        },
        {
            title: "Resurse",
            links: [
                { name: "Ghid GAL", href: "#" },
                { name: "Finanțări IMM", href: "#" },
                { name: "Studii de Caz", href: "#" },
                { name: "Webinarii", href: "#" }
            ]
        },
        {
            title: "Suport",
            links: [
                { name: "Întrebări Frecvente", href: "#" },
                { name: "Contactează-ne", href: "#" },
                { name: "Politica de Confidențialitate", href: "#" },
                { name: "Termeni și Condiții", href: "#" }
            ]
        }
    ];
</script>

<footer class="bg-gray-800 text-white flex justify-center pt-16 pb-8">
    <div class="container mx-auto px-4 w-[80%]">
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {#each footerLinks as column}
                <div>
                    <h3 class="text-xl font-semibold mb-4 text-purple-300">{column.title}</h3>
                    <ul class="space-y-2">
                        {#each column.links as link}
                            <li>
                                <a href={link.href} class="text-gray-300 hover:text-white transition-colors">
                                    {link.name}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/each}

            <div>
                <h3 class="text-xl font-semibold mb-4 text-purple-300">Contact</h3>
                <ul class="space-y-2 text-gray-300">
                    <li>Email: contact@fundingmonitor.ro</li>
                    <li>Telefon: +40 721 234 567</li>
                    <li>Adresă: Str. Finanțării nr. 10, București</li>
                </ul>
            </div>
        </div>

        <div class="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FinanceIt. Toate drepturile rezervate.</p>
        </div>
    </div>
</footer>