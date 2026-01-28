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
import Button from '@/components/Button';

import sampleImg from '@/app/assets/imgs/logo.png'

export default function ProfileHeader() {

    const { data: session, status } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modalPlacement, setModalPlacement] = useState<"bottom" | "center" | "auto" | "top" | "top-center" | "bottom-center">("bottom-center");

    // Multi-step state
    const [step, setStep] = useState(1);

    // Form data - CHANGED: Multiple images
    const [productImages, setProductImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

    // CHANGED: Handle multiple image uploads
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);

            // Limit to 5 images
            if (productImages.length + fileArray.length > 5) {
                alert('最大5枚まで画像をアップロードできます');
                return;
            }

            setProductImages(prev => [...prev, ...fileArray]);

            // Create previews for new images
            fileArray.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // ADDED: Remove image function
    const handleRemoveImage = (index: number) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Reset form when modal closes
    const handleModalClose = () => {
        setStep(1);
        setProductImages([]);
        setImagePreviews([]);
        setProductName('');
        setProductDescription('');
        setSelectedCategory('');
        setSelectedTaste('');
        onOpenChange();
    };

    // Go to next step
    const handleNext = () => {
        if (step === 1) {
            if (!productName || !productDescription || productImages.length === 0) {
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
        } else if (step === 3) {
            if (!selectedTaste) {
                alert('テイストを選択してください');
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

            // CHANGED: Append multiple images
            productImages.forEach((image, index) => {
                formData.append('images', image);
            });

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
                <div className='grid'>
                    <Button className='underline' href="/login">ログイン</Button>
                    <Button className='underline' href="/register">新規登録</Button>
                </div>
            </div>
        );
    }

    const user = session.user;

    return (
        <div>
            <div className="flex space-x-4 items-center max-w-full">
                {user?.image ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                        <Image
                            src={user.image}
                            alt={user.name || 'User Profile'}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                ) :
                    <div className='relative w-20 h-20 border overflow-hidden border-main rounded-full'>
                        <Image
                            src={sampleImg || 'no-image'}
                            alt={user.name || 'User Profile'}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                }

                <div className=''>
                    <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>

                    {/* <Button className='border border-main flex justify-center py-1 items-center px-3 mt-2' href="/profile/edit">
                        <p className='text-[14px]'>アカウント設定</p>
                    </Button> */}

                    <div className='flex mt-4 gap-2'>
                        {session.user.role === 'SELLER' && (
                            <button className='border border-main flex py-2 px-6 rounded-md justify-center items-center' onClick={onOpen}>
                                <i className="text-[12px] fa-solid fa-plus"></i> 
                                <p className='text-[12px]'>商品登録</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Multi-step Modal */}
            <Modal isOpen={isOpen} placement={modalPlacement} hideCloseButton={true} onOpenChange={handleModalClose} className='bg-white h-screen'>
                <ModalContent className='pt-2'>
                    {(onClose) => (
                        <>
                            <ModalHeader className='px-4 py-0'>
                                <HeaderBar title='商品登録' />
                            </ModalHeader>

                            <ModalBody className='px-4 overflow-y-auto'>
                                {/* Step 1: Basic Information */}
                                {step === 1 && (
                                    <div className='grid gap-4'>
                                        {/* CHANGED: Multiple image upload UI */}
                                        <div className="grid gap-2">
                                            <label className='text-sm font-semibold'>
                                                商品画像 ({imagePreviews.length}/5)
                                            </label>

                                            <div className="grid grid-cols-3 gap-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative aspect-square">
                                                        <Image
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            fill
                                                            style={{ objectFit: "cover" }}
                                                            className="rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            <i className="fa-solid fa-times text-xs"></i>
                                                        </button>
                                                    </div>
                                                ))}

                                                {imagePreviews.length < 5 && (
                                                    <label
                                                        htmlFor="productImages"
                                                        className="aspect-square bg-[#F8F8F8] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                                    >
                                                        <i className="fa-solid fa-plus text-xl mb-1"></i>
                                                        <span className="text-xs text-gray-600">追加</span>
                                                    </label>
                                                )}
                                            </div>

                                            <input
                                                type="file"
                                                id="productImages"
                                                name="productImages"
                                                accept="image/*"
                                                multiple
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
                                                    onClick={() => setSelectedCategory(category.name)}
                                                    className={`text-center transition-all cursor-pointer ${selectedCategory === category.name
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
                                                    onClick={() => setSelectedTaste(taste.name)}
                                                    className={`text-center transition-all cursor-pointer ${selectedTaste === taste.name
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

                                {/* Step 4: Confirmation */}
                                {step === 4 && (
                                    <div className='grid gap-4'>
                                        <div className="grid gap-4">
                                            {/* CHANGED: Show all images in confirmation */}
                                            <div>
                                                <h3 className='text-[12px] text-pink-800 mb-2'>商品画像</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative aspect-square">
                                                            <Image
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                fill
                                                                style={{ objectFit: "cover" }}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
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
                                                <p>{categoryTypeLinks.find(c => c.name === selectedCategory)?.name}</p>
                                            </div>
                                            <div className='border-b pb-2 border-gray-300'>
                                                <h3 className='text-[12px] text-pink-800'>テイスト</h3>
                                                <p>{tasteOptions.find(t => t.name === selectedTaste)?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>

                            <ModalFooter className="flex px-4 pb-3 justify-between">
                                <div className="flex flex-1 w-full gap-4 justify-between">
                                    {step > 1 && (
                                        <Button className='border' onClick={handleBack}>
                                            戻る
                                        </Button>
                                    )}

                                    {step === 1 && (
                                        <>
                                            <Button className='border border-text text-text' onClick={onClose}>
                                                キャンセル
                                            </Button>
                                            <Button className='bg-main text-white' onClick={handleNext}>
                                                次へ
                                            </Button>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <Button className='bg-main text-white' onClick={handleNext}>
                                            次へ
                                        </Button>
                                    )}

                                    {step === 3 && (
                                        <Button className='bg-main text-white' onClick={handleNext}>
                                            確認
                                        </Button>
                                    )}

                                    {step === 4 && (
                                        <Button className='bg-main text-white' onClick={handleSubmit}>
                                            登録
                                        </Button>
                                    )}
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}