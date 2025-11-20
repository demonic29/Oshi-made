import HeaderBar from '@/components/ui/HeaderBar';
import { getCategory } from '@/lib/cateogry';

import { ItemDetailCard } from '@/components/ui/ItemCard';

export default async function ItemDetailPage({params}: {params: {id: string}}) {
    
    const { id } = await params;
    
    const datas = await getCategory();
    const itemId = datas.find((data:any) => data.id === Number(id));

    // const { data: session, status } = useSession();

    // if (status === 'loading'){
    //     return (
    //         <div className="flex justify-center items-center h-40">
    //             <p>Loading product profile...</p>
    //         </div>
    //     )
    // }

    return (
        <div className='pb-20'>
            <HeaderBar title={itemId.title}/>

            <div>
                {
                    itemId && <ItemDetailCard item={itemId}/> 
                }
            </div>

        </div>
    )
}