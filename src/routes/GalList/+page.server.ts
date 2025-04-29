import {error} from "@sveltejs/kit";
import {pb} from "$lib/pocketbase";

export const load = async ({ locals }) => {
    try {
        const totalCount = await pb.collection('GALs').getFullList();
        const resultList = await pb.collection('GALs').getList(1, totalCount.length, {
            sort: "created",
        });
        const GALs = resultList.items;
        return {
            data: {
                GALs
            }
        };
    } catch (err) {
        console.error('Error in load function:', err);
        throw error(500, {
            message: 'Error loading data'
        });
    }
};