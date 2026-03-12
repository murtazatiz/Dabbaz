import React from 'react';

type OrderStatus = 'CONFIRMED' | 'BEING_PREPARED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'READY_FOR_COLLECTION' | 'COLLECTED' | 'CANCELLED';

interface Props {
    status: OrderStatus;
    fulfilmentType: 'DELIVERY' | 'COLLECTION';
}

const OrderProgressTracker: React.FC<Props> = ({ status, fulfilmentType }) => {
    if (status === 'CANCELLED') {
        return (
            <div className="w-full mt-4 flex items-center justify-center py-2 bg-red-50 text-red-600 border border-red-100 rounded text-sm font-medium">
                Order Cancelled
            </div>
        );
    }

    const deliverySteps = ['CONFIRMED', 'BEING_PREPARED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const collectionSteps = ['CONFIRMED', 'BEING_PREPARED', 'READY_FOR_COLLECTION', 'COLLECTED'];

    const steps = fulfilmentType === 'DELIVERY' ? deliverySteps : collectionSteps;
    const currentStepIndex = steps.indexOf(status);

    // Safefall if status not in standard flow for some reason
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    const labels = fulfilmentType === 'DELIVERY'
        ? ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']
        : ['Confirmed', 'Preparing', 'Ready for Pickup', 'Collected'];

    return (
        <div className="w-full mt-4 pt-2 relative">
            {/* Background Line */}
            <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-gray-200" />

            {/* Active Foreground Line */}
            <div
                className="absolute top-4 left-[10%] h-0.5 bg-green-500 transition-all duration-500 ease-in-out"
                style={{ width: `${(activeIndex / (steps.length - 1)) * 80}%` }}
            />

            <div className="flex justify-between relative z-10 w-full">
                {steps.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step} className="flex flex-col items-center w-1/4">
                            <div
                                className={`w-[10px] h-[10px] rounded-full shrink-0 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : isCurrent ? 'bg-brand-primary animate-pulse shadow-sm shadow-brand-primary/50' : 'bg-gray-200'}`}
                                aria-current={isCurrent}
                            />
                            <span
                                className={`mt-2 text-[10px] sm:text-xs text-center leading-tight tracking-wide font-medium transition-colors ${isCompleted ? 'text-green-700' : isCurrent ? 'text-brand-primary' : 'text-gray-400'}`}
                            >
                                {labels[index]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderProgressTracker;
