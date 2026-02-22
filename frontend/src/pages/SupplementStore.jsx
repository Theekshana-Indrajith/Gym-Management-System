import React, { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import MemberHeader from '../components/MemberHeader';
import MemberPageBanner from '../components/MemberPageBanner';
import { ShoppingBag, Search, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupplementStore = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All Items');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            // Use public endpoint, but send auth if available
            const res = await axios.get('http://localhost:8080/api/supplements', {
                headers: { Authorization: auth }
            });
            // Assign random colors if not from DB (DB doesn't store color, so we map or default)
            const mapped = res.data.map(p => ({
                ...p,
                color: getColor(p.category),
                rating: 4.8 // Mock rating
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
            case 'Strength': return 'bg-purple-600';
            case 'Pre-Workout': return 'bg-red-600';
            case 'Energy': return 'bg-red-600';
            case 'Recovery': return 'bg-emerald-600';
            case 'Vitamins': return 'bg-orange-600';
            case 'Health': return 'bg-orange-600';
            case 'Mass Gainer': return 'bg-slate-600';
            default: return 'bg-slate-600';
        }
    };

    const addToCart = (id) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
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

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            if (!auth) {
                navigate('/login');
                return;
            }

            // Buy each item
            for (const [id, qty] of Object.entries(cart)) {
                await axios.post(`http://localhost:8080/api/supplements/${id}/buy?quantity=${qty}`, {}, {
                    headers: { Authorization: auth }
                });
            }
            alert("Purchase successful! Your supplements are on the way.");
            setCart({});
            fetchProducts(); // Refresh stock
        } catch (err) {
            console.error(err);
            alert("Purchase failed. Please check stock levels.");
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
        const product = products.find(p => p.id == id);
        return product ? acc + (product.price * qty) : acc;
    }, 0);

    const filteredProducts = activeCategory === 'All Items'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100">
            <MemberSidebar activePage="store" />
            <main className="ml-64 flex-1 p-6 flex gap-6">
                <div className="flex-1">
                    <MemberPageBanner title="Supplement Store" subtitle="Premium nutrition products delivered to you" icon={ShoppingBag} />

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
                        {filteredProducts.map((product) => (
                            <motion.div layout id={`product-${product.id}`} key={product.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className={`h-40 ${product.color} rounded-3xl mb-6 relative overflow-hidden p-6 text-white`}>
                                    {product.image ? (
                                        <>
                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover z-0" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                                        </>
                                    ) : (
                                        <ShoppingBag size={80} className="absolute -right-4 -bottom-4 opacity-20 rotate-12" />
                                    )}
                                    <span className="relative z-20 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-white/20">{product.category}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{product.name}</h3>
                                <p className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-tighter">{product.brand}</p>

                                <div className="flex items-center gap-1 mb-6">
                                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                    <span className="text-sm font-black text-slate-700">{product.rating}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                                    {cart[product.id] ? (
                                        <div className="flex gap-2 items-center bg-slate-900 text-white rounded-2xl p-1 px-4">
                                            <button onClick={() => removeFromCart(product.id)} className="p-1 hover:text-blue-400"><Minus size={16} /></button>
                                            <span className="font-black min-w-[20px] text-center">{cart[product.id]}</span>
                                            <button onClick={() => addToCart(product.id)} disabled={cart[product.id] >= product.stock} className="p-1 hover:text-blue-400 disabled:opacity-50"><Plus size={16} /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product.id)}
                                            disabled={product.stock <= 0}
                                            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-bold">{product.stock} left in stock</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mini Cart Sidebar */}
                <aside className="w-80 h-fit bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-10">
                    <h3 className="text-2xl font-black mb-8 flex items-center justify-between">
                        Cart <ShoppingCart size={24} className="text-blue-400" />
                    </h3>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {Object.entries(cart).map(([id, qty]) => {
                                const product = products.find(p => p.id == id);
                                if (!product) return null;
                                return (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={id} className="flex justify-between items-center group">
                                        <div className="max-w-[70%]">
                                            <p className="font-bold text-base truncate">{product.name}</p>
                                            <p className="text-slate-500 text-xs">{qty} x ${product.price}</p>
                                        </div>
                                        <span className="font-black text-blue-400">${(qty * product.price).toFixed(2)}</span>
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
                            <span className="text-3xl font-black">${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={Object.keys(cart).length === 0 || loading}
                            className="w-full bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? 'Processing...' : 'Checkout Now'}
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default SupplementStore;
