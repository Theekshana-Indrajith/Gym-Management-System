import React, { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { ShoppingBag, Search, ShoppingCart, Star, Plus, Minus, Truck, Store, Phone, MapPin, X, CheckCircle2, Package, MessageSquare, Send, Clock, Reply, CreditCard, DollarSign, Image as ImageIcon, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MemberHeader from '../components/MemberHeader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SupplementStore = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'orders', or 'requests'
    const [orders, setOrders] = useState([]);
    const [userRequests, setUserRequests] = useState([]); // Support/Inquiry requests
    const [walletBalance, setWalletBalance] = useState(0);
    const [notifications, setNotifications] = useState([]);

    // UI Enhancements State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartAnimation, setCartAnimation] = useState(false);

    // Search & Request State
    const [searchQuery, setSearchQuery] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({ name: '', description: '' });

    const [activeCategory, setActiveCategory] = useState('All Items');
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Checkout form state
    const [deliveryMethod, setDeliveryMethod] = useState('PICKUP');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE_PAYMENT');
    const [paymentSlip, setPaymentSlip] = useState(null);
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchMyOrders();
        fetchMyRequests();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) return;
            const res = await axios.get('http://localhost:8080/api/notifications/my', { headers: { Authorization: auth } });
            setNotifications(res.data.filter(n => !n.read));
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/member/inquiries', {
                headers: { Authorization: auth }
            });
            // Show all inquiries or just filter for "Supplement Request" if desired
            setUserRequests(res.data.sort((a, b) => b.id - a.id));
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const handleTabClick = async (tab) => {
        setActiveTab(tab);
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth) return;

        let targetType = null;
        if (tab === 'orders') targetType = 'ORDER_UPDATE';
        if (tab === 'requests') targetType = 'INQUIRY_REPLY';

        if (targetType) {
            const unreadOfThisType = notifications.filter(n => n.type === targetType && !n.read);
            
            if (unreadOfThisType.length > 0) {
                for (const n of unreadOfThisType) {
                    try {
                        await axios.put(`http://localhost:8080/api/notifications/${n.id}/read`, {}, { headers: { Authorization: auth } });
                    } catch(e) { console.error(e) }
                }
                fetchNotifications();
            }
        }
    };

    const fetchMyOrders = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/member/orders/my', {
                headers: { Authorization: auth }
            });
            setOrders(res.data);

            // Also fetch profile to get latest wallet balance
            const profileRes = await axios.get('http://localhost:8080/api/member/profile', {
                headers: { Authorization: auth }
            });
            setWalletBalance(profileRes.data.walletBalance || 0);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    const handleCancelOrder = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this order? Paid amount will be refunded to your store wallet.")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.patch(`http://localhost:8080/api/member/orders/${id}/cancel`, {}, {
                headers: { Authorization: auth }
            });
            alert("Order cancelled successfully!");
            fetchMyOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel order");
        }
    };

    const handleConfirmReceipt = async (id) => {
        if (!window.confirm("Confirm that you have received the items?")) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.patch(`http://localhost:8080/api/member/orders/${id}/confirm`, {}, {
                headers: { Authorization: auth }
            });
            alert("Thank you for confirming!");
            fetchMyOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const getStatusStep = (status) => {
        const flow = {
            'PENDING': 1,
            'AWAITING_PAYMENT_APPROVAL': 2,
            'PAYMENT_VERIFIED': 3,
            'PREPARED': 4,
            'SHIPPED': 5,
            'COMPLETED': 6,
            'CANCELLED': 0
        };
        return flow[status] || 1;
    };

    const renderOrderTimeline = (order) => {
        const status = order.status;
        if (status === 'CANCELLED') return null;
        const currentStep = getStatusStep(status);
        
        const steps = [
            { id: 1, label: 'Placed', icon: ShoppingBag },
            { id: 2, label: 'In Review', icon: Search },
            { id: 3, label: 'Confirmed', icon: DollarSign },
            { id: 4, label: 'Prepared', icon: Package },
            { id: 5, label: order.deliveryMethod === 'PICKUP' ? 'Ready' : 'Shipped', icon: Truck },
            { id: 6, label: 'Finalized', icon: CheckCircle2 }
        ];

        return (
            <div className="py-10 px-4 mb-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Package size={80} className="rotate-12" />
                </div>
                <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                    {/* Background Line */}
                    <div className="absolute top-5 left-0 w-full h-[3px] bg-slate-200 z-0 rounded-full"></div>
                    
                    {/* Progress Line */}
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        className="absolute top-5 left-0 h-[3px] bg-blue-600 z-0 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    ></motion.div>
    
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
    
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                <motion.div 
                                    animate={isCurrent ? { 
                                        scale: [1, 1.15, 1],
                                        boxShadow: ["0 0 0px rgba(37,99,235,0)", "0 0 20px rgba(37,99,235,0.4)", "0 0 0px rgba(37,99,235,0)"]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${
                                        isCompleted 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }`}
                                >
                                    {isCompleted && !isCurrent ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                                </motion.div>
                                <div className="text-center">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1 ${
                                        isCompleted ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="text-[8px] font-bold text-slate-400 italic lowercase tracking-tight">current</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const fetchProducts = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const res = await axios.get('http://localhost:8080/api/supplements', {
                headers: { Authorization: auth }
            });
            const mapped = res.data.map(p => ({
                ...p,
                color: getColor(p.category),
                rating: 4.8
            }));
            setProducts(mapped);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const getColor = (category) => {
        switch (category) {
            case 'Protein': return 'bg-blue-600';
            case 'Creatine': return 'bg-purple-600';
            case 'Pre-Workout': return 'bg-red-600';
            case 'Recovery': return 'bg-emerald-600';
            case 'Vitamins': return 'bg-orange-600';
            case 'Mass Gainer': return 'bg-slate-600';
            default: return 'bg-slate-600';
        }
    };

    const addToCart = (id) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), 300);
    };

    const removeFromCart = (id) => {
        if (!cart[id]) return;
        setCart(prev => {
            const next = { ...prev };
            if (next[id] === 1) delete next[id];
            else next[id]--;
            return next;
        });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(contact)) {
            alert("Please provide a valid 10-digit contact number (e.g. 0771234567).");
            return;
        }

        if (deliveryMethod === 'COURIER') {
            if (!address || address.trim().length < 5) {
                alert("Please provide a full delivery address.");
                return;
            }
            // Check if address is only numbers (e.g. "12345")
            if (/^\d+$/.test(address.trim())) {
                alert("Address cannot be only numbers. Please provide a street name and city.");
                return;
            }
            if (paymentMethod !== 'ONLINE_PAYMENT' && paymentMethod !== 'WALLET') {
                alert("Courier delivery requires online payment (slip upload) or Store Wallet payment.");
                return;
            }
        }

        if (paymentMethod === 'ONLINE_PAYMENT' && !paymentSlip) {
            alert("Please upload your payment slip for online payment.");
            return;
        }

        if (paymentMethod === 'WALLET' && walletBalance < checkoutTotal) {
            alert("Your wallet balance is insufficient for this purchase.");
            return;
        }

        setLoading(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) {
                navigate('/login');
                return;
            }

            const cartItems = {};
            Object.entries(cart).forEach(([id, qty]) => {
                cartItems[id] = qty;
            });

            await axios.post('http://localhost:8080/api/member/orders/place', {
                orderDetails: {
                    deliveryMethod: deliveryMethod,
                    deliveryAddress: deliveryMethod === 'COURIER' ? address : 'Gym Pickup',
                    contactNumber: contact,
                    paymentMethod: paymentMethod,
                    paymentSlip: paymentSlip
                },
                cartItems: cartItems
            }, {
                headers: { Authorization: auth }
            });

            setShowCheckout(false);
            setShowSuccess(true);
            setCart({});
            fetchProducts();
            fetchMyOrders();
        } catch (err) {
            console.error("Checkout Error Details:", err.response?.data);
            const errorMsg = err.response?.data?.message || "Something went wrong. Please check your internet connection or stock levels.";
            alert("Checkout failed: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
        const product = products.find(p => p.id == id);
        return product ? acc + (product.price * qty) : acc;
    }, 0);

    const deliveryFee = deliveryMethod === 'COURIER' ? 50 : 0;
    const checkoutTotal = cartTotal + deliveryFee;

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All Items' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSupplementRequest = async (e) => {
        e.preventDefault();
        if (!requestData.name.trim()) return;
        setLoading(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            await axios.post('http://localhost:8080/api/member/inquiries', {
                subject: 'Supplement Request',
                message: `Supplement Name: ${requestData.name}\nDescription: ${requestData.description}`
            }, {
                headers: { Authorization: auth }
            });
            setShowRequestModal(false);
            setRequestData({ name: '', description: '' });
            alert("Your supplement request has been sent to the admin.");
        } catch (err) {
            alert("Failed to send request. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const generateInvoice = (order) => {
        const doc = new jsPDF();

        // Add MH Logo/Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('MUSCLEHUB', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('OFFICIAL INVOICE', 150, 25);

        // Order Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Invoice To: ${order.user.username}`, 20, 55);
        doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 62);
        doc.text(`Order ID: #${order.id}`, 20, 69);

        doc.text(`Delivery: ${order.deliveryMethod}`, 140, 55);
        doc.text(`Contact: ${order.contactNumber}`, 140, 62);
        doc.text(`Status: ${order.status}`, 140, 69);

        // Items Table
        const tableColumn = ["Item", "Unit Price", "Quantity", "Total"];
        const tableRows = [];

        order.items.forEach(item => {
            const itemData = [
                item.supplement.name,
                `LKR ${item.priceAtPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                item.quantity,
                `LKR ${(item.priceAtPurchase * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }, // blue-600
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        // Totals
        const subtotal = order.totalPrice - (order.deliveryMethod === 'COURIER' ? 50 : 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Subtotal: LKR ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 140, finalY);
        if (order.deliveryMethod === 'COURIER') {
            doc.text(`Shipping: LKR 50.00`, 140, finalY + 7);
        }
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text(`GRAND TOTAL: LKR ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 110, finalY + 17);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for choosing MuscleHub for your supplement needs!', 105, 280, { align: 'center' });

        doc.save(`MuscleHub_Invoice_${order.id}.pdf`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-amber-500 bg-amber-50 border border-amber-100';
            case 'AWAITING_PAYMENT_APPROVAL': return 'text-orange-500 bg-orange-50 border border-orange-100';
            case 'PAYMENT_VERIFIED': return 'text-emerald-500 bg-emerald-50 border border-emerald-100';
            case 'PREPARED': return 'text-blue-500 bg-blue-50 border border-blue-100';
            case 'SHIPPED': return 'text-purple-500 bg-purple-50 border border-purple-100';
            case 'COMPLETED': return 'text-green-500 bg-green-50 border border-green-100';
            case 'CANCELLED': return 'text-rose-500 bg-rose-50 border border-rose-100';
            default: return 'text-slate-500 bg-slate-50 border border-slate-100';
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-100 font-sans">
            <MemberSidebar activePage="store" />
            <main className="ml-64 flex-1 flex flex-col min-h-screen">
                <div className="relative bg-slate-900 px-8 pt-8 pb-14 shadow-sm">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    <div className="relative z-50 max-w-[1400px] mx-auto w-full">
                        <MemberHeader title="Supplement Store" subtitle="Accelerate your progress today" lightTheme={true} />
                    </div>
                </div>
                <div className="flex-1 px-8 pb-12 max-w-[1400px] mx-auto w-full -mt-6 relative z-20 flex gap-10 items-start">
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between mb-8 pt-6 gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search supplements, brands..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 shadow-sm transition-all"
                                />
                            </div>
                            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-2 w-max">
                                <button
                                    onClick={() => handleTabClick('shop')}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'shop' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <ShoppingBag size={18} /> Shop
                                </button>
                                <button
                                    onClick={() => handleTabClick('orders')}
                                    className={`relative px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Package size={18} /> My Orders
                                    {notifications.filter(n => n.type === 'ORDER_UPDATE').length > 0 && 
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-lg shadow-red-500/30">
                                            {notifications.filter(n => n.type === 'ORDER_UPDATE').length}
                                        </span>
                                    }
                                </button>
                                <button
                                    onClick={() => handleTabClick('requests')}
                                    className={`relative px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <MessageSquare size={18} /> My Requests
                                    {notifications.filter(n => n.type === 'INQUIRY_REPLY').length > 0 && 
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-lg shadow-red-500/30">
                                            {notifications.filter(n => n.type === 'INQUIRY_REPLY').length}
                                        </span>
                                    }
                                </button>
                            </div>

                            <div className="bg-slate-900 px-8 py-3 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50"></div>
                                <div className="relative z-10 p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-xl font-black">LKR</span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase mb-0.5">Store Wallet</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white tracking-tight">LKR {walletBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'shop' && (
                            <>
                                <nav className="flex gap-4 mb-10 overflow-x-auto pb-2">
                                    {['All Items', 'Protein', 'Creatine', 'Pre-Workout', 'Vitamins', 'Recovery', 'Mass Gainer'].map((cat, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`whitespace-nowrap px-6 py-2 rounded-xl font-bold transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </nav>

                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <motion.div layout id={`product-${product.id}`} key={product.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                                <div 
                                                    onClick={() => setSelectedProduct(product)}
                                                    className={`h-40 ${product.color} rounded-3xl mb-6 relative overflow-hidden p-6 text-white cursor-pointer group/img`}
                                                >
                                                    {product.image ? (
                                                        <>
                                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover z-0 group-hover/img:scale-110 transition-transform duration-700" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover/img:opacity-80 transition-opacity" />
                                                        </>
                                                    ) : (
                                                        <ShoppingBag size={80} className="absolute -right-4 -bottom-4 opacity-20 rotate-12 group-hover/img:scale-110 transition-transform duration-700" />
                                                    )}
                                                    <span className="relative z-20 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/20 shadow-lg">{product.category}</span>
                                                    <div className="absolute inset-0 z-30 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl border border-white/30 shadow-2xl">Quick View</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{product.name}</h3>
                                                <p className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-tighter">{product.brand}</p>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold text-slate-900">LKR {product.price.toLocaleString()}</span>
                                                    {cart[product.id] ? (
                                                        <div className="flex gap-2 items-center bg-slate-900 text-white rounded-2xl p-1 px-4">
                                                            <button onClick={() => removeFromCart(product.id)} className="p-1 hover:text-blue-400"><Minus size={16} /></button>
                                                            <span className="font-bold min-w-[20px] text-center">{cart[product.id]}</span>
                                                            <button onClick={() => addToCart(product.id)} disabled={cart[product.id] >= product.stock} className="p-1 hover:text-blue-400 disabled:opacity-50"><Plus size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(product.id)}
                                                            disabled={product.stock <= 0}
                                                            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                                                        >
                                                            <ShoppingCart size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                                {product.stock > 0 && product.stock <= 5 && <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-4 bg-red-50 p-2 rounded-lg text-center">Only {product.stock} left in stock!</p>}
                                                {product.stock <= 0 && <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 bg-slate-100 p-2 rounded-lg text-center">Out of stock</p>}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="md:col-span-2 xl:col-span-3 py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                                            <Search size={48} className="mb-4 text-slate-300 opacity-50" />
                                            <p className="font-black text-xl text-slate-800 mb-2">No results found for "{searchQuery}"</p>
                                            <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm text-center">
                                                We currently don't have exactly what you're looking for in stock.
                                            </p>
                                            <button
                                                onClick={() => setShowRequestModal(true)}
                                                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black tracking-wide flex items-center gap-3 transition-all shadow-lg active:scale-95"
                                            >
                                                <Plus size={20} /> Can't find it? Request it here!
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                {orders.length === 0 ? (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <Package size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 uppercase">No orders yet</h3>
                                        <p className="text-slate-500 font-medium">Your purchase history will appear here.</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Order #{order.id}</h4>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>

                                            {renderOrderTimeline(order)}

                                            <div className="grid md:grid-cols-2 gap-8 py-6 border-y border-slate-50">
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Items</p>
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center text-sm font-bold text-slate-600">
                                                            <span>{item.supplement.name} <span className="text-slate-400 text-xs font-medium ml-2">x {item.quantity}</span></span>
                                                            <span className="text-slate-900">LKR {(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Details</p>
                                                        <div className="flex items-start gap-2 text-sm font-bold text-slate-600">
                                                            {order.deliveryMethod === 'COURIER' ? <Truck size={14} className="mt-0.5 text-blue-500" /> : <Store size={14} className="mt-0.5 text-blue-500" />}
                                                            <span>{order.deliveryMethod === 'COURIER' ? 'Courier Delivery' : 'In-Gym Pickup'}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm font-bold text-slate-600">
                                                            <MapPin size={14} className="mt-0.5 text-slate-400" />
                                                            <span className="text-xs leading-relaxed max-w-[200px]">{order.deliveryAddress}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Info</p>
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                            <CreditCard size={14} className="text-blue-500" />
                                                            <span>{order.paymentMethod === 'ONLINE_PAYMENT' ? 'Online Payment' : 'Cash on Pickup'}</span>
                                                        </div>
                                                        {/* {order.paymentSlip && (
                                                            <div className="mt-3 group cursor-pointer" onClick={() => window.open(order.paymentSlip, '_blank')}>
                                                                <p className="text-[10px] font-black uppercase text-blue-600 mb-2 flex items-center gap-1">
                                                                    <ImageIcon size={12} /> Payment Slip Preview
                                                                </p>
                                                                <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm max-w-[120px]">
                                                                    <img 
                                                                        src={order.paymentSlip} 
                                                                        alt="Slip" 
                                                                        className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-[8px] text-white font-black uppercase tracking-tighter">View Full</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-between items-center pt-6 border-t border-slate-50">
                                                <div className="flex gap-4">
                                                    {(order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT_APPROVAL' || order.status === 'PAYMENT_VERIFIED' || order.status === 'PREPARED') && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                                            className="px-6 py-2 rounded-xl bg-orange-50 text-orange-600 font-bold text-xs hover:bg-orange-100 transition-all flex items-center gap-2"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                    {(order.status === 'SHIPPED' || (order.status === 'PREPARED' && order.deliveryMethod === 'PICKUP')) && (
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleConfirmReceipt(order.id); }}
                                                                className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                                            >
                                                                <CheckCircle2 size={14} /> Confirm Receipt
                                                            </button>
                                                            {order.status === 'SHIPPED' && (
                                                                <span className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1">
                                                                    <AlertCircle size={10} /> Orders cannot be cancelled after shipment
                                                                </span>
                                                            )}
                                                            {order.status === 'COMPLETED' && (
                                                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Order Received</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(order.status === 'PAYMENT_VERIFIED' || order.status === 'PREPARED' || order.status === 'SHIPPED' || order.status === 'COMPLETED') && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                                                            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                                        >
                                                            <Download size={14} /> Download Invoice
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Amount</span>
                                                    <span className="text-2xl font-bold text-blue-600">LKR {order.totalPrice.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                {userRequests.filter(r => r.subject === 'Supplement Request').length === 0 ? (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 uppercase">No requests yet</h3>
                                        <p className="text-slate-500 font-medium">Any supplements you request will appear here.</p>
                                    </div>
                                ) : (
                                    userRequests.filter(r => r.subject === 'Supplement Request').map(request => (
                                        <div key={request.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                                        <MessageSquare size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Request #{request.id}</h4>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${request.status === 'OPEN' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {request.status}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-2xl mb-6">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</p>
                                                <p className="text-slate-700 font-medium whitespace-pre-wrap">{request.message}</p>
                                            </div>

                                            {request.reply ? (
                                                <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                                                    <Reply className="absolute right-[-10%] top-[-10%] opacity-10 w-24 h-24 rotate-12" />
                                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Management Response</p>
                                                    <p className="font-bold relative z-10 leading-relaxed italic">"{request.reply}"</p>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-100 rounded-2xl p-6 text-slate-500 flex items-center gap-3">
                                                    <Clock size={18} />
                                                    <span className="text-xs font-bold uppercase tracking-widest text-center">Awaiting response from our stock manager...</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mini Cart Sidebar */}
                    <aside className="w-80 h-fit bg-white text-slate-900 border border-slate-100 shadow-xl rounded-[2.5rem] p-8 shadow-2xl sticky top-10 flex flex-col">
                        <h3 className="text-2xl font-bold mb-8 flex items-center justify-between">
                            Cart 
                            <motion.div animate={cartAnimation ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : {}} transition={{ duration: 0.5 }}>
                                <ShoppingCart size={24} className="text-blue-400" />
                            </motion.div>
                        </h3>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2 custom-scrollbar flex-1">
                            <AnimatePresence>
                                {Object.entries(cart).map(([id, qty]) => {
                                    const product = products.find(p => p.id == id);
                                    if (!product) return null;
                                    return (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={id} className="flex justify-between items-center group">
                                            <div className="max-w-[70%]">
                                                <p className="font-bold text-base truncate">{product.name}</p>
                                                <p className="text-slate-500 text-xs">{qty} x LKR {product.price.toLocaleString()}</p>
                                            </div>
                                            <span className="font-bold text-blue-400 text-xs">LKR {(qty * product.price).toLocaleString()}</span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {Object.keys(cart).length === 0 && (
                                <div className="text-center py-10 opacity-30 italic text-sm">Cart is empty</div>
                            )}
                        </div>
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-slate-400">Total Due</span>
                                <span className="text-2xl font-bold">LKR {cartTotal.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => setShowCheckout(true)}
                                disabled={Object.keys(cart).length === 0 || loading}
                                className="w-full bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </aside>
                </div>

                <footer className="bg-slate-950 text-slate-400 py-12 px-10 mt-auto w-full flex flex-col items-center relative z-20">
                    <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between gap-10 border-b border-slate-800 pb-8">
                        <div className="flex flex-col gap-4 max-w-[200px]">
                            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                                <div className="text-white bg-blue-600 p-1 rounded min-w-[32px] min-h-[32px] flex items-center justify-center font-bold">MH</div> MUSCLEHUB
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500">Premium Fitness Management</p>
                        </div>
                        <div className="flex flex-1 justify-around gap-4 text-[11px]">
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">About Us</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Our gym's vision, story & core mission.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Services</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>AI plans, top-tier trainers & facilities.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Contact</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>24/7 dedicated support & inquiry line.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 text-[13px] font-sans">Privacy Policy</h4>
                                <ul className="space-y-2 opacity-80 leading-relaxed max-w-[120px] text-slate-400">
                                    <li>Data security, user safety & terms.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400">FB</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-slate-400">TW</button>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400">IG</button>
                        </div>
                    </div>
                    <div className="max-w-7xl w-full mx-auto flex justify-between items-center text-[10px] mt-8 text-slate-600 font-semibold tracking-wide">
                        <p>&copy; 2026 MuscleHub. All rights reserved.</p>
                        <p>Colombo, Sri Lanka <span className="mx-2">|</span> 011-2224455</p>
                    </div>
                </footer>

            </main>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative z-10 shadow-2xl overflow-hidden">
                            <button onClick={() => setShowCheckout(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>

                            <h2 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Checkout</h2>
                            <p className="text-slate-500 font-medium mb-8">Confirm your delivery details to complete the purchase.</p>

                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('PICKUP')}
                                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-2 ${deliveryMethod === 'PICKUP' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
                                    >
                                        <Store size={32} />
                                        <span className="font-bold uppercase text-[10px] tracking-widest">In-Gym Pickup</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('COURIER')}
                                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-2 ${deliveryMethod === 'COURIER' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
                                    >
                                        <Truck size={32} />
                                        <span className="font-bold uppercase text-[10px] tracking-widest">Courier Delivery</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="text-[10px] font-black w-full block text-slate-400 uppercase tracking-widest ml-4 mb-2">Contact Details</label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="Mobile Number"
                                                required
                                                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-8 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all"
                                                value={contact}
                                                onChange={e => setContact(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {deliveryMethod === 'COURIER' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
                                            <MapPin className="absolute left-6 top-8 text-slate-400" size={18} />
                                            <textarea
                                                placeholder="Full Delivery Address"
                                                required
                                                className="w-full bg-slate-50 border-none rounded-2xl py-6 pl-14 pr-8 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all min-h-[120px]"
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                            />
                                        </motion.div>
                                    )}

                                    <div className="space-y-4 pt-2">
                                        <label className="text-[10px] font-black w-full block text-slate-400 uppercase tracking-widest ml-4 mb-2">Payment Method</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('ONLINE_PAYMENT')}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border-2 transition-all ${paymentMethod === 'ONLINE_PAYMENT' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                <CreditCard size={20} />
                                                <span className="font-bold uppercase text-[8px] tracking-widest whitespace-nowrap">Online (Slip)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (deliveryMethod === 'COURIER') {
                                                        alert("Courier delivery requires online payment or Store Wallet payment.");
                                                        return;
                                                    }
                                                    setPaymentMethod('CASH_ON_PICKUP');
                                                }}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border-2 transition-all ${paymentMethod === 'CASH_ON_PICKUP' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'} ${deliveryMethod === 'COURIER' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="text-xl font-black">LKR</div>
                                                <span className="font-bold uppercase text-[8px] tracking-widest whitespace-nowrap">Pay at Gym</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('WALLET')}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border-2 transition-all ${paymentMethod === 'WALLET' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                <div className="relative">
                                                    <CreditCard size={20} />
                                                    <div className="absolute -top-1 -right-1 bg-indigo-600 w-2 h-2 rounded-full animate-pulse"></div>
                                                </div>
                                                <span className="font-bold uppercase text-[8px] tracking-widest whitespace-nowrap">My Wallet</span>
                                            </button>
                                        </div>
                                    </div>

                                    {paymentMethod === 'ONLINE_PAYMENT' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 p-6 rounded-[2rem] border border-blue-100">
                                            <label className="text-[10px] font-black block text-blue-600 uppercase tracking-widest mb-4">Upload Payment Slip</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const img = new Image();
                                                            img.src = reader.result;
                                                            img.onload = () => {
                                                                const canvas = document.createElement('canvas');
                                                                const MAX_WIDTH = 800;
                                                                const MAX_HEIGHT = 800;
                                                                let width = img.width;
                                                                let height = img.height;

                                                                if (width > height) {
                                                                    if (width > MAX_WIDTH) {
                                                                        height *= MAX_WIDTH / width;
                                                                        width = MAX_WIDTH;
                                                                    }
                                                                } else {
                                                                    if (height > MAX_HEIGHT) {
                                                                        width *= MAX_HEIGHT / height;
                                                                        height = MAX_HEIGHT;
                                                                    }
                                                                }

                                                                canvas.width = width;
                                                                canvas.height = height;
                                                                const ctx = canvas.getContext('2d');
                                                                ctx.drawImage(img, 0, 0, width, height);
                                                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                                                                setPaymentSlip(compressedBase64);
                                                            };
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                            />
                                            {paymentSlip && <p className="text-[9px] font-bold text-emerald-500 mt-2 flex items-center gap-1"><CheckCircle2 size={12} /> Slip attached successfully</p>}
                                        </motion.div>
                                    )}

                                    {paymentMethod === 'WALLET' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[10px] font-black block text-indigo-600 uppercase tracking-widest">Your Store Wallet</label>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Available Funds</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <p className={`text-2xl font-black ${walletBalance >= checkoutTotal ? 'text-indigo-900' : 'text-rose-600'}`}>
                                                    LKR {walletBalance.toLocaleString()}
                                                </p>
                                                {walletBalance < checkoutTotal && (
                                                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">
                                                        Insufficient Balance: Short of LKR {(checkoutTotal - walletBalance).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-indigo-100">
                                                <p className="text-[10px] font-bold text-indigo-400 leading-relaxed italic">
                                                    * Funds will be deducted immediately upon order confirmation.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                    <div className="flex justify-between items-center relative z-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payment</p>
                                            <p className="text-3xl font-bold">LKR {checkoutTotal.toLocaleString()}</p>
                                            {deliveryMethod === 'COURIER' && <p className="text-[10px] font-bold text-blue-600 mt-1">+ LKR 50.00 Delivery</p>}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Confirm Order'}
                                        </button>
                                    </div>
                                    <ShoppingCart className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="bg-white max-w-sm w-full rounded-[3rem] p-12 text-center relative z-10 shadow-2xl">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 uppercase">Order Placed!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                                Your order has been successfully placed. {deliveryMethod === 'PICKUP' ? "Visit the gym counter to collect your items." : "Our team is preparing your package for courier delivery."}
                            </p>
                            <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                                Awesome
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Quick View Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white max-w-4xl w-full rounded-[3.5rem] p-4 relative z-10 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 items-stretch min-h-[400px]">
                            
                            {/* Left Image Side */}
                            <div className={`w-full md:w-1/2 ${selectedProduct.color} rounded-[3rem] relative overflow-hidden flex items-center justify-center p-12 shrink-0 group`}>
                                {selectedProduct.image ? (
                                    <>
                                        <img src={selectedProduct.image} alt={selectedProduct.name} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                                    </>
                                ) : (
                                    <ShoppingBag size={120} className="text-white opacity-20 rotate-12" />
                                )}
                                <div className="absolute top-6 left-6 z-20">
                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 shadow-lg">{selectedProduct.category}</span>
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 z-20">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{selectedProduct.brand}</p>
                                    <h3 className="text-3xl font-black text-white leading-tight">{selectedProduct.name}</h3>
                                </div>
                            </div>

                            {/* Right Details Side */}
                            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between relative">
                                <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all">
                                    <X size={20} />
                                </button>
                                
                                <div>
                                    <h4 className="text-slate-900 text-2xl font-black mb-4">LKR {selectedProduct.price.toLocaleString()}</h4>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                {selectedProduct.description || "Premium quality supplement crafted for maximum absorption and performance. Enhance your training regimen with this elite-grade formulation."}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplement Facts</p>
                                            <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-4 border border-slate-100">
                                                <div>
                                                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Weight/Volume</span>
                                                    <span className="text-sm font-black text-slate-900">Standard Pack</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Availability</span>
                                                    <span className={`text-sm font-black ${selectedProduct.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            addToCart(selectedProduct.id);
                                            setSelectedProduct(null);
                                        }}
                                        disabled={selectedProduct.stock <= 0 || (cart[selectedProduct.id] && cart[selectedProduct.id] >= selectedProduct.stock)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:shadow-none"
                                    >
                                        <ShoppingCart size={20} />
                                        {selectedProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Request Supplement Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowRequestModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white max-w-lg w-full rounded-[3rem] p-10 relative z-10 shadow-2xl">
                            <button onClick={() => setShowRequestModal(false)} className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>

                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <MessageSquare size={32} />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Request Supplement</h2>
                            <p className="text-slate-500 font-medium mb-8">Tell us what you're looking for, and our team will work on stocking it.</p>

                            <form onSubmit={handleSupplementRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Supplement Name / Brand</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Optimum Nutrition Gold Standard Whey"
                                        value={requestData.name}
                                        onChange={e => setRequestData({ ...requestData, name: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl p-6 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Additional Details (Flavor, Size, etc.)</label>
                                    <textarea
                                        placeholder="Specific flavors, sizes, or reasons you want this..."
                                        value={requestData.description}
                                        onChange={e => setRequestData({ ...requestData, description: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-[2rem] p-6 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 min-h-[120px]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                >
                                    {loading ? 'Sending...' : <><Send size={20} /> Submit Request</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplementStore;
