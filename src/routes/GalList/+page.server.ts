import { error } from "@sveltejs/kit";
import { pb } from "$lib/pocketbase";

export const load = () => {
    return {
        streamed: {
            GALs: pb.collection('GALs').getFirstListItem('id != ""').then(() => {

                return pb.collection('GALs').getList(1, 1);
            }).then(firstPage => {

                return pb.collection('GALs').getList(1, firstPage.totalItems, {
                    sort: "created",
                });
            }).then(resultList => {
                console.log('Server: GALs loaded:', resultList.items.length);
                return structuredClone(resultList.items);
            }).catch(err => {
                console.error('Error loading GALs:', err);
                throw error(500, { message: 'Error loading data' });
            })
        }
    };
};