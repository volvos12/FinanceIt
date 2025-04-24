<script>

import FeaturesSection from "$lib/components/FeaturesSection.svelte";
import AboutSection from "$lib/components/AboutSection.svelte";
import Testimonial from "$lib/components/Testimonial.svelte";
import CtaComponent from "$lib/components/CtaComponent.svelte";
</script>

<div>
    <div class="w-full h-[100px]"></div>
<section class="bg-purple-100 pt-32 pb-20">
    <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
            Descoperă Oportunități de Finanțare pentru IMM-ul Tău
        </h1>
        <p class="text-xl text-purple-700 max-w-3xl mx-auto mb-10">
            Monitorizăm și identificăm cele mai bune surse de finanțare guvernamentală pentru afacerea ta, cu focus special pe fondurile GAL (Grupuri de Acțiune Locală).
        </p>
        <a href="/GalList" class="bg-purple-700 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-purple-800 transition-colors inline-block">
            Începe Acum
        </a>
    </div>
</section>
    <div class="backgroundsvg lg:mt-[-5px] sm:mt-[-10px]"></div>
    <FeaturesSection/>
    <AboutSection/>
    <Testimonial/>
    <CtaComponent/>
</div>

<style>
    .backgroundsvg{
        aspect-ratio: 960/180;
        width: 100%;
        background-image: url("../../static/layered-waves-haikei.svg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>



