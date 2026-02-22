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

    const { register: registerBusiness, handleSubmit: handleSubmitBusiness, formState: { errors: businessErrors } } = useForm<BusinessFormValues>({
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

    const onBusinessSubmit = (data: BusinessFormValues) => {
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
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Become a Dabbaz Vendor</h1>
                <p className="mt-2 text-gray-600">Join our marketplace and deliver home-cooked meals.</p>
            </div>

            {/* Progress Bar */}
            <div className="flex justify-between mb-8">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex-1 text-center">
                        <div className={`h-2 rounded-full mx-1 ${step >= s ? 'bg-green-600' : 'bg-gray-200'}`} />
                        <span className={`text-xs mt-2 block ${step >= s ? 'text-green-600 font-medium' : 'text-gray-400'}`}>Step {s}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">Verify Phone Number</h2>
                        <input
                            type="text"
                            placeholder="10 digit mobile number"
                            className="w-full border rounded p-2"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <button onClick={handleSendOtp} className="bg-gray-100 px-4 py-2 rounded">Send OTP</button>

                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="6 digit OTP"
                                className="w-full border rounded p-2"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                            />
                            <button onClick={handleVerifyOtp} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Verify</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmitBusiness(onBusinessSubmit)} className="space-y-4">
                        <h2 className="text-xl font-medium">Business Details</h2>
                        <div>
                            <label className="block text-sm">Business/Kitchen Name</label>
                            <input {...registerBusiness('business_name')} className="w-full border rounded p-2" />
                            {businessErrors.business_name && <p className="text-red-500 text-xs">{businessErrors.business_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm">Contact Person</label>
                            <input {...registerBusiness('contact_name')} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm">Full Address</label>
                            <input {...registerBusiness('address')} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm">PIN Code</label>
                            <input {...registerBusiness('pincode')} className="w-full border rounded p-2" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm">Years of Operation</label>
                                <input type="number" {...registerBusiness('years_of_operation')} className="w-full border rounded p-2" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm">Daily Capacity (Tiffins)</label>
                                <input type="number" {...registerBusiness('daily_capacity')} className="w-full border rounded p-2" />
                            </div>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Next</button>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">Document Upload</h2>
                        <div>
                            <label className="block text-sm font-medium">FSSAI License (PDF/JPG)</label>
                            <input type="file" onChange={e => handleFileUpload(e, setFssaiUrl)} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Government ID (Proprietor)</label>
                            <input type="file" onChange={e => handleFileUpload(e, setGovtIdUrl)} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Hygiene Certificate (Optional)</label>
                            <input type="file" onChange={e => handleFileUpload(e, setHygieneUrl)} className="mt-1" />
                        </div>
                        <button
                            onClick={() => {
                                if (!fssaiUrl || !govtIdUrl) return alert("FSSAI and ID are required");
                                setStep(4);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">Sample Menu & Final Submit</h2>
                        <div>
                            <label className="block text-sm">Describe typical meals you offer (Min 100 chars)</label>
                            <textarea
                                className="w-full border rounded p-2 h-32"
                                value={sampleMenu}
                                onChange={e => setSampleMenu(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="declare"
                                checked={declaration}
                                onChange={e => setDeclaration(e.target.checked)}
                            />
                            <label htmlFor="declare" className="text-sm">I confirm all information provided is accurate and true.</label>
                        </div>

                        <button
                            onClick={submitApplication}
                            className="bg-green-600 text-white px-6 py-2 rounded w-full font-medium"
                        >
                            Submit Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
