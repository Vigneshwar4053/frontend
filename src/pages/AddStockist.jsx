import { useState } from "react";

function AddStockist(){
    const [retailer, setRetailer] = useState({
        name: '',
        contact: '',
        email: '',
        password: '',
        retailerCode: '',
        country: '',
        state: '',
        upiId: '',
        gstIn: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const countries = [
        'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
        'Germany', 'France', 'Japan', 'Singapore', 'UAE'
    ];

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep'
    ];

    const handleInputChange = (field, value) => {
        setRetailer(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const generateRetailerCode = () => {
        const code = `RET${Date.now().toString().slice(-6)}`;
        handleInputChange('retailerCode', code);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!retailer.name.trim()) newErrors.name = 'Name is required';
        if (!retailer.contact.trim()) newErrors.contact = 'Contact is required';
        else if (!/^\d{10}$/.test(retailer.contact)) newErrors.contact = 'Contact must be 10 digits';

        if (!retailer.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(retailer.email)) newErrors.email = 'Email is invalid';

        if (!retailer.password.trim()) newErrors.password = 'Password is required';
        else if (retailer.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!retailer.retailerCode.trim()) newErrors.retailerCode = 'Retailer code is required';
        if (!retailer.country.trim()) newErrors.country = 'Country is required';
        if (!retailer.state.trim()) newErrors.state = 'State is required';

        if (retailer.upiId && !/^[\w.-]+@[\w.-]+$/.test(retailer.upiId)) {
            newErrors.upiId = 'Invalid UPI ID format';
        }

        // if (retailer.gstIn && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(retailer.gstIn)) {
        //     newErrors.gstIn = 'Invalid GST format';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        try {
            const response = await fetch('https://your-backend-api.com/api/stockists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(retailer),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add stockist');
            }

            const result = await response.json();
            console.log('Backend Response:', result);

            alert('Stockist added successfully!');
            
            // Reset form after successful submission
            setRetailer({
                name: '',
                contact: '',
                email: '',
                password: '',
                retailerCode: '',
                country: '',
                state: '',
                upiId: '',
                gstIn: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error submitting stockist:', error);
            alert(`Error: ${error.message}`);
        }
    }
};


    return (
        <div className="min-h-screen bg-[var(--primary_clr)]">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border-t-4 border-[var(--secondary_clr)]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--primary_clr)] mb-2">
                            Add New Stockist
                        </h1>
                        <p className="text-gray-600">
                            Fill in the Stockist information 
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-[var(--secondary_clr)]">
                            <h2 className="text-xl font-semibold text-[var(--secondary_clr)] mb-4 border-b border-gray-200 pb-2">
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={retailer.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Contact */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={retailer.contact}
                                        onChange={(e) => handleInputChange('contact', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.contact ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={retailer.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="retailer@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={retailer.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors pr-12 ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary_clr)] hover:text-[var(--primary_clr)]"
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-[var(--secondary_clr)]">
                            <h2 className="text-xl font-semibold text-[var(--secondary_clr)] mb-4 border-b border-gray-200 pb-2">
                                Business Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Retailer Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Retailer Code *
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={retailer.retailerCode}
                                            onChange={(e) => handleInputChange('retailerCode', e.target.value)}
                                            className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                                errors.retailerCode ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="RET123456"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRetailerCode}
                                            className="px-4 py-3 bg-[var(--secondary_clr)] text-white rounded-r-lg hover:bg-orange-600 transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    {errors.retailerCode && <p className="text-red-500 text-sm mt-1">{errors.retailerCode}</p>}
                                </div>

                                {/* GST */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GST IN
                                    </label>
                                    <input
                                        type="text"
                                        value={retailer.gstIn}
                                        onChange={(e) => handleInputChange('gstIn', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.gstIn ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength="15"
                                    />
                                    {errors.gstIn && <p className="text-red-500 text-sm mt-1">{errors.gstIn}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
                                </div>

                                {/* UPI */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        value={retailer.upiId}
                                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.upiId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="retailer@paytm"
                                    />
                                    {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Format: username@bankname</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-[var(--secondary_clr)]">
                            <h2 className="text-xl font-semibold text-[var(--secondary_clr)] mb-4 border-b border-gray-200 pb-2">
                                Location Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>
                                    <select
                                        value={retailer.country}
                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.country ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <select
                                        value={retailer.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--secondary_clr)] focus:border-transparent transition-colors ${
                                            errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        disabled={retailer.country !== 'India'}
                                    >
                                        <option value="">Select State</option>
                                        {retailer.country === 'India' ? 
                                            indianStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            )) :
                                            <option value="Other">Other</option>
                                        }
                                    </select>
                                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                            <button
                                type="button"
                                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                onClick={() => {
                                    setRetailer({
                                        name: '',
                                        contact: '',
                                        email: '',
                                        password: '',
                                        retailerCode: '',
                                        country: '',
                                        state: '',
                                        upiId: '',
                                        gstIn: ''
                                    });
                                    setErrors({});
                                }}
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[var(--primary_clr)] text-white rounded-lg hover:bg-[var(--secondary_clr)] transition-colors font-medium shadow-lg"
                            >
                                Add Stockist
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default AddStockist;
