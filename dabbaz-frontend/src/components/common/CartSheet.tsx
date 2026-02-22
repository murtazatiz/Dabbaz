import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../store/cart.store';
import { useNavigate } from 'react-router-dom';

export default function CartSheet() {
    const [open, setOpen] = useState(false);
    const { items, isLoading, removeFromCart, updateFulfillmentMode } = useCart();
    const navigate = useNavigate();

    // Group items by vendor
    const vendors = Array.from(new Set(items.map(i => i.vendor_id)));
    const groupedItems = vendors.map(vendorId => {
        const vendorItems = items.filter(i => i.vendor_id === vendorId);
        const vendor = vendorItems[0].vendor;
        const currentMode = vendorItems[0].fulfillment_mode;
        return { vendorId, vendor, items: vendorItems, fulfillment_mode: currentMode };
    });

    const itemsTotal = items.reduce((sum, item) => sum + (100 * item.quantity), 0); // Mocking Rs 100 per portion
    const deliveryTotal = groupedItems.reduce((sum, g) => sum + (g.fulfillment_mode === 'DELIVERY' ? Number(g.vendor.delivery_charge || 0) : 0), 0);
    const orderTotal = itemsTotal + deliveryTotal;

    const handleCheckout = () => {
        setOpen(false);
        navigate('/checkout/cart'); // we'll intercept this in router
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500"
            >
                <span className="sr-only">Open cart</span>
                <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                {items.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {items.length}
                    </span>
                )}
            </button>

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col bg-white shadow-xl">
                                            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-gray-900">Your Cart</Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <span className="absolute -inset-0.5" />
                                                            <span className="sr-only">Close panel</span>
                                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <div className="flow-root">
                                                        {isLoading ? (
                                                            <p>Loading...</p>
                                                        ) : items.length === 0 ? (
                                                            <p className="text-center text-gray-500">Your cart is empty</p>
                                                        ) : (
                                                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                                {groupedItems.map((group) => (
                                                                    <li key={group.vendorId} className="py-6">
                                                                        <div className="mb-4 flex items-center justify-between border-b pb-2">
                                                                            <h3 className="font-semibold text-gray-900">{group.vendor.business_name}</h3>
                                                                            <div className="flex space-x-2 text-sm">
                                                                                <button
                                                                                    onClick={() => updateFulfillmentMode(group.vendorId, 'DELIVERY')}
                                                                                    className={`px-3 py-1 rounded-full ${group.fulfillment_mode === 'DELIVERY' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                                                                                >
                                                                                    Delivery
                                                                                </button>
                                                                                {group.vendor.collection_enabled && (
                                                                                    <button
                                                                                        onClick={() => updateFulfillmentMode(group.vendorId, 'COLLECTION')}
                                                                                        className={`px-3 py-1 rounded-full ${group.fulfillment_mode === 'COLLECTION' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                                                                                    >
                                                                                        Pickup
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <ul role="list" className="space-y-4">
                                                                            {group.items.map((item) => (
                                                                                <li key={item.id} className="flex">
                                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                                        <div>
                                                                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                                                                <h4>{item.menu_item.name}</h4>
                                                                                                <p className="ml-4">₹{100 * item.quantity}</p>
                                                                                            </div>
                                                                                            <p className="mt-1 text-sm text-gray-500">{new Date(item.delivery_date).toLocaleDateString()} - {item.meal_type}</p>
                                                                                        </div>
                                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                                                                            <div className="flex">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => removeFromCart(item.id)}
                                                                                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                                                                                >
                                                                                                    Remove
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>

                                                                        {group.fulfillment_mode === 'DELIVERY' && group.vendor.delivery_charge && (
                                                                            <div className="mt-4 flex justify-between text-sm text-gray-600 border-t pt-2">
                                                                                <p>Delivery Charge</p>
                                                                                <p>₹{group.vendor.delivery_charge}</p>
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {items.length > 0 && (
                                                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <p>Subtotal</p>
                                                        <p>₹{orderTotal}</p>
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                                    <div className="mt-6">
                                                        <button
                                                            onClick={handleCheckout}
                                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                                                        >
                                                            Checkout
                                                        </button>
                                                    </div>
                                                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                                        <p>
                                                            or{' '}
                                                            <button
                                                                type="button"
                                                                className="font-medium text-indigo-600 hover:text-indigo-500"
                                                                onClick={() => setOpen(false)}
                                                            >
                                                                Continue Shopping
                                                                <span aria-hidden="true"> &rarr;</span>
                                                            </button>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    );
}
