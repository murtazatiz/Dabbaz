import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/api';

const businessSchema = z.object({
    business_name: z.string().min(2),
    contact_name: z.string().min(2),
    address: z.string().min(10),
    pincode: z.string().length(6),
    years_of_operation: z.coerce.number().min(0),
    daily_capacity: z.coerce.number().min(1),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function BecomeVendorPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [fssaiUrl, setFssaiUrl] = useState('');
    const [govtIdUrl, setGovtIdUrl] = useState('');
    const [hygieneUrl, setHygieneUrl] = useState('');
    const [sampleMenu, setSampleMenu] = useState('');
    const [declaration, setDeclaration] = useState(false);
    const [businessData, setBusinessData] = useState<BusinessFormValues | null>(null);

    const { register: registerBusiness, handleSubmit: handleSubmitBusiness, formState: { errors: businessErrors } } = useForm<any>({
        resolver: zodResolver(businessSchema),
    });

    const handleSendOtp = async () => {
        try {
            await api.post('/auth/send-otp', { phone });
            alert('OTP Sent! (Mocked: enter 123456)');
        } catch {
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            await api.post('/auth/verify-otp', { phone, otp });
            setIsPhoneVerified(true);
            setStep(2);
        } catch {
            alert('Invalid OTP');
        }
    };

    const onBusinessSubmit = (data: any) => {
        setBusinessData(data);
        setStep(3);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Mock upload for now until API is built
        // Normally:
        // const formData = new FormData();
        // formData.append('file', file);
        // const res = await api.post('/upload/private-doc', formData);
        // setter(res.data.url);

        // Fake URL for prototyping
        setter(`https://fake-blob-storage.com/${file.name}`);
        alert(`Uploaded ${file.name}`);
    };

    const submitApplication = async () => {
        if (!declaration) {
            return alert('You must confirm information is accurate.');
        }

        try {
            await api.post('/vendors/onboarding-request', {
                ...businessData,
                fssai_doc_url: fssaiUrl,
                govt_id_url: govtIdUrl,
                hygiene_cert_url: hygieneUrl,
                sample_menu_text: sampleMenu,
                recaptcha_token: 'fake_token_for_dev'
            });
            alert('Application submitted successfully!');
            window.location.href = '/dashboard';
        } catch (e: any) {
            alert(e.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Become a Dabbaz Vendor</h1>
                    <p className="text-lg text-text-secondary font-medium">Join our marketplace and deliver home-cooked meals.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="flex-1 text-center">
                            <div className={`h-2.5 rounded-full mx-2 shadow-inner inset-shadow-sm ${step >= s ? 'bg-success' : 'bg-brand-primary/10'}`} />
                            <span className={`text-sm mt-3 block font-bold ${step >= s ? 'text-success' : 'text-text-secondary'}`}>Step {s}</span>
                        </div>
                    ))}
                </div>

                <div className="card-neumorphic">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-2 border-b border-brand-primary/10 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Verify Phone Number</h2>
                            <div>
                                <input
                                    type="text"
                                    placeholder="10 digit mobile number"
                                    className="input-neumorphic w-full mb-4"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                                <button onClick={handleSendOtp} className="btn-skeuo px-6 py-2 w-full md:w-auto">Send OTP</button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-brand-primary/10">
                                <input
                                    type="text"
                                    placeholder="6 digit OTP"
                                    className="input-neumorphic w-full mb-4"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                />
                                <button onClick={handleVerifyOtp} className="btn-skeuo-primary px-6 py-2 w-full md:w-auto">Verify</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmitBusiness(onBusinessSubmit)} className="space-y-5">
                            <h2 className="text-2xl font-bold text-text-primary mb-2 border-b border-brand-primary/10 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Business Details</h2>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Business/Kitchen Name</label>
                                <input {...registerBusiness('business_name')} className="input-neumorphic w-full" />
                                {businessErrors.business_name && <p className="text-error text-xs font-bold mt-1">{businessErrors.business_name?.message?.toString()}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Contact Person</label>
                                <input {...registerBusiness('contact_name')} className="input-neumorphic w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Full Address</label>
                                <input {...registerBusiness('address')} className="input-neumorphic w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">PIN Code</label>
                                <input {...registerBusiness('pincode')} className="input-neumorphic w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Years of Operation</label>
                                    <input type="number" {...registerBusiness('years_of_operation')} className="input-neumorphic w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Daily Capacity (Tiffins)</label>
                                    <input type="number" {...registerBusiness('daily_capacity')} className="input-neumorphic w-full" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-brand-primary/10 flex justify-end">
                                <button type="submit" className="btn-skeuo-primary px-8 py-3 w-full md:w-auto">Next</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-2 border-b border-brand-primary/10 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Document Upload</h2>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">FSSAI License (PDF/JPG)</label>
                                <input type="file" onChange={e => handleFileUpload(e, setFssaiUrl)} className="input-neumorphic w-full cursor-pointer bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Government ID (Proprietor)</label>
                                <input type="file" onChange={e => handleFileUpload(e, setGovtIdUrl)} className="input-neumorphic w-full cursor-pointer bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Hygiene Certificate (Optional)</label>
                                <input type="file" onChange={e => handleFileUpload(e, setHygieneUrl)} className="input-neumorphic w-full cursor-pointer bg-white" />
                            </div>
                            <div className="pt-4 border-t border-brand-primary/10 flex justify-end">
                                <button
                                    onClick={() => {
                                        if (!fssaiUrl || !govtIdUrl) return alert("FSSAI and ID are required");
                                        setStep(4);
                                    }}
                                    className="btn-skeuo-primary px-8 py-3 w-full md:w-auto"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-text-primary mb-2 border-b border-brand-primary/10 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Sample Menu & Final Submit</h2>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Describe typical meals you offer (Min 100 chars)</label>
                                <textarea
                                    className="input-neumorphic w-full h-32"
                                    value={sampleMenu}
                                    onChange={e => setSampleMenu(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                <input
                                    type="checkbox"
                                    id="declare"
                                    checked={declaration}
                                    onChange={e => setDeclaration(e.target.checked)}
                                    className="w-5 h-5 skeuo-radio text-brand-primary"
                                />
                                <label htmlFor="declare" className="text-sm font-bold text-text-primary cursor-pointer">I confirm all information provided is accurate and true.</label>
                            </div>

                            <div className="pt-4 border-t border-brand-primary/10">
                                <button
                                    onClick={submitApplication}
                                    className="btn-skeuo-primary px-8 py-3 w-full text-lg"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
