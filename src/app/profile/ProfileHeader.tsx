'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Button from '@/components/Button';
import {
  Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure
} from '@heroui/modal';
import { useState } from 'react';
import { CategoryUi } from '@/components/ui/TypeUi';
import sampleImg from '../assets/imgs/1.png';

export default function ProfileHeader() {
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
        { name: "ヘアクリップ", href: "hair-clips", src: sampleImg },
        { name: "ヘッドドレス", href: "hair-dress", src: sampleImg },
        { name: "ネックレス", href: "necklaces", src: sampleImg },
        { name: "ブレスレット", href: "bracelets", src: sampleImg },
        { name: "ピアス", href: "earrings", src: sampleImg },
        { name: "カチューシャ", href: "headbands", src: sampleImg },
        { name: "ネイルチップ", href: "nail-tips", src: sampleImg },
    ];

    const tasteOptions = [
        { name: "カジュアル", value: "casual", src: sampleImg },
        { name: "エレガント", value: "elegant", src: sampleImg },
        { name: "ポップ", value: "pop", src: sampleImg },
        { name: "クール", value: "cool", src: sampleImg },
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
            <div className="text-center p-6 bg-red-100 rounded-lg">
                <p className="text-red-700 font-semibold">
                    You are not signed in. Please log in to view your profile.
                </p>
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
            <Modal isOpen={isOpen} placement={modalPlacement} onOpenChange={handleModalClose} className='bg-white h-screen'>
                <ModalContent className='pt-2'>
                    {(onClose) => (
                        <>
                            <ModalHeader className='mt-6 text-xl ps-4'>
                                商品登録 - ステップ {step}/3
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
                                        <div className="grid grid-cols-2 gap-4">
                                            {categoryTypeLinks.map((category) => (
                                                <div
                                                    key={category.href}
                                                    onClick={() => setSelectedCategory(category.href)}
                                                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                                                        selectedCategory === category.href 
                                                            ? 'border-main bg-main/10' 
                                                            : 'border-gray-300 hover:border-main/50'
                                                    }`}
                                                >
                                                    <div className="relative w-16 h-16 mx-auto mb-2">
                                                        <Image 
                                                            src={category.src} 
                                                            alt={category.name}
                                                            fill
                                                            style={{ objectFit: "cover" }}
                                                            className="rounded"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium">{category.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Taste Selection */}
                                {step === 3 && (
                                    <div className='grid gap-4'>
                                        <h3 className="text-lg font-semibold mb-2">テイストを選択</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {tasteOptions.map((taste) => (
                                                <div
                                                    key={taste.value}
                                                    onClick={() => setSelectedTaste(taste.value)}
                                                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                                                        selectedTaste === taste.value 
                                                            ? 'border-main bg-main/10' 
                                                            : 'border-gray-300 hover:border-main/50'
                                                    }`}
                                                >
                                                    <div className="relative w-16 h-16 mx-auto mb-2">
                                                        <Image 
                                                            src={taste.src} 
                                                            alt={taste.name}
                                                            fill
                                                            style={{ objectFit: "cover" }}
                                                            className="rounded"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium">{taste.name}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Summary */}
                                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                            <h4 className="font-semibold mb-2">確認</h4>
                                            <p className="text-sm"><strong>商品名:</strong> {productName}</p>
                                            <p className="text-sm"><strong>カテゴリ:</strong> {categoryTypeLinks.find(c => c.href === selectedCategory)?.name}</p>
                                            <p className="text-sm"><strong>テイスト:</strong> {tasteOptions.find(t => t.value === selectedTaste)?.name}</p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>

                            <ModalFooter className="flex justify-between">
                                <div>
                                    {step > 1 && (
                                        <Button className='border' onClick={handleBack}>
                                            戻る
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button className='border' onClick={onClose}>
                                        キャンセル
                                    </Button>
                                    {step < 3 ? (
                                        <Button className='bg-main text-white' onClick={handleNext}>
                                            次へ
                                        </Button>
                                    ) : (
                                        <Button className='bg-main text-white' onClick={handleSubmit}>
                                            アップロード
                                        </Button>
                                    )}
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}