import { useState, useEffect } from 'react';
import axios from 'axios';
import SalesKanban from '../components/widgets/SalesKanban';
import DealEntryWidget from '../components/widgets/DealEntryWidget';
import ConfirmationModal from '../components/ui/ConfirmationModal';

import { useAuth } from '../contexts/AuthContext';

const Sales = () => {
    const { currentUser } = useAuth();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = currentUser?.id;

    useEffect(() => {
        if (userId) fetchDeals();
    }, [userId]);

    const fetchDeals = async () => {
        try {
            const response = await axios.get(`/api/sales/${userId}`);
            setDeals(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching deals", error);
            setLoading(false);
        }
    };

    const handleAddDeal = async (newDeal) => {
        try {
            await axios.post('/api/sales', { ...newDeal, userId });
            fetchDeals();
        } catch (error) {
            console.error("Error adding deal", error);
        }
    };

    const handleStatusChange = async (dealId, newStatus) => {
        // Optimistic update
        const updatedDeals = deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d);
        setDeals(updatedDeals);

        try {
            const deal = deals.find(d => d.id === dealId);
            if (deal) {
                await axios.post('/api/sales', { ...deal, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating status", error);
            fetchDeals();
        }
    };

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, dealId: null });

    const handleDeleteDeal = (dealId) => {
        setDeleteModal({ isOpen: true, dealId });
    };

    const confirmDeleteDeal = async () => {
        const { dealId } = deleteModal;
        if (!dealId) return;

        // Optimistic remove
        setDeals(deals.filter(d => d.id !== dealId));
        setDeleteModal({ isOpen: false, dealId: null });

        try {
            await axios.delete(`/api/sales/${dealId}`);
        } catch (error) {
            console.error("Error deleting deal", error);
            fetchDeals(); // Revert on error
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Header Section - Fixed */}
            <div className="flex justify-center items-center shrink-0 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Pipeline Control</h2>
                    <p className="text-xs text-zinc-500 mt-1">Manage your opportunities and track progress.</p>
                </div>
            </div>

            {/* Entry Widget - Fixed */}
            <DealEntryWidget onDealAdded={handleAddDeal} />

            {/* Kanban Board - Fills Remaining Space with Internal Scroll */}
            <div className="flex-1 min-h-0 min-w-0 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 p-1 overflow-hidden relative shadow-inner">
                <SalesKanban deals={deals} onStatusChange={handleStatusChange} onDelete={handleDeleteDeal} />
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDeleteDeal}
                title="Delete Deal"
                message="Are you sure you want to delete this deal? This action cannot be undone."
                confirmText="Delete Deal"
                isDestructive={true}
            />
        </div>
    );
};

export default Sales;
