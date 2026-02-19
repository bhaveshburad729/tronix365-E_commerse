import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const txnid = searchParams.get('txnid');
    const { clearCart } = useCart();

    // Determine status based on URL path or query param if provided
    const isSuccess = window.location.pathname.includes('success');

    useEffect(() => {
        if (isSuccess) {
            clearCart();
        }
    }, [isSuccess]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="bg-tronix-card border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    {isSuccess ? (
                        <CheckCircle className="text-green-500 w-20 h-20" />
                    ) : (
                        <XCircle className="text-red-500 w-20 h-20" />
                    )}
                </div>

                <h1 className="text-3xl font-display font-bold text-white mb-2">
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                </h1>

                <p className="text-gray-400 mb-8">
                    {isSuccess
                        ? `Thank you for your purchase. Your transaction ID is ${txnid}.`
                        : `We couldn't process your payment for transaction ${txnid}. Please try again.`}
                </p>

                <div className="space-y-3">
                    <Link
                        to="/shop"
                        className="block w-full bg-tronix-primary hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    {!isSuccess && (
                        <Link
                            to="/cart"
                            className="block w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                            Try Again
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
