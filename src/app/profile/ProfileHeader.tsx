'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure
} from '@heroui/modal';
import { useState } from 'react';
import { CategoryUi } from '@/components/ui/TypeUi';
import HeaderBar from '@/components/ui/HeaderBar';
import { category1, category2, category3, category4, category5, category6, category7 } from '@/lib/image';
import { taste1, taste2, taste3, taste4, taste5, taste6 } from '@/lib/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function ProfileHeader() {
    const router = useRouter();

    const { data: session, status } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modalPlacement, setModalPlacement] = useState<"bottom" | "center" | "auto" | "top" | "top-center" | "bottom-center">("bottom-center");
    
    // Multi-step state
    const [step, setStep] = useState(1); // 1: Basic info, 2: Category, 3: Taste
    
    // Form data
    const [productImage, setProductImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [productName, setProductName] = useState<string>('');
    const [productDescription, setProductDescription] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTaste, setSelectedTaste] = useState<string>('');

    const categoryTypeLinks = [
        { name: "ヘアクリップ", href: "hair-clips", src: category1 },
        { name: "ヘッドドレス", href: "hair-dress", src: category2 },
        { name: "ネックレス", href: "necklaces", src: category3 },
        { name: "ブレスレット", href: "bracelets", src: category4 },
        { name: "ピアス", href: "earrings", src: category5 },
        { name: "カチューシャ", href: "headbands", src: category6 },
        { name: "ネイルチップ", href: "nail-tips", src: category7 },
    ];

    const tasteOptions = [
        { name: "推し活", value: "oshikatsu", src: taste1 },
        { name: "量産型", value: "ryousan", src: taste2 },
        { name: "地雷系", value: "jiraikei", src: taste3 },
        { name: "モノトーン系", value: "monotone", src: taste4 },
        { name: "サブカル系", value: "subculture", src: taste5 },
        { name: "ロリータ系", value: "lolita", src: taste6 },
    ];

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form when modal closes
    const handleModalClose = () => {
        setStep(1);
        setProductImage(null);
        setImagePreview('');
        setProductName('');
        setProductDescription('');
        setSelectedCategory('');
        setSelectedTaste('');
        onOpenChange();
    };

    // Go to next step
    const handleNext = () => {
        if (step === 1) {
            if (!productName || !productDescription || !productImage) {
                alert('商品名、説明、画像を入力してください');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!selectedCategory) {
                alert('カテゴリを選択してください');
                return;
            }
            setStep(3);
        }else if (step === 3) {
            if (!selectedCategory) {
                alert('カテゴリを選択してください');
                return;
            }
            setStep(4);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Submit product to database
    const handleSubmit = async () => {
        if (!selectedTaste) {
            alert('テイストを選択してください');
            return;
        }

        try {
            // Create FormData for file upload
            const formData = new FormData();
            if (productImage) formData.append('image', productImage);
            formData.append('name', productName);
            formData.append('description', productDescription);
            formData.append('category', selectedCategory);
            formData.append('taste', selectedTaste);

            // Upload to your API endpoint
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('商品が登録されました！');
                handleModalClose();
                // Optionally refresh the page or update product list
                window.location.reload();
            } else {
                alert('エラーが発生しました');
            }
        } catch (error) {
            console.error('Error uploading product:', error);
            alert('エラーが発生しました');
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-40">
            <p>Loading user profile...</p>
        </div>;
    }


    if (!session) {
        return (
            <div className="text-center p-6 bg-main rounded-lg">
                <p className="text-white font-semibold">
                    ログインされていません。プロフィールを表示するにはログインしてください。
                </p>
                <Button href="/register">ログイン</Button>
            </div>
        );
    }

    const user = session.user;

    return (
        <>
            <div className="flex items-center gap-4">
                {user?.image && (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                        <Image 
                            src={user.image}
                            alt={user.name || 'User Profile'}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            </div>

            <div className='flex mt-4 gap-4'>
                <Button className='border text-center text-[14px]' href="/profile/edit">
                    <i className="fa-solid fa-user-pen"></i> アカウント設定
                </Button>

                {/* Show button only if user role is 'SELLER' */}
                {session.user.role === 'SELLER' && (
                    <Button className='border text-center text-[14px]' onClick={onOpen}>
                        <i className="fa-solid fa-plus"></i> 商品登録
                    </Button>
                )}
            </div>

            {/* Multi-step Modal */}
            <Modal isOpen={isOpen} placement={modalPlacement} hideCloseButton={true} onOpenChange={handleModalClose} className='bg-white h-screen'>
                <ModalContent className='pt-2'>
                    {(onClose) => (
                        <>
                            <ModalHeader className='px-4 py-0'>
                                <HeaderBar title='商品登録'/>
                            </ModalHeader>
                            
                            <ModalBody className='px-4 overflow-y-auto'>
                                {/* Step 1: Basic Information */}
                                {step === 1 && (
                                    <div className='grid gap-4'>
                                        <div className="bg-[#F8F8F8] h-[200px] w-full mx-auto flex flex-col justify-center items-center rounded-lg text-center">
                                            {imagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <Image 
                                                        src={imagePreview} 
                                                        alt="Preview" 
                                                        fill
                                                        style={{ objectFit: "cover" }}
                                                        className="rounded-lg"
                                                    />
                                                    <label htmlFor="productImage" className="absolute inset-0 cursor-pointer bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <i className="fa-solid fa-edit text-white text-2xl"></i>
                                                    </label>
                                                </div>
                                            ) : (
                                                <label htmlFor="productImage" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                                    <i className="fa-solid fa-plus text-2xl mb-2"></i>
                                                    <span className="text-sm text-gray-600">画像を選択</span>
                                                </label>
                                            )}
                                            <input
                                                type="file"
                                                id="productImage"
                                                name="productImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>

                                        <div className='flex flex-col gap-2'>
                                            <label htmlFor="productName" className='text-sm font-semibold'>商品名</label>
                                            <input 
                                                type="text" 
                                                id='productName'
                                                name='productName'
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                placeholder='商品名を入力してください'
                                                className='border-b border-b-gray-500 p-2'
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="productDescription" className="text-sm font-semibold">
                                                商品説明
                                            </label>
                                            <textarea
                                                id="productDescription"
                                                name="productDescription"
                                                value={productDescription}
                                                onChange={(e) => setProductDescription(e.target.value)}
                                                placeholder="商品文書を入力してください"
                                                rows={4}
                                                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Category Selection */}
                                {step === 2 && (
                                    <div className='grid gap-4'>
                                        <h3 className="text-lg font-semibold mb-2">カテゴリを選択</h3>
                                        <div className="grid">
                                            {categoryTypeLinks.map((category) => (                                    

                                                <div 
                                                    key={category.href} 
                                                    onClick={() => setSelectedCategory(category.href)}
                                                    className={`text-center transition-all ${
                                                        selectedCategory === category.href 
                                                            ? 'border-main bg-main/10' 
                                                            : 'border-gray-300 hover:border-main/50'
                                                    }`}                        
                                                >
                                                    <CategoryUi
                                                        width={70}                 
                                                        height={70}
                                                        href={""} 
                                                        src={category.src} 
                                                        name={category.name} 
                                                        items={[]}                                                
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Taste Selection */}
                                {step === 3 && (
                                    <div className='grid gap-4'>
                                        <h3 className="text-lg font-semibold mb-2">テイストを選択</h3>
                                        <div className="grid gap-4">
                                            {tasteOptions.map((taste) => (            
                                                <div 
                                                    key={taste.value} 
                                                    onClick={() => setSelectedTaste(taste.value)}
                                                    className={`text-center transition-all ${
                                                        selectedTaste === taste.value 
                                                            ? 'border-main bg-main/10' 
                                                            : 'border-gray-300 hover:border-main/50'
                                                    }`}                        
                                                >
                                                    <CategoryUi
                                                        width={70}                 
                                                        height={70}
                                                        href={""} 
                                                        src={taste.src} 
                                                        name={taste.name} 
                                                        items={[]}                                                
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className='grid gap-4'>                            
                                        <div className=" grid gap-4">
                                            <div className=''>
                                                <h3 className='text-[12px] text-pink-800'>商品画像</h3>
                                                {imagePreview && (
                                                    <div className="relative w-full mt-2 h-[300px]">
                                                        <Image 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            fill
                                                            style={{ objectFit: "cover" }}
                                                            className="rounded-lg"
                                                        />
                                                        <label htmlFor="productImage" className="absolute inset-0 cursor-pointer bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <i className="fa-solid fa-edit text-white text-2xl"></i>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className='border-b pb-2 border-gray-300'>
                                                <h3 className='text-[12px] text-pink-800'>商品名</h3>
                                                <p>{productName}</p>
                                            </div>
                                            <div className='border-b pb-2 border-gray-300'>
                                                <h3 className='text-[12px] text-pink-800'>商品詳細</h3>
                                                <p>{productDescription}</p>
                                            </div>
                                            <div className='border-b pb-2 border-gray-300'>
                                                <h3 className='text-[12px] text-pink-800'>カテゴリ</h3>                                                
                                                <p>{categoryTypeLinks.find(c => c.href === selectedCategory)?.name}</p>
                                            </div>
                                            <div className='border-b pb-2 border-gray-300'>
                                                <h3 className='text-[12px] text-pink-800'>テスト</h3>                                                
                                                <p> {tasteOptions.find(t => t.value === selectedTaste)?.name}</p>
                                            </div>
                                            
                                        </div>
                                    </div>
                                )}

                                
                            </ModalBody>

                            <ModalFooter className="flex px-4 pb-3 justify-between">
                                {/* <div className='flex flex-1'>
                                    
                                </div> */}
                                <div className="flex flex-1 w-full gap-4 justify-between">
                                    {step > 1 && (
                                        <Button className='border' onClick={handleBack}>
                                            戻る
                                        </Button>
                                    )}
                                    {/* {
                                        step > 1 ? (
                                            <Button className='hidden' onClick={onClose}>
                                                キャンセル
                                            </Button>
                                        ) : (
                                            <Button className='border border-text' onClick={onClose}>
                                                キャンセル
                                            </Button>
                                        ) 

                                    } */}
                                    {step === 1 && (
                                        <>
                                            <Button className='border border-text text-text' onClick={onClose}>
                                                キャンセル
                                            </Button>
                                            <Button className='bg-main text-white' onClick={handleNext}>
                                                次へ
                                            </Button>
                                        </>
                                    )
                                    }
                                    {step === 2 && (
                                        <>
                                            <Button className='bg-main text-white' onClick={handleNext}>
                                                次へ
                                            </Button>
                                            {/* <Button className='bg-main text-white' onClick={handleNext}>
                                                確認
                                            </Button> */}
                                        </>
                                    )
                                    }
                                    {step === 3 && (
                                        <>
                                            <Button className='bg-main text-white' onClick={handleNext}>
                                                確認
                                            </Button>
                                            {/* <Button className='bg-main text-white' onClick={handleNext}>
                                                確認
                                            </Button> */}
                                        </>
                                    )
                                    }

                                    { step === 4 &&
                                        (
                                            <Button className='bg-main text-white' onClick={handleSubmit}>
                                                登録
                                            </Button>
                                        ) 
                                    }
                                    
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}