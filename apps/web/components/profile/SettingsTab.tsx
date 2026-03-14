import React, { useState, useEffect, useMemo } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Loader2, X, Twitter, Github } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/lib/config';
import { IDENTITY_REGISTRY_ABI } from '@/lib/abis';
import { useSnackbar } from '@/context/SnackbarContext';
import { translateError } from '@/lib/error-translator';

interface ProfileData {
    exists: boolean;
    name: string;
    pfp: string;
    metadataURI: string;
    reputationScore: bigint;
    registeredAt: bigint;
    did: string;
}

interface SettingsTabProps {
    profile: ProfileData | undefined;
    isProfileLoading: boolean;
    displayName: string;
    refetchProfile: () => void;
    setActiveTab: (tab: 'profile' | 'achievements' | 'missions' | 'settings') => void;
}

export default function SettingsTab({ profile, isProfileLoading, displayName, refetchProfile, setActiveTab }: SettingsTabProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [pfp, setPfp] = useState('');
    const [bio, setBio] = useState('');
    const [twitter, setTwitter] = useState('');
    const [github, setGithub] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Username Validation States
    const [validatedName, setValidatedName] = useState(name);

    // Debounce username validation — always use setTimeout to avoid setState-in-effect errors
    useEffect(() => {
        const delay = !name.trim() || name === (profile?.name || '') ? 0 : 300;
        const timer = setTimeout(() => {
            setValidatedName(name);
        }, delay);
        return () => clearTimeout(timer);
    }, [name, profile?.name]);

    const { data: isNameAvailable, isLoading: isCheckingName } = useReadContract({
        address: CONTRACT_ADDRESSES.IdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'isNameAvailable',
        args: [validatedName],
        query: {
            enabled: !!validatedName && validatedName !== (profile?.name || ''),
        }
    });

    const isNameTaken = useMemo(() => {
        if (!validatedName || validatedName === (profile?.name || '')) return false;
        return isNameAvailable === false;
    }, [validatedName, isNameAvailable, profile?.name]);

    const isTyping = name !== validatedName;
    const isChecking = isTyping || isCheckingName;

    const canSubmit = useMemo(() => {
        if (!name.trim()) return false;
        // If typing matches validated name and not checking, use validation result
        if (name === validatedName && !isChecking) {
            if (name === (profile?.name || '')) return true;
            return isNameAvailable === true;
        }
        // Otherwise, only allow submit if it's the original name
        return name === (profile?.name || '');
    }, [name, validatedName, isChecking, isNameAvailable, profile?.name]);

    // Sync form with profile data when it loads
    useEffect(() => {
        if (profile) {
            if (!profile.exists) {
                // Auto-enter edit mode for new users
                const timer = setTimeout(() => {
                    setIsEditing(true);
                }, 0);
                return () => clearTimeout(timer);
            } else if (!isEditing) {
                setTimeout(() => {
                    setName(prev => prev !== profile.name ? profile.name : prev);
                    setPfp(prev => prev !== (profile.pfp || '') ? (profile.pfp || '') : prev);
                    try {
                        const metaContent = profile.metadataURI.replace('data:application/json,', '');
                        const meta = JSON.parse(metaContent);
                        setBio(prev => prev !== (meta.bio || '') ? (meta.bio || '') : prev);
                        setTwitter(prev => prev !== (meta.socials?.twitter || '') ? (meta.socials?.twitter || '') : prev);
                        setGithub(prev => prev !== (meta.socials?.github || '') ? (meta.socials?.github || '') : prev);
                        setSkills(prev => JSON.stringify(prev) !== JSON.stringify(meta.skills || []) ? (meta.skills || []) : prev);
                    } catch {
                        setBio(prev => prev !== profile.metadataURI ? profile.metadataURI : prev);
                    }
                }, 0);
            }
        }
    }, [profile, isEditing]);

    const { writeContractAsync, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const { showSnackbar } = useSnackbar();

    // Log errors for debugging
    useEffect(() => {
        if (writeError) console.error("Smart Contract Write Error:", writeError);
        if (receiptError) console.error("Transaction Receipt Error:", receiptError);
        if (hash) console.log("Transaction Hash:", hash);
        if (isSuccess) console.log("Transaction Confirmed!");
    }, [writeError, receiptError, hash, isSuccess]);

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                // If the user just registered (didn't exist before success), redirect to profile tab
                if (profile && !profile.exists) {
                    setActiveTab('profile');
                }
                setIsEditing(false);
                refetchProfile();
            }, 0);
        }
    }, [isSuccess, refetchProfile, profile, setActiveTab]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        if (isProfileLoading) {
            console.error("Profile data still loading, please wait.");
            return;
        }

        console.log("Submitting Profile Data:", { name, pfp, bio, twitter, github, skills });

        if (!name.trim()) {
            console.error("Name is required.");
            return;
        }

        const metadata = JSON.stringify({
            bio,
            socials: { twitter, github },
            skills
        });

        try {
            // Crucial check: Only call register if we have confirmed profile.exists is false
            // If profile is undefined, we wait.
            if (profile && !profile.exists) {
                console.log("Registering new profile...");
                await writeContractAsync({
                    address: CONTRACT_ADDRESSES.IdentityRegistry,
                    abi: IDENTITY_REGISTRY_ABI,
                    functionName: 'register',
                    args: [name, pfp, `data:application/json,${metadata}`],
                });
            } else if (profile && profile.exists) {
                console.log("Updating existing profile...");
                await writeContractAsync({
                    address: CONTRACT_ADDRESSES.IdentityRegistry,
                    abi: IDENTITY_REGISTRY_ABI,
                    functionName: 'updateProfile',
                    args: [name, pfp, `data:application/json,${metadata}`],
                });
            } else {
                console.warn("Cannot save: Profile state unknown.");
            }
        } catch (error: unknown) {
            const translated = translateError(error);
            const isCancellation = 
                translated.toLowerCase().includes('cancelled') || 
                translated.toLowerCase().includes('denied') ||
                translated.toLowerCase().includes('rejected');
            
            if (isCancellation) {
                showSnackbar(translated, 'info');
            } else {
                console.error("Caught error during writeContract invocation:", error);
                showSnackbar(translated, 'error');
            }
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (s: string) => {
        setSkills(skills.filter(sk => sk !== s));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0] ||
            (e as React.DragEvent).dataTransfer?.files?.[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const MAX_SIZE = 200;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    console.log("Compressed Image Size:", compressedBase64.length, "bytes");
                    setPfp(compressedBase64);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section>
            <div className="glass-panel bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(30,27,75,0.4)] border border-white/40 dark:border-white/10 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B82F6]/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
                <div className="max-w-xl relative z-10 w-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B82F6]/10 text-[#8B82F6] text-xs font-bold uppercase tracking-wider mb-4">
                        Identity Details
                    </span>
                    <h3 className="text-3xl font-bold mb-3 tracking-tight dark:text-[#F3F4F6] text-gray-900">Identity Management</h3>
                    <p className="text-[#4B5563] dark:text-[#9CA3AF] mb-8 text-lg">Your .avax handle is the core of your elite reputation. Manage your credentials and verified accounts below.</p>

                    {(!profile || !profile.exists) && (
                        <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">info</span>
                            <div>
                                <h4 className="font-bold text-amber-500 mb-1">Registration Required</h4>
                                <p className="text-sm dark:text-gray-300 text-gray-700">Please provide at least a display name to register your seed identity. This is required to unlock achievements and missions.</p>
                            </div>
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10">
                                    <label className="block text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase mb-2">Registered Handle</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold dark:text-[#F3F4F6] text-gray-900">{profile?.exists ? displayName : 'Not Registered'}</span>
                                        <span className={`material-symbols-outlined ${profile?.exists ? 'text-green-500' : 'text-gray-400'}`}>
                                            {profile?.exists ? 'verified' : 'cancel'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/40 dark:border-white/10">
                                    <label className="block text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase mb-2">Verification Level</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold dark:text-[#F3F4F6] text-gray-900">{profile?.exists ? 'Master Lvl' : 'None'}</span>
                                        <span className="material-symbols-outlined text-[#8B82F6]">workspace_premium</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full flex items-center justify-center gap-2 bg-[#8B82F6] hover:bg-[#8B82F6]/90 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-[#8B82F6]/20 transition-all transform hover:-translate-y-1"
                            >
                                <span className="material-symbols-outlined">security</span>
                                {profile?.exists ? 'Update Identity Details' : 'Register Identity'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="display-name" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Display Name</label>
                                    <div className="relative">
                                        <input
                                            id="display-name"
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className={`w-full bg-white/50 dark:bg-black/20 border rounded-2xl p-4 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6] ${isNameTaken ? 'border-red-500/50 ring-red-500/20' : 'border-white/40 dark:border-white/10'
                                                }`}
                                            placeholder="e.g. Alex.avax"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isChecking && (
                                                <Loader2 className="animate-spin text-[#8B82F6]" size={18} />
                                            )}
                                            {!isChecking && name && name !== (profile?.name || '') && (
                                                isNameTaken ? (
                                                    <span className="text-red-500 text-xs font-bold uppercase flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                                        Taken
                                                    </span>
                                                ) : isNameAvailable === true ? (
                                                    <span className="text-green-500 text-xs font-bold uppercase flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        Available
                                                    </span>
                                                ) : null
                                            )}
                                        </div>
                                    </div>
                                    {isNameTaken && (
                                        <p className="text-red-500 text-xs px-1">This name is already registered to another user.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="profile-picture" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Profile Picture</label>
                                    <div
                                        className={`relative group h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${isDragging
                                            ? 'border-[#8B82F6] bg-[#8B82F6]/10'
                                            : 'border-white/40 dark:border-white/10 hover:border-[#8B82F6]/50 bg-white/50 dark:bg-black/20'
                                            }`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                        onDrop={handleFileChange}
                                    >
                                        {pfp ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={pfp} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">upload</span>
                                                    <span className="text-white font-bold text-sm drop-shadow-md">Change Photo</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-full bg-[#8B82F6]/10 text-[#8B82F6]">
                                                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-gray-900 dark:text-[#F3F4F6]">Drag and drop image</p>
                                                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">or click to select file</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            id="profile-picture"
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="bio-metadata" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Bio / Metadata</label>
                                    <textarea
                                        id="bio-metadata"
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                        placeholder="Tell the ecosystem about yourself..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="twitter" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                                            <Twitter size={14} /> X (Twitter)
                                        </label>
                                        <input
                                            id="twitter"
                                            type="text"
                                            value={twitter}
                                            onChange={e => setTwitter(e.target.value)}
                                            className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="github" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                                            <Github size={14} /> GitHub
                                        </label>
                                        <input
                                            id="github"
                                            type="text"
                                            value={github}
                                            onChange={e => setGithub(e.target.value)}
                                            className="w-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="specializations" className="text-sm font-semibold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">Specializations</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="specializations"
                                            type="text"
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    addSkill()
                                                }
                                            }}
                                            className="flex-1 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 text-gray-900 dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#8B82F6]"
                                            placeholder="e.g. Smart Contracts"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="bg-white/20 dark:bg-[#1E1B4B] p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-white/40 dark:border-white/10 text-[#8B82F6] flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-[#8B82F6]/10 text-[#8B82F6] rounded-full text-xs font-medium border border-[#8B82F6]/20 flex items-center gap-1 group">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove skill ${skill}`}>
                                                    <X size={12} className="hover:text-red-400" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl font-bold bg-white/20 dark:bg-[#1E1B4B] text-gray-900 dark:text-[#F3F4F6] hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-white/40 dark:border-white/10 fluid-touch"
                                    disabled={isPending || isConfirming || isProfileLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || isConfirming || isProfileLoading || !canSubmit}
                                    className="flex-1 flex justify-center items-center gap-2 bg-[#8B82F6] hover:bg-[#8B82F6]/90 text-white py-4 px-6 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all fluid-touch"
                                >
                                    {isPending || isConfirming ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Processing...</span>
                                        </>
                                    ) : isProfileLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Fetching Identity...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            {profile?.exists ? 'Sync Updates to Blockchain' : 'Complete Registration'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
