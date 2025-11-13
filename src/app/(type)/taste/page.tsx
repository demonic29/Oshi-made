import sampleImg from '../../../../public/imgs/sample_img.png'
import HeaderBar from "@/components/ui/HeaderBar";
import { TasteUi } from "@/components/ui/TypeUi";

export default function TastePage() {

    const tasteLinks = [
        { name: "推し活", href: "/taste/oshi-katsu", src: sampleImg },
        { name: "量産型", href: "/taste/ryousan-gata", src: sampleImg },
        { name: "地雷系", href: "/taste/jirai-kei", src: sampleImg },
        { name: "モノトーン系", href: "/taste/monotone-kei", src: sampleImg },
        { name: "サブカル系", href: "/taste/sample", src: sampleImg },
        { name: "ロリータ系", href: "/taste/lolita", src: sampleImg },
    ]

    return (

        <div className="px-4 ">
            <HeaderBar title="テイスト"/>

            <div className="grid grid-cols-2 gap-4">


                {tasteLinks.map((link) => (
                    <TasteUi 
                        title={link.name} 
                        imgSrc={link.src.src} 
                        href={link.href}  
                        key={link.href}                      
                    />
                ))}
            </div>
        </div>

    );
}

