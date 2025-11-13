import { CategoryUi } from '@/components/ui/TypeUi'
import sampleImg from '../../../../../public/imgs/sample_img.png'
import HeaderBar from '@/components/ui/HeaderBar'

export default async function Page({ params }: { params: Promise<{ item: string }> }) {
    const { item } = await params;

    const categoryNames: Record<string, string> = {
        'accessories': 'アクセサリー',
        'goods': '雑貨',
        'oshikatsu': '推し活',
    };

    const displayTitle = categoryNames[item] || item;
    

    const categoryTypeLinks = [
        { name: "ヘアクリップ", href: "/category/accessories/hair-clips", src: sampleImg },
        { name: "ヘッドドレス", href: "/category/accessories/hair-dress", src: sampleImg },
        { name: "ネックレス", href: "/category/accessories/necklaces", src: sampleImg },
        { name: "ブレスレット", href: "/category/accessories/bracelets", src: sampleImg },
        { name: "ピアス", href: "/category/accessories/earrings", src: sampleImg },
        { name: "カチューシャ", href: "/category/accessories/headbands", src: sampleImg },
        { name: "ネイルチップ", href: "/category/accessories/nail-tips", src: sampleImg },
    ];

    return (
        <div className='px-4'>
            <HeaderBar title={displayTitle || "no-title"} />

            <div className="grid gap-4">
                {categoryTypeLinks.map((link) => (
                    <CategoryUi
                        width={70}
                        height={70}
                        key={link.href}
                        href={link.href}
                        src={link.src.src}
                        name={link.name}
                        items={[]}
                    />
                ))}
            </div>
        </div>
    );
}