export default async function Page({params}: {params: Promise<{id: string}>}) {
    
    const { id } = await params;

    const categoryItemNames: Record<string, string> = {
        'accessories': 'アクセサリー',
        'goods': '雑貨',
        'oshikatsu': '推し活',
    };

    return (
        <div>
            hi
            <h1>blog post : {id}</h1>
        </div>
    )
}
