import {error} from "@sveltejs/kit";
import {pb} from "$lib/pocketbase";

export const load = async ({ params }) => {
    try {
        const id = params.id;
        

        const gal = await pb.collection('GALs').getOne(id)

        const Teritoriu = gal.Acoperire_Teritoriala ? gal.Acoperire_Teritoriala.split(',') : [];

        return {
            data: {
                gal,
                Teritoriu
            }
        };
    } catch (err) {
        console.error('Error fetching GAL details:', err);
        throw error(404, {
            message: 'GAL not found'
        });
    }
};