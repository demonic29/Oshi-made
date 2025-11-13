import HeaderBar from '@/components/ui/HeaderBar';
import { getCategory } from '@/lib/cateogry';

import { ItemDetailCard } from '@/components/ui/ItemCard';

export default async function ItemDetailPage({params}: {params: {id: string}}) {
    
    const { id } = await params;
    
    const datas = await getCategory();
    const itemId = datas.find((data:any) => data.id === Number(id));

    return (
        <div className='pb-[80px]'>
            <HeaderBar title={itemId.title}/>

            <div>
                {
                    itemId && <ItemDetailCard item={itemId}/> 
                }
            </div>

        </div>
    )
}