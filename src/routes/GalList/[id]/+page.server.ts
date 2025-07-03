import { error } from "@sveltejs/kit";
import { pb } from "$lib/pocketbase";

export const load = async ({ params }) => {
    try {
        const id = params.id;
        const gal = await pb.collection('GALs').getOne(id);
        const Teritoriu = gal.Acoperire_teritoriala ? gal.Acoperire_teritoriala.split(',') : [];

        // Get existing files
        const files = await pb.collection('files').getFullList({
            filter: `gal = "${id}"`,
            sort: "-created"
        });

        return {
            data: {
                gal,
                Teritoriu,
                files
            }
        };
    } catch (err) {
        console.error('Error fetching GAL details:', err);
        throw error(404, {
            message: 'GAL not found'
        });
    }
};