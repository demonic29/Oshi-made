import HeaderBar from '@/components/ui/HeaderBar'
import sampleImg from '../../../../public/imgs/sample_img.png'
import { CategoryUi } from '@/components/ui/TypeUi'


export default function CategoryPage() {

    const categoryLinks = [
        { name: "アクセサリー", href: "/category/accessories", src: sampleImg, items: ["ヘアクリップ /", "ピアス /", "イヤリング..."] },
        { name: "雑貨", href: "/category/goods", src: sampleImg, items: ["うちわ /", "ペンライトリボン /", "ロゼッタ..."] },
        { name: "推し活", href: "/category/oshikatsu", src: sampleImg, items: ["キーホルダー /", "スマホカバー /", "その他..."] },
    ]

    return (
        <div className=''>

            <HeaderBar title='カテゴリ'/>
            
            <div className='grid gap-4 px-4'>
                {
                    categoryLinks.map((link) => (
                        <CategoryUi 
                            width={100}
                            height={100}
                            key={link.href}
                            href={link.href} 
                            src={link.src} 
                            name={link.name} 
                            items={link.items}
                        />
                    ))
                }
            </div>

        </div>
    )
}
